const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ]
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter pelo menos 6 caracteres'],
    select: false // Por padrão, não incluir a senha nas consultas
  },
  tipo: {
    type: String,
    required: [true, 'Tipo de usuário é obrigatório'],
    enum: {
      values: ['admin', 'professor', 'responsavel'],
      message: 'Tipo deve ser: admin, professor ou responsavel'
    }
  },
  ativo: {
    type: Boolean,
    default: true
  },
  ultimoLogin: {
    type: Date
  },
  tentativasLogin: {
    type: Number,
    default: 0
  },
  bloqueadoAte: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  refreshTokens: [{
    token: String,
    criadoEm: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ tipo: 1 });
userSchema.index({ ativo: 1 });

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  // Só fazer hash se a senha foi modificada
  if (!this.isModified('senha')) {
    return next();
  }

  try {
    // Hash da senha com salt de 12 rounds
    const salt = await bcrypt.genSalt(12);
    this.senha = await bcrypt.hash(this.senha, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.compararSenha = async function(senhaInformada) {
  return await bcrypt.compare(senhaInformada, this.senha);
};

// Método para gerar JWT token
userSchema.methods.gerarJWT = function() {
  return jwt.sign(
    { 
      id: this._id,
      email: this.email,
      tipo: this.tipo
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    }
  );
};

// Método para gerar refresh token
userSchema.methods.gerarRefreshToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      tipo: 'refresh'
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

// Método para adicionar refresh token
userSchema.methods.adicionarRefreshToken = async function(refreshToken) {
  // Limitar a 5 refresh tokens por usuário
  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift(); // Remove o mais antigo
  }
  
  this.refreshTokens.push({
    token: refreshToken,
    criadoEm: new Date()
  });
  
  await this.save();
};

// Método para remover refresh token
userSchema.methods.removerRefreshToken = async function(refreshToken) {
  this.refreshTokens = this.refreshTokens.filter(
    token => token.token !== refreshToken
  );
  await this.save();
};

// Método para limpar refresh tokens expirados
userSchema.methods.limparRefreshTokensExpirados = async function() {
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - (7 * 24 * 60 * 60 * 1000));
  
  this.refreshTokens = this.refreshTokens.filter(
    token => token.criadoEm > seteDiasAtras
  );
  
  await this.save();
};

// Método para verificar se usuário está bloqueado
userSchema.methods.estaBloqueado = function() {
  return this.bloqueadoAte && this.bloqueadoAte > Date.now();
};

// Método para incrementar tentativas de login
userSchema.methods.incrementarTentativasLogin = async function() {
  // Se já passou do tempo de bloqueio, resetar
  if (this.bloqueadoAte && this.bloqueadoAte < Date.now()) {
    return await this.updateOne({
      $unset: {
        tentativasLogin: 1,
        bloqueadoAte: 1
      }
    });
  }

  const updates = { $inc: { tentativasLogin: 1 } };
  
  // Bloquear após 5 tentativas por 2 horas
  if (this.tentativasLogin + 1 >= 5 && !this.estaBloqueado()) {
    updates.$set = {
      bloqueadoAte: Date.now() + 2 * 60 * 60 * 1000 // 2 horas
    };
  }

  return await this.updateOne(updates);
};

// Método para resetar tentativas de login
userSchema.methods.resetarTentativasLogin = async function() {
  return await this.updateOne({
    $unset: {
      tentativasLogin: 1,
      bloqueadoAte: 1
    },
    $set: {
      ultimoLogin: Date.now()
    }
  });
};

// Método para gerar token de reset de senha
userSchema.methods.gerarTokenResetSenha = function() {
  // Gerar token
  const resetToken = require('crypto').randomBytes(20).toString('hex');

  // Hash do token e definir no campo
  this.resetPasswordToken = require('crypto')
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Definir expiração para 10 minutos
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

// Virtual para nome completo (se necessário)
userSchema.virtual('nomeCompleto').get(function() {
  return this.nome;
});

// Método toJSON personalizado para remover campos sensíveis
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.senha;
  delete user.refreshTokens;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  delete user.tentativasLogin;
  delete user.bloqueadoAte;
  return user;
};

module.exports = mongoose.model('User', userSchema);

