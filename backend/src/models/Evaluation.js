const mongoose = require('mongoose');

const evaluationSchema = new mongoose.Schema({
  // Referências
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  turma: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },

  // Informações da avaliação
  titulo: {
    type: String,
    required: true
  },
  descricao: String,
  data: {
    type: Date,
    required: true,
    default: Date.now
  },
  periodo: {
    type: String,
    enum: ['mensal', 'bimestral', 'trimestral', 'semestral', 'anual'],
    required: true
  },

  // Habilidades técnicas de natação
  habilidadesTecnicas: {
    respiracao: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    flutuacao: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    propulsao: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    coordenacao: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    resistencia: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    }
  },

  // Estilos de natação
  estilos: {
    crawl: {
      nivel: {
        type: String,
        enum: ['nao_sabe', 'iniciante', 'basico', 'intermediario', 'avancado'],
        default: 'nao_sabe'
      },
      nota: {
        type: Number,
        min: 0,
        max: 10
      },
      observacoes: String
    },
    costas: {
      nivel: {
        type: String,
        enum: ['nao_sabe', 'iniciante', 'basico', 'intermediario', 'avancado'],
        default: 'nao_sabe'
      },
      nota: {
        type: Number,
        min: 0,
        max: 10
      },
      observacoes: String
    },
    peito: {
      nivel: {
        type: String,
        enum: ['nao_sabe', 'iniciante', 'basico', 'intermediario', 'avancado'],
        default: 'nao_sabe'
      },
      nota: {
        type: Number,
        min: 0,
        max: 10
      },
      observacoes: String
    },
    borboleta: {
      nivel: {
        type: String,
        enum: ['nao_sabe', 'iniciante', 'basico', 'intermediario', 'avancado'],
        default: 'nao_sabe'
      },
      nota: {
        type: Number,
        min: 0,
        max: 10
      },
      observacoes: String
    }
  },

  // Aspectos comportamentais
  comportamento: {
    disciplina: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    participacao: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    relacionamento: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    },
    dedicacao: {
      nota: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      observacoes: String
    }
  },

  // Objetivos e metas
  objetivos: {
    alcancados: [String],
    emAndamento: [String],
    proximos: [String]
  },

  // Recomendações
  recomendacoes: {
    pontosFortesDesenvolvidos: [String],
    areasParaMelhoria: [String],
    sugestoesPais: [String],
    proximosPassos: [String]
  },

  // Notas e médias
  notas: {
    tecnica: {
      type: Number,
      min: 0,
      max: 10
    },
    comportamento: {
      type: Number,
      min: 0,
      max: 10
    },
    geral: {
      type: Number,
      min: 0,
      max: 10
    }
  },

  // Status da avaliação
  status: {
    type: String,
    enum: ['rascunho', 'finalizada', 'enviada_responsavel'],
    default: 'rascunho'
  },

  // Anexos
  anexos: [{
    nome: String,
    url: String,
    tipo: {
      type: String,
      enum: ['foto', 'video', 'documento']
    },
    dataUpload: {
      type: Date,
      default: Date.now
    }
  }],

  // Dados de controle
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataEnvio: Date,
  visualizadoPeloResponsavel: {
    type: Boolean,
    default: false
  },
  dataVisualizacao: Date
}, {
  timestamps: true
});

// Índices para otimização
evaluationSchema.index({ aluno: 1, data: -1 });
evaluationSchema.index({ professor: 1, data: -1 });
evaluationSchema.index({ turma: 1, data: -1 });
evaluationSchema.index({ periodo: 1, data: -1 });
evaluationSchema.index({ status: 1 });

// Virtual para calcular média técnica
evaluationSchema.virtual('mediaTecnica').get(function() {
  const habilidades = this.habilidadesTecnicas;
  const notas = [
    habilidades.respiracao.nota,
    habilidades.flutuacao.nota,
    habilidades.propulsao.nota,
    habilidades.coordenacao.nota,
    habilidades.resistencia.nota
  ].filter(nota => nota !== undefined);
  
  return notas.length > 0 ? 
    Math.round((notas.reduce((sum, nota) => sum + nota, 0) / notas.length) * 100) / 100 : 0;
});

