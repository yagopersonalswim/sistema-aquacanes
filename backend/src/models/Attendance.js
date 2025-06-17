const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  // Referências
  aluno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  turma: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  aula: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
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
    required: true
  },
  horaFim: {
    type: String,
    required: true
  },

  // Status da presença
  status: {
    type: String,
    enum: ['presente', 'falta', 'falta_justificada', 'atestado'],
    required: true
  },

  // Justificativa (opcional)
  justificativa: {
    motivo: {
      type: String,
      enum: ['doenca', 'viagem', 'compromisso_familiar', 'outro']
    },
    descricao: String,
    anexo: String, // URL do arquivo anexado
    dataJustificativa: Date
  },

  // Observações do professor
  observacoes: {
    comportamento: {
      type: String,
      enum: ['excelente', 'bom', 'regular', 'precisa_melhorar']
    },
    participacao: {
      type: String,
      enum: ['ativa', 'moderada', 'passiva', 'resistente']
    },
    evolucao: {
      type: String,
      enum: ['muito_boa', 'boa', 'regular', 'lenta']
    },
    comentarios: String
  },

  // Dados de controle
  registradoPor: {
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
attendanceSchema.index({ aluno: 1, data: -1 });
attendanceSchema.index({ turma: 1, data: -1 });
attendanceSchema.index({ aula: 1 });
attendanceSchema.index({ data: -1 });
attendanceSchema.index({ status: 1 });

// Índice composto para evitar duplicatas
attendanceSchema.index({ aluno: 1, aula: 1 }, { unique: true });

// Virtual para calcular frequência
attendanceSchema.virtual('frequencia').get(function() {
  return this.status === 'presente' ? 1 : 0;
});

// Métodos estáticos
attendanceSchema.statics.getFrequenciaPorAluno = async function(alunoId, dataInicio, dataFim) {
  const pipeline = [
    {
      $match: {
        aluno: mongoose.Types.ObjectId(alunoId),
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
        presencas: {
          $sum: {
            $cond: [{ $eq: ['$status', 'presente'] }, 1, 0]
          }
        },
        faltas: {
          $sum: {
            $cond: [{ $eq: ['$status', 'falta'] }, 1, 0]
          }
        },
        faltasJustificadas: {
          $sum: {
            $cond: [{ $eq: ['$status', 'falta_justificada'] }, 1, 0]
          }
        }
      }
    },
    {
      $project: {
        totalAulas: 1,
        presencas: 1,
        faltas: 1,
        faltasJustificadas: 1,
        percentualFrequencia: {
          $multiply: [
            { $divide: ['$presencas', '$totalAulas'] },
            100
          ]
        }
      }
    }
  ];

  const resultado = await this.aggregate(pipeline);
  return resultado[0] || {
    totalAulas: 0,
    presencas: 0,
    faltas: 0,
    faltasJustificadas: 0,
    percentualFrequencia: 0
  };
};

attendanceSchema.statics.getFrequenciaPorTurma = async function(turmaId, dataInicio, dataFim) {
  const pipeline = [
    {
      $match: {
        turma: mongoose.Types.ObjectId(turmaId),
        data: {
          $gte: new Date(dataInicio),
          $lte: new Date(dataFim)
        }
      }
    },
    {
      $group: {
        _id: '$aluno',
        totalAulas: { $sum: 1 },
        presencas: {
          $sum: {
            $cond: [{ $eq: ['$status', 'presente'] }, 1, 0]
          }
        }
      }
    },
    {
      $lookup: {
        from: 'students',
        localField: '_id',
        foreignField: '_id',
        as: 'aluno'
      }
    },
    {
      $unwind: '$aluno'
    },
    {
      $project: {
        nome: '$aluno.nome',
        totalAulas: 1,
        presencas: 1,
        percentualFrequencia: {
          $multiply: [
            { $divide: ['$presencas', '$totalAulas'] },
            100
          ]
        }
      }
    },
    {
      $sort: { percentualFrequencia: -1 }
    }
  ];

  return await this.aggregate(pipeline);
};

// Middleware para atualizar timestamp
attendanceSchema.pre('save', function(next) {
  this.ultimaAtualizacao = new Date();
  next();
});

// Validação customizada
attendanceSchema.pre('save', async function(next) {
  // Verificar se a aula existe e pertence à turma
  const Lesson = mongoose.model('Lesson');
  const aula = await Lesson.findById(this.aula);
  
  if (!aula) {
    return next(new Error('Aula não encontrada'));
  }
  
  if (aula.turma.toString() !== this.turma.toString()) {
    return next(new Error('Aula não pertence à turma especificada'));
  }
  
  // Verificar se o aluno está matriculado na turma
  const Class = mongoose.model('Class');
  const turma = await Class.findById(this.turma);
  
  if (!turma.alunosMatriculados.includes(this.aluno)) {
    return next(new Error('Aluno não está matriculado nesta turma'));
  }
  
  next();
});

module.exports = mongoose.model('Attendance', attendanceSchema);

