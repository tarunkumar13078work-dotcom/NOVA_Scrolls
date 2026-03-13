import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './database/connect.js';
import authRoutes from './routes/authRoutes.js';
import manhwaRoutes from './routes/manhwaRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import updateRoutes from './routes/updateRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { startUpdateScheduler } from './jobs/updateScheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const allowedOrigins = CLIENT_ORIGIN.split(',').map((origin) => origin.trim());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests, try again later.' },
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Nova Scrolls API running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/manhwa', manhwaRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

export const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    startUpdateScheduler();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
