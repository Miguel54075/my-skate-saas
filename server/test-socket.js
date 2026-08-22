import { io } from 'socket.io-client';

// Conecta ao servidor WebSocket
const socket = io('http://localhost:3333');

const TENANT_ID = 'b122780a-1fcc-41f9-8137-6672d9a2e28c'; // Cole seu tenantId aqui

socket.on('connect', () => {
  console.log(`✅ Conectado ao servidor Socket! ID: ${socket.id}`);

  // Entra na sala do restaurante
  socket.emit('joinTenantRoom', TENANT_ID);
  console.log(`📡 Escutando novos pedidos para o Tenant: ${TENANT_ID}...`);
});

// Escuta o evento de Novo Pedido
socket.on('newOrder', (order) => {
  console.log('🚨 NOVO PEDIDO RECEBIDO EM TEMPO REAL!');
  console.log(JSON.stringify(order, null, 2));
});

// Escuta o evento de Atualização de Status
socket.on('orderStatusUpdated', (order) => {
  console.log(`🔄 STATUS DO PEDIDO ${order.id} ATUALIZADO PARA: ${order.status}`);
});