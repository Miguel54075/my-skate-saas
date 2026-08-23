import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    // Usa a conexão DIRETA do Supabase para migrações (porta 5432),
    // porque o pooler/PgBouncer (porta 6543) trava nas migrações.
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL,
  },
});