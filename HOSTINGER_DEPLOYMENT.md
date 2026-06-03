# 🌍 Deployment ke Hostinger - Complete Guide

## 📌 Prerequisites

- ✅ Database sudah dimigrasikan ke MySQL lokal
- ✅ Semua data terimport dengan baik
- ✅ Testing lokal berhasil di XAMPP
- ✅ Hostinger account sudah aktif
- ✅ Domain sudah pointed ke Hostinger

---

## 🗂️ Struktur Hosting di Hostinger

```
public_html/
├── backend/
│   ├── src/
│   ├── prisma/
│   ├── dist/
│   ├── package.json
│   ├── tsconfig.json
│   └── .env (production)
├── frontend/
│   ├── dist/ (build output)
│   └── ...
└── .htaccess (untuk routing)
```

---

## 📋 Step-by-Step Deployment

### Step 1: Backup Database XAMPP

**Via Command Line (Windows Command Prompt):**

```bash
# Buka command prompt di folder portal-berita
cd C:\Users\kemas\portal-berita

# Jalankan mysqldump dari XAMPP
"C:\xampp\mysql\bin\mysqldump.exe" -u root portal_berita > portal_berita_backup.sql

# File backup akan tersimpan di C:\Users\kemas\portal-berita\portal_berita_backup.sql
```

**Verifikasi file:**
```bash
dir *.sql
# Seharusnya ada: portal_berita_backup.sql
```

### Step 2: Buat Database di Hostinger

1. **Login ke cPanel Hostinger**
   - URL: `https://hostinger.com` → My Websites → Manage

2. **Buat MySQL Database**
   - Go to: **Databases** → **MySQL**
   - Klik **Create New Database**
   
3. **Isi Detail Database:**
   - Database Name: `[username]_portal_berita`
   - Username: `[username]_portal`
   - Password: `[Create Strong Password - simpan di tempat aman]`
   - Klik **Create**

4. **Catat Credentials:**
   ```
   Hostname: localhost
   Username: [username]_portal
   Password: [your_strong_password]
   Database: [username]_portal_berita
   ```

### Step 3: Import Backup ke Hostinger

**Via cPanel phpMyAdmin:**

1. Buka cPanel → **Database** → **phpMyAdmin**
2. Select database: `[username]_portal_berita`
3. Klik tab: **Import**
4. **Choose File:** Pilih `portal_berita_backup.sql`
5. Klik: **Go / Import**
6. Tunggu hingga selesai (tampil "Import has been successfully completed")

**Verifikasi:**
- Tab **Database**: Seharusnya muncul tables: Role, User, Category, Post, Setting, Menu
- Click table untuk view data

### Step 4: Setup Node.js Application

1. **Buka Node.js App Manager**
   - cPanel → **Software** → **Node.js Selector**

2. **Create New Application**
   - Node.js Version: **20.10.0** (atau latest stable)
   - App URL: `yourdomain.com`
   - App Root: `/home/[username]/public_html/backend`
   - App Startup File: `dist/index.js`
   - Application Port: **Biarkan system assign**

3. **Environment Variables**
   - Klik **Edit App** → **Environment Variables**
   - Add:
     ```
     NODE_ENV = production
     ```

4. **Klik Create / Run**

### Step 5: Upload Backend Files

**Option A: Via File Manager (Simple)**

1. cPanel → **File Manager**
2. Navigate to: `public_html`
3. Upload backend files:
   - `package.json`
   - `tsconfig.json`
   - `prisma/` folder
   - `src/` folder

**Option B: Via FTP (Recommended for large files)**

1. Get FTP credentials dari cPanel → **FTP Accounts**
2. Gunakan FileZilla atau WinSCP:
   - Hostname: `ftp.yourdomain.com`
   - Username: `[FTP username]`
   - Password: `[FTP password]`
   - Port: `21`
3. Navigate ke `public_html`
4. Upload:
   - `backend/` folder → `public_html/backend/`
   - `frontend/dist/` → `public_html/public/`

**Option C: Via Git (Pro)**

```bash
# SSH ke Hostinger
ssh [username]@yourdomain.com

# Clone repository
cd /home/[username]/public_html
git clone https://github.com/AnggaNovlianta/portal-berita.git .

# Install dependencies
cd backend
npm install --production
```

### Step 6: Setup Production Environment

1. **Create/Edit .env file**
   - Via cPanel → File Manager
   - Navigate to: `public_html/backend/`
   - Create file: `.env`

2. **Isi konfigurasi production:**

```env
# Database - Gunakan credentials dari Step 2
DATABASE_URL="mysql://[username]_portal:your_strong_password@localhost:3306/[username]_portal_berita"

# JWT Secret - Generate baru atau gunakan yang ada
JWT_SECRET=your_super_secret_jwt_key_production

# Frontend URL
FRONTEND_URL=https://yourdomain.com

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Production Flag
NODE_ENV=production
```

### Step 7: Build Application

**Via Terminal SSH:**

```bash
# SSH ke server
ssh [username]@yourdomain.com

# Go to backend folder
cd /home/[username]/public_html/backend

# Build TypeScript
npm run build

# Verify build
ls -la dist/
# Seharusnya ada: dist/index.js dan file lainnya
```

### Step 8: Run Migrations (if needed)

```bash
# SSH connection
cd /home/[username]/public_html/backend

# Generate Prisma Client
npx prisma generate

# If new migrations exist
npx prisma migrate deploy
```

### Step 9: Setup Frontend Static Files

