-- Add more editable landing page fields
ALTER TABLE agents
ADD COLUMN IF NOT EXISTS features_title TEXT DEFAULT 'Neden Benimle Çalışmalısınız?',
ADD COLUMN IF NOT EXISTS properties_title TEXT DEFAULT 'Portföyümden Seçmeler',
ADD COLUMN IF NOT EXISTS cta_title TEXT DEFAULT 'Hayalinizdeki Evi Bulun',
ADD COLUMN IF NOT EXISTS cta_description TEXT DEFAULT 'Size özel gayrimenkul danışmanlığı için hemen iletişime geçin',
ADD COLUMN IF NOT EXISTS features_list JSONB DEFAULT '[
  {"title": "Güvenilir Hizmet", "description": "Şeffaf ve dürüst iletişim"},
  {"title": "Hızlı Çözümler", "description": "En uygun seçenekleri hızlıca buluyoruz"},
  {"title": "Rekabetçi Fiyat", "description": "Piyasa koşullarına uygun fiyatlar"},
  {"title": "Uzman Destek", "description": "Deneyimli danışmanlık ekibi"}
]'::jsonb,
ADD COLUMN IF NOT EXISTS hero_button_text TEXT DEFAULT 'Ücretsiz Görüşme',
ADD COLUMN IF NOT EXISTS hero_phone_text TEXT DEFAULT NULL;

-- Add comments
COMMENT ON COLUMN agents.features_title IS 'Features section title';
COMMENT ON COLUMN agents.properties_title IS 'Properties section title';
COMMENT ON COLUMN agents.cta_title IS 'CTA section title';
COMMENT ON COLUMN agents.cta_description IS 'CTA section description';
COMMENT ON COLUMN agents.features_list IS 'Array of feature items with title and description';
COMMENT ON COLUMN agents.hero_button_text IS 'Hero CTA button text';
COMMENT ON COLUMN agents.hero_phone_text IS 'Hero phone button custom text';
