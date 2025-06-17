const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar configurações
const connectDB = require('./src/config/database');

// Importar middleware
const errorHandler = require('./src/middleware/errorHandler');
const {
  apiLimiter,
  speedLimiter,
  sanitizeInput,
  securityLogger,
  additionalSecurityHeaders
} = require('./src/middleware/security');

// Importar rotas
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const studentRoutes = require('./src/routes/students');
const teacherRoutes = require('./src/routes/teachers');
const classRoutes = require('./src/routes/classes');
const lessonRoutes = require('./src/routes/lessons');
const evaluationRoutes = require('./src/routes/evaluations');
const paymentRoutes = require('./src/routes/payments');
const contractRoutes = require('./src/routes/contracts');

const app = express();

// Conectar ao banco de dados
connectDB();

// Middleware de segurança básico
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:5000", "https://api.mercadopago.com"]
    }
  }
}));

// Headers de segurança adicionais
app.use(additionalSecurityHeaders);

// Rate limiting e speed limiting
app.use('/api/', apiLimiter);
app.use('/api/', speedLimiter);

// Log de segurança
app.use(securityLogger);

// CORS configurado de forma segura
app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sem origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 horas
}));

// Body parser com limites de segurança
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Verificar se o JSON é válido
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        message: 'JSON inválido'
      });
      return;
    }
  }
}));

app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb',
  parameterLimit: 100 // Limitar número de parâmetros
}));

// Sanitização de entrada
app.use(sanitizeInput);

// Servir arquivos estáticos com segurança
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d',
  etag: false,
  setHeaders: (res, path) => {
    // Prevenir execução de scripts em uploads
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Disposition', 'attachment');
  }
}));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contracts', contractRoutes);

// Rota de teste com informações limitadas
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Middleware de tratamento de erros
app.use(errorHandler);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏊‍♀️ Servidor da Escola de Natação rodando na porta ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔒 Segurança: Ativada`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor graciosamente...');
  server.close(() => {
    console.log('Servidor encerrado.');
    process.exit(0);
  });
});

module.exports = app;

