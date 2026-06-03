@echo off
REM Script Setup Migrasi PostgreSQL ke MySQL untuk Windows

echo.
echo 🚀 Memulai setup migrasi ke MySQL...
echo.

REM 1. Check if node_modules exists
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    call npm install
    echo ✅ Dependencies installed
    echo.
)

REM 2. Check .env file
if not exist ".env" (
    echo ⚠️  File .env tidak ditemukan!
    echo 📝 Membuat .env dari .env.example...
    copy .env.example .env
    echo ✅ File .env berhasil dibuat
    echo.
    echo ⚠️  Silakan update .env dengan konfigurasi lokal Anda:
    echo    DATABASE_URL=mysql://root:@localhost:3306/portal_berita
    echo.
    pause
)

REM 3. Generate Prisma Client
echo 🔧 Generate Prisma Client...
call npx prisma generate
echo ✅ Prisma Client generated
echo.

REM 4. Run Migrations
echo 🗄️  Running Prisma migrations...
call npx prisma migrate dev --name init
echo ✅ Migrations completed
echo.

REM 5. Run Seed Script
echo 🌱 Seeding database dengan data dari data.json...
call npx tsx src/seed-mysql.ts
echo.

REM 6. Summary
echo.
echo ═══════════════════════════════════════════════
echo ✅ SETUP SELESAI!
echo ═══════════════════════════════════════════════
echo.
echo 🎯 Langkah selanjutnya:
echo 1. Verify data di phpMyAdmin: http://localhost/phpmyadmin
echo 2. Start backend: npm run dev
echo 3. Start frontend: cd ../frontend ^&^& npm run dev
echo 4. Buka browser: http://localhost:5173
echo.
echo 💡 Jika ada error, jalankan:
echo    npx prisma db push
echo    npx tsx src/seed-mysql.ts
echo.
pause
