-- Add Contact Form and Footer text fields to agents table
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS form_title TEXT,
ADD COLUMN IF NOT EXISTS form_subtitle TEXT,
ADD COLUMN IF NOT EXISTS form_button_text TEXT,
ADD COLUMN IF NOT EXISTS form_privacy_text TEXT,
ADD COLUMN IF NOT EXISTS footer_description TEXT,
ADD COLUMN IF NOT EXISTS footer_contact_title TEXT,
ADD COLUMN IF NOT EXISTS footer_links_title TEXT,
ADD COLUMN IF NOT EXISTS footer_whatsapp_text TEXT,
ADD COLUMN IF NOT EXISTS footer_phone_text TEXT,
ADD COLUMN IF NOT EXISTS footer_email_text TEXT;
