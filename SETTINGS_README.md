# ⚙️ Sistem Ayarları Kurulumu

## 📋 Özellikler

Sistem Ayarları sayfası aşağıdaki özellikleri içerir:

### 1️⃣ Genel Ayarlar
- Site başlığı ve açıklama
- Destek email ve telefon

### 2️⃣ Email (SMTP) Ayarları
- SMTP host, port, kullanıcı, şifre
- Gönderen email ve isim
- Aktif/Pasif durumu
- Bağlantı testi

### 3️⃣ WhatsApp Ayarları
- API URL ve Key
- Aktif/Pasif durumu

### 4️⃣ Bildirim Ayarları
- Yeni lead bildirimi
- Lead durum değişikliği
- Yeni ilan bildirimi
- Yeni danışman kaydı

### 5️⃣ Tema Ayarları
- Ana renk (Primary)
- İkincil renk (Secondary)
- Logo URL
- Favicon URL
- Color picker ile renk seçimi

### 6️⃣ Güvenlik Ayarları
- PIN kod zorunluluğu
- Session timeout (saat)
- IP whitelist
- Maksimum giriş denemesi

---

## 🚀 Kurulum Adımları

### 1. Supabase'de Settings Tablosu Oluştur

Supabase Dashboard'a git:
1. SQL Editor'ü aç
2. `supabase/migrations/005_create_settings_table.sql` dosyasındaki SQL'i yapıştır
3. Run tuşuna bas

### 2. Sayfaya Erişim

Admin paneline giriş yap:
```
http://localhost:3000/admin/settings
```

---

## 🎨 Kullanım

### Ayarları Değiştirme:
1. İlgili tab'e tıkla (Genel, Email, vb.)
2. Değişiklik yap
3. "Ayarları Kaydet" butonuna tıkla

### Email Test Etme:
1. Email (SMTP) tab'ına git
2. SMTP bilgilerini doldur
3. "Bağlantıyı Test Et" butonuna tıkla

### Tema Renkleri:
1. Tema tab'ına git
2. Color picker ile renk seç VEYA hex kodu gir
3. Logo/Favicon URL'lerini güncelle
4. Kaydet

---

## 📊 Veritabanı Yapısı

```sql
settings (
  id: 1 (tek satır)
  
  -- Genel
  site_title
  site_description
  support_email
  support_phone
  
  -- Email
  smtp_host, smtp_port, smtp_user, smtp_password
  smtp_from_email, smtp_from_name
  smtp_enabled
  
  -- WhatsApp
  whatsapp_api_url, whatsapp_api_key
  whatsapp_enabled
  
  -- Bildirimler
  notify_new_lead, notify_lead_status_change
  notify_new_property, notify_agent_signup
  
  -- Tema
  primary_color, secondary_color
  logo_url, favicon_url
  
  -- Güvenlik
  pin_required, session_timeout
  ip_whitelist, max_login_attempts
)
```

---

## 🔐 Güvenlik Notları

- **SMTP Şifre:** `password` tipi input, göster/gizle butonu
- **WhatsApp Key:** `password` tipi input, göster/gizle butonu
- **IP Whitelist:** Dikkatli kullanın, yanlış IP'ler sisteme erişimi engelleyebilir
- **Session Timeout:** 1-168 saat arası olmalı

---

## 🎯 Varsayılan Değerler

```javascript
site_title: 'Gayrimenkul CRM'
primary_color: '#111827'
secondary_color: '#6366F1'
pin_required: true
session_timeout: 24 (saat)
max_login_attempts: 5
notify_new_lead: true
```

---

## 🔗 API Entegrasyonları

### Email (SMTP):
- Gmail: `smtp.gmail.com:587`
- Outlook: `smtp-mail.outlook.com:587`
- SendGrid: `smtp.sendgrid.net:587`

### WhatsApp:
- Twilio
- MessageBird
- WhatsApp Business API

---

## 🐛 Sorun Giderme

### Ayarlar Kaydedilmiyor:
- Supabase bağlantısını kontrol edin
- Browser console'u kontrol edin
- Settings tablosunun oluşturulduğundan emin olun

### Email Testi Çalışmıyor:
- SMTP bilgilerini kontrol edin
- Port 587 açık mı kontrol edin
- Gmail kullanıyorsanız "App Password" kullanın

### Renkler Değişmiyor:
- Hex kod formatı: `#RRGGBB`
- Sayfa yenilemeyi deneyin
- Cache temizleyin

---

## 📝 TODO (Gelecek Özellikler)

- [ ] Logo/Favicon upload özelliği
- [ ] Email template editor
- [ ] WhatsApp template yönetimi
- [ ] Bulk email gönderimi
- [ ] Activity log entegrasyonu
- [ ] Backup/Restore ayarları

---

## 🎨 UI/UX Özellikleri

- ✅ Tab-based navigation
- ✅ Color picker
- ✅ Password show/hide
- ✅ Success/Error messages
- ✅ Loading states
- ✅ Responsive design
- ✅ Icon-based navigation
- ✅ Kurumsal SaaS teması

---

## 📞 Destek

Sorularınız için:
- GitHub Issues
- support@example.com
