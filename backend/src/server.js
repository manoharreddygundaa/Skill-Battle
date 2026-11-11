import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupBattleSocket } from './socket/battleSocket.js';

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Setup Battle real-time socket events
setupBattleSocket(io);

// Core Middlewares
app.use(cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// Mount API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Skill Battle API',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health'
  });
});

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// Connect DB & Start Server
const startServer = async () => {
  try {
    await connectDB();
    httpServer.listen(config.port, () => {
      console.log(`\n=================================================`);
      console.log(`  SKILL BATTLE SERVER RUNNING ON PORT ${config.port} 🚀 `);
      console.log(`  Mode: ${config.nodeEnv}`);
      console.log(`  Client Origin: ${config.clientUrl}`);
      console.log(`=================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

export { app, io };

