"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
require("dotenv/config");
const databaseUrl = process.env.DATABASE_URL || 'mysql://root:@localhost:3306/portal_berita';
const adapter = new adapter_mariadb_1.PrismaMariaDb(databaseUrl);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
