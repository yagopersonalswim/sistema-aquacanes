const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  // Referências
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  responsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plano: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },

  // Informações do contrato
  numeroContrato: {
    type: String,
    required: true,
    unique: true
  },
  tipoContrato: {
    type: String,
    enum: ['matricula', 'renovacao', 'transferencia'],
    required: true
  },
  dataInicio: {
    type: Date,
    required: true
  },
  dataFim: Date,
  vigencia: {
    tipo: {
      type: String,
      enum: ['mensal', 'trimestral', 'semestral', 'anual', 'indeterminado'],
      required: true
    },
    meses: Number
  },

  // Dados do contratante (responsável)
  contratante: {
    nome: {
      type: String,
      required: true
    },
    cpf: {
      type: String,
      required: true
    },
    rg: String,
    endereco: {
      logradouro: String,
      numero: String,
      complemento: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String
    },
    telefone: String,
    email: String,
    profissao: String,
    estadoCivil: String
  },

  // Dados do contratado (escola)
  contratado: {
    razaoSocial: {
      type: String,
      default: 'AquaVida Escola de Natação'
    },
    cnpj: {
      type: String,
      default: '00.000.000/0001-00'
    },
    endereco: {
      logradouro: String,
      numero: String,
      bairro: String,
      cidade: String,
      estado: String,
      cep: String
    },
    telefone: String,
    email: String,
    responsavelLegal: String
  },

  // Cláusulas e condições
  clausulas: {
    objetoContrato: {
      type: String,
      default: 'Prestação de serviços de ensino de natação'
    },
    valorMensalidade: {
      type: Number,
      required: true
    },
    diaVencimento: {
      type: Number,
      required: true,
      min: 1,
      max: 31
    },
    formaPagamento: {
      type: String,
      enum: ['boleto', 'cartao', 'pix', 'dinheiro'],
      required: true
    },
    multa: {
      percentual: {
        type: Number,
        default: 2
      },
      descricao: String
    },
    juros: {
      percentual: {
        type: Number,
        default: 1
      },
      descricao: String
    },
    reajuste: {
      indice: {
        type: String,
        default: 'IPCA'
      },
      periodicidade: {
        type: String,
        default: 'anual'
      }
    },
    cancelamento: {
      prazoAviso: {
        type: Number,
        default: 30
      },
      condicoes: String
    },
    foro: {
      cidade: String,
      estado: String
    }
  },

  // Termos específicos
  termosEspecificos: {
    restricoesMedicas: String,
    autorizacaoImagem: {
      type: Boolean,
      default: false
    },
    responsabilidadeCivil: String,
    normasInternas: String,
    politicaPrivacidade: {
      type: Boolean,
      default: false
    }
  },

  // Assinatura eletrônica
  assinatura: {
    responsavel: {
      assinado: {
        type: Boolean,
        default: false
      },
      dataAssinatura: Date,
      ipAssinatura: String,
      hashAssinatura: String,
      assinaturaDigital: String, // Base64 da assinatura
      certificadoDigital: String,
      localizacao: {
        latitude: Number,
        longitude: Number,
        endereco: String
      }
    },
    escola: {
      assinado: {
        type: Boolean,
        default: false
      },
      dataAssinatura: Date,
      assinadoPor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      cargoAssinante: String,
      assinaturaDigital: String
    },
    testemunhas: [{
      nome: String,
      cpf: String,
      assinatura: String,
      dataAssinatura: Date
    }]
  },

  // Status do contrato
  status: {
    type: String,
    enum: [
      'rascunho',
      'aguardando_assinatura',
      'assinado',
      'ativo',
      'suspenso',
      'cancelado',
      'vencido'
    ],
    default: 'rascunho'
  },

  // Histórico e controle
  historico: [{
    data: {
      type: Date,
      default: Date.now
    },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    acao: String,
    statusAnterior: String,
    statusNovo: String,
    observacoes: String,
    ip: String
  }],

  // Anexos e documentos
  anexos: [{
    nome: String,
    tipo: {
      type: String,
      enum: ['documento', 'comprovante', 'laudo_medico', 'autorizacao']
    },
    url: String,
    dataUpload: {
      type: Date,
      default: Date.now
    },
    uploadPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Dados de controle
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataGeracao: {
    type: Date,
    default: Date.now
  },
  versaoTemplate: {
    type: String,
    default: '1.0'
  },
  hashContrato: String, // Hash do conteúdo para verificação de integridade
  
  // Renovação automática
  renovacaoAutomatica: {
    ativa: {
      type: Boolean,
      default: false
    },
    condicoes: String,
    dataProximaRenovacao: Date
  }
}, {
  timestamps: true
});

// Índices para otimização
contractSchema.index({ numeroContrato: 1 });
contractSchema.index({ aluno: 1, status: 1 });
contractSchema.index({ responsavel: 1 });
contractSchema.index({ dataInicio: 1, dataFim: 1 });
contractSchema.index({ status: 1 });
contractSchema.index({ 'assinatura.responsavel.assinado': 1 });

// Virtual para verificar se está vencido
contractSchema.virtual('vencido').get(function() {
  if (!this.dataFim) return false;
  return new Date() > this.dataFim;
});

