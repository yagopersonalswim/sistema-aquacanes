const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  nomeCompleto: {
    type: String,
    required: [true, 'Nome completo é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  dataNascimento: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória'],
    validate: {
      validator: function(value) {
        return value < new Date();
      },
      message: 'Data de nascimento deve ser no passado'
    }
  },
  sexo: {
    type: String,
    required: [true, 'Sexo é obrigatório'],
    enum: {
      values: ['M', 'F'],
      message: 'Sexo deve ser M ou F'
    }
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(cpf) {
        // Validação básica de CPF (apenas formato)
        return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
      },
      message: 'CPF deve estar no formato XXX.XXX.XXX-XX'
    }
  },
  rg: {
    type: String,
    required: [true, 'RG é obrigatório'],
    trim: true
  },
  endereco: {
    rua: {
      type: String,
      required: [true, 'Rua é obrigatória'],
      trim: true
    },
    numero: {
      type: String,
      required: [true, 'Número é obrigatório'],
      trim: true
    },
    complemento: {
      type: String,
      trim: true
    },
    bairro: {
      type: String,
      required: [true, 'Bairro é obrigatório'],
      trim: true
    },
    cidade: {
      type: String,
      required: [true, 'Cidade é obrigatória'],
      trim: true
    },
    estado: {
      type: String,
      required: [true, 'Estado é obrigatório'],
      trim: true,
      maxlength: [2, 'Estado deve ter 2 caracteres']
    },
    cep: {
      type: String,
      required: [true, 'CEP é obrigatório'],
      trim: true,
      validate: {
        validator: function(cep) {
          return /^\d{5}-\d{3}$/.test(cep);
        },
        message: 'CEP deve estar no formato XXXXX-XXX'
      }
    }
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ]
  },
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  responsavel: {
    nome: {
      type: String,
      required: [true, 'Nome do responsável é obrigatório'],
      trim: true
    },
    cpf: {
      type: String,
      required: [true, 'CPF do responsável é obrigatório'],
      trim: true,
      validate: {
        validator: function(cpf) {
          return /^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf);
        },
        message: 'CPF do responsável deve estar no formato XXX.XXX.XXX-XX'
      }
    },
    telefone: {
      type: String,
      required: [true, 'Telefone do responsável é obrigatório'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email do responsável é obrigatório'],
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Email do responsável deve ser válido'
      ]
    },
    parentesco: {
      type: String,
      required: [true, 'Parentesco é obrigatório'],
      enum: {
        values: ['pai', 'mae', 'avo', 'ava', 'tio', 'tia', 'responsavel_legal', 'outro'],
        message: 'Parentesco inválido'
      }
    }
  },
  nivelNatacao: {
    type: String,
    required: [true, 'Nível de natação é obrigatório'],
    enum: {
      values: ['iniciante', 'basico', 'intermediario', 'avancado', 'competitivo'],
      message: 'Nível de natação inválido'
    },
    default: 'iniciante'
  },
  restricoesMedicas: {
    type: String,
    trim: true,
    default: 'Nenhuma'
  },
  medicamentos: {
    type: String,
    trim: true
  },
  alergias: {
    type: String,
    trim: true
  },
  consentimentoImagem: {
    type: Boolean,
    required: [true, 'Consentimento de imagem é obrigatório'],
    default: false
  },
  turmaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  },
  planoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan'
  },
  responsavelUsuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataMatricula: {
    type: Date,
    default: Date.now
  },
  dataInativacao: {
    type: Date
  },
  motivoInativacao: {
    type: String,
    trim: true
  },
  observacoes: {
    type: String,
    trim: true
  },
  documentos: [{
    tipo: {
      type: String,
      enum: ['rg', 'cpf', 'comprovante_residencia', 'atestado_medico', 'foto', 'outro']
    },
    nome: String,
    url: String,
    uploadEm: {
      type: Date,
      default: Date.now
    }
  }],
  historicoTurmas: [{
    turmaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class'
    },
    dataInicio: Date,
    dataFim: Date,
    motivo: String
  }]
}, {
  timestamps: true
});

