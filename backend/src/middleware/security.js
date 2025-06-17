const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const validator = require('validator');
const xss = require('xss');

// Rate limiting específico para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas de login por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Rate limiting para APIs sensíveis
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em 15 minutos.'
  }
});

// Slow down para requisições frequentes
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 50, // permitir 50 requests por 15 minutos sem delay
  delayMs: () => 500, // adicionar 500ms de delay para cada request adicional
  validate: { delayMs: false } // desabilitar warning
});

// Sanitização de dados de entrada
const sanitizeInput = (req, res, next) => {
  // Sanitizar strings para prevenir XSS
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) {
    sanitizeObject(req.body);
  }
  
  if (req.query) {
    sanitizeObject(req.query);
  }

  next();
};

// Validação de entrada para campos críticos
const validateCriticalFields = (req, res, next) => {
  const { email, cpf, telefone } = req.body;

  // Validar email se presente
  if (email && !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Email inválido'
    });
  }

  // Validar CPF se presente (formato básico)
  if (cpf && !validator.matches(cpf, /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)) {
    return res.status(400).json({
      success: false,
      message: 'CPF inválido'
    });
  }

  // Validar telefone se presente
  if (telefone && !validator.matches(telefone, /^\(\d{2}\)\s\d{4,5}-\d{4}$|^\d{10,11}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Telefone inválido'
    });
  }

  next();
};

// Middleware para log de segurança
const securityLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  const method = req.method;
  const url = req.originalUrl;

  // Log de tentativas de acesso a rotas sensíveis
  const sensitiveRoutes = ['/api/auth/login', '/api/users', '/api/payments'];
  const isSensitive = sensitiveRoutes.some(route => url.startsWith(route));

  if (isSensitive) {
    console.log(`[SECURITY] ${timestamp} - ${ip} - ${method} ${url} - ${userAgent}`);
  }

  next();
};

// Middleware para validar tokens JWT mais rigorosamente
const strictTokenValidation = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verificar se o token não está expirado
    if (decoded.exp < Date.now() / 1000) {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    // Verificar se o usuário ainda existe e está ativo
    const User = require('../models/User');
    User.findById(decoded.id).then(user => {
      if (!user || user.status !== 'ativo') {
        return res.status(401).json({
          success: false,
          message: 'Usuário inválido ou inativo'
        });
      }
      
      req.user = user;
      next();
    }).catch(error => {
      return res.status(401).json({
        success: false,
        message: 'Erro na validação do token'
      });
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para prevenir ataques de força bruta em operações sensíveis
const bruteForceProtection = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
  const attempts = new Map();

  return (req, res, next) => {
    const key = req.ip + req.originalUrl;
    const now = Date.now();
    
    if (!attempts.has(key)) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const attempt = attempts.get(key);
    
    if (now > attempt.resetTime) {
      attempts.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (attempt.count >= maxAttempts) {
      return res.status(429).json({
        success: false,
        message: 'Muitas tentativas. Tente novamente mais tarde.'
      });
    }

    attempt.count++;
    next();
  };
};

// Middleware para validar tamanho de arquivos
const validateFileSize = (maxSize = 10 * 1024 * 1024) => { // 10MB padrão
  return (req, res, next) => {
    if (req.file && req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Arquivo muito grande. Tamanho máximo: 10MB'
      });
    }
    next();
  };
};

// Middleware para validar tipos de arquivo
const validateFileType = (allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']) => {
  return (req, res, next) => {
    if (req.file && !allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de arquivo não permitido'
      });
    }
    next();
  };
};

// Middleware para headers de segurança adicionais
const additionalSecurityHeaders = (req, res, next) => {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Forçar HTTPS em produção
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  // Política de referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Política de permissões
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

module.exports = {
  loginLimiter,
  apiLimiter,
  speedLimiter,
  sanitizeInput,
  validateCriticalFields,
  securityLogger,
  strictTokenValidation,
  bruteForceProtection,
  validateFileSize,
  validateFileType,
  additionalSecurityHeaders
};

