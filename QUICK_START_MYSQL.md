# ⚡ QUICK START - Migrasi ke MySQL

## 🎯 TL;DR (Versi Singkat)

Jika sudah familiar dengan setup database, ikuti langkah ini:

### Persiapan Lokal (XAMPP)
```bash
# 1. Start MySQL di XAMPP Control Panel
# 2. Buka phpMyAdmin: http://localhost/phpmyadmin
# 3. Buat database: portal_berita (collation: utf8mb4_unicode_ci)

# 4. Setup Backend
cd backend
cp .env.example .env
npm install

# 5. Generate & Migrate
npx prisma generate
npx prisma migrate dev --name init

# 6. Import Data
npm run seed:mysql

# 7. Verify
npm run test:db

# 8. Start App
npm run dev
```

Di terminal lain:
```bash
cd frontend
npm run dev
```

Buka: http://localhost:5173

---

## 📋 Konfigurasi .env

Lokasi: `backend/.env`

```env
DATABASE_URL="mysql://root:@localhost:3306/portal_berita"
JWT_SECRET=rahasia_jwt_super_aman_anda
FRONTEND_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email.anda@gmail.com
SMTP_PASS=password_aplikasi_anda
```

**Untuk Hostinger, ubah:**
```env
DATABASE_URL="mysql://hostinger_user:password@localhost:3306/db_name"
FRONTEND_URL=https://domainmu.com
```

---

## 🧪 Testing

### Test Koneksi Database
```bash
npm run test:db
```

**Expected Output:**
```
1️⃣  Checking MySQL connection...
   ✅ MySQL connection successful

2️⃣  Checking tables...
   ✅ Roles: 3 data
   ✅ Users: 4 data
   ✅ Categories: 7 data
   ✅ Posts: 12 data
   ✅ Settings: 25 data

✅ ALL TESTS PASSED - Database ready to use!
```

### Test Login
1. Go to: http://localhost:5173/login
2. Email: `angganovlianta@gmail.com`
3. Password: Gunakan password yang sudah dienkripsi di database

---

## 🚀 Deploy ke Hostinger

### 1. Buat Database di Hostinger
- cPanel → MySQL Databases → Create New Database
- Nama: `your_username_portal_berita`
- Username: (create new)
- Password: (gunakan strong password)

### 2. Export Database dari XAMPP

**Via Command Line (Windows Command Prompt):**
```bash
cd C:\xampp\mysql\bin
mysqldump -u root portal_berita > "C:\Users\kemas\portal_berita_backup.sql"
```

**Via phpMyAdmin:**
1. Pilih database `portal_berita`
2. Klik Export → Download sebagai SQL file

### 3. Import ke Hostinger

**Via cPanel phpMyAdmin:**
1. Pilih database Hostinger
2. Tab Import
3. Choose file → Upload backup.sql
4. Execute

**Via SSH (jika punya akses):**
```bash
mysql -u hostinger_user -p database_name < portal_berita_backup.sql
```

### 4. Update Environment di Hostinger

File: `/public_html/backend/.env`

```env
DATABASE_URL="mysql://hostinger_user:password@localhost:3306/database_name"
JWT_SECRET=[generate ulang atau use yang lama]
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

### 5. Deploy Backend ke Hostinger

**Via File Manager / FTP:**
1. Upload seluruh folder `backend` ke `/public_html/`
2. Upload seluruh folder `frontend/dist` ke `/public_html/public`

**Via SSH (recommended):**
```bash
# SSH ke Hostinger
ssh user@hostinger.com

cd /home/username/public_html
git clone [repo-url] .
cd backend
npm install --production
npm run build

# Copy frontend dist
cp -r ../frontend/dist/* public/
```

### 6. Setup Node.js di Hostinger

1. cPanel → Setup Node.js App
2. Node.js Version: 18.x atau 20.x
3. App URL: `https://yourdomain.com`
4. App Root: `/home/username/public_html/backend`
5. App Startup File: `dist/index.js`

### 7. Restart & Test

```bash
# Restart Node app di Hostinger
# Atau via cPanel → Node.js Selector → Restart

# Test:
curl https://yourdomain.com/api/posts
```

---

## ❓ FAQ

### Q: Apakah semua data akan tetap?
**A:** ✅ Ya! Semua data users, posts, categories, settings akan migrate 100%.

### Q: Apakah tampilan berubah?
**A:** ✅ Tidak! Hanya database driver yang berubah dari PostgreSQL ke MySQL.

### Q: Berapa lama migrasi?
**A:** ⏱️ ~5 menit untuk lokal, ~15 menit termasuk Hostinger setup.

### Q: Bagaimana jika ada error?
**A:** 
1. Cek .env configuration
2. Pastikan MySQL running
3. Jalankan: `npx prisma db push`
4. Jalankan: `npm run seed:mysql`

### Q: Bisakah saya rollback ke PostgreSQL?
**A:** ✅ Ya! Backup .env PostgreSQL Anda dan switch kembali. Semua data aman di file backup.

---

## 🛠️ Useful Commands

```bash
# Database Operations
npm run db:push          # Push schema ke database
npm run db:migrate       # Create new migration
npm run db:generate      # Generate Prisma client
npm run seed:mysql       # Import data dari data.json
npm run test:db          # Test database connection

# App Operations
npm run dev              # Start backend dev server
npm run build            # Build TypeScript
npm start                # Start production server

# Prisma CLI
npx prisma studio       # GUI untuk database
npx prisma validate     # Validate schema.prisma
npx prisma format       # Format schema.prisma
```

---

## 📞 Troubleshooting Cepat

| Error | Solusi |
|-------|--------|
| `ECONNREFUSED` | MySQL belum running. Start di XAMPP. |
| `ER_ACCESS_DENIED_ERROR` | Check DATABASE_URL di .env |
| `ER_NO_SUCH_TABLE` | Jalankan: `npx prisma migrate dev` |
| `Connection timeout` | Firewall atau MySQL port blocked |
| `SQLITE_CANTOPEN` | Delete `prisma/dev.db` jika ada |

---

## ✅ Checklist Sebelum Launch

- [ ] Database MySQL berjalan
- [ ] `.env` sudah update
- [ ] `npm install` selesai
- [ ] `npm run test:db` passed
- [ ] Login berfungsi
- [ ] Upload berfungsi
- [ ] Dashboard accessible
- [ ] Hostinger database siap
- [ ] Backend dapat diakses
- [ ] Frontend dapat diakses

---

**Butuh bantuan lebih detail?** Lihat [MIGRASI_POSTGRESQL_KE_MYSQL.md](./MIGRASI_POSTGRESQL_KE_MYSQL.md)

**Teknis detil?** Lihat [TECHNICAL_MIGRATION_GUIDE.md](./TECHNICAL_MIGRATION_GUIDE.md)
