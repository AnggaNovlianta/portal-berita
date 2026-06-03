"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./utils/prisma"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
async function main() {
    console.log('🔄 Memulai migrasi data dari PostgreSQL ke MySQL...\n');
    try {
        // 1. Baca file data.json
        const dataPath = path_1.default.join(__dirname, '../data.json');
        if (!fs_1.default.existsSync(dataPath)) {
            throw new Error(`File data.json tidak ditemukan di ${dataPath}`);
        }
        const data = JSON.parse(fs_1.default.readFileSync(dataPath, 'utf-8'));
        console.log('✅ File data.json berhasil dibaca\n');
        // 2. Migrasi Roles
        console.log('📍 [1/6] Migrasi Roles...');
        for (const role of data.roles) {
            await prisma_1.default.role.upsert({
                where: { id: role.id },
                update: { name: role.name },
                create: { id: role.id, name: role.name },
            });
        }
        console.log(`✅ ${data.roles.length} roles berhasil dimigrasi\n`);
        // 3. Migrasi Users
        console.log('📍 [2/6] Migrasi Users...');
        for (const user of data.users) {
            await prisma_1.default.user.upsert({
                where: { id: user.id },
                update: {
                    email: user.email,
                    password: user.password,
                    name: user.name,
                    isApproved: user.isApproved,
                    resetPasswordToken: user.resetPasswordToken,
                    resetPasswordExpires: user.resetPasswordExpires
                        ? new Date(user.resetPasswordExpires)
                        : null,
                    roleId: user.roleId,
                    updatedAt: new Date(user.updatedAt),
                },
                create: {
                    id: user.id,
                    email: user.email,
                    password: user.password,
                    name: user.name,
                    isApproved: user.isApproved,
                    resetPasswordToken: user.resetPasswordToken,
                    resetPasswordExpires: user.resetPasswordExpires
                        ? new Date(user.resetPasswordExpires)
                        : null,
                    roleId: user.roleId,
                    createdAt: new Date(user.createdAt),
                    updatedAt: new Date(user.updatedAt),
                },
            });
        }
        console.log(`✅ ${data.users.length} users berhasil dimigrasi\n`);
        // 4. Migrasi Settings
        console.log('📍 [3/6] Migrasi Settings...');
        for (const setting of data.settings) {
            await prisma_1.default.setting.upsert({
                where: { id: setting.id },
                update: { value: setting.value },
                create: {
                    id: setting.id,
                    key: setting.key,
                    value: setting.value,
                },
            });
        }
        console.log(`✅ ${data.settings.length} settings berhasil dimigrasi\n`);
        // 5. Migrasi Categories
        console.log('📍 [4/6] Migrasi Categories...');
        for (const category of data.categories) {
            await prisma_1.default.category.upsert({
                where: { id: category.id },
                update: {
                    name: category.name,
                    slug: category.slug,
                    updatedAt: new Date(category.updatedAt),
                },
                create: {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    createdAt: new Date(category.createdAt),
                    updatedAt: new Date(category.updatedAt),
                },
            });
        }
        console.log(`✅ ${data.categories.length} categories berhasil dimigrasi\n`);
        // 6. Migrasi Posts
        console.log('📍 [5/6] Migrasi Posts...');
        for (const post of data.posts) {
            await prisma_1.default.post.upsert({
                where: { id: post.id },
                update: {
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    thumbnail: post.thumbnail,
                    image: post.image,
                    published: post.published,
                    views: post.views,
                    authorId: post.authorId,
                    categoryId: post.categoryId,
                    updatedAt: new Date(post.updatedAt),
                },
                create: {
                    id: post.id,
                    title: post.title,
                    slug: post.slug,
                    content: post.content,
                    thumbnail: post.thumbnail,
                    image: post.image,
                    published: post.published,
                    views: post.views,
                    authorId: post.authorId,
                    categoryId: post.categoryId,
                    createdAt: new Date(post.createdAt),
                    updatedAt: new Date(post.updatedAt),
                },
            });
        }
        console.log(`✅ ${data.posts.length} posts berhasil dimigrasi\n`);
        // 7. Summary
        console.log('📊 SUMMARY MIGRASI:');
        console.log('═'.repeat(50));
        console.log(`📌 Roles:      ${data.roles.length} data`);
        console.log(`👤 Users:      ${data.users.length} user`);
        console.log(`⚙️  Settings:   ${data.settings.length} settings`);
        console.log(`📂 Categories: ${data.categories.length} kategori`);
        console.log(`📰 Posts:      ${data.posts.length} artikel`);
        console.log('═'.repeat(50));
        console.log('\n✅ MIGRASI BERHASIL! Database MySQL siap digunakan.\n');
    }
    catch (error) {
        console.error('❌ Error saat migrasi:', error);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
main();
