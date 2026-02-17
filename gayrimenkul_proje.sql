-- Gayrimenkul Danışman Yönetim Sistemi
-- Supabase için SQL Şeması

-- Danışmanlar (Agents) Tablosu
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    city VARCHAR(100),
    domain VARCHAR(255) UNIQUE,
    whatsapp_number VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    license_status VARCHAR(50) DEFAULT 'active', -- active, suspended, expired
    license_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Leadler Tablosu
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    budget VARCHAR(100),
    room_count VARCHAR(50),
    district VARCHAR(100),
    notes TEXT,
    status VARCHAR(50) DEFAULT 'new', -- new, contacted, converted, lost
    source VARCHAR(100) DEFAULT 'landing_page',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admin Kullanıcıları Tablosu (auth.users'dan ayrı admin yetkisi kontrolü için)
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Row Level Security (RLS) Politikaları

-- Agents tablosu için RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

-- Admin tüm danışmanları görebilir
CREATE POLICY "Admins can view all agents"
    ON agents FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Admin danışman oluşturabilir
CREATE POLICY "Admins can insert agents"
    ON agents FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Admin danışman güncelleyebilir
CREATE POLICY "Admins can update agents"
    ON agents FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Danışmanlar kendi bilgilerini görebilir
CREATE POLICY "Agents can view own profile"
    ON agents FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());

-- Danışmanlar kendi bilgilerini güncelleyebilir
CREATE POLICY "Agents can update own profile"
    ON agents FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid());

-- Leads tablosu için RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Herkes lead oluşturabilir (public form)
CREATE POLICY "Anyone can create leads"
    ON leads FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- Admin tüm leadleri görebilir
CREATE POLICY "Admins can view all leads"
    ON leads FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Danışmanlar sadece kendi leadlerini görebilir
CREATE POLICY "Agents can view own leads"
    ON leads FOR SELECT
    TO authenticated
    USING (
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
    );

-- Danışmanlar kendi leadlerini güncelleyebilir
CREATE POLICY "Agents can update own leads"
    ON leads FOR UPDATE
    TO authenticated
    USING (
        agent_id IN (
            SELECT id FROM agents WHERE user_id = auth.uid()
        )
    );

-- Admin Kullanıcıları tablosu için RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin users"
    ON admin_users FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM admin_users
            WHERE admin_users.user_id = auth.uid()
        )
    );

-- Indexes (performans için)
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_agents_domain ON agents(domain);
CREATE INDEX idx_agents_is_active ON agents(is_active);
CREATE INDEX idx_leads_agent_id ON leads(agent_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_status ON leads(status);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_agents_updated_at
    BEFORE UPDATE ON agents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- İlk admin kullanıcısını eklemek için:
-- INSERT INTO admin_users (user_id) VALUES ('YOUR_USER_ID_HERE');
