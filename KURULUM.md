# Kurulum Kılavuzu

Bu döküman, Gayrimenkul Danışman Yönetim Sistemi'nin sıfırdan kurulumunu adım adım açıklamaktadır.

## 📌 Gereksinimler

- Node.js 18+ (https://nodejs.org/)
- npm veya yarn
- Supabase hesabı (https://supabase.com)

## 🚀 Adım Adım Kurulum

### Adım 1: Supabase Projesi Oluşturma

1. **Supabase'e Giriş Yapın**
   - https://supabase.com adresine gidin
   - Giriş yapın veya yeni hesap oluşturun

2. **Yeni Proje Oluşturun**
   - "New Project" butonuna tıklayın
   - Proje adı: `gayrimenkul-crm` (veya istediğiniz bir isim)
   - Database şifresi belirleyin (güçlü bir şifre kullanın)
   - Region seçin (Türkiye için Frankfurt önerilir)
   - "Create new project" butonuna tıklayın

3. **Veritabanını Oluşturun**
   - Proje hazır olduktan sonra, sol menüden "SQL Editor"ı açın
   - "New query" butonuna tıklayın
   - `gayrimenkul_proje.sql` dosyasının tüm içeriğini kopyalayıp yapıştırın
   - "Run" butonuna tıklayın
   - ✅ Başarılı mesajını görmelisiniz

### Adım 2: API Anahtarlarını Alma

1. Sol menüden "Settings" > "API" bölümüne gidin
2. Şu bilgileri kopyalayın:
   - **Project URL** (URL kısmında)
   - **anon public** (Project API keys kısmında)

### Adım 3: Proje Dosyalarını Hazırlama

1. Komut satırını açın (CMD veya Terminal)

2. Proje dizinine gidin:
```bash
cd c:\xampp\htdocs\gayrimenkul
```

3. Bağımlılıkları yükleyin:
```bash
npm install
```

4. Environment dosyasını oluşturun:
```bash
copy .env.example .env.local
```

5. `.env.local` dosyasını bir metin editöründe açın ve bilgileri girin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Adım 4: İlk Admin Kullanıcısı Oluşturma

1. **Supabase Dashboard'a Dönün**
   - Sol menüden "Authentication" > "Users" bölümüne gidin

2. **Yeni Kullanıcı Ekleyin**
   - "Add user" > "Create new user" butonuna tıklayın
   - E-posta: admin@example.com (veya kendi e-postanız)
   - Şifre: Güçlü bir şifre belirleyin
   - "Auto Confirm User" seçeneğini işaretleyin
   - "Create user" butonuna tıklayın

3. **Kullanıcının ID'sini Kopyalayın**
   - Oluşan kullanıcının üzerine tıklayın
   - "UID" alanındaki ID'yi kopyalayın

4. **Admin Yetkisi Verin**
   - SQL Editor'a dönün
   - Şu komutu çalıştırın (UID yerine kopyaladığınız ID'yi yazın):
   ```sql
   INSERT INTO admin_users (user_id) 
   VALUES ('BURAYA_UID_YAPIŞTIRIN');
   ```
   - ✅ 1 row affected mesajını görmelisiniz

### Adım 5: Uygulamayı Başlatma

1. Komut satırında şu komutu çalıştırın:
```bash
npm run dev
```

2. Tarayıcınızda şu adresi açın:
```
http://localhost:3000
```

3. ✅ Ana sayfa yüklenmelidir

### Adım 6: Admin Paneline Giriş

1. Şu adrese gidin:
```
http://localhost:3000/admin/login
```

2. Adım 4'te oluşturduğunuz kullanıcı bilgileri ile giriş yapın:
   - E-posta: admin@example.com
   - Şifre: Belirlediğiniz şifre

3. ✅ Dashboard sayfasına yönlendirilmelisiniz

### Adım 7: İlk Danışmanı Oluşturma

1. Sol menüden "Danışmanlar" bölümüne gidin

2. "Yeni Danışman" butonuna tıklayın

3. Formu doldurun:
   - **Ad Soyad**: Ahmet Yılmaz (örnek)
   - **E-posta**: ahmet@example.com
   - **Telefon**: 05XX XXX XX XX
   - **WhatsApp**: 905XXXXXXXXX
   - **Şehir**: İstanbul
   - **Domain**: ahmet-yilmaz (URL için kullanılacak)

4. "Kaydet" butonuna tıklayın

5. ✅ Danışman oluşturulmalı ve listede görünmelidir

### Adım 8: Landing Sayfasını Test Etme

1. Tarayıcınızda şu adresi açın (domain olarak belirlediğiniz ismi kullanın):
```
http://localhost:3000/d/ahmet-yilmaz
```

2. ✅ Danışman landing sayfası görünmelidir

3. **Formu Test Edin**:
   - "Ücretsiz Danışmanlık Al" butonuna tıklayın
   - Formu doldurun
   - "Gönder" butonuna tıklayın
   - ✅ Başarı mesajı görünmeli

4. **Admin Panelinde Kontrol Edin**:
   - Admin paneline dönün
   - "Leadler" bölümüne gidin
   - ✅ Yeni lead görünmelidir

## 🎉 Kurulum Tamamlandı!

Artık sisteminiz çalışıyor. Aşağıdaki işlemleri yapabilirsiniz:

### Yapılacaklar Listesi

- [ ] Gerçek admin e-postanız ile yeni bir kullanıcı oluşturun
- [ ] Test admin kullanıcısını silin
- [ ] Gerçek danışmanları ekleyin
- [ ] Domain adreslerini belirleyin
- [ ] WhatsApp numaralarını test edin
- [ ] Formu test edin

## 🔧 Sorun Giderme

### "Module not found" Hatası
```bash
# node_modules'ı silip yeniden yükleyin
rm -rf node_modules
npm install
```

### Supabase Bağlantı Hatası
- `.env.local` dosyasındaki bilgileri kontrol edin
- Supabase projesinin aktif olduğundan emin olun
- Tarayıcı konsolunda hata mesajlarını kontrol edin

### Admin Girişi Başarısız
- Kullanıcının admin_users tablosuna eklendiğinden emin olun
- SQL Editor'da kontrol edin:
```sql
SELECT * FROM admin_users;
```

### Landing Sayfası 404 Hatası
- Danışman domain'inin doğru yazıldığından emin olun
- Danışmanın `is_active` durumunun `true` olduğunu kontrol edin

## 📚 Ek Kaynaklar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Supabase Dokümantasyonu](https://supabase.com/docs)
- [TailwindCSS Dokümantasyonu](https://tailwindcss.com/docs)

## 🆘 Yardım

Sorun yaşıyorsanız:
1. Hata mesajını tam olarak okuyun
2. Tarayıcı konsolunu kontrol edin (F12)
3. Supabase Dashboard > Logs bölümünü kontrol edin
4. README.md dosyasını tekrar okuyun

---

**Not**: Production'a almadan önce:
- Güvenli şifreler kullanın
- `.env.local` dosyasını asla paylaşmayın
- Supabase RLS politikalarını gözden geçirin
- SSL sertifikası kullanın
