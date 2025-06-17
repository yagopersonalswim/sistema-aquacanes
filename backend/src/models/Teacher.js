const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID do usuário é obrigatório'],
    unique: true
  },
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome não pode ter mais de 100 caracteres']
  },
  cpf: {
    type: String,
    required: [true, 'CPF é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(cpf) {
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
  dataNascimento: {
    type: Date,
    required: [true, 'Data de nascimento é obrigatória']
  },
  sexo: {
    type: String,
    required: [true, 'Sexo é obrigatório'],
    enum: {
      values: ['M', 'F'],
      message: 'Sexo deve ser M ou F'
    }
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
  telefone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  whatsapp: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, insira um email válido'
    ]
  },
  especialidades: [{
    type: String,
    enum: [
      'natacao_infantil',
      'natacao_adulto',
      'natacao_competitiva',
      'hidroginastica',
      'aqua_fitness',
      'natacao_terapeutica',
      'polo_aquatico',
      'sincronizado',
      'mergulho',
      'salvamento_aquatico'
    ]
  }],
  certificacoes: [{
    nome: {
      type: String,
      required: true,
      trim: true
    },
    instituicao: {
      type: String,
      required: true,
      trim: true
    },
    dataObtencao: {
      type: Date,
      required: true
    },
    dataVencimento: Date,
    numero: String,
    documento: String // URL do documento
  }],
  experiencia: {
    anosExperiencia: {
      type: Number,
      min: 0,
      default: 0
    },
    descricao: {
      type: String,
      trim: true
    }
  },
  formacao: [{
    curso: {
      type: String,
      required: true,
      trim: true
    },
    instituicao: {
      type: String,
      required: true,
      trim: true
    },
    nivel: {
      type: String,
      enum: ['tecnico', 'superior', 'pos_graduacao', 'mestrado', 'doutorado'],
      required: true
    },
    anoConclusao: {
      type: Number,
      required: true
    },
    situacao: {
      type: String,
      enum: ['concluido', 'em_andamento', 'trancado'],
      default: 'concluido'
    }
  }],
  horarioTrabalho: {
    segunda: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    },
    terca: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    },
    quarta: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    },
    quinta: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    },
    sexta: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    },
    sabado: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    },
    domingo: {
      ativo: { type: Boolean, default: false },
      inicio: String,
      fim: String
    }
  },
  salario: {
    tipo: {
      type: String,
      enum: ['fixo', 'por_hora', 'por_aula'],
      default: 'fixo'
    },
    valor: {
      type: Number,
      min: 0
    },
    dataUltimoReajuste: Date
  },
  contrato: {
    tipo: {
      type: String,
      enum: ['clt', 'pj', 'freelancer', 'estagio'],
      required: true
    },
    dataInicio: {
      type: Date,
      required: true
    },
    dataFim: Date,
    observacoes: String
  },
  ativo: {
    type: Boolean,
    default: true
  },
  dataAdmissao: {
    type: Date,
    default: Date.now
  },
  dataDesligamento: Date,
  motivoDesligamento: String,
  observacoes: String,
  documentos: [{
    tipo: {
      type: String,
      enum: ['rg', 'cpf', 'comprovante_residencia', 'diploma', 'certificado', 'contrato', 'foto', 'outro']
    },
    nome: String,
    url: String,
    uploadEm: {
      type: Date,
      default: Date.now
    }
  }],
  avaliacoes: [{
    data: {
      type: Date,
      default: Date.now
    },
    avaliador: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    pontuacao: {
      type: Number,
      min: 1,
      max: 5
    },
    comentarios: String,
    criterios: {
      pontualidade: { type: Number, min: 1, max: 5 },
      didatica: { type: Number, min: 1, max: 5 },
      relacionamento: { type: Number, min: 1, max: 5 },
      tecnica: { type: Number, min: 1, max: 5 },
      organizacao: { type: Number, min: 1, max: 5 }
    }
  }]
}, {
  timestamps: true
});

// Índices
teacherSchema.index({ usuarioId: 1 });
teacherSchema.index({ cpf: 1 });
teacherSchema.index({ email: 1 });
teacherSchema.index({ ativo: 1 });
teacherSchema.index({ especialidades: 1 });

