# 💾 Backup & Restore Guide

## 📋 Overview

Panduan lengkap untuk backup dan restore database MySQL untuk Portal Berita, termasuk disaster recovery procedures.

---

## 🔐 Backup Strategy

### Backup Types

| Type | Frequency | Storage | Use Case |
|------|-----------|---------|----------|
| **Daily** | Every night | Local + Cloud | Production safety |
| **Weekly** | Every Sunday | External drive | Archive |
| **Monthly** | 1st of month | Cloud backup | Long-term |
| **Pre-deployment** | Before update | Local | Emergency rollback |

---

## 💾 Local XAMPP Backup

### Method 1: Command Line (Recommended)

**Windows Command Prompt:**

```bash
# Navigate to XAMPP bin folder
cd C:\xampp\mysql\bin

# Backup dengan struktur lengkap
mysqldump -u root -p portal_berita > "C:\Users\kemas\portal_berita_full_backup.sql"

# Tanpa password prompt (jika XAMPP tidak ada password)
mysqldump -u root portal_berita > "C:\Backup\portal_berita_$(date /+\%Y\%m\%d).sql"
```

**On Mac/Linux:**

```bash
mysqldump -u root -p portal_berita > ~/backup/portal_berita_backup.sql
```

### Method 2: phpMyAdmin GUI

1. Buka: http://localhost/phpmyadmin
2. Select database: `portal_berita`
3. Tab: **Export**
4. Format: **SQL**
5. Klik: **Go** (download file)

### What Gets Backed Up

✅ Semua table:
- Role
- User
- Category
- Post
- Setting
- Menu

✅ Semua data:
- Passwords (encrypted)
- UUIDs
- Timestamps
- Relationships

✅ Schema:
- Primary keys
- Foreign keys
- Indexes
- Constraints

### Backup File Size

```
Typical size: 500KB - 2MB
- 3 roles
- 4 users
- 7 categories
- 12 posts
- 25 settings
```

---

## 📤 Backup to Cloud

### Google Drive (Simple)

```bash
# 1. Create backup
mysqldump -u root portal_berita > portal_berita_backup.sql

# 2. Upload manually ke Google Drive
# atau gunakan script Python

# 3. Keep backup link safe
```

### AWS S3 (Professional)

```bash
# Install AWS CLI
npm install -g aws-cli

# Configure
aws configure

# Backup ke S3
mysqldump -u root portal_berita | \
  gzip | \
  aws s3 cp - s3://my-bucket/backups/portal_berita_$(date +%Y%m%d).sql.gz

# Verify
aws s3 ls s3://my-bucket/backups/
```

### GitHub Private Repository

```bash
# Create backup
mysqldump -u root portal_berita > backup.sql

# Add to git
git add backup.sql
git commit -m "Database backup - $(date +%Y%m%d)"
git push origin backup-branch

# Verify on GitHub
# Clean up before pushing to origin
rm backup.sql
```

---

## 🔄 Restore Database

### Scenario 1: Restore di XAMPP Lokal

```bash
# 1. Stop MySQL (optional - better practice)
# Click XAMPP Control Panel → Stop MySQL

# 2. Drop existing database (backup dulu!)
mysql -u root -e "DROP DATABASE portal_berita;"

# 3. Create fresh database
mysql -u root -e "CREATE DATABASE portal_berita COLLATE utf8mb4_unicode_ci;"

# 4. Restore from backup
mysql -u root portal_berita < "C:\Backup\portal_berita_backup.sql"

# 5. Verify
mysql -u root portal_berita -e "SELECT * FROM Role LIMIT 5;"

# 6. Start application
npm run test:db
npm run dev
```

### Scenario 2: Restore di Hostinger

**Via cPanel phpMyAdmin:**

```
1. Login ke cPanel
2. Go to: Databases → phpMyAdmin
3. Select database
4. Tab: Import
5. Choose file: backup.sql
6. Klik Go
```

