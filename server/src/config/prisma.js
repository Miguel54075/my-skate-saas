import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// necessário para obter __dirname em ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ FATAL: A variável de ambiente DATABASE_URL não está definida!');
  process.exit(1);
}

let parsed;
try {
  parsed = new URL(databaseUrl);
  console.log(`🔗 Prisma conectando ao banco: ${parsed.host}${parsed.pathname}`);
} catch {
  console.error('❌ FATAL: DATABASE_URL inválida!');
  process.exit(1);
}

// caminho do certificado CA baixado do Supabase
const caCertPath = path.join(__dirname, '../certificateSSL/prod-ca-2021.crt');
let caCert;
try {
  caCert = fs.readFileSync(caCertPath).toString();
  console.log('🔒 Certificado SSL carregado com sucesso.');
} catch (err) {
  console.error(`❌ FATAL: Não foi possível ler o certificado SSL em ${caCertPath}`);
  console.error(err.message);
  process.exit(1);
}

const adapter = new PrismaPg({
  host: parsed.hostname,
  port: Number(parsed.port) || 5432,
  user: decodeURIComponent(parsed.username),
  password: decodeURIComponent(parsed.password),
  database: parsed.pathname.slice(1),
  ssl: {
    ca: caCert,
    rejectUnauthorized: true, // agora valida de verdade, usando o CA correto
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'],
});

export default prisma;