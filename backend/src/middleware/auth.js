const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const auth = async (req, res, next) => {
  try {
    let token;

    // Verificar se o token está no header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Verificar se o token existe
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Acesso negado. Token não fornecido.'
      });
    }

    try {
      // Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Buscar o usuário no banco de dados
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido. Usuário não encontrado.'
        });
      }

      // Verificar se o usuário está ativo
      if (!user.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada. Entre em contato com o administrador.'
        });
      }

      // Verificar se o usuário está bloqueado
      if (user.estaBloqueado()) {
        return res.status(423).json({
          success: false,
          message: 'Conta temporariamente bloqueada devido a múltiplas tentativas de login.'
        });
      }

      // Adicionar usuário ao request
      req.user = user;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expirado. Faça login novamente.',
          code: 'TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Token inválido.'
        });
      }

      throw error;
    }

  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Middleware para verificar refresh token
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token não fornecido.'
      });
    }

    try {
      // Verificar e decodificar o refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      // Buscar o usuário no banco de dados
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido. Usuário não encontrado.'
        });
      }

      // Verificar se o refresh token existe na lista do usuário
      const tokenExists = user.refreshTokens.some(token => token.token === refreshToken);
      
      if (!tokenExists) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido ou revogado.'
        });
      }

      // Verificar se o usuário está ativo
      if (!user.ativo) {
        return res.status(401).json({
          success: false,
          message: 'Conta desativada. Entre em contato com o administrador.'
        });
      }

      // Adicionar usuário e refresh token ao request
      req.user = user;
      req.refreshToken = refreshToken;
      next();

    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token expirado. Faça login novamente.',
          code: 'REFRESH_TOKEN_EXPIRED'
        });
      }

      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Refresh token inválido.'
        });
      }

      throw error;
    }

  } catch (error) {
    console.error('Erro no middleware de refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  auth,
  verifyRefreshToken
};

