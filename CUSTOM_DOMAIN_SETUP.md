# Custom Domain Kurulum Rehberi

Bu döküman, her danışman için custom domain nasıl bağlanacağını açıklar.

## 🌐 Sistem Nasıl Çalışır?

Sistemde **3 erişim yolu** vardır:

### 1️⃣ Ana Domain (Admin Paneli)
```
https://gayrimenkulcrm.com/admin
```
- Admin paneli
- Danışman yönetimi
- Lead görüntüleme

### 2️⃣ Path-Based URL (Varsayılan)
```
https://gayrimenkulcrm.com/d/ahmet-yilmaz
```
- Her danışman için otomatik oluşturulur
- Domain bağlanmadan önce kullanılır

### 3️⃣ Custom Domain (Danışman Özel)
```
https://ahmetyilmaz.com
https://gayrimenkulahmet.com.tr
```
- Danışman kendi domain'ini bağlar
- Profesyonel görünüm
- SEO dostu

---

## 🚀 Vercel'de Custom Domain Nasıl Bağlanır?

### Adım 1: Proje Deploy Edilmeli

Önce projenizi Vercel'e deploy edin:

```bash
# GitHub'a push edin
git add .
git commit -m "Custom domain support"
git push origin main

# Vercel'de deploy edin
# https://vercel.com
```

### Adım 2: Vercel Projesinde Domain Ekleyin

1. **Vercel Dashboard**'a gidin
2. Projenizi seçin
3. **Settings** > **Domains** sekmesine gidin
4. **"Add"** butonuna tıklayın

### Adım 3: Domain Ekleyin

Her danışman için ayrı ayrı:

**Domain eklerken**:
```
ahmetyilmaz.com
```

**Vercel size DNS ayarlarını gösterecek**:

#### A Record (Yöntem 1):
```
Type: A
Name: @
Value: 76.76.21.21
```

#### CNAME (Yöntem 2 - Önerilen):
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

### Adım 4: DNS Ayarlarını Yapın

Danışmanın domain sağlayıcısında (GoDaddy, Namecheap, vs.):

1. **DNS Management** bölümüne gidin
2. Yeni **A Record** veya **CNAME** ekleyin
3. Vercel'in verdiği değerleri girin
4. Kaydedin

**Propagation** 5-10 dakika sürebilir.

### Adım 5: Doğrulama

Vercel otomatik olarak:
- ✅ Domain'i doğrular
- ✅ SSL sertifikası ekler (HTTPS)
- ✅ Domain'i aktif eder

---

## 📋 Danışman Ekleme Süreci

### Admin Panelinde:

1. **Danışmanlar** > **Yeni Danışman** butonuna tıklayın
2. Formu doldurun:
   ```
   Ad Soyad: Ahmet Yılmaz
   E-posta: ahmet@example.com
   Telefon: 05321234567
   WhatsApp: 905321234567
   Şehir: İstanbul
   Domain: ahmetyilmaz.com  ← Custom domain veya slug
   ```

