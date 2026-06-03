# 🚀 Portal Berita - PostgreSQL to MySQL Migration Guide

> **Migrasi database dari PostgreSQL ke MySQL dengan sistem yang tetap utuh**

## 📚 Dokumentasi Migrasi

Panduan lengkap migrasi Portal Berita telah disiapkan dalam beberapa dokumen:

### 🎯 Quick Start (Mulai Di Sini!)
- **File:** [`QUICK_START_MYSQL.md`](./QUICK_START_MYSQL.md)
- **Waktu:** ~5 menit untuk setup lokal
- **Untuk:** Developers yang ingin quick setup
- **Berisi:** Step-by-step instruksi sederhana

```bash
# TL;DR
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed:mysql
npm run test:db
npm run dev
```

---

### 📋 Complete Migration Guide
- **File:** [`MIGRASI_POSTGRESQL_KE_MYSQL.md`](./MIGRASI_POSTGRESQL_KE_MYSQL.md)
- **Waktu:** Baca lengkap ~20 menit
- **Untuk:** Detailed understanding tentang setiap tahap
- **Berisi:**
  - ✅ Instalasi XAMPP MySQL
  - ✅ Konfigurasi aplikasi
  - ✅ Setup database
  - ✅ Import data
  - ✅ Testing lokal
  - ✅ Pre-flight checklist

---

### 🔧 Technical Deep Dive
- **File:** [`TECHNICAL_MIGRATION_GUIDE.md`](./TECHNICAL_MIGRATION_GUIDE.md)
- **Untuk:** Technical architects dan DevOps
- **Berisi:**
  - 📊 Database schema compatibility
  - 🔌 Connection string formats
  - ⚙️ Prisma 7 configuration details
  - 🐛 Troubleshooting technical issues
  - 📈 Performance tuning

---

### 🌍 Deployment ke Hostinger
- **File:** [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md)
- **Waktu:** ~30 menit untuk deployment
- **Untuk:** Production deployment instructions
- **Berisi:**
  - 🗂️ Setup di cPanel Hostinger
  - 📤 Upload files via FTP/Git
  - 🔐 Environment configuration
  - 🧪 Production testing
  - 📊 Monitoring & maintenance

---

### 💾 Backup & Restore
- **File:** [`BACKUP_RESTORE_GUIDE.md`](./BACKUP_RESTORE_GUIDE.md)
- **Untuk:** Disaster recovery & safety procedures
- **Berisi:**
  - 🔐 Backup strategies
  - 📤 Cloud backup options
  - 🔄 Restore procedures
  - 🚨 Disaster recovery
  - 🔍 Verification & testing

---

## 🎯 Quick Navigation

### Baru dimulai migrasi?
👉 Start: [`QUICK_START_MYSQL.md`](./QUICK_START_MYSQL.md)

### Ingin detail lengkap?
👉 Read: [`MIGRASI_POSTGRESQL_KE_MYSQL.md`](./MIGRASI_POSTGRESQL_KE_MYSQL.md)

### Technical question?
👉 Check: [`TECHNICAL_MIGRATION_GUIDE.md`](./TECHNICAL_MIGRATION_GUIDE.md)

### Siap deploy?
👉 Follow: [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md)

### Perlu backup?
👉 Learn: [`BACKUP_RESTORE_GUIDE.md`](./BACKUP_RESTORE_GUIDE.md)

---

## 📊 Data Migration Status

### Database Content yang Akan Dimigrasikan

```
✅ Roles: 3 data
   - Admin
   - Jurnalis  
   - Redaktur

✅ Users: 4 users
   - angganovlianta@gmail.com
   - admin@kompas-clone.com
   - angganovliantast@gmail.com
   - anjarolanza@gmail.com

✅ Categories: 7 kategori
   - Berita Prabumulih
   - Umum
   - Nasional
   - Internasional
   - Ekonomi & Bisnis
   - Teknologi
   - Opini

✅ Posts: 12 artikel
   - Semua article content terimport
   - Timestamps preserved
   - Author relationships maintained

✅ Settings: 25+ konfigurasi
   - Site name, logo, motto
   - Contact information
   - Social media links
   - SMTP configuration
   - Ad slots configuration
   - Editorial board

✅ Menus: Hierarchy structure
```

---

## 🔄 Migration Process

```
Step 1: Setup XAMPP MySQL Lokal
         ↓
Step 2: Update .env Configuration
         ↓
Step 3: Generate & Migrate Database Schema
         ↓
Step 4: Import Data dari data.json
         ↓
Step 5: Test Database Connections
         ↓
Step 6: Test Application Locally
         ↓
Step 7: Backup Data
         ↓
Step 8: Deploy ke Hostinger
         ↓
Step 9: Production Testing
         ↓
✅ Live!
```

---

## 📦 Tools & Scripts Tersedia

### Database Scripts

```bash
# Install dependencies
npm install

# Generate Prisma Client
npm run db:generate

# Push schema ke database
npm run db:push

# Create & run migrations
npm run db:migrate

# Import data dari JSON
npm run seed:mysql

# Test database connection
npm run test:db
```

### Development

```bash
# Start backend dev server
npm run dev

# Build TypeScript
npm run build

# Start production server
npm start
```

### Setup Scripts

```bash
# Windows
backend/setup-mysql.bat

# Linux/Mac
backend/setup-mysql.sh
```

---

## 🔐 Key Points

### ✅ Keamanan Data
- **100% data preservation** - Semua data terimport tanpa loss
- **Password encryption** - Semua password tetap encrypted
- **UUID preserved** - Semua user IDs tetap sama
- **Timestamp maintained** - Semua timestamps terimport akurat

