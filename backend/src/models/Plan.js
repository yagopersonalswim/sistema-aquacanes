const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome do plano é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
  },
  tipo: {
    type: String,
    required: [true, 'Tipo do plano é obrigatório'],
    enum: {
      values: ['mensal', 'trimestral', 'semestral', 'anual', 'avulso', 'pacote'],
      message: 'Tipo de plano inválido'
    }
  },
  modalidade: {
    type: String,
    required: [true, 'Modalidade é obrigatória'],
    enum: {
      values: [
        'natacao_livre',
        'natacao_infantil',
        'natacao_adulto',
        'hidroginastica',
        'aqua_fitness',
        'natacao_terapeutica',
        'polo_aquatico',
        'sincronizado',
        'mergulho',
        'salvamento_aquatico',
        'todas'
      ],
      message: 'Modalidade inválida'
    }
  },
  valor: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0, 'Valor deve ser maior ou igual a zero']
  },
  valorPromocional: {
    type: Number,
    min: [0, 'Valor promocional deve ser maior ou igual a zero'],
    validate: {
      validator: function(value) {
        return !value || value < this.valor;
      },
      message: 'Valor promocional deve ser menor que o valor normal'
    }
  },
  duracao: {
    type: Number, // em meses
    required: [true, 'Duração é obrigatória'],
    min: [1, 'Duração deve ser pelo menos 1 mês']
  },
  aulasPorSemana: {
    type: Number,
    required: [true, 'Número de aulas por semana é obrigatório'],
    min: [1, 'Deve ter pelo menos 1 aula por semana'],
    max: [7, 'Máximo de 7 aulas por semana']
  },
  duracaoAula: {
    type: Number, // em minutos
    required: [true, 'Duração da aula é obrigatória'],
    min: [30, 'Aula deve ter pelo menos 30 minutos'],
    max: [120, 'Aula não pode ter mais de 120 minutos']
  },
  faixaEtaria: {
    min: {
      type: Number,
      required: [true, 'Idade mínima é obrigatória'],
      min: [0, 'Idade mínima deve ser maior ou igual a 0']
    },
    max: {
      type: Number,
      required: [true, 'Idade máxima é obrigatória'],
      min: [0, 'Idade máxima deve ser maior ou igual a 0'],
      validate: {
        validator: function(value) {
          return value >= this.faixaEtaria.min;
        },
        message: 'Idade máxima deve ser maior ou igual à idade mínima'
      }
    }
  },
  beneficios: [{
    descricao: {
      type: String,
      required: true,
      trim: true
    },
    icone: String // nome do ícone para exibição
  }],
  restricoes: [{
    tipo: {
      type: String,
      enum: ['horario', 'idade', 'nivel', 'equipamento', 'outro']
    },
    descricao: {
      type: String,
      required: true,
      trim: true
    }
  }],
  promocao: {
    ativa: {
      type: Boolean,
      default: false
    },
    dataInicio: Date,
    dataFim: Date,
    descricao: String,
    desconto: {
      tipo: {
        type: String,
        enum: ['percentual', 'valor_fixo']
      },
      valor: Number
    }
  },
  configuracoes: {
    permiteCongelamento: {
      type: Boolean,
      default: true
    },
    diasCongelamento: {
      type: Number,
      default: 30
    },
    permiteCancelamento: {
      type: Boolean,
      default: true
    },
    diasAviso: {
      type: Number,
      default: 30
    },
    multaRescisao: {
      type: Number,
      default: 0
    },
    carencia: {
      type: Number, // em dias
      default: 0
    }
  },
  limites: {
    maxAlunosPorTurma: {
      type: Number,
      default: 15
    },
    maxFaltas: {
      type: Number,
      default: 4 // por mês
    },
    reposicaoAulas: {
      type: Boolean,
      default: false
    }
  },
  categoria: {
    type: String,
    enum: ['basico', 'intermediario', 'premium', 'vip'],
    default: 'basico'
  },
  popularidade: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataLancamento: {
    type: Date,
    default: Date.now
  },
  dataDescontinuacao: Date,
  motivoDescontinuacao: String,
  estatisticas: {
    totalContratacoes: {
      type: Number,
      default: 0
    },
    contratacaoesAtivas: {
      type: Number,
      default: 0
    },
    receitaTotal: {
      type: Number,
      default: 0
    },
    ultimaAtualizacao: {
      type: Date,
      default: Date.now
    }
  },
  observacoes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Índices
planSchema.index({ tipo: 1 });
planSchema.index({ modalidade: 1 });
planSchema.index({ categoria: 1 });
planSchema.index({ ativo: 1 });
planSchema.index({ valor: 1 });
planSchema.index({ 'faixaEtaria.min': 1, 'faixaEtaria.max': 1 });

// Virtual para valor efetivo (considerando promoção)
planSchema.virtual('valorEfetivo').get(function() {
  if (this.promocao.ativa && this.valorPromocional) {
    const agora = new Date();
    if ((!this.promocao.dataInicio || agora >= this.promocao.dataInicio) &&
        (!this.promocao.dataFim || agora <= this.promocao.dataFim)) {
      return this.valorPromocional;
    }
  }
  return this.valor;
});

