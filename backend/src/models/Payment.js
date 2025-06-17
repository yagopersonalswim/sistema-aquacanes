const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Referências
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  plano: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  responsavel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Informações do pagamento
  descricao: {
    type: String,
    required: true
  },
  valor: {
    type: Number,
    required: true,
    min: 0
  },
  valorOriginal: {
    type: Number,
    required: true,
    min: 0
  },
  desconto: {
    valor: {
      type: Number,
      default: 0,
      min: 0
    },
    percentual: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    motivo: String
  },
  multa: {
    valor: {
      type: Number,
      default: 0,
      min: 0
    },
    percentual: {
      type: Number,
      default: 0,
      min: 0
    },
    motivo: String
  },
  juros: {
    valor: {
      type: Number,
      default: 0,
      min: 0
    },
    percentual: {
      type: Number,
      default: 0,
      min: 0
    },
    diasAtraso: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Datas
  dataVencimento: {
    type: Date,
    required: true
  },
  dataPagamento: Date,
  dataProcessamento: Date,
  competencia: {
    mes: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    ano: {
      type: Number,
      required: true,
      min: 2020
    }
  },

  // Status do pagamento
  status: {
    type: String,
    enum: [
      'pendente',
      'processando',
      'pago',
      'vencido',
      'cancelado',
      'estornado',
      'em_analise'
    ],
    default: 'pendente'
  },

  // Método de pagamento
  metodoPagamento: {
    tipo: {
      type: String,
      enum: ['boleto', 'cartao_credito', 'cartao_debito', 'pix', 'dinheiro', 'transferencia'],
      required: true
    },
    detalhes: {
      // Para cartão
      bandeira: String,
      ultimosDigitos: String,
      parcelas: Number,
      
      // Para boleto
      codigoBarras: String,
      linhaDigitavel: String,
      nossoNumero: String,
      
      // Para PIX
      chavePixUtilizada: String,
      qrCode: String,
      
      // Para transferência
      banco: String,
      agencia: String,
      conta: String
    }
  },

  // Informações de cobrança
  cobranca: {
    numeroFatura: String,
    numeroRecibo: String,
    observacoes: String,
    emailEnviado: {
      type: Boolean,
      default: false
    },
    dataEnvioEmail: Date,
    tentativasCobranca: {
      type: Number,
      default: 0
    },
    ultimaTentativaCobranca: Date
  },

  // Integração com gateway de pagamento
  gateway: {
    provedor: {
      type: String,
      enum: ['mercadopago', 'pagseguro', 'stripe', 'manual']
    },
    transacaoId: String,
    statusGateway: String,
    dadosResposta: mongoose.Schema.Types.Mixed,
    webhookRecebido: {
      type: Boolean,
      default: false
    },
    dataWebhook: Date
  },

  // Dados fiscais
  fiscal: {
    notaFiscalEmitida: {
      type: Boolean,
      default: false
    },
    numeroNotaFiscal: String,
    dataEmissaoNF: Date,
    chaveAcessoNF: String
  },

  // Histórico de alterações
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
    observacoes: String
  }],

  // Dados de controle
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  processadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Índices para otimização
paymentSchema.index({ aluno: 1, dataVencimento: -1 });
paymentSchema.index({ status: 1, dataVencimento: 1 });
paymentSchema.index({ 'competencia.ano': 1, 'competencia.mes': 1 });
paymentSchema.index({ 'gateway.transacaoId': 1 });
paymentSchema.index({ 'cobranca.numeroFatura': 1 });
paymentSchema.index({ dataVencimento: 1 });

// Virtual para verificar se está em atraso
paymentSchema.virtual('emAtraso').get(function() {
  if (this.status === 'pago' || this.status === 'cancelado') {
    return false;
  }
  return new Date() > this.dataVencimento;
});