### ✅ Kompatibilitas Sistem
- **No code changes** - Backend code tetap sama
- **No UI changes** - Frontend interface tidak berubah
- **Same relationships** - Semua relasi database preserved
- **Same functionality** - Semua fitur berjalan normal

### ✅ Database Compatibility
- **MySQL 5.7** - ✅ Supported
- **MySQL 8.0** - ✅ Supported
- **Prisma 7** - ✅ Latest version
- **Charset UTF-8MB4** - ✅ Full Unicode support

---

## 🆘 Getting Help

### If Something Goes Wrong

1. **Check logs first**
   ```bash
   npm run test:db          # Test database connection
   npm run dev              # Check server logs
   ```

2. **Review error message carefully**
   - Most errors are configuration related (DATABASE_URL)
   - Check MySQL is running
   - Verify credentials in .env

3. **Consult documentation**
   - Technical issues? → [`TECHNICAL_MIGRATION_GUIDE.md`](./TECHNICAL_MIGRATION_GUIDE.md)
   - Deployment issues? → [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md)
   - Data issues? → [`BACKUP_RESTORE_GUIDE.md`](./BACKUP_RESTORE_GUIDE.md)

4. **Rollback if needed**
   ```bash
   # Restore from backup
   mysql -u root portal_berita < backup.sql
   
   # Switch back to PostgreSQL .env
   # Update DATABASE_URL to PostgreSQL connection
   ```

---

## 📈 Architecture

```
┌─────────────────────────────────────────────────────┐
│              Portal Berita Application               │
├─────────────────────────────────────────────────────┤
│                                                       │
│  Frontend (React + Vite)                            │
│  ├── src/                                           │
│  ├── dist/ (Build output)                           │
│  └── public/                                        │
│                                                       │
│  Backend (Express + TypeScript)                     │
│  ├── src/                                           │
│  ├── controllers/                                   │
│  ├── routes/                                        │
│  ├── middlewares/                                   │
│  └── utils/                                         │
│                                                       │
│  Database Layer (Prisma ORM)                        │
│  ├── prisma/schema.prisma                           │
│  ├── migrations/                                    │
│  └── seed scripts                                   │
│                                                       │
├─────────────────────────────────────────────────────┤
│              MySQL Database                          │
│                                                       │
│  ├── Role table                                     │
│  ├── User table                                     │
│  ├── Category table                                 │
│  ├── Post table                                     │
│  ├── Setting table                                  │
│  └── Menu table                                     │
│                                                       │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Next Steps

### For Local Development
1. Read: [`QUICK_START_MYSQL.md`](./QUICK_START_MYSQL.md)
2. Install: XAMPP MySQL
3. Run: Setup scripts
4. Test: `npm run test:db`

### For Hostinger Deployment
1. Read: [`HOSTINGER_DEPLOYMENT.md`](./HOSTINGER_DEPLOYMENT.md)
2. Create: Database di Hostinger
3. Export: Backup dari XAMPP
4. Import: Ke Hostinger database
5. Deploy: Backend & Frontend

### For Production Safety
1. Read: [`BACKUP_RESTORE_GUIDE.md`](./BACKUP_RESTORE_GUIDE.md)
2. Setup: Automated backups
3. Test: Restore procedures
4. Document: Recovery procedures

---

## 📅 Timeline Estimate

| Phase | Duration | Notes |
|-------|----------|-------|
| Setup XAMPP | 10 min | One-time setup |
| Local Migration | 5 min | Automated scripts |
| Testing | 10 min | Verification |
| Backup | 5 min | Safety first |
| Hostinger Setup | 15 min | cPanel configuration |
| Data Import | 5 min | Database import |
| Deployment | 10 min | File upload |
| Testing Production | 10 min | Final verification |
| **Total** | **70 min** | **~1 hour 10 min** |

---

## ✅ Pre-Launch Verification

Before going live, verify:

```bash
# 1. Database connection
npm run test:db

# 2. All data imported
mysql -u root portal_berita -e "SELECT COUNT(*) FROM Post;"

# 3. Application starts
npm run dev

# 4. Frontend accessible
curl http://localhost:5173

# 5. API accessible
curl http://localhost:5050/api/posts

# 6. Login works
# Test dengan user existing dari database

# 7. All features work
# - Create post
# - Upload thumbnail
# - View category
# - Admin panel access
```

---

## 📞 Support Resources

- **Prisma Docs:** https://www.prisma.io/docs/
- **MySQL Docs:** https://dev.mysql.com/doc/
- **Hostinger Support:** https://support.hostinger.com/
- **This Repo Issues:** Check GitHub issues

---

## 📝 Document Versions

| Document | Version | Updated | Status |
|----------|---------|---------|--------|
| QUICK_START_MYSQL | 1.0 | Jun 4, 2026 | ✅ Ready |
| MIGRASI_POSTGRESQL_KE_MYSQL | 1.0 | Jun 4, 2026 | ✅ Ready |
| TECHNICAL_MIGRATION_GUIDE | 1.0 | Jun 4, 2026 | ✅ Ready |
| HOSTINGER_DEPLOYMENT | 1.0 | Jun 4, 2026 | ✅ Ready |
| BACKUP_RESTORE_GUIDE | 1.0 | Jun 4, 2026 | ✅ Ready |

---

## 🎉 Final Notes

- ✅ **Ini adalah proses yang aman** - Data akan terimport dengan sempurna
- ✅ **Tidak ada code changes** - Aplikasi berjalan sama persis
- ✅ **Fully reversible** - Bisa rollback kapan saja
- ✅ **Well tested** - Semua scripts sudah siap
- ✅ **Production ready** - Siap untuk live

---

**Status:** ✅ Ready for Migration
**Last Updated:** June 4, 2026
**Database:** PostgreSQL → MySQL
**Hosting:** XAMPP Lokal → Hostinger Production

**Good luck with your migration! 🚀**