// Virtual para calcular média comportamental
evaluationSchema.virtual('mediaComportamento').get(function() {
  const comportamento = this.comportamento;
  const notas = [
    comportamento.disciplina.nota,
    comportamento.participacao.nota,
    comportamento.relacionamento.nota,
    comportamento.dedicacao.nota
  ].filter(nota => nota !== undefined);
  
  return notas.length > 0 ? 
    Math.round((notas.reduce((sum, nota) => sum + nota, 0) / notas.length) * 100) / 100 : 0;
});

// Virtual para calcular média geral
evaluationSchema.virtual('mediaGeral').get(function() {
  const mediaTecnica = this.mediaTecnica;
  const mediaComportamento = this.mediaComportamento;
  
  return Math.round(((mediaTecnica + mediaComportamento) / 2) * 100) / 100;
});

// Virtual para determinar conceito
evaluationSchema.virtual('conceito').get(function() {
  const media = this.mediaGeral;
  
  if (media >= 9) return 'Excelente';
  if (media >= 8) return 'Muito Bom';
  if (media >= 7) return 'Bom';
  if (media >= 6) return 'Regular';
  if (media >= 5) return 'Insuficiente';
  return 'Inadequado';
});

// Métodos de instância
evaluationSchema.methods.calcularNotas = function() {
  this.notas.tecnica = this.mediaTecnica;
  this.notas.comportamento = this.mediaComportamento;
  this.notas.geral = this.mediaGeral;
};

evaluationSchema.methods.finalizar = function() {
  this.calcularNotas();
  this.status = 'finalizada';
};

evaluationSchema.methods.enviarParaResponsavel = function() {
  this.finalizar();
  this.status = 'enviada_responsavel';
  this.dataEnvio = new Date();
};

evaluationSchema.methods.marcarComoVisualizada = function() {
  this.visualizadoPeloResponsavel = true;
  this.dataVisualizacao = new Date();
};

// Métodos estáticos
evaluationSchema.statics.getEvolucaoAluno = async function(alunoId, limite = 5) {
  return await this.find({ aluno: alunoId })
    .sort({ data: -1 })
    .limit(limite)
    .populate('professor', 'nome')
    .populate('turma', 'nome');
};

evaluationSchema.statics.getEstatisticasPorTurma = async function(turmaId, periodo) {
  const pipeline = [
    {
      $match: {
        turma: mongoose.Types.ObjectId(turmaId),
        periodo: periodo,
        status: { $ne: 'rascunho' }
      }
    },
    {
      $group: {
        _id: null,
        totalAvaliacoes: { $sum: 1 },
        mediaTecnicaGeral: { $avg: '$notas.tecnica' },
        mediaComportamentoGeral: { $avg: '$notas.comportamento' },
        mediaGeralTurma: { $avg: '$notas.geral' }
      }
    }
  ];

  const resultado = await this.aggregate(pipeline);
  return resultado[0] || {
    totalAvaliacoes: 0,
    mediaTecnicaGeral: 0,
    mediaComportamentoGeral: 0,
    mediaGeralTurma: 0
  };
};

// Middleware para calcular notas antes de salvar
evaluationSchema.pre('save', function(next) {
  if (this.isModified('habilidadesTecnicas') || this.isModified('comportamento')) {
    this.calcularNotas();
  }
  next();
});

// Middleware para popular automaticamente
evaluationSchema.pre(/^find/, function(next) {
  this.populate('aluno', 'nome dataNascimento')
      .populate('professor', 'nome')
      .populate('turma', 'nome');
  next();
});

module.exports = mongoose.model('Evaluation', evaluationSchema);