**Via SSH:**

```bash
# SSH ke server Hostinger
ssh username@yourdomain.com

# Navigate to backup folder
cd ~/backups

# Restore database
mysql -u username_user -p password \
  username_db < portal_berita_backup.sql

# Verify
mysql -u username_user -p password -e \
  "SELECT COUNT(*) FROM username_db.Post;"
```

### Scenario 3: Partial Restore (Specific Table)

```bash
# Extract specific table dari backup
mysqldump -u root portal_berita Post > posts_backup.sql

# Restore hanya table Post
mysql -u root portal_berita < posts_backup.sql
```

---

## 🚨 Disaster Recovery

### Case: Database Corrupted

```bash
# Step 1: Create immediate backup (jika masih bisa)
mysqldump -u root portal_berita > corrupted_backup.sql

# Step 2: Drop dan recreate
mysql -u root -e "DROP DATABASE portal_berita;"
mysql -u root -e "CREATE DATABASE portal_berita COLLATE utf8mb4_unicode_ci;"

# Step 3: Restore dari backup terakhir yang baik
mysql -u root portal_berita < ~/backups/portal_berita_2026_06_02.sql

# Step 4: Verify data integrity
npm run test:db

# Step 5: Check aplikasi
npm run dev
```

### Case: Accidentally Deleted Data

```bash
# Step 1: Identify when deletion occurred
# Look at backup file timestamps

# Step 2: Restore from latest backup before deletion
mysql -u root -e "DROP TABLE portal_berita.Post;"
mysql -u root portal_berita < ~/backups/portal_berita_before_deletion.sql

# Step 3: Verify
SELECT COUNT(*) FROM Post;
```

### Case: Hard Disk Failure (Hostinger)

```bash
# 1. Restore from Hostinger's automated backup
#    (Contact Hostinger support)

# 2. Or restore manually from your own backup
#    Via cPanel → File Manager or FTP

# 3. Then restore database
mysql -u user -p db < backup.sql

# 4. Restart application
pm2 restart app
```

---

## 🔍 Backup Verification

### Verify Backup File Integrity

```bash
# Windows - Check file size
dir /s backup.sql

# Mac/Linux - Check file size
ls -lh backup.sql

# Typical size should be 500KB - 2MB
# Jika kurang dari 100KB, kemungkinan corrupt
```

### Verify Backup Contents

```bash
# Linux/Mac - View first 50 lines
head -50 backup.sql

# Should contain:
# /*!40101 SET @OLD_CHARACTER_SET_CLIENT...
# CREATE TABLE `Role` (...)
# INSERT INTO `Role` VALUES...

# Windows - Use Notepad++
# Open backup.sql and check structure
```

### Test Restore (Best Practice)

```bash
# 1. Create test database
mysql -u root -e "CREATE DATABASE portal_berita_test COLLATE utf8mb4_unicode_ci;"

# 2. Restore backup ke test database
mysql -u root portal_berita_test < backup.sql

# 3. Verify all tables exist
mysql -u root portal_berita_test -e "SHOW TABLES;"

# 4. Count records in each table
mysql -u root portal_berita_test -e "
  SELECT 'Role' as table_name, COUNT(*) as count FROM Role
  UNION ALL
  SELECT 'User', COUNT(*) FROM User
  UNION ALL
  SELECT 'Category', COUNT(*) FROM Category
  UNION ALL
  SELECT 'Post', COUNT(*) FROM Post
  UNION ALL
  SELECT 'Setting', COUNT(*) FROM Setting;"

# 5. Drop test database
mysql -u root -e "DROP DATABASE portal_berita_test;"
```

---

## 📅 Automated Backup Script

### Backup Script for Linux/Mac

Save as: `backup.sh`

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/home/username/backups"
DB_NAME="portal_berita"
DB_USER="root"
RETENTION_DAYS=30

