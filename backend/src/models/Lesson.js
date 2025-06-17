const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  // Referências
  turma: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },

  // Data e horário
  data: {
    type: Date,
    required: true
  },
  horaInicio: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  horaFim: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  },
  duracao: {
    type: Number, // em minutos
    required: true
  },

  // Informações da aula
  titulo: {
    type: String,
    required: true
  },
  descricao: String,
  objetivos: [String],
  
  // Conteúdo programático
  conteudo: {
    aquecimento: String,
    partePrincipal: String,
    relaxamento: String,
    observacoes: String
  },

  // Status da aula
  status: {
    type: String,
    enum: ['agendada', 'em_andamento', 'concluida', 'cancelada', 'adiada'],
    default: 'agendada'
  },

  // Motivo do cancelamento/adiamento
  motivoCancelamento: {
    motivo: {
      type: String,
      enum: ['doenca_professor', 'feriado', 'manutencao', 'clima', 'outro']
    },
    descricao: String,
    novaData: Date // Para aulas adiadas
  },

  // Presença
  listaPresenca: [{
    aluno: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    status: {
      type: String,
      enum: ['presente', 'falta', 'falta_justificada', 'atestado'],
      default: 'falta'
    },
    horaChegada: String,
    observacoes: String
  }],

  // Estatísticas da aula
  estatisticas: {
    totalAlunos: {
      type: Number,
      default: 0
    },
    presentes: {
      type: Number,
      default: 0
    },
    ausentes: {
      type: Number,
      default: 0
    },
    percentualPresenca: {
      type: Number,
      default: 0
    }
  },

  // Avaliação da aula
  avaliacao: {
    qualidadeAula: {
      type: Number,
      min: 1,
      max: 5
    },
    participacaoAlunos: {
      type: Number,
      min: 1,
      max: 5
    },
    cumprimentoObjetivos: {
      type: Number,
      min: 1,
      max: 5
    },
    comentarios: String
  },

  // Recursos utilizados
  recursos: {
    equipamentos: [String],
    materiais: [String],
    local: String
  },

  // Dados de controle
  criadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  dataRegistro: {
    type: Date,
    default: Date.now
  },
  ultimaAtualizacao: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Índices para otimização
lessonSchema.index({ turma: 1, data: -1 });
lessonSchema.index({ professor: 1, data: -1 });
lessonSchema.index({ data: -1 });
lessonSchema.index({ status: 1 });

// Virtual para calcular duração automaticamente
lessonSchema.virtual('duracaoCalculada').get(function() {
  if (this.horaInicio && this.horaFim) {
    const [horaIni, minIni] = this.horaInicio.split(':').map(Number);
    const [horaFim, minFim] = this.horaFim.split(':').map(Number);
    
    const inicioMinutos = horaIni * 60 + minIni;
    const fimMinutos = horaFim * 60 + minFim;
    
    return fimMinutos - inicioMinutos;
  }
  return 0;
});

// Métodos de instância
lessonSchema.methods.marcarPresenca = function(alunoId, status, observacoes = '') {
  const presencaExistente = this.listaPresenca.find(
    p => p.aluno.toString() === alunoId.toString()
  );

  if (presencaExistente) {
    presencaExistente.status = status;
    presencaExistente.observacoes = observacoes;
    if (status === 'presente') {
      presencaExistente.horaChegada = new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } else {
    this.listaPresenca.push({
      aluno: alunoId,
      status,
      observacoes,
      horaChegada: status === 'presente' ? new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      }) : null
    });
  }

  this.calcularEstatisticas();
};

lessonSchema.methods.calcularEstatisticas = function() {
  const total = this.listaPresenca.length;
  const presentes = this.listaPresenca.filter(p => p.status === 'presente').length;
  const ausentes = total - presentes;

  this.estatisticas = {
    totalAlunos: total,
    presentes,
    ausentes,
    percentualPresenca: total > 0 ? Math.round((presentes / total) * 100) : 0
  };
};

lessonSchema.methods.iniciarAula = function() {
  this.status = 'em_andamento';
  this.ultimaAtualizacao = new Date();
};

lessonSchema.methods.finalizarAula = function() {
  this.status = 'concluida';
  this.calcularEstatisticas();
  this.ultimaAtualizacao = new Date();
};

lessonSchema.methods.cancelarAula = function(motivo, descricao, novaData = null) {
  this.status = novaData ? 'adiada' : 'cancelada';
  this.motivoCancelamento = {
    motivo,
    descricao,
    novaData
  };
  this.ultimaAtualizacao = new Date();
};

// Métodos estáticos
lessonSchema.statics.getAulasPorPeriodo = async function(dataInicio, dataFim, filtros = {}) {
  const match = {
    data: {
      $gte: new Date(dataInicio),
      $lte: new Date(dataFim)
    },
    ...filtros
  };

  return await this.find(match)
    .populate('turma', 'nome')
    .populate('professor', 'nome')
    .sort({ data: 1, horaInicio: 1 });
};

lessonSchema.statics.getEstatisticasPorProfessor = async function(professorId, dataInicio, dataFim) {
  const pipeline = [
    {
      $match: {
        professor: mongoose.Types.ObjectId(professorId),
        data: {
          $gte: new Date(dataInicio),
          $lte: new Date(dataFim)
        }
      }
    },
    {
      $group: {
        _id: null,
        totalAulas: { $sum: 1 },
        aulasRealizadas: {
          $sum: {
            $cond: [{ $eq: ['$status', 'concluida'] }, 1, 0]
          }
        },
        aulasCanceladas: {
          $sum: {
            $cond: [{ $eq: ['$status', 'cancelada'] }, 1, 0]
          }
        },
        mediaPresenca: { $avg: '$estatisticas.percentualPresenca' }
      }
    }
  ];

  const resultado = await this.aggregate(pipeline);
  return resultado[0] || {
    totalAulas: 0,
    aulasRealizadas: 0,
    aulasCanceladas: 0,
    mediaPresenca: 0
  };
};

// Middleware para atualizar timestamp
lessonSchema.pre('save', function(next) {
  this.ultimaAtualizacao = new Date();
  
  // Calcular duração se não foi definida
  if (!this.duracao && this.horaInicio && this.horaFim) {
    this.duracao = this.duracaoCalculada;
  }
  
  next();
});

// Middleware para popular automaticamente
lessonSchema.pre(/^find/, function(next) {
  this.populate('turma', 'nome capacidadeMaxima')
      .populate('professor', 'nome email')
      .populate('listaPresenca.aluno', 'nome');
  next();
});

module.exports = mongoose.model('Lesson', lessonSchema);

