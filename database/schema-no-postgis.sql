-- =====================================================
-- MINIMAPLY DATABASE SCHEMA
-- Supabase PostgreSQL
-- Version: 1.0
-- Date: 2026-01-28
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For fuzzy text search

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE user_role AS ENUM ('user', 'provider', 'admin', 'curator');
CREATE TYPE provider_status AS ENUM ('pending', 'active', 'suspended', 'rejected');
CREATE TYPE event_status AS ENUM ('draft', 'pending', 'active', 'cancelled', 'completed');
CREATE TYPE session_status AS ENUM ('scheduled', 'cancelled', 'completed');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'partial_refund');
CREATE TYPE claim_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE scraper_status AS ENUM ('running', 'completed', 'failed', 'partial');

-- =====================================================
-- CITIES TABLE
-- =====================================================

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    is_active BOOLEAN DEFAULT false,
    is_coming_soon BOOLEAN DEFAULT true,
    timezone VARCHAR(50) DEFAULT 'Europe/Istanbul',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial cities data
INSERT INTO cities (name, slug, lat, lng, is_active, is_coming_soon) VALUES
('İstanbul', 'istanbul', 41.0082, 28.9784, true, false),
('Ankara', 'ankara', 39.9334, 32.8597, true, false),
('İzmir', 'izmir', 38.4192, 27.1287, true, false),
('Bursa', 'bursa', 40.1885, 29.0610, true, false),
('Antalya', 'antalya', 36.8969, 30.7133, false, true),
('Adana', 'adana', 37.0000, 35.3213, false, true);

-- =====================================================
-- CATEGORIES TABLE
-- =====================================================

CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    icon VARCHAR(10) NOT NULL,
    color VARCHAR(7) NOT NULL, -- Hex color
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial categories
INSERT INTO categories (name, slug, icon, color, sort_order) VALUES
('Atölye', 'atolye', '🎨', '#8B5CF6', 1),
('Tiyatro', 'tiyatro', '🎭', '#EC4899', 2),
('Müzik', 'muzik', '🎵', '#F97316', 3),
('Spor', 'spor', '⚽', '#22C55E', 4),
('Müze', 'muze', '🏛️', '#6366F1', 5),
('Açık Hava', 'acik-hava', '🌳', '#14B8A6', 6),
('Bilim', 'bilim', '🔬', '#0EA5E9', 7),
('Sanat', 'sanat', '🖼️', '#F43F5E', 8),
('Dans', 'dans', '💃', '#D946EF', 9),
('Oyun', 'oyun', '🎮', '#EAB308', 10);

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    avatar_url TEXT,
    phone VARCHAR(20),
    role user_role DEFAULT 'user',
    preferred_city_id UUID REFERENCES cities(id),
    children_ages INT[], -- Array of children ages
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ
);

-- =====================================================
-- PROVIDERS TABLE
-- =====================================================

CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    logo_url TEXT,
    cover_image_url TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(500),
    instagram VARCHAR(100),
    city_id UUID NOT NULL REFERENCES cities(id),
    address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    status provider_status DEFAULT 'pending',
    commission_rate DECIMAL(5, 2) DEFAULT 15.00,
    is_anchor BOOLEAN DEFAULT false, -- Anchor providers get 10% commission
    payout_info JSONB, -- Bank account details (encrypted)
    tax_number VARCHAR(20),
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES users(id),
    total_events INT DEFAULT 0,
    total_reservations INT DEFAULT 0,
    average_rating DECIMAL(3, 2) DEFAULT 0,
    review_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EVENTS TABLE
-- =====================================================

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    description TEXT,
    short_description VARCHAR(300),
    category_id UUID NOT NULL REFERENCES categories(id),
    city_id UUID NOT NULL REFERENCES cities(id),
    
    -- Location
    venue_name VARCHAR(255),
    address TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    district VARCHAR(100),
    
    -- Age & Duration
    age_min INT DEFAULT 0,
    age_max INT DEFAULT 12,
    duration_minutes INT,
    
    -- Pricing
    price DECIMAL(10, 2) DEFAULT 0,
    price_child DECIMAL(10, 2),
    price_adult DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'TRY',
    is_free BOOLEAN DEFAULT false,
    
    -- Media
    image_url TEXT,
    gallery JSONB, -- Array of image URLs
    video_url TEXT,
    
    -- Source (for scraped events)
    source_name VARCHAR(100), -- 'ibb', 'biletinial', 'manual', etc.
    source_id VARCHAR(255),
    source_url TEXT,
    
    -- Claim system
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMPTZ,
    claimed_by UUID REFERENCES providers(id),
    
    -- Status & Flags
    status event_status DEFAULT 'pending',
    is_featured BOOLEAN DEFAULT false,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT, -- RRULE format for recurring events
    
    -- Capacity (for events without sessions)
    total_capacity INT,
    
    -- SEO
    meta_title VARCHAR(255),
    meta_description VARCHAR(500),
    
    -- Stats
    views_count INT DEFAULT 0,
    favorites_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id),
    
    -- Unique constraint for scraped events
    CONSTRAINT unique_source_event UNIQUE (source_name, source_id)
);

