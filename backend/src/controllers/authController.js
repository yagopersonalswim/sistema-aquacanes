const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Private (apenas admin)
const register = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { nome, email, senha, tipo } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    // Criar usuário
    const user = await User.create({
      nome,
      email,
      senha,
      tipo
    });

    // Gerar tokens
    const token = user.gerarJWT();
    const refreshToken = user.gerarRefreshToken();

    // Salvar refresh token
    await user.adicionarRefreshToken(refreshToken);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { email, senha } = req.body;

    // Buscar usuário com senha
    const user = await User.findOne({ email }).select('+senha');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
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
        message: 'Conta temporariamente bloqueada devido a múltiplas tentativas de login.',
        bloqueadoAte: user.bloqueadoAte
      });
    }

    // Verificar senha
    const senhaCorreta = await user.compararSenha(senha);
    
    if (!senhaCorreta) {
      // Incrementar tentativas de login
      await user.incrementarTentativasLogin();
      
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Reset tentativas de login e atualizar último login
    await user.resetarTentativasLogin();

    // Limpar refresh tokens expirados
    await user.limparRefreshTokensExpirados();

    // Gerar tokens
    const token = user.gerarJWT();
    const refreshToken = user.gerarRefreshToken();

    // Salvar refresh token
    await user.adicionarRefreshToken(refreshToken);

    // Remover senha do objeto de resposta
    user.senha = undefined;

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user,
        token,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Logout de usuário
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = req.user;

    if (refreshToken) {
      // Remover refresh token específico
      await user.removerRefreshToken(refreshToken);
    }

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Logout de todos os dispositivos
// @route   POST /api/auth/logout-all
// @access  Private
const logoutAll = async (req, res) => {
  try {
    const user = req.user;

    // Limpar todos os refresh tokens
    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Logout realizado em todos os dispositivos'
    });

  } catch (error) {
    console.error('Erro no logout geral:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
  try {
    const user = req.user;
    const oldRefreshToken = req.refreshToken;

    // Remover o refresh token antigo
    await user.removerRefreshToken(oldRefreshToken);

    // Gerar novos tokens
    const token = user.gerarJWT();
    const newRefreshToken = user.gerarRefreshToken();

    // Salvar novo refresh token
    await user.adicionarRefreshToken(newRefreshToken);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: {
        token,
        refreshToken: newRefreshToken
      }
    });

  } catch (error) {
    console.error('Erro no refresh token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter dados do usuário atual
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        user
      }
    });

  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar dados do usuário atual
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { nome, email } = req.body;
    const user = req.user;

    // Verificar se o email já existe (se foi alterado)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
    }

    // Atualizar dados
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { nome, email },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Dados atualizados com sucesso',
      data: {
        user: updatedUser
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar dados do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { senhaAtual, novaSenha } = req.body;
    const user = await User.findById(req.user._id).select('+senha');

    // Verificar senha atual
    const senhaCorreta = await user.compararSenha(senhaAtual);
    if (!senhaCorreta) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta'
      });
    }

    // Atualizar senha
    user.senha = novaSenha;
    await user.save();

    // Limpar todos os refresh tokens (forçar novo login)
    user.refreshTokens = [];
    await user.save();

    res.json({
      success: true,
      message: 'Senha alterada com sucesso. Faça login novamente.'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Solicitar reset de senha
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Gerar token de reset
    const resetToken = user.gerarTokenResetSenha();
    await user.save();

    // Aqui você enviaria o email com o token
    // Por enquanto, vamos apenas retornar o token (apenas para desenvolvimento)
    
    res.json({
      success: true,
      message: 'Token de reset enviado por email',
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    });

  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Reset de senha
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
const resetPassword = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Hash do token recebido
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }

    // Definir nova senha
    user.senha = req.body.senha;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Limpar todos os refresh tokens
    user.refreshTokens = [];
    
    await user.save();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword
};

