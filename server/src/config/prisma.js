import pkg from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const { PrismaClient } = pkg;

// Cria o adaptador do PostgreSQL usando a URL de conexão direta
const adapter = new PrismaPg({
  connectionString: 'postgresql://postgres:123@localhost:5432/street_burger_db?schema=public',
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});

export default prisma;