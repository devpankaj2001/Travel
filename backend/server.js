const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { testConnection } = require('./database/connection');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();

// Trust proxy for reverse proxies (Nginx, Cloudflare, AWS ALB) in production
if (config.app.isProduction) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Dynamic CORS based on ALLOWED_ORIGINS in .env
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);

    if (config.app.allowedOrigins.includes('*') || config.app.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!config.app.isProduction) {
      // In development, be permissive with localhost/127.0.0.1
      if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        return callback(null, true);
      }
    }

    return callback(new Error(`CORS blocked for origin: ${origin}. Add to ALLOWED_ORIGINS in .env.`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// HTTP Request logging
app.use(morgan(config.app.isProduction ? 'combined' : 'dev'));

// Body parsing with configurable payload size
app.use(express.json({ limit: `${config.storage.maxFileSizeMb}mb` }));
app.use(express.urlencoded({ extended: true, limit: `${config.storage.maxFileSizeMb}mb` }));

// Serve uploaded assets statically
app.use('/uploads', express.static(config.storage.uploadDir));

// Global Rate Limiter (DDoS protection)
const globalLimiter = rateLimit({
  windowMs: config.security.rateLimitWindowMs,
  max: config.security.rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', globalLimiter);

// Root informational endpoint
app.get('/', (req, res) => {
  res.json({
    name: config.app.name,
    environment: config.app.env,
    status: 'operational',
    documentation: '/api/v1/health'
  });
});

// Mount Central API v1 Routes
app.use('/api/v1', apiRoutes);

// Centralized 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Server startup
const startServer = async () => {
  // Test DB connection on boot
  const isDbConnected = await testConnection();
  if (!isDbConnected && config.app.isProduction) {
    console.error('[CRITICAL] Database connection failed on startup in production. Exiting process.');
    process.exit(1);
  }

  const server = app.listen(config.app.port, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 ${config.app.name} running`);
    console.log(`📦 Environment:    ${config.app.env}`);
    console.log(`🌐 Port:           ${config.app.port}`);
    console.log(`🔗 API Base:       ${config.app.backendUrl}/api/v1`);
    console.log(`💻 Frontend URL:   ${config.app.frontendUrl}`);
    console.log(`🛡️  Allowed Origins: ${config.app.allowedOrigins.join(', ')}`);
    console.log(`======================================================\n`);
  });

  // Graceful shutdown handling
  const shutdown = (signal) => {
    console.log(`\n[${signal}] Received. Shutting down gracefully...`);
    server.close(() => {
      console.log('[Shutdown] Server closed cleanly.');
      process.exit(0);
    });

    // Force close if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[Shutdown Error] Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

startServer();

module.exports = app;
