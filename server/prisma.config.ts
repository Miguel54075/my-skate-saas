import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Se estivermos a correr comandos de migrate, usa a directUrl (5432). Caso contrário, usa o pooler (6543).
    url: process.env.npm_lifecycle_event === 'build' || process.env.NODE_ENV === 'production' 
      ? (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)
      : process.env.DATABASE_URL,
  },
});