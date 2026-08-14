const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const mongoose = require('mongoose');

dotenv.config();

const requiredEnv = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnv.forEach((v) => {
  if (!process.env[v]) throw new Error(`Missing required env var: ${v}`);
});

const clientOrigin = (process.env.CLIENT_URL || '').replace(/\/+$/, '');

const allowedOrigins = [
  clientOrigin,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
].filter(Boolean);

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

if (process.env.NODE_ENV === 'production' && !clientOrigin) {
  logger.warn('CLIENT_URL not set — CORS will allow all origins. Set CLIENT_URL in Render env vars.');
}

const mongoHost = () => {
  try {
    return new URL(process.env.MONGODB_URI.replace('mongodb+srv://', 'https://')).host || process.env.MONGODB_URI.slice(0, 50);
  } catch {
    return process.env.MONGODB_URI.slice(0, 50);
  }
};
logger.info(`MONGODB_URI host: ${mongoHost()}`);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health',
});
app.use('/api/', limiter);

app.get('/api/health', (req, res) => {
  res.json({
    status: mongoose.connection.readyState === 1 ? 'ok' : 'degraded',
    mongo: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

connectDB();

app.use('/api/auth', require('./routes/auth'));
app.use('/api/income', require('./routes/income'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/habits', require('./routes/habit'));
app.use('/api/savings', require('./routes/savings'));
app.use('/api/investments', require('./routes/investment'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/user', require('./routes/user'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/budgets', require('./routes/budget'));
app.use('/api/debts', require('./routes/debt'));

app.use('/api', (req, res) => res.status(404).json({ message: 'API route not found' }));

app.get('/', (req, res) => res.json({ status: 'ok', app: 'WealthFlow API' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => process.exit(0));
});
