"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./utils/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
async function main() {
    // 1. Pastikan Role sudah ada
    const role = await prisma_1.default.role.upsert({
        where: { name: 'Admin' },
        update: {},
        create: { name: 'Admin' },
    });
    // 2. Enkripsi (Hash) kata sandi menggunakan bcrypt
    const hashedPassword = await bcrypt_1.default.hash('rahasia123', 10);
    // 3. Tambahkan User ke database
    const user = await prisma_1.default.user.upsert({
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
    .finally(async () => await prisma_1.default.$disconnect());