-- Full-text search index
CREATE INDEX idx_events_search ON events USING GIN (
    to_tsvector('turkish', coalesce(title, '') || ' ' || coalesce(description, '') || ' ' || coalesce(venue_name, ''))
);

-- =====================================================
-- SESSIONS TABLE
-- =====================================================

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- DateTime
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME,
    
    -- Capacity
    capacity INT NOT NULL DEFAULT 20,
    available INT NOT NULL DEFAULT 20,
    min_participants INT DEFAULT 1,
    
    -- Pricing override
    price_override DECIMAL(10, 2),
    
    -- Status
    status session_status DEFAULT 'scheduled',
    cancellation_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT check_available CHECK (available >= 0 AND available <= capacity),
    CONSTRAINT check_capacity CHECK (capacity > 0)
);

CREATE INDEX idx_sessions_event_date ON sessions(event_id, date);
CREATE INDEX idx_sessions_date_status ON sessions(date, status);

-- =====================================================
-- RESERVATIONS TABLE
-- =====================================================

CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_code VARCHAR(20) NOT NULL UNIQUE, -- MM-XXXXXX format
    session_id UUID NOT NULL REFERENCES sessions(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Participants
    child_count INT NOT NULL DEFAULT 1,
    adult_count INT NOT NULL DEFAULT 1,
    participant_names JSONB, -- Array of names
    
    -- Pricing
    unit_price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    commission_amount DECIMAL(10, 2) NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status reservation_status DEFAULT 'pending',
    payment_status payment_status DEFAULT 'pending',
    
    -- Check-in
    qr_code TEXT, -- QR code data
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES users(id),
    
    -- Notes
    notes TEXT,
    special_requests TEXT,
    
    -- Cancellation
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    refund_amount DECIMAL(10, 2),
    refunded_at TIMESTAMPTZ,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ -- For pending reservations
);

CREATE INDEX idx_reservations_session ON reservations(session_id);
CREATE INDEX idx_reservations_user ON reservations(user_id);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_code ON reservations(reservation_code);

-- =====================================================
-- PAYMENTS TABLE
-- =====================================================

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    
    -- Provider info
    provider VARCHAR(50) NOT NULL, -- 'iyzico', 'stripe', etc.
    provider_payment_id VARCHAR(255),
    provider_transaction_id VARCHAR(255),
    
    -- Amount
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    
    -- Status
    status payment_status DEFAULT 'pending',
    
    -- Card info (masked)
    card_last_four VARCHAR(4),
    card_brand VARCHAR(50),
    
    -- 3D Secure
    is_3d_secure BOOLEAN DEFAULT false,
    
    -- Metadata
    metadata JSONB,
    error_message TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

CREATE INDEX idx_payments_reservation ON payments(reservation_id);
CREATE INDEX idx_payments_provider_id ON payments(provider_payment_id);

-- =====================================================
-- CLAIM REQUESTS TABLE
-- =====================================================

CREATE TABLE claim_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Proof
    proof_type VARCHAR(50) NOT NULL, -- 'website', 'social_media', 'document', 'phone', 'other'
    proof_url TEXT,
    proof_document TEXT, -- Storage URL
    proof_notes TEXT,
    
    -- Status
    status claim_status DEFAULT 'pending',
    
    -- Review
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_claims_event ON claim_requests(event_id);
CREATE INDEX idx_claims_provider ON claim_requests(provider_id);
CREATE INDEX idx_claims_status ON claim_requests(status);

-- =====================================================
-- SCRAPER LOGS TABLE
-- =====================================================

