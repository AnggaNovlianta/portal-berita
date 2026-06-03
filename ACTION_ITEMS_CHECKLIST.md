# ✅ ACTION ITEMS CHECKLIST - Migrasi PostgreSQL ke MySQL

> Copy checklist ini dan gunakan untuk tracking progress migrasi Anda

## 🎯 Phase 1: Preparation (Local XAMPP Setup)

- [ ] **1.1** Download & Install XAMPP dari https://www.apachefriends.org/
- [ ] **1.2** Jalankan XAMPP Control Panel
- [ ] **1.3** Click Start pada Apache (optional)
- [ ] **1.4** Click Start pada MySQL - tunggu status hijau
- [ ] **1.5** Buka phpMyAdmin: http://localhost/phpmyadih
- [ ] **1.6** Create new database: `portal_berita`
- [ ] **1.7** Set collation ke: `utf8mb4_unicode_ci`
- [ ] **1.8** Verify database berhasil dibuat

**Estimated Time:** 10 minutes

---

## 🔧 Phase 2: Application Configuration

- [ ] **2.1** Buka file: `backend/.env`
- [ ] **2.2** Ubah `DATABASE_URL` ke:
  ```
  DATABASE_URL="mysql://root:@localhost:3306/portal_berita"
  ```
- [ ] **2.3** Verify konfigurasi SMTP (optional)
- [ ] **2.4** Save file `.env`
- [ ] **2.5** Verify file `.env.example` ada
- [ ] **2.6** Buka terminal di folder `backend`
- [ ] **2.7** Jalankan: `npm install` - tunggu selesai

**Estimated Time:** 5 minutes

---

## 📊 Phase 3: Database Migration

- [ ] **3.1** Di terminal backend, jalankan: `npx prisma generate`
- [ ] **3.2** Tunggu sampai Prisma client tergenerate
- [ ] **3.3** Jalankan: `npx prisma migrate dev --name init`
- [ ] **3.4** Jika diminta nama migration, ketik: `init`
- [ ] **3.5** Tunggu migration selesai
- [ ] **3.6** Buka phpMyAdmin di http://localhost/phpmyadmin
- [ ] **3.7** Select database `portal_berita`
- [ ] **3.8** Verify semua table sudah dibuat:
  - [ ] Role
  - [ ] User
  - [ ] Category
  - [ ] Post
  - [ ] Setting
  - [ ] Menu

**Estimated Time:** 5 minutes

---

## 📥 Phase 4: Data Import

- [ ] **4.1** Di terminal backend, jalankan: `npm run seed:mysql`
- [ ] **4.2** Lihat output - seharusnya ada success message
- [ ] **4.3** Tunggu sampai selesai
- [ ] **4.4** Verify data di phpMyAdmin:
  - [ ] Role table: 3 data
  - [ ] User table: 4 data
  - [ ] Category table: 7 data
  - [ ] Post table: 12 data
  - [ ] Setting table: 25+ data
- [ ] **4.5** Click beberapa record untuk verify content

**Estimated Time:** 5 minutes

---

## 🧪 Phase 5: Testing Lokal

- [ ] **5.1** Di terminal backend, jalankan: `npm run test:db`
- [ ] **5.2** Lihat output - seharusnya "✅ ALL TESTS PASSED"
- [ ] **5.3** Jika ada error, check:
  - [ ] MySQL running di XAMPP?
  - [ ] DATABASE_URL di .env benar?
  - [ ] Database `portal_berita` ada?
- [ ] **5.4** Setelah test pass, jalankan: `npm run dev`
- [ ] **5.5** Lihat message: "Server listening on port 5050"
- [ ] **5.6** Di terminal baru, go to `frontend`
- [ ] **5.7** Jalankan: `npm run dev`
- [ ] **5.8** Buka browser: http://localhost:5173
- [ ] **5.9** Verify homepage tampil
- [ ] **5.10** Test login dengan user: `angganovlianta@gmail.com`

**Note:** Password sudah di-hash, gunakan credential yang benar dari database

**Estimated Time:** 10 minutes

---

## 💾 Phase 6: Backup Sebelum Deploy

