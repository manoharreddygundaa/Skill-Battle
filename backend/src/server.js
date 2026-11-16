import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupBattleSocket } from './socket/battleSocket.js';
import { sanitizeData, generalApiLimiter } from './middleware/security.js';

const app = express();
const httpServer = http.createServer(app);

// Configure Allowed Origins
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

// Initialize Socket.IO with strict CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS violation: origin not allowed for WebSockets'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }
});

// Setup Battle real-time socket events
setupBattleSocket(io);

// Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false
  })
);

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Access denied for this origin'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Cookie Parser for HttpOnly authentication cookies
app.use(cookieParser());

// Request Parsing with limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// NoSQL Operator Injection Sanitizer
app.use(sanitizeData);

// Logging in Development
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// General API Rate Limiting
app.use('/api', generalApiLimiter);

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
app.use((req, res) => {
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
