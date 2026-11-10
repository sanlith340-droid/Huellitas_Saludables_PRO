import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';
import { buildDatabaseUrl } from './app/config/databaseUrl.js';

const backRoot = path.dirname(fileURLToPath(import.meta.url));
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.join(backRoot, envFile) });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.js',
  },
  datasource: {
    url: buildDatabaseUrl(),
  },
});
