import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import { connectDatabase } from './config/database';
import routes from './routes';
import { errorHandler, notFound } from './middleware/errorHandler';
import { setSocketServer } from './utils/socket';
import { initScheduler } from './services/scheduler/scheduler';
import logger from './utils/logger';

const app = express();
const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowed = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(o => o.trim());
      if (allowed.includes(origin) || /^https:\/\/.*\.vercel\.app$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error('Socket.IO CORS blocked'));
    },
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

setSocketServer(io);

// Socket auth & room management
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) { next(new Error('Authentication required')); return; }
  try {
    const { verifyAccessToken } = require('./utils/jwt');
    const decoded = verifyAccessToken(token);
    socket.data.userId = decoded.userId;
    next();
  } catch {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = socket.data.userId;
  if (userId) {
    socket.join(`user:${userId}`);
    logger.info(`Socket connected: user ${userId}`);
  }

  socket.on('join:task', (taskId: string) => { socket.join(`task:${taskId}`); });
  socket.on('leave:task', (taskId: string) => { socket.leave(`task:${taskId}`); });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: user ${userId}`);
  });
});

// Security & middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cookieParser());

// CORS — supports comma-separated list of allowed origins for prod + preview + local dev
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any *.vercel.app preview deployment automatically
    if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Rate limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'AgentForge API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api', routes);

// 404 & error handling
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '5000');

const startServer = async (): Promise<void> => {
  await connectDatabase();

  httpServer.listen(PORT, '0.0.0.0', () => {
    logger.info(`AgentForge server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Client URL: ${process.env.CLIENT_URL}`);
  });

  // Start background scheduler
  initScheduler();

  // Dynamically discover free models from OpenRouter on startup
  const { initModelDiscovery } = await import('./services/agent/modelDiscovery');
  initModelDiscovery().catch((err: unknown) => logger.error('Model discovery init failed:', err));
};

//   import('./services/agent/modelDiscovery').then(({ initModelDiscovery }) => {
//   initModelDiscovery().catch((err: unknown) => logger.error('Model discovery init failed:', err));
// });



startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export { app, httpServer, io };