1. **Build Frontend locally:**
   ```bash
   cd frontend
   npm run build
   # Ini akan generate folder: frontend/dist/
   ```

2. **Upload ke Hostinger:**
   - Copy `frontend/dist/*` → `public_html/`
   - Atau via cPanel File Manager

3. **Setup Routing (.htaccess):**
   ```apache
   # public_html/.htaccess
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     
     # Jangan rewrite file dan folder yang ada
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     
     # Route semua request ke index.html untuk React Router
     RewriteRule ^ index.html [QSA,L]
     
     # API requests bypass routing
     RewriteCond %{REQUEST_URI} ^/api/
     RewriteRule ^ - [L]
   </IfModule>
   ```

---

## 🧪 Testing Production

### Test Database Connection
```bash
# SSH ke server
ssh [username]@yourdomain.com

cd /home/[username]/public_html/backend

# Test database
npx prisma db execute --stdin < /dev/null
# Atau
npx tsx src/test-db.ts
```

### Test API Endpoint
```bash
# Dari local computer
curl https://yourdomain.com/api/posts

# Expected response:
# {"data": [...]}
```

### Test Frontend
- Buka browser: `https://yourdomain.com`
- Seharusnya tampil homepage
- Test login dengan akun yang sudah ada

---

## 🔄 Monitoring & Maintenance

### View Application Logs

**Via cPanel:**
1. Go to: **Software** → **Node.js Selector**
2. Select your app
3. Klik **View Logs**

**Via SSH:**
```bash
# SSH ke server
tail -f /home/[username]/.pm2/logs/app-error.log
tail -f /home/[username]/.pm2/logs/app-out.log
```

### Restart Application

**Via cPanel:**
1. **Node.js Selector**
2. Select app → **Restart**

**Via SSH:**
```bash
cd /home/[username]/public_html/backend
pm2 restart app
pm2 logs
```

### Check Application Status

**Via SSH:**
```bash
pm2 status
pm2 show app
```

---

## 🔒 SSL/HTTPS Setup

### Hostinger Auto SSL
1. cPanel → **Domains**
2. Select domain
3. Klik **AutoSSL** → Install

### Force HTTPS
Add to `public_html/.htaccess`:
```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

---

## 📊 Database Maintenance

### Regular Backups

**Automated Backup via cPanel:**
1. cPanel → **Backup** → Set backup schedule
2. Frequency: Daily/Weekly
3. Backup location: Remote storage (if available)

**Manual Backup:**
```bash
# SSH ke server
mysqldump -u [username]_portal -p [username]_portal_berita > backup_$(date +%Y%m%d).sql

# Copy ke local
scp [username]@yourdomain.com:~/backup_*.sql ./
```

### Monitor Database Size

```bash
# SSH ke server
mysql -u [username]_portal -p -e "SELECT 
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables 
GROUP BY table_schema;"
```

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Cannot find module '@prisma/client'"
```bash
# Solution
cd /home/[username]/public_html/backend
npm install @prisma/client
npx prisma generate
```

### Issue 2: "EACCES: permission denied"
```bash
# Solution - SSH to server
chmod -R 755 /home/[username]/public_html/backend
chmod 600 /home/[username]/public_html/backend/.env
```

### Issue 3: "Database connection failed"
```
Checklist:
- Verify DATABASE_URL di .env
- Verify MySQL user credentials
- Verify firewall allows localhost connection
- Check if MySQL service running: systemctl status mysql
```

### Issue 4: "Port already in use"
```bash
# Solution
pm2 restart app
# atau
pkill -f "node dist/index.js"
```

### Issue 5: "Static files not loading"
```
Checklist:
- Verify frontend/dist/ files uploaded
- Check .htaccess configuration
- Verify file permissions (755 for folders, 644 for files)
```

---

## 📈 Performance Optimization

### Enable Gzip Compression
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>
```

### Cache Headers
```apache
<FilesMatch "\.(jpg|jpeg|png|gif|css|js|woff|woff2)$">
  Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

### Database Query Optimization
```typescript
// ✅ Good - selective fields
const posts = await prisma.post.findMany({
  select: { id: true, title: true, slug: true },
  take: 10,
});

// ❌ Avoid - all fields
const posts = await prisma.post.findMany();
```

---

## ✅ Post-Deployment Checklist

- [ ] Database MySQL terbuat di Hostinger
- [ ] Data successfully imported
- [ ] .env file dengan credentials yang benar
- [ ] Backend aplikasi upload lengkap
- [ ] Frontend build & upload lengkap
- [ ] npm install dependency selesai
- [ ] npm run build berhasil
- [ ] Node.js App berjalan (status: running)
- [ ] API endpoint accessible: https://yourdomain.com/api/posts
- [ ] Frontend tampil di: https://yourdomain.com
- [ ] Login berfungsi dengan user existing
- [ ] Create post berfungsi
- [ ] Upload thumbnail berfungsi
- [ ] Database logs normal
- [ ] SSL/HTTPS active
- [ ] Backup schedule active

---

## 🆘 Getting Help

### Check Status
```bash
# SSH ke server
pm2 status
pm2 logs
```

### Test Connectivity
```bash
# Local computer
curl -v https://yourdomain.com/api/posts

# Check response headers & timing
```

### View Detailed Logs
```bash
# SSH ke server
journalctl -u app -f
tail -100 /home/[username]/.pm2/logs/app-error.log
```

---

**Deployment Status:** ✅ Ready
**Last Updated:** June 4, 2026
**Contact:** Hostinger Support atau cPanel Documentation
