import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function exportData() {
  try {
    const roles = await prisma.role.findMany();
    const users = await prisma.user.findMany();
    const settings = await prisma.setting.findMany();
    const menus = await prisma.menu.findMany();
    const categories = await prisma.category.findMany();
    const posts = await prisma.post.findMany();

    const data = {
      roles,
      users,
      settings,
      menus,
      categories,
      posts,
    };

    fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(data, null, 2));
    console.log('Data successfully exported to data.json');
  } catch (error) {
    console.error('Error exporting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
