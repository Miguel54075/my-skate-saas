import { defineConfig } from '@prisma/config';

// Deteta se o comando atual do CLI é o migrate
const isMigrate = process.argv.some(arg => arg.includes('migrate'));

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Se for migrate, usa a DIRECT_DATABASE_URL (porta 5432). Caso contrário, usa o DATABASE_URL (porta 6543).
    url: isMigrate 
      ? (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)
      : process.env.DATABASE_URL,
  },
});