import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import adminRoutes from './routes/adminRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middleware/errorMiddleware';
import { logger } from './utils/logger';

// Initialize app
const app = express();

// Set middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// Start server only when this file is run directly (e.g. a standalone admin
// process). When imported by src/app.ts as a mounted router, do NOT listen —
// otherwise it binds port 3003 first and Railway routes the public domain to
// the admin server instead of the real API on $PORT.
if (require.main === module) {
  const PORT = process.env.ADMIN_PORT || 3003;
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

// Export app for testing
export default app;