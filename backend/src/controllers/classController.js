const Class = require('../models/Class');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const { validationResult } = require('express-validator');

// @desc    Listar todas as turmas
// @route   GET /api/classes
// @access  Private
const getClasses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      professor,
      nivel,
      modalidade,
      ativa,
      diaSemana
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { nome: { $regex: search, $options: 'i' } },
        { descricao: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (professor) filters.professorId = professor;
    if (nivel) filters.nivel = nivel;
    if (modalidade) filters.modalidade = modalidade;
    if (ativa !== undefined) filters.ativa = ativa === 'true';
    if (diaSemana) filters['horarios.diaSemana'] = parseInt(diaSemana);

    const classes = await Class.find(filters)
      .populate('professorId', 'nome email especialidades')
      .populate('professorSubstitutoId', 'nome email')
      .populate('alunosIds', 'nomeCompleto idade nivelNatacao')
      .sort({ nome: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Class.countDocuments(filters);

    res.json({
      success: true,
      data: {
        classes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar turmas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter turma por ID
// @route   GET /api/classes/:id
// @access  Private
const getClass = async (req, res) => {
  try {
    const turma = await Class.findById(req.params.id)
      .populate('professorId')
      .populate('professorSubstitutoId')
      .populate('alunosIds')
      .populate('listaEspera.alunoId', 'nomeCompleto idade');

    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    res.json({
      success: true,
      data: { class: turma }
    });

  } catch (error) {
    console.error('Erro ao obter turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar nova turma
// @route   POST /api/classes
// @access  Private (Admin)
const createClass = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    // Verificar se professor existe
    const professor = await Teacher.findById(req.body.professorId);
    if (!professor || !professor.ativo) {
      return res.status(400).json({
        success: false,
        message: 'Professor não encontrado ou inativo'
      });
    }

    // Verificar conflitos de horário do professor
    const conflictingClasses = await Class.find({
      professorId: req.body.professorId,
      ativa: true
    });

    for (let horario of req.body.horarios) {
      for (let turmaExistente of conflictingClasses) {
        if (turmaExistente.verificarConflitoHorario(horario)) {
          return res.status(400).json({
            success: false,
            message: `Conflito de horário: Professor já tem aula ${turmaExistente.nome} no mesmo horário`
          });
        }
      }
    }

    const newClass = await Class.create(req.body);

    // Popular dados para resposta
    await newClass.populate('professorId professorSubstitutoId');

    res.status(201).json({
      success: true,
      message: 'Turma criada com sucesso',
      data: { class: newClass }
    });

  } catch (error) {
    console.error('Erro ao criar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar turma
// @route   PUT /api/classes/:id
// @access  Private (Admin)
const updateClass = async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const turma = await Class.findById(req.params.id);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Se mudou o professor, verificar se existe
    if (req.body.professorId && req.body.professorId !== turma.professorId.toString()) {
      const professor = await Teacher.findById(req.body.professorId);
      if (!professor || !professor.ativo) {
        return res.status(400).json({
          success: false,
          message: 'Professor não encontrado ou inativo'
        });
      }
    }

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('professorId professorSubstitutoId alunosIds');

    res.json({
      success: true,
      message: 'Turma atualizada com sucesso',
      data: { class: updatedClass }
    });

  } catch (error) {
    console.error('Erro ao atualizar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Adicionar aluno à turma
// @route   POST /api/classes/:id/students
// @access  Private (Admin)
const addStudentToClass = async (req, res) => {
  try {
    const { alunoId } = req.body;
    
    const turma = await Class.findById(req.params.id);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    const aluno = await Student.findById(alunoId);
    if (!aluno || !aluno.ativo) {
      return res.status(400).json({
        success: false,
        message: 'Aluno não encontrado ou inativo'
      });
    }

    // Verificar elegibilidade por idade
    if (!turma.configuracoes.idadeFlexivel) {
      const idade = aluno.idade;
      if (idade < turma.faixaEtaria.min || idade > turma.faixaEtaria.max) {
        return res.status(400).json({
          success: false,
          message: `Aluno não está na faixa etária da turma (${turma.faixaEtaria.min}-${turma.faixaEtaria.max} anos)`
        });
      }
    }

    await turma.adicionarAluno(alunoId);

    // Atualizar turma do aluno
    await Student.findByIdAndUpdate(alunoId, { turmaId: req.params.id });

    res.json({
      success: true,
      message: 'Aluno adicionado à turma com sucesso',
      data: { class: turma }
    });

  } catch (error) {
    console.error('Erro ao adicionar aluno à turma:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

// @desc    Remover aluno da turma
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin)
const removeStudentFromClass = async (req, res) => {
  try {
    const turma = await Class.findById(req.params.id);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    await turma.removerAluno(req.params.studentId);

    // Remover turma do aluno
    await Student.findByIdAndUpdate(req.params.studentId, { 
      $unset: { turmaId: 1 } 
    });

    res.json({
      success: true,
      message: 'Aluno removido da turma com sucesso',
      data: { class: turma }
    });

  } catch (error) {
    console.error('Erro ao remover aluno da turma:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

// @desc    Adicionar aluno à lista de espera
// @route   POST /api/classes/:id/waiting-list
// @access  Private (Admin)
const addToWaitingList = async (req, res) => {
  try {
    const { alunoId, prioridade = 1 } = req.body;
    
    const turma = await Class.findById(req.params.id);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    await turma.adicionarListaEspera(alunoId, prioridade);

    res.json({
      success: true,
      message: 'Aluno adicionado à lista de espera',
      data: { class: turma }
    });

  } catch (error) {
    console.error('Erro ao adicionar à lista de espera:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Erro interno do servidor'
    });
  }
};

// @desc    Encerrar turma
// @route   PUT /api/classes/:id/close
// @access  Private (Admin)
const closeClass = async (req, res) => {
  try {
    const { motivo } = req.body;
    
    const turma = await Class.findById(req.params.id);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    await turma.encerrar(motivo);

    res.json({
      success: true,
      message: 'Turma encerrada com sucesso',
      data: { class: turma }
    });

  } catch (error) {
    console.error('Erro ao encerrar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Reativar turma
// @route   PUT /api/classes/:id/reopen
// @access  Private (Admin)
const reopenClass = async (req, res) => {
  try {
    const turma = await Class.findById(req.params.id);
    if (!turma) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    await turma.reativar();

    res.json({
      success: true,
      message: 'Turma reativada com sucesso',
      data: { class: turma }
    });

  } catch (error) {
    console.error('Erro ao reativar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Buscar turmas por professor
// @route   GET /api/classes/by-teacher/:teacherId
// @access  Private
const getClassesByTeacher = async (req, res) => {
  try {
    const classes = await Class.buscarPorProfessor(req.params.teacherId)
      .populate('alunosIds', 'nomeCompleto idade nivelNatacao')
      .sort({ nome: 1 });

    res.json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    console.error('Erro ao buscar turmas por professor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Buscar turmas com vagas
// @route   GET /api/classes/available
// @access  Private
const getAvailableClasses = async (req, res) => {
  try {
    const classes = await Class.buscarComVagas()
      .populate('professorId', 'nome')
      .sort({ nome: 1 });

    res.json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    console.error('Erro ao buscar turmas disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Buscar turmas por horário
// @route   GET /api/classes/by-schedule
// @access  Private
const getClassesBySchedule = async (req, res) => {
  try {
    const { diaSemana, horario } = req.query;
    
    if (!diaSemana || !horario) {
      return res.status(400).json({
        success: false,
        message: 'Dia da semana e horário são obrigatórios'
      });
    }

    const classes = await Class.buscarPorHorario(parseInt(diaSemana), horario)
      .populate('professorId', 'nome')
      .populate('alunosIds', 'nomeCompleto')
      .sort({ 'horarios.horaInicio': 1 });

    res.json({
      success: true,
      data: { classes }
    });

  } catch (error) {
    console.error('Erro ao buscar turmas por horário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getClasses,
  getClass,
  createClass,
  updateClass,
  addStudentToClass,
  removeStudentFromClass,
  addToWaitingList,
  closeClass,
  reopenClass,
  getClassesByTeacher,
  getAvailableClasses,
  getClassesBySchedule
};