- [ ] **6.1** Di terminal, navigate ke: `C:\xampp\mysql\bin`
- [ ] **6.2** Jalankan command:
  ```bash
  mysqldump -u root portal_berita > "C:\Users\kemas\portal_berita_backup.sql"
  ```
- [ ] **6.3** Verify file backup ada: `portal_berita_backup.sql` (~1-2 MB)
- [ ] **6.4** Keep file di safe place (Google Drive, GitHub, etc)
- [ ] **6.5** Note waktu backup

**Estimated Time:** 5 minutes

---

## 🌍 Phase 7: Hostinger Setup (Production)

- [ ] **7.1** Login ke Hostinger: https://hostinger.com
- [ ] **7.2** Go to: My Websites → Manage
- [ ] **7.3** Click cPanel icon
- [ ] **7.4** Go to: Databases → MySQL
- [ ] **7.5** Click: Create New Database
- [ ] **7.6** Isi:
  - Database Name: `[username]_portal_berita`
  - Username: `[username]_portal`
  - Password: `[Strong_Password]` - **SAVE THIS!**
- [ ] **7.7** Click: Create
- [ ] **7.8** Catat credentials:
  ```
  Host: localhost
  Database: [username]_portal_berita
  User: [username]_portal
  Password: [your_password]
  ```

**Estimated Time:** 5 minutes

---

## 📤 Phase 8: Data Import ke Hostinger

- [ ] **8.1** Di Hostinger cPanel, buka: Databases → phpMyAdmin
- [ ] **8.2** Select database: `[username]_portal_berita`
- [ ] **8.3** Click tab: **Import**
- [ ] **8.4** Click: Choose File
- [ ] **8.5** Select: `portal_berita_backup.sql` (dari Phase 6)
- [ ] **8.6** Click: Go / Import
- [ ] **8.7** Tunggu sampai selesai (status: "Import has been successfully completed")
- [ ] **8.8** Verify tables ada:
  - [ ] Role table ada
  - [ ] User table ada
  - [ ] Post table ada (12 posts)

**Estimated Time:** 10 minutes

---

## 🚀 Phase 9: Deploy Backend ke Hostinger

- [ ] **9.1** Go to Hostinger cPanel → Software → Node.js Selector
- [ ] **9.2** Click: Create New Application
- [ ] **9.3** Isi:
  - Node.js Version: **20.10.0** (atau latest)
  - App URL: `yourdomain.com`
  - App Root: `/home/[username]/public_html/backend`
  - Startup File: `dist/index.js`
- [ ] **9.4** Click: Create
- [ ] **9.5** Copy backend files:
  - Option A: Via File Manager (Upload manually)
  - Option B: Via FTP
  - Option C: Via Git clone
- [ ] **9.6** Create `.env` file di: `public_html/backend/.env`
- [ ] **9.7** Isi:
  ```env
  DATABASE_URL="mysql://[username]_portal:password@localhost:3306/[username]_portal_berita"
  JWT_SECRET=[your_jwt_secret]
  FRONTEND_URL=https://yourdomain.com
  NODE_ENV=production
  ```
- [ ] **9.8** SSH ke server (atau Terminal di cPanel)
- [ ] **9.9** Jalankan:
  ```bash
  cd /home/[username]/public_html/backend
  npm install --production
  npm run build
  ```
- [ ] **9.10** Verify build successful: `ls dist/index.js` ada

**Estimated Time:** 20 minutes

---

## 🎨 Phase 10: Deploy Frontend ke Hostinger

- [ ] **10.1** Local: Buka terminal di folder `frontend`
- [ ] **10.2** Jalankan: `npm run build`
- [ ] **10.3** Verify folder `dist` ada
- [ ] **10.4** Upload folder `frontend/dist/*` ke: `public_html/`
- [ ] **10.5** Di Hostinger cPanel, create file: `.htaccess` di `public_html/`
- [ ] **10.6** Isi dengan React routing config:
  ```apache
  <IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^ index.html [QSA,L]
  </IfModule>
  ```
- [ ] **10.7** Save file

**Estimated Time:** 10 minutes

---

## 🧪 Phase 11: Final Testing Production

