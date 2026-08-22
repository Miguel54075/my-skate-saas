import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: 'postgresql://postgres:123@localhost:5432/street_burger_db?schema=public', // <-- Sem o env()
  },
});