// Virtual para calcular dias de atraso
paymentSchema.virtual('diasAtraso').get(function() {
  if (!this.emAtraso) return 0;
  
  const hoje = new Date();
  const vencimento = new Date(this.dataVencimento);
  const diffTime = hoje - vencimento;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual para valor total com juros e multa
paymentSchema.virtual('valorTotal').get(function() {
  let total = this.valorOriginal;
  
  // Aplicar desconto
  if (this.desconto.valor > 0) {
    total -= this.desconto.valor;
  } else if (this.desconto.percentual > 0) {
    total -= (total * this.desconto.percentual / 100);
  }
  
  // Aplicar multa
  if (this.multa.valor > 0) {
    total += this.multa.valor;
  } else if (this.multa.percentual > 0) {
    total += (this.valorOriginal * this.multa.percentual / 100);
  }
  
  // Aplicar juros
  if (this.juros.valor > 0) {
    total += this.juros.valor;
  } else if (this.juros.percentual > 0 && this.juros.diasAtraso > 0) {
    const jurosDiario = this.valorOriginal * (this.juros.percentual / 100) / 30;
    total += jurosDiario * this.juros.diasAtraso;
  }
  
  return Math.round(total * 100) / 100; // Arredondar para 2 casas decimais
});

// Métodos de instância
paymentSchema.methods.marcarComoPago = function(metodoPagamento, dadosGateway = {}) {
  this.status = 'pago';
  this.dataPagamento = new Date();
  this.dataProcessamento = new Date();
  this.metodoPagamento = metodoPagamento;
  
  if (dadosGateway.provedor) {
    this.gateway = dadosGateway;
  }
  
  this.historico.push({
    acao: 'pagamento_confirmado',
    statusAnterior: this.status,
    statusNovo: 'pago',
    observacoes: `Pagamento confirmado via ${metodoPagamento.tipo}`
  });
};

paymentSchema.methods.cancelar = function(motivo, usuarioId) {
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

paymentSchema.methods.aplicarDesconto = function(valor, percentual, motivo) {
  this.desconto = {
    valor: valor || 0,
    percentual: percentual || 0,
    motivo
  };
  this.valor = this.valorTotal;
};

paymentSchema.methods.aplicarMulta = function(valor, percentual, motivo) {
  this.multa = {
    valor: valor || 0,
    percentual: percentual || 0,
    motivo
  };
  this.valor = this.valorTotal;
};

paymentSchema.methods.calcularJuros = function() {
  if (this.emAtraso && this.status !== 'pago') {
    const diasAtraso = this.diasAtraso;
    this.juros.diasAtraso = diasAtraso;
    
    // Aplicar juros de 1% ao mês (0.033% ao dia)
    if (diasAtraso > 0) {
      this.juros.percentual = 1; // 1% ao mês
      this.valor = this.valorTotal;
    }
  }
};

// Métodos estáticos
paymentSchema.statics.getReceitaMensal = async function(ano, mes) {
  const pipeline = [
    {
      $match: {
        'competencia.ano': ano,
        'competencia.mes': mes,
        status: 'pago'
      }
    },
    {
      $group: {
        _id: null,
        totalReceita: { $sum: '$valor' },
        totalPagamentos: { $sum: 1 },
        receitaPorMetodo: {
          $push: {
            metodo: '$metodoPagamento.tipo',
            valor: '$valor'
          }
        }
      }
    }
  ];

  const resultado = await this.aggregate(pipeline);
  return resultado[0] || {
    totalReceita: 0,
    totalPagamentos: 0,
    receitaPorMetodo: []
  };
};

paymentSchema.statics.getInadimplencia = async function() {
  const hoje = new Date();
  
  const pipeline = [
    {
      $match: {
        status: { $in: ['pendente', 'vencido'] },
        dataVencimento: { $lt: hoje }
      }
    },
    {
      $group: {
        _id: null,
        totalInadimplencia: { $sum: '$valor' },
        totalPagamentosVencidos: { $sum: 1 }
      }
    }
  ];

  const resultado = await this.aggregate(pipeline);
  return resultado[0] || {
    totalInadimplencia: 0,
    totalPagamentosVencidos: 0
  };
};

// Middleware para atualizar status automaticamente
paymentSchema.pre('save', function(next) {
  // Atualizar status para vencido se necessário
  if (this.status === 'pendente' && this.emAtraso) {
    this.status = 'vencido';
  }
  
  // Calcular juros se em atraso
  if (this.emAtraso && this.status !== 'pago') {
    this.calcularJuros();
  }
  
  // Atualizar valor final
  this.valor = this.valorTotal;
  
  next();
});

// Middleware para popular automaticamente
paymentSchema.pre(/^find/, function(next) {
  this.populate('aluno', 'nome email telefone')
      .populate('plano', 'nome valor')
      .populate('responsavel', 'nome email');
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);

