import express from 'express';
import cors from 'cors';
import path from 'path';
import https from 'https';
import fs from 'fs';

// Import port configuration
let PORTS;
try {
  PORTS = require('../../config/ports');
} catch (error) {
  // Fallback configuration for customer package
  PORTS = {
    backend: 3001,
    frontend: 3000,
    admin: 3002
  };
}
const CORS_ORIGINS = [
  'http://localhost:3000', 
  'http://localhost:3002', 
  'https://localhost:8443',
  'http://sellercentral.amazon.com',
  'https://sellercentral.amazon.com', 
  'http://admin.sellercentral.amazon.com',
  'https://admin.sellercentral.amazon.com'
];

// Import routes
import storeRoutes from './routes/store';
import productRoutes from './routes/product';
import salesRoutes from './routes/sales';
import dashboardRoutes from './routes/dashboard';
import userRoutes from './routes/users';
import vocRoutes from './routes/voc';
import authRoutes from './routes/auth';
import communicationsRoutes from './routes/communications';
import accountHealthRoutes from './routes/accountHealth';
import taxInfoRoutes from './routes/taxInfo';
import legalEntityRoutes from './routes/legalEntity';
import sellingApplicationsRoutes from './routes/sellingApplications';
import uploadRoutes from './routes/upload';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';

const app = express();
const PORT = process.env.PORT || PORTS.backend;

// Middleware
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(requestLogger);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`📁 Created uploads directory: ${uploadsDir}`);
}

// Static file serving for uploaded images
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/store', storeRoutes);  // Legacy route for backward compatibility
app.use('/api/stores', storeRoutes); // New plural route for enhanced API
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/voc', vocRoutes);
app.use('/api/communications', communicationsRoutes);
app.use('/api/account-health', accountHealthRoutes);
app.use('/api/tax-info', taxInfoRoutes);
app.use('/api/legal-entity', legalEntityRoutes);
app.use('/api/selling-applications', sellingApplicationsRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📁 Uploads directory: ${path.join(__dirname, '../uploads')}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`✅ Server started successfully at ${new Date().toISOString()}`); // 触发重启
});

// 开发环境HTTPS服务器配置（用于自定义域名）
if (process.env.ENABLE_HTTPS === 'true') {
  const httpsPort = process.env.HTTPS_PORT || 443;
  const certPath = path.join(__dirname, '../../certs');
  
  try {
    // 检查证书文件是否存在
    if (fs.existsSync(path.join(certPath, 'key.pem')) && fs.existsSync(path.join(certPath, 'cert.pem'))) {
      const httpsOptions = {
        key: fs.readFileSync(path.join(certPath, 'key.pem')),
        cert: fs.readFileSync(path.join(certPath, 'cert.pem'))
      };
      
      https.createServer(httpsOptions, app).listen(httpsPort, () => {
        console.log(`🔒 HTTPS Backend server running on https://api.sellercentral.amazon.com:${httpsPort}`);
        console.log(`🌐 Custom domain mode enabled`);
      });
    } else {
      console.log(`⚠️  SSL certificates not found in ${certPath}`);
      console.log(`   Certificates will be generated automatically`);
    }
  } catch (error) {
    console.error('❌ Failed to start HTTPS server:', error);
    console.log('   Continuing with HTTP server only...');
  }
}

export = app;