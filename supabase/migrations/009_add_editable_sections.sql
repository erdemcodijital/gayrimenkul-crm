-- Add more editable landing page fields
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS features_title TEXT DEFAULT 'Neden Benimle Çalışmalısınız?',
ADD COLUMN IF NOT EXISTS properties_title TEXT DEFAULT 'Portföyümden Seçmeler',
ADD COLUMN IF NOT EXISTS cta_title TEXT DEFAULT 'Hayalinizdeki Evi Bulun',
ADD COLUMN IF NOT EXISTS cta_description TEXT DEFAULT 'Size özel gayrimenkul danışmanlığı için hemen iletişime geçin';

-- Add comments
COMMENT ON COLUMN agents.features_title IS 'Features section title';
COMMENT ON COLUMN agents.properties_title IS 'Properties section title';
COMMENT ON COLUMN agents.cta_title IS 'CTA section title';
COMMENT ON COLUMN agents.cta_description IS 'CTA section description';