// Virtual para valor por aula
planSchema.virtual('valorPorAula').get(function() {
  const totalAulas = this.aulasPorSemana * 4 * this.duracao; // aproximadamente 4 semanas por mês
  return (this.valorEfetivo / totalAulas).toFixed(2);
});

// Virtual para desconto percentual
planSchema.virtual('descontoPercentual').get(function() {
  if (this.valorPromocional && this.valorPromocional < this.valor) {
    return (((this.valor - this.valorPromocional) / this.valor) * 100).toFixed(1);
  }
  return 0;
});

// Virtual para status da promoção
planSchema.virtual('statusPromocao').get(function() {
  if (!this.promocao.ativa) return 'inativa';
  
  const agora = new Date();
  
  if (this.promocao.dataInicio && agora < this.promocao.dataInicio) {
    return 'agendada';
  }
  
  if (this.promocao.dataFim && agora > this.promocao.dataFim) {
    return 'expirada';
  }
  
  return 'ativa';
});

// Virtual para total de horas por mês
planSchema.virtual('horasPorMes').get(function() {
  const aulasPorMes = this.aulasPorSemana * 4; // aproximadamente 4 semanas
  return (aulasPorMes * this.duracaoAula / 60).toFixed(1); // converter para horas
});

// Middleware para validar datas de promoção
planSchema.pre('save', function(next) {
  if (this.promocao.ativa) {
    if (this.promocao.dataInicio && this.promocao.dataFim) {
      if (this.promocao.dataFim <= this.promocao.dataInicio) {
        return next(new Error('Data fim da promoção deve ser posterior à data início'));
      }
    }
  }
  next();
});

// Método para ativar promoção
planSchema.methods.ativarPromocao = async function(promocao) {
  this.promocao = {
    ativa: true,
    ...promocao
  };
  return await this.save();
};

// Método para desativar promoção
planSchema.methods.desativarPromocao = async function() {
  this.promocao.ativa = false;
  return await this.save();
};

// Método para descontinuar plano
planSchema.methods.descontinuar = async function(motivo) {
  this.ativo = false;
  this.dataDescontinuacao = new Date();
  this.motivoDescontinuacao = motivo;
  return await this.save();
};

// Método para reativar plano
planSchema.methods.reativar = async function() {
  this.ativo = true;
  this.dataDescontinuacao = undefined;
  this.motivoDescontinuacao = undefined;
  return await this.save();
};

// Método para verificar elegibilidade por idade
planSchema.methods.verificarElegibilidadeIdade = function(idade) {
  return idade >= this.faixaEtaria.min && idade <= this.faixaEtaria.max;
};

// Método para calcular valor com desconto
planSchema.methods.calcularValorComDesconto = function(desconto) {
  const valorBase = this.valorEfetivo;
  
  if (desconto.tipo === 'percentual') {
    return valorBase * (1 - desconto.valor / 100);
  } else if (desconto.tipo === 'valor_fixo') {
    return Math.max(0, valorBase - desconto.valor);
  }
  
  return valorBase;
};

// Método para atualizar estatísticas
planSchema.methods.atualizarEstatisticas = async function(stats) {
  this.estatisticas = {
    ...this.estatisticas,
    ...stats,
    ultimaAtualizacao: new Date()
  };
  return await this.save();
};

// Método estático para buscar planos ativos
planSchema.statics.buscarAtivos = function() {
  return this.find({ ativo: true }).sort({ popularidade: -1, valor: 1 });
};

// Método estático para buscar por modalidade
planSchema.statics.buscarPorModalidade = function(modalidade) {
  return this.find({ 
    modalidade: { $in: [modalidade, 'todas'] },
    ativo: true 
  });
};

// Método estático para buscar por faixa de preço
planSchema.statics.buscarPorFaixaPreco = function(valorMin, valorMax) {
  return this.find({
    valor: { $gte: valorMin, $lte: valorMax },
    ativo: true
  });
};

// Método estático para buscar por idade
planSchema.statics.buscarPorIdade = function(idade) {
  return this.find({
    'faixaEtaria.min': { $lte: idade },
    'faixaEtaria.max': { $gte: idade },
    ativo: true
  });
};

// Método estático para planos em promoção
planSchema.statics.buscarPromocoes = function() {
  const agora = new Date();
  return this.find({
    'promocao.ativa': true,
    $or: [
      { 'promocao.dataInicio': { $exists: false } },
      { 'promocao.dataInicio': { $lte: agora } }
    ],
    $or: [
      { 'promocao.dataFim': { $exists: false } },
      { 'promocao.dataFim': { $gte: agora } }
    ],
    ativo: true
  });
};

// Método toJSON personalizado
planSchema.methods.toJSON = function() {
  const plan = this.toObject({ virtuals: true });
  return plan;
};

module.exports = mongoose.model('Plan', planSchema);

