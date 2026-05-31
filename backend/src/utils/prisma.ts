import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Ambil alamat database dari .env
const connectionString = process.env.DATABASE_URL;

// 2. Buat mesin koneksi PostgreSQL (Pool)
const pool = new Pool({ connectionString });

// 3. Pasang mesin tersebut ke dalam Prisma Adapter
const adapter = new PrismaPg(pool);

// 4. Masukkan adapter ke dalam Prisma Client (Kurungnya tidak kosong lagi!)
const prisma = new PrismaClient({ adapter });

export default prisma;