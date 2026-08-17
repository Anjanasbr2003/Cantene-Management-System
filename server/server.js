const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { checkDatabaseHealth, pool } = require('./src/config/db');

const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
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

// Basic API Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);

// Strict Rate Limiting for Authentication (Brute Force Protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 login/register attempts per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reviews', reviewRoutes);

// Health Check Endpoint (Public)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Canteen Management System Core',
    timestamp: new Date().toISOString()
  });
});

// MySQL Database Status & Telemetry Endpoint (Admin Protected to prevent info disclosure)
const { verifyToken, authorizeRoles } = require('./src/middleware/auth');
app.get('/api/db-status', verifyToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tableRows] = await connection.query('SHOW TABLES;');
    const tables = tableRows.map(r => Object.values(r)[0]);
    
    // Count rows in key tables
    const tableCounts = {};
    for (const t of tables) {
      const [cntRow] = await connection.query(`SELECT COUNT(*) as count FROM ${t}`);
      tableCounts[t] = cntRow[0].count;
    }
    
    connection.release();

    res.json({
      success: true,
      database: process.env.DB_NAME || 'orbit_canteen',
      engine: 'MySQL 8.0 / MariaDB',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      status: 'Connected',
      tablesCount: tables.length,
      tables,
      tableCounts,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      database: process.env.DB_NAME || 'orbit_canteen',
      status: 'Disconnected / Error',
      error: process.env.NODE_ENV === 'production' ? 'Database connection error' : err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Global Error Handler (Hides internal stack traces in production)
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'An internal server error occurred.' : err.message
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

  // Join Customer Room
  socket.on('join_customer', (customerId) => {
    socket.join(`customer_${customerId}`);
    console.log(`[Socket.IO] ${socket.id} joined customer_${customerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Start HTTP Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Canteen Management System Backend running on http://localhost:${PORT}`);
  await checkDatabaseHealth();
});
