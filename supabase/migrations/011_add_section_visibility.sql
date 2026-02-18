-- Add section visibility toggles
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS show_stats BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_features BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_properties BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_cta BOOLEAN DEFAULT true;

-- Add comments
COMMENT ON COLUMN agents.show_stats IS 'Show/hide stats section (200+ Müşteri, etc)';
COMMENT ON COLUMN agents.show_features IS 'Show/hide features section';
COMMENT ON COLUMN agents.show_properties IS 'Show/hide properties section';
COMMENT ON COLUMN agents.show_cta IS 'Show/hide CTA section';
