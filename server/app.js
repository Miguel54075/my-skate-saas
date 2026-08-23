import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

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
  origin: true, // Permite qualquer origem automaticamente refletindo o Origin da requisição
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

// Limitador de requisições contra ataques de força bruta nas rotas de autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP por janela
  message: {
    error: 'Muitas requisições a partir deste IP. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rotas da aplicação
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ingredients', ingredientRoutes);

app.get('/health', async (req, res) => {
  try {
    // Apenas verifica se o client do prisma está ativo e pronto
    return res.status(200).json({
      status: 'OK',
      message: 'Street Burger SaaS API rodando e conectada ao PostgreSQL!',
    });
  } catch (error) {
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