/**
 * Google Maps Scraper Data Cleaner
 * Emlakçı verilerini temizler, duplicate'leri kaldırır, telefon numarası olmayanları filtreler
 */

const fs = require('fs');
const path = require('path');

// Konfigürasyon
const CONFIG = {
  inputFile: 'scraped-data.json', // veya 'scraped-data.csv'
  outputFile: 'cleaned-data.json',
  duplicatesFile: 'duplicates.json',
  invalidFile: 'invalid-data.json',
  statsFile: 'cleaning-stats.json'
};

// Telefon numarasını temizle ve normalize et
function normalizePhone(phone) {
  if (!phone) return null;
  
  // Tüm özel karakterleri kaldır
  let cleaned = phone.toString().replace(/[^\d+]/g, '');
  
  // Türkiye için normalize et
  if (cleaned.startsWith('0')) {
    cleaned = '+90' + cleaned.substring(1);
  } else if (cleaned.startsWith('90')) {
    cleaned = '+' + cleaned;
  } else if (!cleaned.startsWith('+')) {
    cleaned = '+90' + cleaned;
  }
  
  return cleaned;
}

// Email formatını kontrol et
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// İsim temizleme
function cleanName(name) {
  if (!name) return null;
  return name.trim().replace(/\s+/g, ' ');
}

// Duplicate kontrolü için unique key oluştur
function createUniqueKey(record) {
  const phone = normalizePhone(record.phone || record.telefon || record.phoneNumber);
  const email = (record.email || '').toLowerCase().trim();
  const name = cleanName(record.name || record.isim || record.title);
  
  return {
    phone,
    email,
    name,
    key: `${phone || ''}_${email || ''}_${name || ''}`.toLowerCase()
  };
}

// CSV'yi JSON'a çevir
function csvToJson(csvData) {
  const lines = csvData.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  const result = [];
  for (let i = 1; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(',');
    
    headers.forEach((header, index) => {
      obj[header] = currentLine[index]?.trim() || '';
    });
    
    result.push(obj);
  }
  
  return result;
}

// Ana temizleme fonksiyonu
function cleanData(data) {
  console.log(`\n📊 Toplam kayıt: ${data.length}`);
  
  const stats = {
    total: data.length,
    valid: 0,
    duplicates: 0,
    noPhone: 0,
    invalidEmail: 0,
    cleaned: 0
  };
  
  const seen = new Map();
  const validRecords = [];
  const duplicates = [];
  const invalid = [];
  
  data.forEach((record, index) => {
    const unique = createUniqueKey(record);
    
    // Telefon numarası kontrolü
    if (!unique.phone || unique.phone.length < 10) {
      stats.noPhone++;
      invalid.push({ reason: 'No valid phone', data: record });
      return;
    }
    
    // Email kontrolü (varsa)
    if (record.email && !isValidEmail(record.email)) {
      stats.invalidEmail++;
      // Email invalid ama kayıt geçerli sayılabilir
    }
    
    // Duplicate kontrolü
    if (seen.has(unique.key)) {
      stats.duplicates++;
      duplicates.push({
        original: seen.get(unique.key),
        duplicate: record,
        key: unique.key
      });
      return;
    }
    
    // Temiz kayıt oluştur
    const cleanedRecord = {
      name: unique.name || 'İsimsiz',
      phone: unique.phone,
      email: unique.email || null,
      address: cleanName(record.address || record.adres || record.location) || null,
      website: (record.website || record.web || '').trim() || null,
      rating: parseFloat(record.rating || record.puan || 0) || null,
      reviews: parseInt(record.reviews || record.yorumSayisi || 0) || null,
      category: cleanName(record.category || record.kategori || 'Emlak Ofisi'),
      rawData: record
    };
    
    seen.set(unique.key, cleanedRecord);
    validRecords.push(cleanedRecord);
    stats.valid++;
  });
  
  stats.cleaned = validRecords.length;
  
  return {
    validRecords,
    duplicates,
    invalid,
    stats
  };
}

