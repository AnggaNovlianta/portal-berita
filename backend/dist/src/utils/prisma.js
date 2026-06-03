"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const adapter_mariadb_1 = require("@prisma/adapter-mariadb");
require("dotenv/config");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl?.trim()) {
    throw new Error('DATABASE_URL harus diatur pada environment saat menjalankan backend.');
}
const adapter = new adapter_mariadb_1.PrismaMariaDb(databaseUrl);
const prisma = new client_1.PrismaClient({ adapter });
exports.default = prisma;
