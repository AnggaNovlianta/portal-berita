#!/bin/bash

# Script Setup Migrasi PostgreSQL ke MySQL
# Pastikan sudah install Node.js dan MySQL running

echo "🚀 Memulai setup migrasi ke MySQL..."
echo ""

# 1. Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# 2. Check .env file
if [ ! -f ".env" ]; then
    echo "⚠️  File .env tidak ditemukan!"
    echo "📝 Membuat .env dari .env.example..."
    cp .env.example .env
    echo "✅ File .env berhasil dibuat"
    echo ""
    echo "⚠️  Silakan update .env dengan konfigurasi lokal Anda:"
    echo "   DATABASE_URL=mysql://root:@localhost:3306/portal_berita"
    echo ""
fi

# 3. Generate Prisma Client
echo "🔧 Generate Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# 4. Run Migrations
echo "🗄️  Running Prisma migrations..."
npx prisma migrate dev --name init
echo "✅ Migrations completed"
echo ""

# 5. Run Seed Script
echo "🌱 Seeding database dengan data dari data.json..."
npx tsx src/seed-mysql.ts
echo ""

# 6. Summary
echo "═══════════════════════════════════════════════"
echo "✅ SETUP SELESAI!"
echo "═══════════════════════════════════════════════"
echo ""
echo "🎯 Langkah selanjutnya:"
echo "1. Verify data di phpMyAdmin: http://localhost/phpmyadmin"
echo "2. Start backend: npm run dev"
echo "3. Start frontend: cd ../frontend && npm run dev"
echo "4. Buka browser: http://localhost:5173"
echo ""
echo "💡 Jika ada error, jalankan:"
echo "   npx prisma db push"
echo "   npx tsx src/seed-mysql.ts"
echo ""
