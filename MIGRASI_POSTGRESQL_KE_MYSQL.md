# 📋 Panduan Migrasi PostgreSQL ke MySQL

## Ringkasan Proses Migrasi
Kita akan memigrasikan aplikasi **Portal Berita** dari PostgreSQL ke MySQL dengan menggunakan XAMPP lokal untuk testing, kemudian deploy ke Hostinger.

**Status Data:**
- ✅ Roles: 3 data
- ✅ Users: 4 user aktif
- ✅ Settings: 25+ konfigurasi
- ✅ Categories: 7 kategori
- ✅ Posts: 12 artikel

---

## ⚙️ TAHAP 1: SETUP XAMPP (Windows)

### 1.1 Instalasi XAMPP
1. Download XAMPP terbaru dari: https://www.apachefriends.org/
2. Jalankan installer dan pilih komponen:
   - ✅ Apache
   - ✅ MySQL
   - ✅ PHP
   - ✅ PhpMyAdmin
3. Install di direktori default (biasanya `C:\xampp`)
4. Setelah instalasi, buka XAMPP Control Panel

### 1.2 Konfigurasi MySQL di XAMPP
1. Di XAMPP Control Panel, klik **Start** pada MySQL
2. Tunggu hingga status berubah menjadi hijau (running)
3. Akses phpMyAdmin: http://localhost/phpmyadmin

**Default Credentials:**
- Username: `root`
- Password: (kosong)
- Host: `localhost:3306`

### 1.3 Buat Database Baru
Di phpMyAdmin:
1. Klik **New** atau **Buat Database Baru**
2. Nama Database: `portal_berita`
3. Collation: `utf8mb4_unicode_ci` (untuk support emoji & karakter khusus)
4. Klik **Create**

---

## 🔧 TAHAP 2: KONFIGURASI APLIKASI

### 2.1 Update File `.env`

Edit file `.env` backend dengan konfigurasi MySQL lokal:

```env
# DATABASE CONFIGURATION
DATABASE_URL="mysql://root:@localhost:3306/portal_berita"

# JWT
JWT_SECRET=rahasia_jwt_super_aman_anda

# FRONTEND URL
FRONTEND_URL=http://localhost:5173

# EMAIL CONFIGURATION
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email.anda@gmail.com
SMTP_PASS=password_aplikasi_anda
```

### 2.2 Verifikasi Prisma Schema

File `prisma/schema.prisma` sudah dikonfigurasi untuk MySQL:

```prisma
datasource db {
  provider = "mysql"
}
```

### 2.3 Install/Update Dependencies

Jalankan di folder backend:

```bash
npm install
```

Dependencies yang sudah tersedia:
- ✅ `@prisma/client`: ^7.8.0
- ✅ `@prisma/adapter-mariadb`: ^7.8.0
- ✅ `mysql2`: ^3.x (optional, untuk koneksi langsung)

---

## 🗄️ TAHAP 3: MIGRASI DATABASE

### 3.1 Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### 3.2 Jalankan Migration

Prisma akan membuat semua tabel berdasarkan schema:

```bash
npx prisma migrate dev --name init
```

Jika diminta nama untuk migration, ketik: `init_mysql_migration`

### 3.3 Verifikasi Tabel di phpMyAdmin

1. Buka phpMyAdmin: http://localhost/phpmyadmin
2. Pilih database `portal_berita`
3. Verifikasi tabel yang ada:
   - ✅ `Role`
   - ✅ `User`
   - ✅ `Setting`
   - ✅ `Menu`
   - ✅ `Category`
   - ✅ `Post`

---

## 📥 TAHAP 4: IMPORT DATA

### 4.1 Jalankan Script Import

Gunakan script TypeScript yang sudah disiapkan:

```bash
cd backend
npm run seed
```

atau jika belum ada:

```bash
npx tsx src/seed.ts
```

### 4.2 Verifikasi Data di phpMyAdmin

Setelah import, cek di phpMyAdmin:

**Role Table (3 data):**
- Admin
- Jurnalis
- Redaktur

**User Table (4 user):**
- angganovlianta@gmail.com
- admin@kompas-clone.com
- angganovliantast@gmail.com
- anjarolanza@gmail.com

**Category Table (7 kategori):**
- Berita Prabumulih
- Umum
- Nasional
- Internasional
- Ekonomi & Bisnis
- Teknologi
- Opini