// Dosya okuma
function readInputFile(filename) {
  const filePath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Dosya bulunamadı: ${filename}`);
    console.log(`\n💡 Lütfen aşağıdaki formatlardan birinde dosya oluşturun:`);
    console.log(`   - scraped-data.json`);
    console.log(`   - scraped-data.csv`);
    process.exit(1);
  }
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const ext = path.extname(filename).toLowerCase();
  
  if (ext === '.json') {
    return JSON.parse(fileContent);
  } else if (ext === '.csv') {
    return csvToJson(fileContent);
  } else {
    console.error(`❌ Desteklenmeyen dosya formatı: ${ext}`);
    process.exit(1);
  }
}

// Dosyaya yaz
function writeOutputFiles(result) {
  // Temiz veri
  fs.writeFileSync(
    path.join(__dirname, CONFIG.outputFile),
    JSON.stringify(result.validRecords, null, 2),
    'utf8'
  );
  
  // Duplicate'ler
  if (result.duplicates.length > 0) {
    fs.writeFileSync(
      path.join(__dirname, CONFIG.duplicatesFile),
      JSON.stringify(result.duplicates, null, 2),
      'utf8'
    );
  }
  
  // Invalid kayıtlar
  if (result.invalid.length > 0) {
    fs.writeFileSync(
      path.join(__dirname, CONFIG.invalidFile),
      JSON.stringify(result.invalid, null, 2),
      'utf8'
    );
  }
  
  // İstatistikler
  fs.writeFileSync(
    path.join(__dirname, CONFIG.statsFile),
    JSON.stringify(result.stats, null, 2),
    'utf8'
  );
}

// CSV export
function exportToCSV(records, filename) {
  if (records.length === 0) return;
  
  const headers = ['name', 'phone', 'email', 'address', 'website', 'rating', 'reviews', 'category'];
  const csvLines = [headers.join(',')];
  
  records.forEach(record => {
    const row = headers.map(header => {
      const value = record[header] || '';
      return `"${value.toString().replace(/"/g, '""')}"`;
    });
    csvLines.push(row.join(','));
  });
  
  fs.writeFileSync(
    path.join(__dirname, filename),
    csvLines.join('\n'),
    'utf8'
  );
}

// Ana fonksiyon
function main() {
  console.log('🧹 Google Maps Scraper Data Cleaner');
  console.log('=====================================\n');
  
  try {
    // Veriyi oku
    console.log(`📂 Dosya okunuyor: ${CONFIG.inputFile}`);
    const rawData = readInputFile(CONFIG.inputFile);
    
    // Temizle
    console.log('🔄 Veri temizleniyor...');
    const result = cleanData(rawData);
    
    // Sonuçları kaydet
    console.log('\n💾 Sonuçlar kaydediliyor...');
    writeOutputFiles(result);
    
    // CSV export
    exportToCSV(result.validRecords, 'cleaned-data.csv');
    
    // İstatistikler
    console.log('\n📊 SONUÇLAR:');
    console.log('=====================================');
    console.log(`✅ Toplam Kayıt: ${result.stats.total}`);
    console.log(`✅ Geçerli Kayıt: ${result.stats.valid}`);
    console.log(`🔄 Duplicate: ${result.stats.duplicates}`);
    console.log(`❌ Telefon Yok: ${result.stats.noPhone}`);
    console.log(`⚠️  Geçersiz Email: ${result.stats.invalidEmail}`);
    console.log(`\n📁 Oluşturulan Dosyalar:`);
    console.log(`   ✓ ${CONFIG.outputFile} (JSON)`);
    console.log(`   ✓ cleaned-data.csv (CSV)`);
    
    if (result.duplicates.length > 0) {
      console.log(`   ✓ ${CONFIG.duplicatesFile}`);
    }
    if (result.invalid.length > 0) {
      console.log(`   ✓ ${CONFIG.invalidFile}`);
    }
    console.log(`   ✓ ${CONFIG.statsFile}`);
    
    console.log('\n✨ Temizleme tamamlandı!\n');
    
  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Scripti çalıştır
if (require.main === module) {
  main();
}

module.exports = { cleanData, normalizePhone, isValidEmail };