CREATE TABLE scraper_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scraper_name VARCHAR(100) NOT NULL,
    city_id UUID REFERENCES cities(id),
    
    -- Timing
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INT,
    
    -- Results
    events_found INT DEFAULT 0,
    events_new INT DEFAULT 0,
    events_updated INT DEFAULT 0,
    events_duplicate INT DEFAULT 0,
    events_failed INT DEFAULT 0,
    
    -- Status
    status scraper_status DEFAULT 'running',
    error_message TEXT,
    error_stack TEXT,
    
    -- Metadata
    metadata JSONB -- URLs processed, etc.
);

CREATE INDEX idx_scraper_logs_name ON scraper_logs(scraper_name);
CREATE INDEX idx_scraper_logs_status ON scraper_logs(status);
CREATE INDEX idx_scraper_logs_date ON scraper_logs(started_at DESC);

-- =====================================================
-- FAVORITES TABLE
-- =====================================================

CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, event_id)
);

CREATE INDEX idx_favorites_user ON favorites(user_id);

-- =====================================================
-- REVIEWS TABLE
-- =====================================================

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id UUID NOT NULL REFERENCES reservations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    event_id UUID NOT NULL REFERENCES events(id),
    provider_id UUID REFERENCES providers(id),
    
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    
    -- Provider response
    response TEXT,
    responded_at TIMESTAMPTZ,
    
    -- Moderation
    is_approved BOOLEAN DEFAULT true,
    is_flagged BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_event ON reviews(event_id);
CREATE INDEX idx_reviews_provider ON reviews(provider_id);

-- =====================================================
-- WAITLIST TABLE
-- =====================================================

CREATE TABLE waitlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    city_id UUID REFERENCES cities(id),
    is_provider BOOLEAN DEFAULT false,
    source VARCHAR(50), -- 'landing', 'app', 'referral'
    referral_code VARCHAR(50),
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    converted_at TIMESTAMPTZ,
    converted_user_id UUID REFERENCES users(id),
    
    UNIQUE(email, city_id)
);

CREATE INDEX idx_waitlist_city ON waitlist(city_id);
CREATE INDEX idx_waitlist_email ON waitlist(email);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- 'reservation', 'reminder', 'promo', 'system'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB, -- Action data (event_id, reservation_id, etc.)
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);

-- =====================================================
-- PROMO CODES TABLE
-- =====================================================

CREATE TABLE promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    
    discount_type VARCHAR(20) NOT NULL, -- 'percentage', 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(10, 2) DEFAULT 0,
    max_discount DECIMAL(10, 2),
    
    valid_from TIMESTAMPTZ NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    
    usage_limit INT,
    usage_count INT DEFAULT 0,
    per_user_limit INT DEFAULT 1,
    
    -- Restrictions
    category_ids UUID[],
    city_ids UUID[],
    provider_ids UUID[],
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to update available seats atomically
CREATE OR REPLACE FUNCTION decrement_session_availability(
    p_session_id UUID,
    p_count INT
) RETURNS BOOLEAN AS $$
DECLARE
    v_updated INT;
BEGIN
    UPDATE sessions 
    SET available = available - p_count,
        updated_at = NOW()
    WHERE id = p_session_id 
    AND available >= p_count
    AND status = 'scheduled';
    
    GET DIAGNOSTICS v_updated = ROW_COUNT;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to increment availability (for cancellations)
CREATE OR REPLACE FUNCTION increment_session_availability(
    p_session_id UUID,
    p_count INT
) RETURNS VOID AS $$
BEGIN
    UPDATE sessions 
    SET available = LEAST(available + p_count, capacity),
        updated_at = NOW()
    WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to generate reservation code
CREATE OR REPLACE FUNCTION generate_reservation_code() RETURNS VARCHAR(20) AS $$
DECLARE
    v_code VARCHAR(20);
    v_exists BOOLEAN;
BEGIN
    LOOP
        v_code := 'MM-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT EXISTS(SELECT 1 FROM reservations WHERE reservation_code = v_code) INTO v_exists;
        EXIT WHEN NOT v_exists;
    END LOOP;
    RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_providers_updated_at BEFORE UPDATE ON providers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER tr_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate reservation code
CREATE OR REPLACE FUNCTION set_reservation_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.reservation_code IS NULL THEN
        NEW.reservation_code := generate_reservation_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_reservation_code BEFORE INSERT ON reservations FOR EACH ROW EXECUTE FUNCTION set_reservation_code();