- [ ] **11.1** Buka: `https://yourdomain.com` di browser
- [ ] **11.2** Verify homepage tampil
- [ ] **11.3** Test login: `angganovlianta@gmail.com`
- [ ] **11.4** Verify dapat akses dashboard
- [ ] **11.5** Test create new post
- [ ] **11.6** Verify thumbnail upload berfungsi
- [ ] **11.7** Check categories tampil
- [ ] **11.8** Verify database query berfungsi:
  ```bash
  curl https://yourdomain.com/api/posts
  ```
- [ ] **11.9** Lihat response JSON dengan data posts
- [ ] **11.10** Test berbagai fitur aplikasi

**Estimated Time:** 10 minutes

---

## 🔒 Phase 12: Security & Hardening

- [ ] **12.1** Update JWT_SECRET dengan value yang aman
- [ ] **12.2** Verify `.env` file tidak accessible
- [ ] **12.3** Setup SSL/HTTPS:
  - [ ] Go to Hostinger cPanel → Domains
  - [ ] Install AutoSSL
  - [ ] Verify HTTPS working: `https://yourdomain.com`
- [ ] **12.4** Force HTTPS di `.htaccess`
- [ ] **12.5** Setup backup schedule di cPanel

**Estimated Time:** 10 minutes

---

## 📊 Phase 13: Monitoring

- [ ] **13.1** Setup error logging
- [ ] **13.2** Check Node.js logs di cPanel
- [ ] **13.3** Monitor database size di phpMyAdmin
- [ ] **13.4** Setup email alerts untuk errors
- [ ] **13.5** Document support contacts

**Estimated Time:** 5 minutes

---

## ✅ Final Verification Checklist

### Database
- [ ] MySQL berjalan di XAMPP
- [ ] Database `portal_berita` ada
- [ ] Semua 6 tables ada
- [ ] Semua data terimport (3+4+7+12+25=51+ records)
- [ ] Relasi antar table intact

### Backend
- [ ] Backend berjalan di localhost:5050
- [ ] API endpoint responsive
- [ ] Database queries berhasil
- [ ] No errors di console
- [ ] Backend dapat di-restart

### Frontend
- [ ] Frontend berjalan di localhost:5173
- [ ] Homepage tampil dengan benar
- [ ] Navbar & footer tampil
- [ ] No console errors
- [ ] Login page accessible

### Integration
- [ ] Login berhasil
- [ ] User data muncul dari database
- [ ] Post data muncul dari database
- [ ] Category dropdown berfungsi
- [ ] Upload file berfungsi
- [ ] Create/edit post berfungsi

### Production (Hostinger)
- [ ] Frontend accessible di https://yourdomain.com
- [ ] API accessible di https://yourdomain.com/api/posts
- [ ] Database query berfungsi
- [ ] Login berfungsi
- [ ] All features berfungsi sama seperti lokal

### Backup & Security
- [ ] Database backup tersimpan aman
- [ ] .env file secure
- [ ] HTTPS active
- [ ] No sensitive data exposed

---

## 🆘 If Something Goes Wrong

### Error: "Cannot connect to database"
- [ ] Check MySQL running
- [ ] Check DATABASE_URL di .env
- [ ] Verify credentials
- [ ] Check database `portal_berita` ada

### Error: "Table does not exist"
- [ ] Run: `npx prisma migrate dev`
- [ ] Run: `npx prisma db push`
- [ ] Check `.env` connection

### Error: "Data tidak terimport"
- [ ] Check file `data.json` valid
- [ ] Run: `npm run seed:mysql`
- [ ] Check logs untuk error message

### Error: "Login tidak berfungsi"
- [ ] Check user ada di database
- [ ] Verify password hash
- [ ] Check JWT_SECRET di .env

### Error: "404 Not Found untuk file"
- [ ] Check .htaccess di public_html
- [ ] Verify file sudah di-upload
- [ ] Check file permissions (644 for files, 755 for folders)

---

## 📞 Support

Jika butuh bantuan:
1. Check error logs
2. Review documentation
3. Test di local XAMPP dulu
4. Check database dengan phpMyAdmin

---

**Total Estimated Time:** ~90 minutes (1.5 hours)
**Difficulty:** ⭐⭐ (Moderate)
**Risk Level:** 🟢 (Low - fully reversible)

Print atau bookmark checklist ini untuk reference! ✅
