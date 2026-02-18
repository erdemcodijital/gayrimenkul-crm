-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  
  -- General Settings
  site_title TEXT DEFAULT 'Gayrimenkul CRM',
  site_description TEXT DEFAULT 'Profesyonel gayrimenkul yönetim sistemi',
  support_email TEXT,
  support_phone TEXT,
  
  -- Email (SMTP) Settings
  smtp_host TEXT,
  smtp_port TEXT DEFAULT '587',
  smtp_user TEXT,
  smtp_password TEXT,
  smtp_from_email TEXT,
  smtp_from_name TEXT,
  smtp_enabled BOOLEAN DEFAULT FALSE,
  
  -- WhatsApp Settings
  whatsapp_api_url TEXT,
  whatsapp_api_key TEXT,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  
  -- Notification Settings
  notify_new_lead BOOLEAN DEFAULT TRUE,
  notify_lead_status_change BOOLEAN DEFAULT TRUE,
  notify_new_property BOOLEAN DEFAULT TRUE,
  notify_agent_signup BOOLEAN DEFAULT TRUE,
  
  -- Theme Settings
  primary_color TEXT DEFAULT '#111827',
  secondary_color TEXT DEFAULT '#6366F1',
  logo_url TEXT DEFAULT '/logo.png',
  favicon_url TEXT DEFAULT '/favicon.ico',
  
  -- Security Settings
  pin_required BOOLEAN DEFAULT TRUE,
  session_timeout INTEGER DEFAULT 24,
  ip_whitelist TEXT,
  max_login_attempts INTEGER DEFAULT 5,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default settings
INSERT INTO settings (id) VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Admin can read and update settings
CREATE POLICY "Admin can read settings"
  ON settings FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can update settings"
  ON settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Update trigger
CREATE OR REPLACE FUNCTION update_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_settings_updated_at();
