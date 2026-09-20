import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDatabaseUrl = process.env.DATABASE_URL;

if (!rawDatabaseUrl) {
  console.error('❌ FATAL: A variável de ambiente DATABASE_URL não está definida!');
  process.exit(1);
}

// 1. Ajuste para o PgBouncer no Supabase (porta 6543)
let connectionString = rawDatabaseUrl;
if (connectionString.includes('6543') && !connectionString.includes('pgbouncer=true')) {
  connectionString += connectionString.includes('?') ? '&pgbouncer=true' : '?pgbouncer=true';
}

// 2. Remove parâmetros de SSL da URL para impedir que o 'pg' ignore o objeto de SSL abaixo
const parsedUrl = new URL(connectionString);
parsedUrl.searchParams.delete('sslmode');
parsedUrl.searchParams.delete('ssl');

// 3. Localiza o certificado SSL local (se disponível)
const certPath = path.resolve(__dirname, '../certificateSSL/prod-ca-2021.crt');
const hasCert = fs.existsSync(certPath);

// 4. Configura o SSL diretamente no driver PG
const sslOption = hasCert
  ? { ca: fs.readFileSync(certPath).toString(), rejectUnauthorized: false }
  : { rejectUnauthorized: false };

const pool = new Pool({
  connectionString: parsedUrl.toString(),
  ssl: sslOption,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'production'
    ? ['warn', 'error']
    : ['query', 'info', 'warn', 'error'],
});

export default prisma;