-- Update event favorites count
CREATE OR REPLACE FUNCTION update_event_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE events SET favorites_count = favorites_count + 1 WHERE id = NEW.event_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE events SET favorites_count = favorites_count - 1 WHERE id = OLD.event_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_favorites_count AFTER INSERT OR DELETE ON favorites FOR EACH ROW EXECUTE FUNCTION update_event_favorites_count();

-- Update provider stats after review
CREATE OR REPLACE FUNCTION update_provider_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE providers p SET
        average_rating = (SELECT AVG(rating)::DECIMAL(3,2) FROM reviews WHERE provider_id = NEW.provider_id AND is_approved = true),
        review_count = (SELECT COUNT(*) FROM reviews WHERE provider_id = NEW.provider_id AND is_approved = true)
    WHERE id = NEW.provider_id;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_provider_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_provider_rating();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Events policies (public read)
CREATE POLICY "Anyone can view active events" ON events FOR SELECT USING (status = 'active');
CREATE POLICY "Providers can manage own events" ON events FOR ALL USING (
    provider_id IN (SELECT id FROM providers WHERE user_id = auth.uid())
);

-- Sessions policies
CREATE POLICY "Anyone can view scheduled sessions" ON sessions FOR SELECT USING (status = 'scheduled');

-- Reservations policies
CREATE POLICY "Users can view own reservations" ON reservations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create reservations" ON reservations FOR INSERT WITH CHECK (user_id = auth.uid());

-- Favorites policies
CREATE POLICY "Users can manage own favorites" ON favorites FOR ALL USING (user_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can view approved reviews" ON reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Users can create own reviews" ON reviews FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_events_city_status ON events(city_id, status);
CREATE INDEX idx_events_category ON events(category_id);
CREATE INDEX idx_events_provider ON events(provider_id);
CREATE INDEX idx_events_source ON events(source_name, source_id);
CREATE INDEX idx_events_featured ON events(is_featured) WHERE is_featured = true;
CREATE INDEX idx_events_free ON events(is_free) WHERE is_free = true;
CREATE INDEX idx_providers_city ON providers(city_id);
CREATE INDEX idx_providers_status ON providers(status);

-- =====================================================
-- VIEWS
-- =====================================================

-- Active events with details
CREATE VIEW v_active_events AS
SELECT 
    e.*,
    c.name as category_name,
    c.icon as category_icon,
    c.color as category_color,
    ci.name as city_name,
    p.business_name as provider_name,
    p.logo_url as provider_logo,
    (SELECT MIN(date) FROM sessions s WHERE s.event_id = e.id AND s.status = 'scheduled' AND s.date >= CURRENT_DATE) as next_session_date,
    (SELECT SUM(available) FROM sessions s WHERE s.event_id = e.id AND s.status = 'scheduled' AND s.date >= CURRENT_DATE) as total_available
FROM events e
JOIN categories c ON e.category_id = c.id
JOIN cities ci ON e.city_id = ci.id
LEFT JOIN providers p ON e.provider_id = p.id
WHERE e.status = 'active';

-- Scraper health dashboard
CREATE VIEW v_scraper_health AS
SELECT 
    scraper_name,
    MAX(started_at) as last_run,
    (SELECT events_found FROM scraper_logs sl2 WHERE sl2.scraper_name = sl.scraper_name ORDER BY started_at DESC LIMIT 1) as last_events_found,
    (SELECT events_new FROM scraper_logs sl2 WHERE sl2.scraper_name = sl.scraper_name ORDER BY started_at DESC LIMIT 1) as last_events_new,
    (SELECT status FROM scraper_logs sl2 WHERE sl2.scraper_name = sl.scraper_name ORDER BY started_at DESC LIMIT 1) as last_status,
    COUNT(*) FILTER (WHERE status = 'completed' AND started_at > NOW() - INTERVAL '7 days') as successful_runs_7d,
    COUNT(*) FILTER (WHERE status = 'failed' AND started_at > NOW() - INTERVAL '7 days') as failed_runs_7d
FROM scraper_logs sl
GROUP BY scraper_name;

-- =====================================================
-- SEED DATA FOR TESTING
-- =====================================================

-- Note: Run this in development only
-- INSERT INTO users (id, email, name, role) VALUES ...
-- INSERT INTO providers (user_id, business_name, ...) VALUES ...
-- INSERT INTO events (...) VALUES ...

-- =====================================================
-- END OF SCHEMA
-- =====================================================
