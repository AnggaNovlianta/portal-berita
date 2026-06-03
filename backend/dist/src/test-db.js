"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("./utils/prisma"));
async function testConnection() {
    console.log('\n🧪 Testing Database Connection...\n');
    try {
        // Test 1: Check connection
        console.log('1️⃣  Checking MySQL connection...');
        await prisma_1.default.$executeRaw `SELECT 1`;
        console.log('   ✅ MySQL connection successful\n');
        // Test 2: Count tables
        console.log('2️⃣  Checking tables...');
        const roleCount = await prisma_1.default.role.count();
        const userCount = await prisma_1.default.user.count();
        const categoryCount = await prisma_1.default.category.count();
        const postCount = await prisma_1.default.post.count();
        const settingCount = await prisma_1.default.setting.count();
        console.log(`   ✅ Roles: ${roleCount} data`);
        console.log(`   ✅ Users: ${userCount} data`);
        console.log(`   ✅ Categories: ${categoryCount} data`);
        console.log(`   ✅ Posts: ${postCount} data`);
        console.log(`   ✅ Settings: ${settingCount} data\n`);
        // Test 3: Sample query
        console.log('3️⃣  Testing sample query...');
        const roles = await prisma_1.default.role.findMany();
        console.log('   Roles found:');
        roles.forEach((role) => {
            console.log(`      - ${role.name} (ID: ${role.id})`);
        });
        console.log('');
        // Test 4: User with role
        console.log('4️⃣  Testing user with role...');
        const user = await prisma_1.default.user.findFirst({
            include: { role: true },
        });
        if (user) {
            console.log(`   ✅ User: ${user.name} (${user.email})`);
            console.log(`      Role: ${user.role.name}\n`);
        }
        // Test 5: Posts with category
        console.log('5️⃣  Testing posts with category...');
        const posts = await prisma_1.default.post.findMany({
            include: { category: true },
            take: 3,
        });
        console.log(`   Found ${posts.length} posts:`);
        posts.forEach((post) => {
            console.log(`      - ${post.title}`);
            console.log(`        Category: ${post.category.name}`);
            console.log(`        Published: ${post.published ? '✅' : '❌'}\n`);
        });
        console.log('═══════════════════════════════════════════════');
        console.log('✅ ALL TESTS PASSED - Database ready to use!');
        console.log('═══════════════════════════════════════════════\n');
    }
    catch (error) {
        console.error('❌ Connection test failed:', error);
        process.exit(1);
    }
    finally {
        await prisma_1.default.$disconnect();
    }
}
testConnection();
