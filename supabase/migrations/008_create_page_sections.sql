-- Create page_sections table for visual editor
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'features', 'properties', 'contact', 'text', 'image', 'gallery'
  section_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  props JSONB DEFAULT '{}'::jsonb, -- section-specific properties (title, description, images, etc)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_page_sections_agent_id ON page_sections(agent_id);
CREATE INDEX idx_page_sections_order ON page_sections(section_order);

-- Add RLS policies
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read all sections
CREATE POLICY "Public sections are viewable by everyone"
  ON page_sections FOR SELECT
  USING (true);

-- Policy: Agents can manage their own sections
CREATE POLICY "Agents can manage own sections"
  ON page_sections FOR ALL
  USING (agent_id IN (SELECT id FROM agents WHERE user_id = auth.uid()));

-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION update_page_sections_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_page_sections_timestamp
  BEFORE UPDATE ON page_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_page_sections_updated_at();

COMMENT ON TABLE page_sections IS 'Stores landing page sections for visual editor';
COMMENT ON COLUMN page_sections.section_type IS 'Type of section: hero, features, properties, contact, text, image, gallery';
COMMENT ON COLUMN page_sections.props IS 'JSON object containing section-specific properties';
