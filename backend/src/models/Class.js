const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome da turma é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  descricao: {
    type: String,
    trim: true,
    maxlength: [500, 'Descrição não pode ter mais de 500 caracteres']
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
  nivel: {
    type: String,
    required: [true, 'Nível da turma é obrigatório'],
    enum: {
      values: ['iniciante', 'basico', 'intermediario', 'avancado', 'competitivo'],
      message: 'Nível inválido'
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
        'salvamento_aquatico'
      ],
      message: 'Modalidade inválida'
    }
  },
  horarios: [{
    diaSemana: {
      type: Number,
      required: [true, 'Dia da semana é obrigatório'],
      min: [0, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)'],
      max: [6, 'Dia da semana deve ser entre 0 (domingo) e 6 (sábado)']
    },
    horaInicio: {
      type: String,
      required: [true, 'Hora de início é obrigatória'],
      validate: {
        validator: function(value) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: 'Hora de início deve estar no formato HH:MM'
      }
    },
    horaFim: {
      type: String,
      required: [true, 'Hora de fim é obrigatória'],
      validate: {
        validator: function(value) {
          return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value);
        },
        message: 'Hora de fim deve estar no formato HH:MM'
      }
    },
    duracao: {
      type: Number, // em minutos
      default: function() {
        if (this.horaInicio && this.horaFim) {
          const [inicioH, inicioM] = this.horaInicio.split(':').map(Number);
          const [fimH, fimM] = this.horaFim.split(':').map(Number);
          const inicioMinutos = inicioH * 60 + inicioM;
          const fimMinutos = fimH * 60 + fimM;
          return fimMinutos - inicioMinutos;
        }
        return 60; // padrão 1 hora
      }
    }
  }],
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Professor responsável é obrigatório']
  },
  professorSubstitutoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  maxAlunos: {
    type: Number,
    required: [true, 'Número máximo de alunos é obrigatório'],
    min: [1, 'Deve haver pelo menos 1 vaga'],
    max: [50, 'Máximo de 50 alunos por turma']
  },
  alunosIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  listaEspera: [{
    alunoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    dataInscricao: {
      type: Date,
      default: Date.now
    },
    prioridade: {
      type: Number,
      default: 1
    }
  }],
  local: {
    piscina: {
      type: String,
      required: [true, 'Piscina é obrigatória'],
      enum: ['piscina_1', 'piscina_2', 'piscina_infantil', 'piscina_aquecida']
    },
    raia: {
      type: Number,
      min: 1,
      max: 8
    },
    observacoes: String
  },
  equipamentos: [{
    tipo: {
      type: String,
      enum: ['prancha', 'pullbuoy', 'nadadeira', 'macarrao', 'boia', 'outro']
    },
    quantidade: Number,
    observacoes: String
  }],
  objetivos: [{
    descricao: {
      type: String,
      required: true,
      trim: true
    },
    prazo: Date,
    concluido: {
      type: Boolean,
      default: false
    },
    dataConclusao: Date
  }],
  planoAula: {
    aquecimento: String,
    partePrincipal: String,
    relaxamento: String,
    observacoes: String,
    ultimaAtualizacao: {
      type: Date,
      default: Date.now
    }
  },
  ativa: {
    type: Boolean,
    default: true
  },
  dataInicio: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  dataFim: Date,
  motivoEncerramento: String,
  configuracoes: {
    permitirListaEspera: {
      type: Boolean,
      default: true
    },
    notificarResponsaveis: {
      type: Boolean,
      default: true
    },
    exigirAtestadoMedico: {
      type: Boolean,
      default: false
    },
    idadeFlexivel: {
      type: Boolean,
      default: false
    }
  },
  estatisticas: {
    totalAulas: {
      type: Number,
      default: 0
    },
    presencaMedia: {
      type: Number,
      default: 0
    },
    ultimaAtualizacao: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Índices
classSchema.index({ professorId: 1 });
classSchema.index({ nivel: 1 });
classSchema.index({ modalidade: 1 });
classSchema.index({ ativa: 1 });
classSchema.index({ 'faixaEtaria.min': 1, 'faixaEtaria.max': 1 });
classSchema.index({ 'horarios.diaSemana': 1 });

// Virtual para número de alunos matriculados
classSchema.virtual('numeroAlunos').get(function() {
  return this.alunosIds ? this.alunosIds.length : 0;
});

// Virtual para vagas disponíveis
classSchema.virtual('vagasDisponiveis').get(function() {
  return this.maxAlunos - this.numeroAlunos;
});

// Virtual para taxa de ocupação
classSchema.virtual('taxaOcupacao').get(function() {
  if (this.maxAlunos === 0) return 0;
  return ((this.numeroAlunos / this.maxAlunos) * 100).toFixed(1);
});

// Virtual para status da turma
classSchema.virtual('status').get(function() {
  if (!this.ativa) return 'inativa';
  if (this.numeroAlunos === 0) return 'vazia';
  if (this.numeroAlunos >= this.maxAlunos) return 'lotada';
  if (this.numeroAlunos >= this.maxAlunos * 0.8) return 'quase_lotada';
  return 'disponivel';
});

// Virtual para próxima aula
classSchema.virtual('proximaAula').get(function() {
  const hoje = new Date();
  const diaSemanaHoje = hoje.getDay();
  const horaAtual = hoje.getHours() * 60 + hoje.getMinutes();
  
  let proximaAula = null;
  let menorDiferenca = Infinity;
  
  this.horarios.forEach(horario => {
    const [hora, minuto] = horario.horaInicio.split(':').map(Number);
    const horarioMinutos = hora * 60 + minuto;
    
    // Calcular diferença em dias
    let diferenca = horario.diaSemana - diaSemanaHoje;
    if (diferenca < 0 || (diferenca === 0 && horarioMinutos <= horaAtual)) {
      diferenca += 7; // próxima semana
    }
    
    if (diferenca < menorDiferenca) {
      menorDiferenca = diferenca;
      proximaAula = {
        diaSemana: horario.diaSemana,
        horaInicio: horario.horaInicio,
        horaFim: horario.horaFim,
        data: new Date(hoje.getTime() + diferenca * 24 * 60 * 60 * 1000)
      };
    }
  });
  
  return proximaAula;
});

// Middleware para validar horários
classSchema.pre('save', function(next) {
  // Validar se hora fim é maior que hora início
  for (let horario of this.horarios) {
    const [inicioH, inicioM] = horario.horaInicio.split(':').map(Number);
    const [fimH, fimM] = horario.horaFim.split(':').map(Number);
    const inicioMinutos = inicioH * 60 + inicioM;
    const fimMinutos = fimH * 60 + fimM;
    
    if (fimMinutos <= inicioMinutos) {
      return next(new Error('Hora de fim deve ser maior que hora de início'));
    }
    
    // Calcular duração
    horario.duracao = fimMinutos - inicioMinutos;
  }
  
  next();
});

// Método para adicionar aluno
classSchema.methods.adicionarAluno = async function(alunoId) {
  if (this.numeroAlunos >= this.maxAlunos) {
    throw new Error('Turma lotada');
  }
  
  if (this.alunosIds.includes(alunoId)) {
    throw new Error('Aluno já está matriculado nesta turma');
  }
  
  this.alunosIds.push(alunoId);
  return await this.save();
};

// Método para remover aluno
classSchema.methods.removerAluno = async function(alunoId) {
  const index = this.alunosIds.indexOf(alunoId);
  if (index === -1) {
    throw new Error('Aluno não está matriculado nesta turma');
  }
  
  this.alunosIds.splice(index, 1);
  
  // Verificar lista de espera
  if (this.listaEspera.length > 0) {
    const proximoAluno = this.listaEspera.sort((a, b) => {
      if (a.prioridade !== b.prioridade) {
        return b.prioridade - a.prioridade; // maior prioridade primeiro
      }
      return a.dataInscricao - b.dataInscricao; // mais antigo primeiro
    })[0];
    
    // Aqui você poderia notificar o responsável
    // Por enquanto, apenas removemos da lista de espera
    this.listaEspera.id(proximoAluno._id).remove();
  }
  
  return await this.save();
};

// Método para adicionar à lista de espera
classSchema.methods.adicionarListaEspera = async function(alunoId, prioridade = 1) {
  if (!this.configuracoes.permitirListaEspera) {
    throw new Error('Lista de espera não permitida para esta turma');
  }
  
  const jaExiste = this.listaEspera.some(item => 
    item.alunoId.toString() === alunoId.toString()
  );
  
  if (jaExiste) {
    throw new Error('Aluno já está na lista de espera');
  }
  
  this.listaEspera.push({
    alunoId,
    prioridade,
    dataInscricao: new Date()
  });
  
  return await this.save();
};

// Método para verificar conflito de horário
classSchema.methods.verificarConflitoHorario = function(outroHorario) {
  return this.horarios.some(horario => {
    if (horario.diaSemana !== outroHorario.diaSemana) return false;
    
    const [inicioH1, inicioM1] = horario.horaInicio.split(':').map(Number);
    const [fimH1, fimM1] = horario.horaFim.split(':').map(Number);
    const inicio1 = inicioH1 * 60 + inicioM1;
    const fim1 = fimH1 * 60 + fimM1;
    
    const [inicioH2, inicioM2] = outroHorario.horaInicio.split(':').map(Number);
    const [fimH2, fimM2] = outroHorario.horaFim.split(':').map(Number);
    const inicio2 = inicioH2 * 60 + inicioM2;
    const fim2 = fimH2 * 60 + fimM2;
    
    // Verificar sobreposição
    return !(fim1 <= inicio2 || fim2 <= inicio1);
  });
};

// Método para encerrar turma
classSchema.methods.encerrar = async function(motivo) {
  this.ativa = false;
  this.dataFim = new Date();
  this.motivoEncerramento = motivo;
  return await this.save();
};

// Método para reativar turma
classSchema.methods.reativar = async function() {
  this.ativa = true;
  this.dataFim = undefined;
  this.motivoEncerramento = undefined;
  return await this.save();
};

// Método para atualizar estatísticas
classSchema.methods.atualizarEstatisticas = async function(totalAulas, presencaMedia) {
  this.estatisticas.totalAulas = totalAulas;
  this.estatisticas.presencaMedia = presencaMedia;
  this.estatisticas.ultimaAtualizacao = new Date();
  return await this.save();
};

// Método estático para buscar por professor
classSchema.statics.buscarPorProfessor = function(professorId) {
  return this.find({ 
    $or: [
      { professorId: professorId },
      { professorSubstitutoId: professorId }
    ],
    ativa: true 
  });
};

// Método estático para buscar por horário
classSchema.statics.buscarPorHorario = function(diaSemana, horario) {
  return this.find({
    'horarios.diaSemana': diaSemana,
    'horarios.horaInicio': { $lte: horario },
    'horarios.horaFim': { $gt: horario },
    ativa: true
  });
};

// Método estático para turmas com vagas
classSchema.statics.buscarComVagas = function() {
  return this.find({
    ativa: true,
    $expr: { $lt: [{ $size: '$alunosIds' }, '$maxAlunos'] }
  });
};

// Método toJSON personalizado
classSchema.methods.toJSON = function() {
  const turma = this.toObject({ virtuals: true });
  return turma;
};

module.exports = mongoose.model('Class', classSchema);

