# 🧹 Google Maps Scraper Data Cleaner

Google Maps'ten çekilen emlakçı verilerini temizlemek için standalone script.

## 🚀 Kullanım

### 1. Veriyi Hazırla

Scraped verini **`scraped-data.json`** veya **`scraped-data.csv`** olarak ana dizine kaydet.

**Örnek JSON formatı:**
```json
[
  {
    "name": "Ahmet Emlak",
    "phone": "0532 123 45 67",
    "email": "ahmet@emlak.com",
    "address": "İstanbul, Kadıköy",
    "rating": "4.5",
    "reviews": "23"
  },
  {
    "name": "Mehmet Gayrimenkul",
    "phone": "0533 234 56 78",
    "address": "İstanbul, Beşiktaş"
  }
]
```

**Örnek CSV formatı:**
```csv
name,phone,email,address,rating,reviews
Ahmet Emlak,0532 123 45 67,ahmet@emlak.com,"İstanbul, Kadıköy",4.5,23
Mehmet Gayrimenkul,0533 234 56 78,,"İstanbul, Beşiktaş",,
```

### 2. Scripti Çalıştır

```bash
node data-cleaner.js
```

### 3. Sonuçları Al

Script şu dosyaları oluşturur:

- **`cleaned-data.json`** - Temizlenmiş veri (JSON)
- **`cleaned-data.csv`** - Temizlenmiş veri (CSV)
- **`duplicates.json`** - Duplicate kayıtlar
- **`invalid-data.json`** - Geçersiz kayıtlar (telefon yok vb.)
- **`cleaning-stats.json`** - İstatistikler

## ✨ Özellikler

### ✅ Telefon Numarası Normalizasyonu
- Tüm özel karakterleri temizler
- +90 formatına çevirir
- Geçersiz numaraları filtreler

```
0532 123 45 67  →  +905321234567
532-123-45-67   →  +905321234567
(0532) 123 4567 →  +905321234567
```

### ✅ Duplicate Kontrolü
- Telefon numarasına göre
- Email adresine göre
- İsme göre
- Duplicate'leri ayrı dosyaya kaydeder

### ✅ Veri Temizleme
- Gereksiz boşlukları kaldırır
- Email formatını kontrol eder
- İsimleri düzenler
- Telefonu olmayan kayıtları filtreler

### ✅ Çıktı Formatı

**cleaned-data.json:**
```json
[
  {
    "name": "Ahmet Emlak",
    "phone": "+905321234567",
    "email": "ahmet@emlak.com",
    "address": "İstanbul, Kadıköy",
    "website": null,
    "rating": 4.5,
    "reviews": 23,
    "category": "Emlak Ofisi",
    "rawData": { ... }
  }
]
```

## 📊 İstatistik Örneği

```json
{
  "total": 1500,
  "valid": 1200,
  "duplicates": 250,
  "noPhone": 30,
  "invalidEmail": 20,
  "cleaned": 1200
}
```

## 🔧 Özelleştirme

Script içindeki `CONFIG` objesini düzenleyebilirsin:

```javascript
const CONFIG = {
  inputFile: 'scraped-data.json',  // Giriş dosyası
  outputFile: 'cleaned-data.json', // Çıkış dosyası
  duplicatesFile: 'duplicates.json',
  invalidFile: 'invalid-data.json',
  statsFile: 'cleaning-stats.json'
};
```

## 💡 İpuçları

1. **Büyük Dosyalar:** Script binlerce kayıtla çalışabilir
2. **CSV vs JSON:** İkisini de destekler, istediğini kullan
3. **Duplicate'ler:** `duplicates.json` dosyasını kontrol et
4. **Invalid Kayıtlar:** `invalid-data.json` dosyasında ne eksik kontrol et
5. **Manuel Kontrol:** Temizleme sonrası mutlaka kontrol et

## 🎯 Sonraki Adım: Supabase'e Import

Temizlenmiş veriyi Supabase'e import etmek için:

```javascript
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient('YOUR_URL', 'YOUR_KEY');
const data = JSON.parse(fs.readFileSync('cleaned-data.json', 'utf8'));

async function importToSupabase() {
  const agents = data.map(record => ({
    name: record.name,
    email: record.email,
    phone: record.phone,
    city: extractCity(record.address),
    is_active: true,
    license_status: 'inactive'
  }));
  
  const { data: inserted, error } = await supabase
    .from('agents')
    .insert(agents);
    
  console.log(`✅ ${inserted.length} kayıt eklendi`);
}

function extractCity(address) {
  // İstanbul, Kadıköy → İstanbul
  return address?.split(',')[0]?.trim() || null;
}

importToSupabase();
```

## 📞 Destek

Sorun olursa console'daki hata mesajını kontrol et.