3. **Domain alanı** için 2 seçenek:
   - **Custom domain**: `ahmetyilmaz.com` (danışmanın domain'i)
   - **Slug**: `ahmet-yilmaz` (path-based için)

4. Kaydet

### Danışmana Ne Söylenecek:

```
Sayın Ahmet Yılmaz,

Landing sayfanız hazır! 

🌐 Geçici URL: https://gayrimenkulcrm.com/d/ahmetyilmaz.com

Kendi domain'inizi (ahmetyilmaz.com) bağlamak için:

1. Domain sağlayıcınıza giriş yapın (GoDaddy, Namecheap, vs.)
2. DNS Management bölümüne gidin
3. Şu CNAME kaydını ekleyin:
   - Type: CNAME
   - Name: @ (veya domain adınız)
   - Value: cname.vercel-dns.com
   - TTL: Automatic

4. 10-15 dakika içinde ahmetyilmaz.com aktif olacak

Sorularınız için: destek@gayrimenkulcrm.com
```

---

## 🔧 Teknik Detaylar

### Middleware Nasıl Çalışır?

`middleware.ts` dosyası:

1. **Domain'i yakalar**: `ahmetyilmaz.com`
2. **Veritabanında arar**: `agents` tablosunda `domain = 'ahmetyilmaz.com'`
3. **Sayfa render eder**: Danışman landing sayfası

### Ana Domain Koruması

Ana domain'lerde admin paneli korunur:
```typescript
const mainDomains = [
  'localhost:3000',
  'gayrimenkulcrm.com',
  'www.gayrimenkulcrm.com',
];
```

Bu domain'ler custom routing'e girmez.

---

## 📊 Domain Yönetimi

### Veritabanında:

```sql
-- Danışman eklerken
INSERT INTO agents (name, email, domain, is_active)
VALUES ('Ahmet Yılmaz', 'ahmet@example.com', 'ahmetyilmaz.com', true);

-- Domain güncelleme
UPDATE agents 
SET domain = 'yeni-domain.com' 
WHERE id = 'agent_id';

-- Domain'e göre bulma
SELECT * FROM agents WHERE domain = 'ahmetyilmaz.com';
```

---

## ⚙️ Vercel Konfigürasyonu

Vercel otomatik olarak:
- Wildcard domain'leri destekler
- Her domain için SSL sertifikası oluşturur
- CDN üzerinden serve eder
- DDoS koruması sağlar

**Ek konfigürasyon gerekmez!**

---

## 💡 En İyi Pratikler

### 1. Domain Formatı

✅ **Doğru**:
```
ahmetyilmaz.com
gayrimenkul-ahmet.com
ahmet.gayrimenkul.com (subdomain)
```

❌ **Yanlış**:
```
http://ahmetyilmaz.com (protokol eklemeyin)
ahmetyilmaz.com/ (slash eklemeyin)
Ahmet Yılmaz (boşluk kullanmayın)
```

### 2. Domain Kontrolü

Her domain eklenmeden önce:
- Domain'in aktif olduğundan emin olun
- Danışman domain'in sahibi olmalı
- DNS erişimi olmalı

### 3. Yedek URL

Her danışmana hem:
- Custom domain (`ahmetyilmaz.com`)
- Path URL (`gayrimenkulcrm.com/d/ahmetyilmaz.com`)

verin. DNS sorunlarında yedek olarak kullanılabilir.

---

## 🆘 Sorun Giderme

### Domain Çalışmıyor

1. **DNS Propagation**: 24 saate kadar sürebilir
2. **Kontrol**: `nslookup ahmetyilmaz.com`
3. **Vercel Status**: Settings > Domains'de status kontrol edin

### SSL Sertifikası Hatası

- Vercel otomatik SSL ekler
- 5-10 dakika bekleyin
- Hala yoksa domain'i kaldırıp tekrar ekleyin

### "Danışman Bulunamadı" Hatası

1. Domain veritabanında doğru mu?
   ```sql
   SELECT * FROM agents WHERE domain = 'ahmetyilmaz.com';
   ```
2. `is_active = true` mi?
3. Domain Vercel'de ekli mi?

---

## 📈 Ölçeklendirme

Vercel **Free Plan**:
- ✅ Sınırsız custom domain
- ✅ Otomatik SSL
- ✅ CDN

**100+ danışman** için yeterli!

Daha fazlası için **Pro Plan** ($20/ay):
- Daha hızlı build
- Gelişmiş analytics
- Takım özellikleri

---

## 🎯 Özet Checklist

Admin için:
- [ ] Proje Vercel'e deploy edildi
- [ ] Ana domain bağlandı (gayrimenkulcrm.com)
- [ ] Environment variables eklendi
- [ ] İlk test danışmanı oluşturuldu

Danışman ekleme:
- [ ] Admin panelde danışman oluşturuldu
- [ ] Domain alanına custom domain girildi
- [ ] Vercel'de domain eklendi
- [ ] DNS ayarları yapıldı
- [ ] Domain aktif oldu (10-15 dk)
- [ ] Danışmana bilgi verildi

---

**Sorularınız için**: README.md ve DEPLOYMENT.md dosyalarına bakın.
