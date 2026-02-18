-- Create pages table for multi-page management
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  is_home BOOLEAN DEFAULT false,
  order_index INTEGER DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agent_id, slug)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_pages_agent_id ON pages(agent_id);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_visible ON pages(visible);

-- Add RLS policies
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own pages"
  ON pages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own pages"
  ON pages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own pages"
  ON pages FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own pages"
  ON pages FOR DELETE
  USING (true);

-- Add comments
COMMENT ON TABLE pages IS 'Custom pages for each agent landing site';
COMMENT ON COLUMN pages.content IS 'JSONB content with sections array';
COMMENT ON COLUMN pages.is_home IS 'Is this the home/landing page';
COMMENT ON COLUMN pages.order_index IS 'Order in navigation menu';