// Virtual para idade
teacherSchema.virtual('idade').get(function() {
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
teacherSchema.virtual('enderecoCompleto').get(function() {
  const end = this.endereco;
  let endereco = `${end.rua}, ${end.numero}`;
  if (end.complemento) endereco += `, ${end.complemento}`;
  endereco += `, ${end.bairro}, ${end.cidade}/${end.estado} - ${end.cep}`;
  return endereco;
});

// Virtual para média de avaliações
teacherSchema.virtual('mediaAvaliacoes').get(function() {
  if (!this.avaliacoes || this.avaliacoes.length === 0) return 0;
  
  const soma = this.avaliacoes.reduce((acc, avaliacao) => acc + avaliacao.pontuacao, 0);
  return (soma / this.avaliacoes.length).toFixed(1);
});

// Virtual para tempo de trabalho
teacherSchema.virtual('tempoTrabalho').get(function() {
  if (!this.dataAdmissao) return null;
  
  const fim = this.dataDesligamento || new Date();
  const inicio = new Date(this.dataAdmissao);
  const diffTime = Math.abs(fim - inicio);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const anos = Math.floor(diffDays / 365);
  const meses = Math.floor((diffDays % 365) / 30);
  
  return { anos, meses, dias: diffDays };
});

// Middleware para atualizar data de desligamento
teacherSchema.pre('save', function(next) {
  if (this.isModified('ativo') && !this.ativo && !this.dataDesligamento) {
    this.dataDesligamento = new Date();
  }
  next();
});

// Método para desligar professor
teacherSchema.methods.desligar = async function(motivo) {
  this.ativo = false;
  this.dataDesligamento = new Date();
  this.motivoDesligamento = motivo;
  return await this.save();
};

// Método para reativar professor
teacherSchema.methods.reativar = async function() {
  this.ativo = true;
  this.dataDesligamento = undefined;
  this.motivoDesligamento = undefined;
  return await this.save();
};

// Método para adicionar certificação
teacherSchema.methods.adicionarCertificacao = async function(certificacao) {
  this.certificacoes.push(certificacao);
  return await this.save();
};

// Método para adicionar avaliação
teacherSchema.methods.adicionarAvaliacao = async function(avaliacao) {
  this.avaliacoes.push(avaliacao);
  return await this.save();
};

// Método para verificar disponibilidade
teacherSchema.methods.verificarDisponibilidade = function(diaSemana, horario) {
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dia = dias[diaSemana];
  
  if (!this.horarioTrabalho[dia] || !this.horarioTrabalho[dia].ativo) {
    return false;
  }
  
  const inicio = this.horarioTrabalho[dia].inicio;
  const fim = this.horarioTrabalho[dia].fim;
  
  return horario >= inicio && horario <= fim;
};

// Método para obter certificações válidas
teacherSchema.methods.obterCertificacoesValidas = function() {
  const hoje = new Date();
  return this.certificacoes.filter(cert => {
    return !cert.dataVencimento || cert.dataVencimento > hoje;
  });
};

// Método estático para buscar por especialidade
teacherSchema.statics.buscarPorEspecialidade = function(especialidade) {
  return this.find({ 
    especialidades: especialidade,
    ativo: true 
  });
};

// Método estático para professores disponíveis
teacherSchema.statics.buscarDisponiveis = function(diaSemana, horario) {
  const dias = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const dia = dias[diaSemana];
  
  const query = {
    ativo: true,
    [`horarioTrabalho.${dia}.ativo`]: true,
    [`horarioTrabalho.${dia}.inicio`]: { $lte: horario },
    [`horarioTrabalho.${dia}.fim`]: { $gte: horario }
  };
  
  return this.find(query);
};

// Método toJSON personalizado
teacherSchema.methods.toJSON = function() {
  const teacher = this.toObject({ virtuals: true });
  // Remover dados sensíveis se necessário
  delete teacher.salario;
  return teacher;
};

module.exports = mongoose.model('Teacher', teacherSchema);

