# Gayrimenkul Danışman Yönetim Sistemi

Modern, SaaS mantığında çalışan gayrimenkul danışmanları için lead toplama ve yönetim platformu.

## 🚀 Özellikler

### Admin Panel
- ✅ Yeni danışman oluşturma
- ✅ Danışman domain yönetimi
- ✅ Site aktif/pasif yapma
- ✅ Lisans durumu yönetimi
- ✅ Tüm leadleri görüntüleme ve filtreleme
- ✅ CSV export

### Danışman Landing Sayfası
- ✅ Özelleştirilebilir danışman profili
- ✅ WhatsApp entegrasyonu
- ✅ Profesyonel lead formu
- ✅ Mobil uyumlu tasarım
- ✅ Modern ve çekici UI/UX

### Form Alanları
- Ad Soyad
- Telefon
- Bütçe
- Oda Sayısı
- İlçe
- Notlar

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## 📋 Kurulum

### 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabı oluşturun
2. Yeni bir proje oluşturun
3. SQL Editor'de `gayrimenkul_proje.sql` dosyasını çalıştırın

### 2. Proje Kurulumu

```bash
# Proje dizinine gidin
cd c:/xampp/htdocs/gayrimenkul

# Bağımlılıkları yükleyin
npm install

# .env.local dosyası oluşturun
cp .env.example .env.local
```

### 3. Environment Variables

`.env.local` dosyasını düzenleyin:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Bu bilgileri Supabase projenizin Settings > API bölümünden alabilirsiniz.

### 4. İlk Admin Kullanıcısı Oluşturma

1. Supabase Dashboard > Authentication > Users bölümünden bir kullanıcı oluşturun
2. Kullanıcının `id`'sini kopyalayın
3. SQL Editor'de şu komutu çalıştırın:

```sql
INSERT INTO admin_users (user_id) 
VALUES ('KULLANICI_ID_BURAYA');
```

### 5. Uygulamayı Çalıştırma

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📱 Kullanım

### Admin Paneli

1. `http://localhost:3000/admin/login` adresine gidin
2. Supabase'de oluşturduğunuz admin kullanıcısı ile giriş yapın
3. Dashboard'dan sistem istatistiklerini görüntüleyin
4. **Danışmanlar** sayfasından yeni danışman ekleyin
5. **Leadler** sayfasından gelen leadleri yönetin

### Danışman Sayfası

Danışman oluştururken bir `domain` belirleyin. Örneğin:
- Domain: `ahmet-yilmaz`
- Landing page URL: `http://localhost:3000/d/ahmet-yilmaz`

Her danışman kendi özel landing sayfasına sahiptir.

## 🗄️ Veritabanı Yapısı

### `agents` Tablosu
- Danışman bilgileri
- Domain yönetimi
- Lisans durumu
- Aktif/pasif durumu

### `leads` Tablosu
- Lead bilgileri
- Danışman ilişkisi
- Durum takibi (yeni, iletişime geçildi, dönüştürüldü, kayıp)

### `admin_users` Tablosu
- Admin yetkilendirme

## 🔒 Güvenlik

- **Row Level Security (RLS)**: Supabase RLS politikaları ile her kullanıcı sadece kendi verilerine erişebilir
- **Admin Kontrolü**: Sadece admin kullanıcıları danışman oluşturabilir
- **Public Form**: Lead formları public'tir ancak doğrudan veritabanına yazılır

## 🎨 Özelleştirme

### Renkleri Değiştirme

`tailwind.config.ts` dosyasındaki `primary` renklerini düzenleyin:

```typescript
colors: {
  primary: {
    50: '#f0f9ff',
    // ...
  }
}
```

### Form Alanları Ekleme

1. `gayrimenkul_proje.sql` dosyasına yeni alanı ekleyin
2. `lib/database.types.ts` dosyasını güncelleyin
3. `LeadForm.tsx` komponentine yeni form alanını ekleyin

## 📊 Özellik Listesi

- [x] Veritabanı şeması
- [x] Admin paneli (login, dashboard, danışman yönetimi, lead görüntüleme)
- [x] Danışman landing sayfaları (dinamik routing)
- [x] Lead formu
- [x] WhatsApp entegrasyonu
- [x] CSV export
- [x] Responsive tasarım
- [x] Row Level Security
- [ ] E-posta bildirimleri
- [ ] SMS entegrasyonu
- [ ] Detaylı analytics
- [ ] Multi-language desteği

## 🤝 Katkıda Bulunma

Projeye katkıda bulunmak için pull request gönderebilirsiniz.

## 📝 Lisans

Bu proje özel kullanım içindir.

## 📞 Destek

Herhangi bir sorun için issue açabilirsiniz.

---

**Geliştirici Notları:**

- Next.js 14 App Router kullanılmıştır
- Tüm komponentler TypeScript ile yazılmıştır
- Server Components ve Client Components doğru şekilde ayrılmıştır
- Supabase Auth ve RLS politikaları entegre edilmiştir
- Modern UI/UX best practices uygulanmıştır
