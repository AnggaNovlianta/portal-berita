import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // 1. Pastikan Role sudah ada
  const role = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin' },
  });

  // 2. Enkripsi (Hash) kata sandi menggunakan bcrypt
  const hashedPassword = await bcrypt.hash('rahasia123', 10);

  // 3. Tambahkan User ke database
  const user = await prisma.user.upsert({
    where: { email: 'redaksi@email.com' },
    update: {
      roleId: role.id,
      isApproved: true, // Paksa setujui jika akun sudah ada
    },
    create: {
      name: 'Kemas',
      email: 'redaksi@email.com',
      password: hashedPassword,
      roleId: role.id,
      isApproved: true, // Langsung setujui saat pertama kali dibuat
    },
  });

  console.log('✅ User berhasil ditambahkan:', user.email);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());