# Create backup directory if not exists
mkdir -p "$BACKUP_DIR"

# Create backup with timestamp
BACKUP_FILE="$BACKUP_DIR/portal_berita_$(date +%Y%m%d_%H%M%S).sql"
mysqldump -u $DB_USER -p $DB_NAME > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Delete backups older than retention period
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Log backup
echo "$(date): Backup created - $BACKUP_FILE.gz" >> "$BACKUP_DIR/backup.log"

# Optional: Upload to cloud
# aws s3 cp "$BACKUP_FILE.gz" s3://my-bucket/backups/
```

### Setup Cron Job (Linux)

```bash
# Edit cron
crontab -e

# Add line to backup every day at 2 AM
0 2 * * * /home/username/backup.sh

# Verify cron job
crontab -l
```

---

## 🔐 Backup Security

### Encrypt Sensitive Backups

```bash
# Create encrypted backup
mysqldump -u root portal_berita | openssl enc -aes-256-cbc -out backup.sql.enc

# Restore encrypted backup
openssl enc -d -aes-256-cbc -in backup.sql.enc | mysql -u root portal_berita
```

### Secure File Permissions

```bash
# Make backup readable only by owner
chmod 600 backup.sql

# Make directory accessible only by owner
chmod 700 /home/username/backups
```

### Store Credentials Securely

```bash
# Create .my.cnf file (DO NOT COMMIT TO GIT)
cat > ~/.my.cnf <<EOF
[client]
user=root
password=your_password
EOF

# Secure permissions
chmod 600 ~/.my.cnf

# Then backup without password:
mysqldump portal_berita > backup.sql
```

---

## 📊 Backup Checklist

- [ ] Daily backup automated
- [ ] Weekly backup to external storage
- [ ] Backup files encrypted
- [ ] Backup files have descriptive names with timestamps
- [ ] Backup verification tested
- [ ] Restore procedure documented
- [ ] Recovery time objective (RTO): < 2 hours
- [ ] Recovery point objective (RPO): < 1 day
- [ ] Backups stored in 2+ locations
- [ ] No sensitive data in backup filenames
- [ ] Backup logs monitored

---

## 🆘 Troubleshooting

### Problem: "Access denied" during backup

```bash
# Solution: Check MySQL user permissions
mysql -u root -e "SHOW GRANTS FOR 'root'@'localhost';"

# Grant necessary permissions
mysql -u root -e "GRANT ALL PRIVILEGES ON portal_berita.* TO 'root'@'localhost';"
```

### Problem: Backup file is empty

```bash
# Verify MySQL is running
ps aux | grep mysql

# Or check XAMPP status

# Try again with explicit password
mysqldump -u root -p portal_berita > backup.sql
```

### Problem: "Lost connection during backup"

```bash
# Reduce load on database
# Try incremental backup approach
mysqldump -u root portal_berita --single-transaction > backup.sql
```

### Problem: Restore fails with "Error 1064"

```bash
# Backup mungkin corrupt, try:
# 1. Check file size
# 2. Check first lines
# 3. Try restore dengan berbeda MySQL version

# Clean backup:
mysql -u root portal_berita < clean_backup.sql
```

---

## 📋 Backup File Checklist

Each backup file should contain:

```sql
-- Verification checklist

-- 1. Role table
SELECT COUNT(*) FROM Role;
-- Expected: 3 roles (Admin, Jurnalis, Redaktur)

-- 2. User table
SELECT COUNT(*) FROM User;
-- Expected: 4 users

-- 3. Category table
SELECT COUNT(*) FROM Category;
-- Expected: 7 categories

-- 4. Post table
SELECT COUNT(*) FROM Post;
-- Expected: 12 posts

-- 5. Setting table
SELECT COUNT(*) FROM Setting;
-- Expected: 25+ settings
```

---

**Last Updated:** June 4, 2026
**Backup Status:** ✅ Ready
