const Student = require('../models/Student');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Listar todos os alunos
// @route   GET /api/students
// @access  Private (Professor/Admin)
const getStudents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      turma,
      nivel,
      ativo,
      idade_min,
      idade_max
    } = req.query;

    // Construir filtros
    const filters = {};
    
    if (search) {
      filters.$or = [
        { nomeCompleto: { $regex: search, $options: 'i' } },
        { cpf: { $regex: search, $options: 'i' } },
        { 'responsavel.nome': { $regex: search, $options: 'i' } },
        { 'responsavel.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (turma) filters.turmaId = turma;
    if (nivel) filters.nivelNatacao = nivel;
    if (ativo !== undefined) filters.ativo = ativo === 'true';
    
    // Filtro por idade (será aplicado após a busca devido ao virtual)
    let students = await Student.find(filters)
      .populate('turmaId', 'nome nivel modalidade')
      .populate('planoId', 'nome tipo valor')
      .populate('responsavelUsuarioId', 'nome email')
      .sort({ nomeCompleto: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Aplicar filtro de idade se especificado
    if (idade_min || idade_max) {
      students = students.filter(student => {
        const idade = student.idade;
        if (idade_min && idade < parseInt(idade_min)) return false;
        if (idade_max && idade > parseInt(idade_max)) return false;
        return true;
      });
    }

    const total = await Student.countDocuments(filters);

    res.json({
      success: true,
      data: {
        students,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter aluno por ID
// @route   GET /api/students/:id
// @access  Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('turmaId')
      .populate('planoId')
      .populate('responsavelUsuarioId', 'nome email tipo');

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    res.json({
      success: true,
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao obter aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Criar novo aluno
// @route   POST /api/students
// @access  Private (Admin)
const createStudent = async (req, res) => {
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

    // Verificar se CPF já existe
    const existingStudent = await Student.findOne({ cpf: req.body.cpf });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Já existe um aluno cadastrado com este CPF'
      });
    }

    // Verificar se responsável existe (se fornecido)
    if (req.body.responsavelUsuarioId) {
      const responsavel = await User.findById(req.body.responsavelUsuarioId);
      if (!responsavel || responsavel.tipo !== 'responsavel') {
        return res.status(400).json({
          success: false,
          message: 'Responsável não encontrado ou inválido'
        });
      }
    }

    const student = await Student.create(req.body);

    // Popular dados para resposta
    await student.populate('turmaId planoId responsavelUsuarioId');

    res.status(201).json({
      success: true,
      message: 'Aluno criado com sucesso',
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Atualizar aluno
// @route   PUT /api/students/:id
// @access  Private (Admin/Professor)
const updateStudent = async (req, res) => {
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

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    // Verificar se CPF já existe (se foi alterado)
    if (req.body.cpf && req.body.cpf !== student.cpf) {
      const existingStudent = await Student.findOne({ cpf: req.body.cpf });
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'Já existe um aluno cadastrado com este CPF'
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('turmaId planoId responsavelUsuarioId');

    res.json({
      success: true,
      message: 'Aluno atualizado com sucesso',
      data: { student: updatedStudent }
    });

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Inativar aluno
// @route   PUT /api/students/:id/inactivate
// @access  Private (Admin)
const inactivateStudent = async (req, res) => {
  try {
    const { motivo } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    await student.inativar(motivo);

    res.json({
      success: true,
      message: 'Aluno inativado com sucesso',
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao inativar aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Reativar aluno
// @route   PUT /api/students/:id/reactivate
// @access  Private (Admin)
const reactivateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    await student.reativar();

    res.json({
      success: true,
      message: 'Aluno reativado com sucesso',
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao reativar aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Mudar aluno de turma
// @route   PUT /api/students/:id/change-class
// @access  Private (Admin)
const changeStudentClass = async (req, res) => {
  try {
    const { turmaId, motivo } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    await student.mudarTurma(turmaId, motivo);

    res.json({
      success: true,
      message: 'Turma alterada com sucesso',
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao mudar turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Obter estatísticas de alunos
// @route   GET /api/students/statistics
// @access  Private (Admin/Professor)
const getStudentStatistics = async (req, res) => {
  try {
    const statistics = await Student.obterEstatisticas();

    res.json({
      success: true,
      data: { statistics }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Buscar alunos por responsável
// @route   GET /api/students/by-responsible/:responsibleId
// @access  Private
const getStudentsByResponsible = async (req, res) => {
  try {
    const students = await Student.buscarPorResponsavel(req.params.responsibleId)
      .populate('turmaId', 'nome nivel modalidade horarios')
      .populate('planoId', 'nome tipo valor');

    res.json({
      success: true,
      data: { students }
    });

  } catch (error) {
    console.error('Erro ao buscar alunos por responsável:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Buscar alunos por turma
// @route   GET /api/students/by-class/:classId
// @access  Private
const getStudentsByClass = async (req, res) => {
  try {
    const students = await Student.buscarPorTurma(req.params.classId)
      .populate('responsavelUsuarioId', 'nome email telefone')
      .sort({ nomeCompleto: 1 });

    res.json({
      success: true,
      data: { students }
    });

  } catch (error) {
    console.error('Erro ao buscar alunos por turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Upload de documento
// @route   POST /api/students/:id/documents
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    const { tipo, nome, url } = req.body;
    
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    await student.adicionarDocumento({ tipo, nome, url });

    res.json({
      success: true,
      message: 'Documento adicionado com sucesso',
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao adicionar documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// @desc    Remover documento
// @route   DELETE /api/students/:id/documents/:documentId
// @access  Private
const removeDocument = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    await student.removerDocumento(req.params.documentId);

    res.json({
      success: true,
      message: 'Documento removido com sucesso',
      data: { student }
    });

  } catch (error) {
    console.error('Erro ao remover documento:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  inactivateStudent,
  reactivateStudent,
  changeStudentClass,
  getStudentStatistics,
  getStudentsByResponsible,
  getStudentsByClass,
  uploadDocument,
  removeDocument
};

