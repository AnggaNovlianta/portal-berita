# 🔧 TECHNICAL MIGRATION GUIDE: PostgreSQL → MySQL

## 📌 Overview

Aplikasi Portal Berita akan dimigrasikan dari PostgreSQL ke MySQL dengan struktur data yang sepenuhnya kompatibel. Database schema, relasi, dan semua data akan dipindahkan tanpa perubahan logika bisnis.

---

## 🗂️ Database Architecture

### Current Setup
```
┌─────────────────────────────┐
│      PORTAL BERITA          │
├─────────────────────────────┤
│  Backend (Express + Prisma) │
│  Frontend (React + Vite)    │
│  Database: MySQL 5.7+ / 8.0 │
└─────────────────────────────┘
```

### Prisma 7 Configuration

**Key Features:**
- ✅ Supports MySQL 5.7 and MySQL 8.0
- ✅ Uses environment variable `DATABASE_URL`
- ✅ No direct connection in schema.prisma
- ✅ Adapters: `@prisma/adapter-mariadb` (optional)

---

## 🔌 Connection String Format

### For XAMPP Local Development
```
mysql://root:@localhost:3306/portal_berita
```

**Components:**
- Protocol: `mysql://`
- Username: `root` (default XAMPP)
- Password: (empty for local XAMPP)
- Host: `localhost`
- Port: `3306` (default MySQL)
- Database: `portal_berita`

### For Hostinger Production
```
mysql://your_username:your_password@your_host:3306/portal_berita
```

---

## 📊 Database Schema Compatibility

### MySQL vs PostgreSQL Data Types

| Field Type | PostgreSQL | MySQL | Notes |
|-----------|-----------|-------|-------|
| ID (auto) | `SERIAL` | `INT AUTO_INCREMENT` | ✅ Compatible |
| ID (UUID) | `UUID` | `VARCHAR(36)` | ✅ Compatible |
| Text | `TEXT` | `TEXT` | ✅ Compatible |
| Long Text | `TEXT` | `LONGTEXT` | ✅ Compatible |
| Boolean | `BOOLEAN` | `TINYINT(1)` | ✅ Compatible |
| Timestamp | `TIMESTAMP` | `DATETIME` | ✅ Compatible |
| JSON | `JSONB` | `JSON` | ✅ Compatible |

### Current Schema Models

```prisma
model Role {
  id    Int    @id @default(autoincrement())  // MySQL: INT AUTO_INCREMENT
  name  String @unique                        // MySQL: VARCHAR(191) UNIQUE
  users User[]
}

model User {
  id        String   @id @default(uuid())     // MySQL: VARCHAR(36) PRIMARY KEY
  email     String   @unique                  // MySQL: VARCHAR(191) UNIQUE
  password  String                            // MySQL: VARCHAR(255)
  name      String                            // MySQL: VARCHAR(191)
  isApproved Boolean @default(false)          // MySQL: TINYINT(1)
  resetPasswordToken   String?                // MySQL: VARCHAR(191)
  resetPasswordExpires DateTime?              // MySQL: DATETIME(3)
  roleId    Int
  role      Role     @relation(...)
  posts     Post[]
  createdAt DateTime @default(now())          // MySQL: DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3)
  updatedAt DateTime @updatedAt               // MySQL: DATETIME(3) ON UPDATE CURRENT_TIMESTAMP(3)
}

model Post {
  id        String  @id @default(uuid())
  title     String
  slug      String  @unique
  content   String  @db.Text                  // MySQL: TEXT
  thumbnail String?
  image     String?
  published Boolean @default(false)
  views     Int     @default(0)
  authorId  String?
  author    User?   @relation(...)
  categoryId Int
  category   Category @relation(...)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id        Int      @id @default(autoincrement())
  name      String   @unique
  slug      String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Setting {
  id    Int    @id @default(autoincrement())
  key   String @unique
  value String @db.Text
}

model Menu {
  id         Int     @id @default(autoincrement())
  name       String
  url        String
  parentId   Int?
  orderIndex Int     @default(0)
  isActive   Boolean @default(true)
  parent     Menu?   @relation("MenuHierarchy", ...)
  children   Menu[]  @relation("MenuHierarchy")
}
```

---

## ✨ MySQL-Specific Configurations

### 1. Collation for Unicode Support
```sql
ALTER DATABASE portal_berita COLLATE utf8mb4_unicode_ci;
```

**Why?**
- ✅ Supports full Unicode (emoji, special chars)
- ✅ Better performance than `utf8_general_ci`
- ✅ Proper international character handling

### 2. String Length Limitations
MySQL default index limit: 767 bytes (MySQL 5.7) or 3072 bytes (MySQL 8.0)

