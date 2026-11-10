import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.ts';
import { buildDatabaseUrl } from './databaseUrl.js';

const adapter = new PrismaPg({ connectionString: buildDatabaseUrl() });
const prisma = new PrismaClient({ adapter });

async function testConnection() {
  const rows = await prisma.$queryRaw`SELECT NOW() AS now`;
  return rows[0]?.now ?? null;
}

async function disconnect() {
  await prisma.$disconnect();
}

export { prisma, testConnection, disconnect };
export default prisma;
