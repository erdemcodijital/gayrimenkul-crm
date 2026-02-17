# Production Deployment Kılavuzu

Bu döküman, uygulamanın production ortamına nasıl deploy edileceğini açıklamaktadır.

## 🌐 Deployment Seçenekleri

### Seçenek 1: Vercel (Önerilen)

Vercel, Next.js'in geliştiricileri tarafından yapılmış bir hosting platformudur.

#### Adımlar:

1. **Vercel Hesabı Oluşturun**
   - https://vercel.com adresine gidin
   - GitHub hesabınızla giriş yapın

2. **Projeyi Import Edin**
   - "New Project" butonuna tıklayın
   - GitHub repository'nizi seçin (veya repo oluşturun)
   - "Import" butonuna tıklayın

3. **Environment Variables Ekleyin**
   - "Environment Variables" bölümünden şunları ekleyin:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Deploy Edin**
   - "Deploy" butonuna tıklayın
   - ✅ Birkaç dakika içinde siteniz yayında olacak

5. **Custom Domain Ekleyin** (Opsiyonel)
   - Settings > Domains bölümünden custom domain ekleyebilirsiniz

---

### Seçenek 2: Netlify

1. **Netlify'da Yeni Site Oluşturun**
   - https://netlify.com
   - "Add new site" > "Import an existing project"

2. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

3. **Environment Variables**
   - Site settings > Build & deploy > Environment
   - Supabase bilgilerini ekleyin

---

### Seçenek 3: Self-Hosting (VPS)

#### Gereksinimler:
- Ubuntu 20.04+ server
- Node.js 18+
- Nginx
- PM2

#### Adımlar:

1. **Sunucuya Bağlanın**
```bash
ssh user@your-server-ip
```

2. **Node.js Kurun**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **PM2 Kurun**
```bash
sudo npm install -g pm2
```

4. **Projeyi Clone Edin**
```bash
cd /var/www
git clone your-repo-url gayrimenkul
cd gayrimenkul
```

5. **Bağımlılıkları Yükleyin**
```bash
npm install
```

6. **Environment Variables**
```bash
nano .env.local
# Supabase bilgilerini girin ve kaydedin
```

7. **Build Edin**
```bash
npm run build
```

8. **PM2 ile Çalıştırın**
```bash
pm2 start npm --name "gayrimenkul" -- start
pm2 save
pm2 startup
```

9. **Nginx Konfigürasyonu**
```bash
sudo nano /etc/nginx/sites-available/gayrimenkul
```

Şu içeriği ekleyin:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

10. **Nginx'i Aktifleştirin**
```bash
sudo ln -s /etc/nginx/sites-available/gayrimenkul /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

11. **SSL Sertifikası (Let's Encrypt)**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔒 Production Güvenlik Kontrol Listesi

### Supabase Güvenliği

- [ ] RLS (Row Level Security) politikalarının aktif olduğunu doğrulayın
- [ ] Admin kullanıcıları için güçlü şifreler kullanın
- [ ] Supabase dashboard'a erişimi kısıtlayın
- [ ] Backup stratejisi oluşturun

### Next.js Güvenliği

- [ ] Environment variables'ları asla kodda hard-code etmeyin
- [ ] `.env.local` dosyasını git'e eklemeyin
- [ ] API rate limiting ekleyin (opsiyonel)
- [ ] CORS ayarlarını kontrol edin

### Genel Güvenlik

- [ ] HTTPS kullanın (SSL sertifikası)
- [ ] Güvenlik başlıkları ekleyin
- [ ] Regular security updates yapın
- [ ] Monitoring ve logging kurun

---

## 📊 Production Checklist

### Performans

- [ ] Next.js Image Optimization kullanın
- [ ] Lazy loading uygulayın
- [ ] Bundle size'ı optimize edin
- [ ] CDN kullanın (Vercel otomatik sağlar)

### SEO

- [ ] Meta tags'leri kontrol edin
- [ ] Sitemap ekleyin
- [ ] robots.txt oluşturun
- [ ] Open Graph tags ekleyin

### Monitoring

- [ ] Error tracking (Sentry vb.)
- [ ] Analytics (Google Analytics, Vercel Analytics)
- [ ] Uptime monitoring
- [ ] Performance monitoring

---

## 🔄 Güncelleme Stratejisi

### Vercel'de Otomatik Deployment

```bash
# main branch'e push ettiğinizde otomatik deploy olur
git add .
git commit -m "Update features"
git push origin main
```

### Self-Hosting Güncelleme

```bash
# Sunucuda
cd /var/www/gayrimenkul
git pull
npm install
npm run build
pm2 restart gayrimenkul
```

---

## 🆘 Troubleshooting

### Build Hatası
```bash
# node_modules ve .next'i temizle
rm -rf node_modules .next
npm install
npm run build
```

### Environment Variables Yüklenmiyor
- Vercel/Netlify'da environment variables'ları kontrol edin
- Self-hosting'de .env.local dosyasının varlığını doğrulayın
- Değişiklikten sonra rebuild edin

### Database Connection Hatası
- Supabase URL ve key'lerin doğruluğunu kontrol edin
- Supabase projesinin aktif olduğundan emin olun
- Network/firewall ayarlarını kontrol edin

---

## 📈 Scaling

### Database Scaling
- Supabase otomatik scaling sağlar
- Gerekirse daha büyük bir plan'a geçin

### Application Scaling
- Vercel otomatik scale eder
- Self-hosting'de load balancer ekleyin

---

## 🎯 Post-Deployment

1. **Test Edin**
   - Tüm sayfaları ziyaret edin
   - Form gönderimini test edin
   - Admin panelini test edin

2. **Monitoring Kurun**
   - Uptime monitoring
   - Error tracking
   - Performance monitoring

3. **Backup Stratejisi**
   - Supabase otomatik backup yapar
   - Manual export alın (opsiyonel)

4. **Dokümantasyon**
   - Deployment tarihini not edin
   - Versiyon bilgisini tutun
   - Değişiklikleri kaydedin

---

**Not**: Production'a geçmeden önce staging ortamında test etmeniz önerilir.
