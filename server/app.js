import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

import prisma from './src/config/prisma.js';
import authRoutes from './src/routes/authRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import ingredientRoutes from './src/routes/ingredientRoutes.js';
import menuController from './src/controllers/menuController.js';
import { authMiddleware } from './src/middlewares/authMiddleware.js';

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

// Configuração de Origens Permitidas (CORS) com o link da Vercel hardcoded para evitar falhas
const allowedOrigins = [
  'https://my-street-burger-saas.vercel.app',
  'https://my-skate-saas.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:3333'
];

if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
    const trimmed = origin.trim();
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

const corsOptions = {
  origin: function (origin, callback) {
    // Permite requisições sem origin (ex: mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Bloqueado pela política de CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Segurança e Cabeçalhos HTTP (Sem a linha com o '*' que quebra no Node novo)
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

// Configuração do Socket.io com CORS restrito
const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
});

// Disponibiliza a instância do socket `io` em todas as requisições
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Gerenciamento de Conexões WebSocket
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado no Socket: ${socket.id}`);

  // Permite que o painel admin entre em uma "sala" (room) isolada do seu tenant
  socket.on('joinTenantRoom', (tenantId) => {
    socket.join(tenantId);
    console.log(`🏠 Socket ${socket.id} entrou na sala do tenant: ${tenantId}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado do Socket: ${socket.id}`);
  });
});

// Rate Limiter: Autenticação (mais restritivo — protege contra brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // limite de 50 requisições por IP por janela
  message: {
    error: 'Muitas requisições a partir deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter: Global (proteção genérica contra DDoS em todas as rotas)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // limite de 500 requisições por IP por janela
  message: {
    error: 'Limite de requisições excedido. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate Limiter: Pedidos públicos (anti-spam de pedidos falsos)
const orderLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 20, // máximo 20 pedidos por IP em 5 minutos
  message: {
    error: 'Muitos pedidos em curto período. Aguarde antes de tentar novamente.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplica o rate limiter global em toda a API
app.use('/api', globalLimiter);

// Rotas da aplicação
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderLimiter, orderRoutes);
app.use('/api/ingredients', ingredientRoutes);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({
      status: 'OK',
      message: 'Street Burger SaaS API rodando e conectada ao PostgreSQL!',
    });
  } catch (error) {
    console.error('❌ Health check falhou:', error.message);
    return res.status(500).json({
      status: 'ERROR',
      message: 'Erro ao conectar no banco de dados',
      error: error.message,
    });
  }
});

const PORT = process.env.PORT || 3333;

httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});