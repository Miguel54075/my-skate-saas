import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: A variável de ambiente DATABASE_URL não está definida!');
  process.exit(1);
}

try {
  const parsed = new URL(databaseUrl);
  console.log(`🔗 Prisma conectando ao banco: ${parsed.host}${parsed.pathname}`);
} catch {
  console.log('🔗 Prisma conectando ao banco (URL presente)');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // aceita certificado self-signed
  },
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'],
});

export default prisma;