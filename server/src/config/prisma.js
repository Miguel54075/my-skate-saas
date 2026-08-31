import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkg;

// Lê a URL de conexão da variável de ambiente (definida no Render/Supabase)
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: A variável de ambiente DATABASE_URL não está definida!');
  process.exit(1);
}

// Log de segurança: mostra apenas o host para confirmar que a URL correta foi carregada
try {
  const parsed = new URL(databaseUrl);
  console.log(`🔗 Prisma conectando ao banco: ${parsed.host}${parsed.pathname}`);
} catch {
  console.log('🔗 Prisma conectando ao banco (URL presente)');
}

// Cria o adaptador do PostgreSQL usando a URL de conexão do ambiente
// rejectUnauthorized: false permite conexão com Supabase que usa certificados self-signed
const adapter = new PrismaPg({ 
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'],
});

export default prisma;