import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as mariadb from 'mariadb';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

const pool = mariadb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'portal_berita',
  connectionLimit: 5
});
const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

async function importData() {
  try {
    const dataPath = path.join(__dirname, 'data.json');
    if (!fs.existsSync(dataPath)) {
      console.log('No data.json found. Skipping import.');
      return;
    }

    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

    console.log('Clearing existing data...');
    await prisma.post.deleteMany();
    await prisma.category.deleteMany();
    await prisma.menu.deleteMany();
    await prisma.setting.deleteMany();
    await prisma.user.deleteMany();
    await prisma.role.deleteMany();

    console.log('Importing roles...');
    for (const role of data.roles || []) {
      await prisma.role.create({ data: role });
    }

    console.log('Importing users...');
    for (const user of data.users || []) {
      await prisma.user.create({ data: user });
    }

    console.log('Importing settings...');
    for (const setting of data.settings || []) {
      await prisma.setting.create({ data: setting });
    }

    console.log('Importing menus...');
    const rootMenus = (data.menus || []).filter((m: any) => m.parentId === null);
    for (const menu of rootMenus) {
      await prisma.menu.create({ data: menu });
    }
    const childMenus = (data.menus || []).filter((m: any) => m.parentId !== null);
    for (const menu of childMenus) {
      await prisma.menu.create({ data: menu });
    }

    console.log('Importing categories...');
    for (const category of data.categories || []) {
      await prisma.category.create({ data: category });
    }

    console.log('Importing posts...');
    for (const post of data.posts || []) {
      await prisma.post.create({ data: post });
    }

    console.log('Data successfully imported to MySQL');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

importData();
