import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorMiddleware } from './middlewares/error.middleware';
import authRoutes from './modules/auth/auth.routes';
import productRoutes from './modules/product/product.routes';
import categoryRoutes from './modules/category/category.routes';
import traceRoutes from './modules/traceability/trace.routes';
import orderRoutes from './modules/order/order.routes';
import paymentRoutes from './modules/payment/payment.routes';
import path from 'path';
import analyticsRoutes from './modules/analytics/analytics.routes';
import adminRoutes from './modules/admin/admin.routes';
import uploadRoutes from './modules/upload/upload.routes';
import forumRoutes from './modules/forum/forum.routes';
import { loggerMiddleware } from './middlewares/logger.middleware';

const app = express();

// Log API transactions and user session paths
app.use(loggerMiddleware);

// Security HTTP headers configured to allow static file queries
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Cookie parser for secure JWT session tokens
app.use(cookieParser());

// Rate Limiter: max 150 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    error: {
      message: 'Quá nhiều yêu cầu từ IP của bạn, vui lòng thử lại sau 15 phút.',
      status: 429
    }
  }
});
app.use('/api', limiter);

// Enable CORS with credentials support for HTTP-only cookies
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json());

// Routes mappings
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/traceability', traceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/forum', forumRoutes);

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health Check API
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Error handling global middleware
app.use(errorMiddleware);

export default app;
