const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./src/routes/authRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const inventoryRoutes = require('./src/routes/inventoryRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const tableRoutes = require('./src/routes/tableRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with permissive CORS for development/demo
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

// Attach Socket.IO instance to app for routes usage
app.set('io', io);

// Security & Parsing Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Orbit Canteen Management Core',
    timestamp: new Date().toISOString()
  });
});

// Real-Time Socket.IO Handling
io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);

  // Join KDS Kitchen Display Room
  socket.on('join_kds', () => {
    socket.join('kds_room');
    console.log(`[Socket.IO] ${socket.id} joined kds_room`);
  });

  // Join Customer Private Room
  socket.on('join_customer', (userId) => {
    if (userId) {
      socket.join(`customer_${userId}`);
      console.log(`[Socket.IO] ${socket.id} joined customer_${userId}`);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Error Middleware]:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

let PORT = process.env.PORT || 5000;

function startServer(portToUse) {
  server.listen(portToUse, () => {
    console.log(`🚀 Orbit Canteen Backend running on http://localhost:${portToUse}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[Port ${portToUse} busy, trying port ${portToUse + 1}...]`);
      startServer(portToUse + 1);
    } else {
      console.error(err);
    }
  });
}

startServer(Number(PORT));

