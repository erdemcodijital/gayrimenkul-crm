# Ana Sayfa Sections Migration

## Problem:
Ana sayfa (is_home: true) şu anda `agents` tablosunda tutuluyor:
- hero_title
- hero_subtitle
- hero_button_text
- features_list
- vb.

**Sonuç:** Builder'da bölümlere tıklayınca properties panel açılmıyor, buton linki düzenlenemiyor!

## Çözüm:
Ana sayfa için de `pages` tablosuna sections ekleyelim.

## SQL Migration:
```sql
-- Ana sayfa için sections oluştur
UPDATE pages
SET content = jsonb_build_object(
  'sections', jsonb_build_array(
    jsonb_build_object(
      'id', 'hero-' || gen_random_uuid()::text,
      'type', 'hero',
      'order', 0,
      'data', jsonb_build_object(
        'title', (SELECT hero_title FROM agents WHERE id = pages.agent_id),
        'subtitle', (SELECT hero_subtitle FROM agents WHERE id = pages.agent_id),
        'buttonText', (SELECT hero_button_text FROM agents WHERE id = pages.agent_id),
        'buttonLink', '#iletisim'
      )
    )
  )
)
WHERE is_home = true AND (content IS NULL OR content::text = '{}');
```

## Veya:
Builder'da ana sayfa seçildiğinde otomatik sections oluştur (lazy migration).
