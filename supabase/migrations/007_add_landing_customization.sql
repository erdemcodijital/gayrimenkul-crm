-- Add landing page customization fields to agents table
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS hero_title TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS about_text TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS show_properties BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_features BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_cta BOOLEAN DEFAULT true;

-- Add comment
COMMENT ON COLUMN agents.hero_title IS 'Custom hero section title';
COMMENT ON COLUMN agents.hero_subtitle IS 'Custom hero section subtitle';
COMMENT ON COLUMN agents.about_text IS 'About me text for landing page';
COMMENT ON COLUMN agents.logo_url IS 'Custom logo URL';
COMMENT ON COLUMN agents.show_properties IS 'Show/hide properties section';
COMMENT ON COLUMN agents.show_features IS 'Show/hide features section';
COMMENT ON COLUMN agents.show_cta IS 'Show/hide CTA section';