**Post Table (12 artikel):**
- Viral Surat Terbuka Ujang...
- Malam Sibuk di Pustaka Publik...
- Dan 10 artikel lainnya

---

## 🧪 TAHAP 5: TESTING LOKAL

### 5.1 Jalankan Backend

```bash
cd backend
npm run dev
```

Server akan berjalan di `http://localhost:5050`

### 5.2 Jalankan Frontend

Di terminal baru:

```bash
cd frontend
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 5.3 Testing Checklist

- [ ] Login berhasil dengan user dari PostgreSQL
- [ ] Daftar user baru berfungsi
- [ ] View artikel berfungsi
- [ ] Upload thumbnail berfungsi
- [ ] Kategori tampil dengan benar
- [ ] Dashboard admin accessible
- [ ] Settings dapat diubah
- [ ] Database queries tidak error

---

## 🌍 TAHAP 6: PERSIAPAN HOSTINGER

### 6.1 Buat Database di Hostinger

1. Login ke Hostinger Control Panel
2. Buka **Databases** → **MySQL Databases**
3. Buat database baru:
   - Database Name: `portal_berita`
   - Username: `[username_mu]`
   - Password: `[password_yang_aman]`
   - Host: `localhost` (biasanya)

### 6.2 Penyesuaian untuk Production

Update `.env` production:

```env
DATABASE_URL="mysql://username_hostinger:password_aman@localhost:3306/portal_berita"
JWT_SECRET=[generate_token_baru_yang_aman]
FRONTEND_URL=https://domainmu.com
```

### 6.3 Export Data dari XAMPP

**Via phpMyAdmin:**
1. Pilih database `portal_berita`
2. Klik **Export**
3. Format: `SQL`
4. Klik **Go** (download file SQL)

**Via Command Line:**
```bash
mysqldump -u root -p portal_berita > portal_berita_backup.sql
```

### 6.4 Import ke Hostinger

**Via phpMyAdmin Hostinger:**
1. Login ke phpMyAdmin Hostinger
2. Buat database baru `portal_berita`
3. Pilih database
4. Tab **Import**
5. Upload file `portal_berita_backup.sql`
6. Klik **Go**

**Via Command Line (SSH):**
```bash
mysql -u username -p portal_berita < portal_berita_backup.sql
```

---

## ⚠️ TROUBLESHOOTING

### Problem: "database does not exist"
**Solution:**
- Pastikan MySQL running di XAMPP Control Panel
- Pastikan database `portal_berita` sudah dibuat di phpMyAdmin
- Periksa DATABASE_URL di `.env`

### Problem: "connection refused"
**Solution:**
- Restart MySQL di XAMPP
- Cek port MySQL (default 3306)
- Pastikan tidak ada aplikasi lain menggunakan port 3306

### Problem: "character set error"
**Solution:**
- Ubah collation database ke `utf8mb4_unicode_ci`
- Jalankan: `npx prisma migrate resolve --rolled-back init`
- Jalankan ulang: `npx prisma migrate dev`

### Problem: "data tidak terimport"
**Solution:**
- Cek file `data.json` masih valid JSON
- Jalankan script seed.ts dengan mode verbose
- Cek error logs di console

---

## ✅ CHECKLIST FINAL SEBELUM LAUNCH

- [ ] Database MySQL berjalan di XAMPP
- [ ] Semua tabel termigrasi dengan benar
- [ ] Semua data terimport dengan sempurna
- [ ] Login berfungsi dengan benar
- [ ] Upload file berfungsi
- [ ] Semua endpoint API berfungsi
- [ ] Frontend tampilan normal
- [ ] HTTPS siap di Hostinger
- [ ] Database Hostinger siap menerima data
- [ ] Backup data PostgreSQL tersimpan aman

---

## 📞 KONTAK SUPPORT

Jika ada masalah:
1. Cek error logs di console backend
2. Periksa browser console untuk frontend errors
3. Verifikasi phpMyAdmin untuk data integrity
4. Cek Network tab di browser untuk API errors

**Yang penting diingat:**
- ✅ Semua data akan aman terimport
- ✅ Tampilan & system tidak berubah
- ✅ Hanya change database driver
- ✅ Backup selalu tersedia

Good luck! 🚀