For `@unique` fields with `VARCHAR(255)`:
- Prisma automatically uses `VARCHAR(191)` for UTF8MB4
- This prevents index overflow errors

### 3. Timestamp Defaults
```
- MySQL 5.7: `DATETIME(3)` for millisecond precision
- MySQL 8.0: `DATETIME(3)` + `DEFAULT CURRENT_TIMESTAMP(3)`
- PostgreSQL: `TIMESTAMP WITH TIME ZONE` → MySQL: `DATETIME(3)`
```

---

## 🔄 Migration Steps

### Step 1: Setup Local XAMPP MySQL
```bash
# On XAMPP Control Panel
1. Click "Start" on MySQL module
2. Open phpMyAdmin: http://localhost/phpmyadmin
3. Create new database "portal_berita"
4. Set collation to "utf8mb4_unicode_ci"
```

### Step 2: Update Environment
```bash
# .env
DATABASE_URL="mysql://root:@localhost:3306/portal_berita"
```

### Step 3: Generate & Migrate
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
```

### Step 4: Seed Data
```bash
npx tsx src/seed-mysql.ts
```

### Step 5: Verify
```bash
npx tsx src/test-db.ts
```

---

## 🚀 Deployment to Hostinger

### 1. Create Database on Hostinger
- Login to cPanel
- Go to MySQL Databases
- Create: `your_username_portal_berita`
- Record username and password

### 2. Export from XAMPP
```bash
# Via Command Line
mysqldump -u root portal_berita > backup_portal_berita.sql
```

### 3. Import to Hostinger
```bash
# Via cPanel → phpMyAdmin
# Or via SSH
mysql -u hostinger_user -p portal_berita < backup_portal_berita.sql
```

### 4. Update Production .env
```
DATABASE_URL="mysql://hostinger_user:strong_password@localhost:3306/your_username_portal_berita"
```

---

## ⚙️ Performance Tuning for MySQL

### Indexes
All unique fields automatically get indexes:
- ✅ `users.email` → INDEX
- ✅ `users.id` → PRIMARY KEY
- ✅ `categories.slug` → UNIQUE INDEX
- ✅ `posts.slug` → UNIQUE INDEX

### Query Optimization

**Good for MySQL:**
```typescript
// ✅ Use includes for relations
const posts = await prisma.post.findMany({
  include: { category: true, author: true },
  take: 10,
});

// ✅ Use select for specific fields
const users = await prisma.user.findMany({
  select: { id: true, email: true, name: true },
});
```

**Avoid:**
```typescript
// ❌ Don't fetch all fields if not needed
const allPosts = await prisma.post.findMany(); // Too heavy

// ❌ Don't nest too many relations
const posts = await prisma.post.findMany({
  include: {
    author: { include: { role: true } },
    category: true,
  },
});
```

---

## 🐛 Troubleshooting

### Issue: "Table doesn't exist"
```bash
# Solution:
npx prisma db push
npx prisma migrate dev
```

### Issue: "Access denied for user"
```bash
# Check:
1. DATABASE_URL in .env is correct
2. MySQL is running (XAMPP Control Panel)
3. Username and password match
```

### Issue: "Character encoding error"
```bash
# Solution:
ALTER DATABASE portal_berita 
CHARSET=utf8mb4 
COLLATE=utf8mb4_unicode_ci;
```

### Issue: "Data loss after migration"
```bash
# Backup first:
mysqldump -u root portal_berita > backup.sql
# Then verify with test-db.ts before proceeding
npx tsx src/test-db.ts
```

---

## 📋 Pre-Launch Checklist

- [ ] MySQL running in XAMPP
- [ ] Database `portal_berita` created
- [ ] `.env` correctly configured
- [ ] `npm install` completed
- [ ] `npx prisma generate` ran successfully
- [ ] `npx prisma migrate dev` completed
- [ ] `npx tsx src/seed-mysql.ts` imported all data
- [ ] `npx tsx src/test-db.ts` passed all tests
- [ ] Backend starts: `npm run dev`
- [ ] Frontend starts: `npm run dev`
- [ ] Login works with existing users
- [ ] Create new post works
- [ ] Upload thumbnail works
- [ ] All categories display
- [ ] All data appears in phpMyAdmin

---

## 📞 Support & References

### MySQL Syntax
- [MySQL Official Docs](https://dev.mysql.com/doc/)

### Prisma MySQL
- [Prisma MySQL Guide](https://www.prisma.io/docs/orm/overview/databases/mysql)

### XAMPP Setup
- [XAMPP Official](https://www.apachefriends.org/)

### Hostinger Deployment
- [Hostinger Guides](https://support.hostinger.com/)

---

**Migration Status:** ✅ Ready
**Last Updated:** June 4, 2026