// Índices
studentSchema.index({ cpf: 1 });
studentSchema.index({ 'responsavel.cpf': 1 });
studentSchema.index({ 'responsavel.email': 1 });
studentSchema.index({ turmaId: 1 });
studentSchema.index({ ativo: 1 });
studentSchema.index({ dataMatricula: 1 });
studentSchema.index({ nivelNatacao: 1 });

// Virtual para idade
studentSchema.virtual('idade').get(function() {
  if (!this.dataNascimento) return null;
  
  const hoje = new Date();
  const nascimento = new Date(this.dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }
  
  return idade;
});

// Virtual para endereço completo
studentSchema.virtual('enderecoCompleto').get(function() {
  const end = this.endereco;
  let endereco = `${end.rua}, ${end.numero}`;
  if (end.complemento) endereco += `, ${end.complemento}`;
  endereco += `, ${end.bairro}, ${end.cidade}/${end.estado} - ${end.cep}`;
  return endereco;
});

// Middleware para atualizar data de inativação
studentSchema.pre('save', function(next) {
  if (this.isModified('ativo') && !this.ativo && !this.dataInativacao) {
    this.dataInativacao = new Date();
  }
  next();
});

// Método para inativar aluno
studentSchema.methods.inativar = async function(motivo) {
  this.ativo = false;
  this.dataInativacao = new Date();
  this.motivoInativacao = motivo;
  return await this.save();
};

// Método para reativar aluno
studentSchema.methods.reativar = async function() {
  this.ativo = true;
  this.dataInativacao = undefined;
  this.motivoInativacao = undefined;
  return await this.save();
};

// Método para adicionar documento
studentSchema.methods.adicionarDocumento = async function(documento) {
  this.documentos.push(documento);
  return await this.save();
};

// Método para remover documento
studentSchema.methods.removerDocumento = async function(documentoId) {
  this.documentos.id(documentoId).remove();
  return await this.save();
};

// Método para mudar de turma
studentSchema.methods.mudarTurma = async function(novaTurmaId, motivo) {
  // Adicionar ao histórico
  if (this.turmaId) {
    this.historicoTurmas.push({
      turmaId: this.turmaId,
      dataInicio: this.dataMatricula,
      dataFim: new Date(),
      motivo: motivo || 'Mudança de turma'
    });
  }
  
  this.turmaId = novaTurmaId;
  return await this.save();
};

// Método toJSON personalizado
studentSchema.methods.toJSON = function() {
  const student = this.toObject({ virtuals: true });
  return student;
};

// Método estático para buscar por responsável
studentSchema.statics.buscarPorResponsavel = function(responsavelId) {
  return this.find({ responsavelUsuarioId: responsavelId, ativo: true });
};

// Método estático para buscar por turma
studentSchema.statics.buscarPorTurma = function(turmaId) {
  return this.find({ turmaId: turmaId, ativo: true });
};

// Método estático para estatísticas
studentSchema.statics.obterEstatisticas = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalAlunos: { $sum: 1 },
        alunosAtivos: {
          $sum: { $cond: [{ $eq: ['$ativo', true] }, 1, 0] }
        },
        alunosInativos: {
          $sum: { $cond: [{ $eq: ['$ativo', false] }, 1, 0] }
        }
      }
    }
  ]);
  
  const porNivel = await this.aggregate([
    { $match: { ativo: true } },
    {
      $group: {
        _id: '$nivelNatacao',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const porIdade = await this.aggregate([
    { $match: { ativo: true } },
    {
      $addFields: {
        idade: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$dataNascimento'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        }
      }
    },
    {
      $group: {
        _id: {
          $switch: {
            branches: [
              { case: { $lt: ['$idade', 6] }, then: '0-5' },
              { case: { $lt: ['$idade', 12] }, then: '6-11' },
              { case: { $lt: ['$idade', 18] }, then: '12-17' },
              { case: { $gte: ['$idade', 18] }, then: '18+' }
            ],
            default: 'Indefinido'
          }
        },
        count: { $sum: 1 }
      }
    }
  ]);
  
  return {
    geral: stats[0] || { totalAlunos: 0, alunosAtivos: 0, alunosInativos: 0 },
    porNivel,
    porIdade
  };
};

module.exports = mongoose.model('Student', studentSchema);