// Virtual para verificar se está próximo do vencimento
contractSchema.virtual('proximoVencimento').get(function() {
  if (!this.dataFim) return false;
  const hoje = new Date();
  const diasParaVencimento = Math.ceil((this.dataFim - hoje) / (1000 * 60 * 60 * 24));
  return diasParaVencimento <= 30 && diasParaVencimento > 0;
});

// Virtual para status de assinatura
contractSchema.virtual('statusAssinatura').get(function() {
  const respAssinado = this.assinatura.responsavel.assinado;
  const escolaAssinado = this.assinatura.escola.assinado;
  
  if (respAssinado && escolaAssinado) return 'completo';
  if (respAssinado && !escolaAssinado) return 'parcial_responsavel';
  if (!respAssinado && escolaAssinado) return 'parcial_escola';
  return 'pendente';
});

// Métodos de instância
contractSchema.methods.gerarNumeroContrato = function() {
  const ano = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  this.numeroContrato = `CT${ano}${timestamp}`;
};

contractSchema.methods.assinarResponsavel = function(dadosAssinatura) {
  this.assinatura.responsavel = {
    assinado: true,
    dataAssinatura: new Date(),
    ipAssinatura: dadosAssinatura.ip,
    assinaturaDigital: dadosAssinatura.assinatura,
    localizacao: dadosAssinatura.localizacao
  };
  
  this.historico.push({
    acao: 'assinatura_responsavel',
    statusAnterior: this.status,
    statusNovo: this.statusAssinatura === 'completo' ? 'assinado' : 'aguardando_assinatura',
    observacoes: 'Contrato assinado pelo responsável',
    ip: dadosAssinatura.ip
  });
  
  if (this.statusAssinatura === 'completo') {
    this.status = 'assinado';
  } else {
    this.status = 'aguardando_assinatura';
  }
};

contractSchema.methods.assinarEscola = function(usuarioId, cargo, assinatura) {
  this.assinatura.escola = {
    assinado: true,
    dataAssinatura: new Date(),
    assinadoPor: usuarioId,
    cargoAssinante: cargo,
    assinaturaDigital: assinatura
  };
  
  this.historico.push({
    data: new Date(),
    usuario: usuarioId,
    acao: 'assinatura_escola',
    statusAnterior: this.status,
    statusNovo: this.statusAssinatura === 'completo' ? 'assinado' : 'aguardando_assinatura',
    observacoes: 'Contrato assinado pela escola'
  });
  
  if (this.statusAssinatura === 'completo') {
    this.status = 'assinado';
  }
};

contractSchema.methods.ativar = function() {
  if (this.status === 'assinado') {
    this.status = 'ativo';
    this.historico.push({
      acao: 'ativacao',
      statusAnterior: 'assinado',
      statusNovo: 'ativo',
      observacoes: 'Contrato ativado'
    });
  }
};

contractSchema.methods.cancelar = function(motivo, usuarioId) {
  this.status = 'cancelado';
  this.historico.push({
    data: new Date(),
    usuario: usuarioId,
    acao: 'cancelamento',
    statusAnterior: this.status,
    statusNovo: 'cancelado',
    observacoes: motivo
  });
};

contractSchema.methods.calcularDataFim = function() {
  if (this.vigencia.tipo === 'indeterminado') {
    this.dataFim = null;
    return;
  }
  
  const meses = {
    mensal: 1,
    trimestral: 3,
    semestral: 6,
    anual: 12
  };
  
  const mesesVigencia = this.vigencia.meses || meses[this.vigencia.tipo];
  this.dataFim = new Date(this.dataInicio);
  this.dataFim.setMonth(this.dataFim.getMonth() + mesesVigencia);
};

// Métodos estáticos
contractSchema.statics.getContratosVencendo = async function(dias = 30) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() + dias);
  
  return await this.find({
    status: 'ativo',
    dataFim: {
      $lte: dataLimite,
      $gte: new Date()
    }
  }).populate('aluno responsavel');
};

contractSchema.statics.getEstatisticas = async function() {
  const pipeline = [
    {
      $group: {
        _id: '$status',
        total: { $sum: 1 }
      }
    }
  ];
  
  const resultado = await this.aggregate(pipeline);
  const stats = {};
  
  resultado.forEach(item => {
    stats[item._id] = item.total;
  });
  
  return {
    total: Object.values(stats).reduce((sum, val) => sum + val, 0),
    ...stats
  };
};

// Middleware para gerar número do contrato
contractSchema.pre('save', function(next) {
  if (this.isNew && !this.numeroContrato) {
    this.gerarNumeroContrato();
  }
  
  // Calcular data fim se não definida
  if (this.isModified('dataInicio') || this.isModified('vigencia')) {
    this.calcularDataFim();
  }
  
  // Atualizar status baseado no vencimento
  if (this.vencido && this.status === 'ativo') {
    this.status = 'vencido';
  }
  
  next();
});

// Middleware para popular automaticamente
contractSchema.pre(/^find/, function(next) {
  this.populate('aluno', 'nome dataNascimento')
      .populate('responsavel', 'nome email telefone')
      .populate('plano', 'nome valor');
  next();
});

module.exports = mongoose.model('Contract', contractSchema);

