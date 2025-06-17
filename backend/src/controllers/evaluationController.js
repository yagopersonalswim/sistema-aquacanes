const Evaluation = require('../models/Evaluation');
const Student = require('../models/Student');
const Class = require('../models/Class');
const moment = require('moment');

// Criar nova avaliação
const createEvaluation = async (req, res) => {
  try {
    const {
      aluno,
      turma,
      titulo,
      descricao,
      periodo,
      habilidadesTecnicas,
      estilos,
      comportamento,
      objetivos,
      recomendacoes
    } = req.body;

    // Verificar se o aluno existe e está na turma
    const alunoExistente = await Student.findById(aluno);
    if (!alunoExistente) {
      return res.status(404).json({
        success: false,
        message: 'Aluno não encontrado'
      });
    }

    const turmaExistente = await Class.findById(turma);
    if (!turmaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    if (!turmaExistente.alunosMatriculados.includes(aluno)) {
      return res.status(400).json({
        success: false,
        message: 'Aluno não está matriculado nesta turma'
      });
    }

    const novaAvaliacao = new Evaluation({
      aluno,
      professor: req.user.id,
      turma,
      titulo,
      descricao,
      periodo,
      habilidadesTecnicas,
      estilos,
      comportamento,
      objetivos,
      recomendacoes,
      criadoPor: req.user.id
    });

    await novaAvaliacao.save();

    res.status(201).json({
      success: true,
      message: 'Avaliação criada com sucesso',
      data: { evaluation: novaAvaliacao }
    });

  } catch (error) {
    console.error('Erro ao criar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar avaliações
const getEvaluations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      aluno,
      turma,
      professor,
      periodo,
      status,
      dataInicio,
      dataFim
    } = req.query;

    const filtros = {};

    if (aluno) filtros.aluno = aluno;
    if (turma) filtros.turma = turma;
    if (professor) filtros.professor = professor;
    if (periodo) filtros.periodo = periodo;
    if (status) filtros.status = status;

    if (dataInicio && dataFim) {
      filtros.data = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }

    // Se for professor, só pode ver suas próprias avaliações
    if (req.user.tipo === 'professor') {
      filtros.professor = req.user.id;
    }

    const skip = (page - 1) * limit;

    const evaluations = await Evaluation.find(filtros)
      .sort({ data: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Evaluation.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        evaluations,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar avaliações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter avaliação por ID
const getEvaluationById = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.tipo === 'professor' && evaluation.professor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: { evaluation }
    });

  } catch (error) {
    console.error('Erro ao obter avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar avaliação
const updateEvaluation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.tipo === 'professor' && evaluation.professor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Não permitir edição se já foi enviada para o responsável
    if (evaluation.status === 'enviada_responsavel') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível editar avaliação já enviada para o responsável'
      });
    }

    Object.assign(evaluation, updates);
    await evaluation.save();

    res.json({
      success: true,
      message: 'Avaliação atualizada com sucesso',
      data: { evaluation }
    });

  } catch (error) {
    console.error('Erro ao atualizar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Finalizar avaliação
const finalizeEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.tipo === 'professor' && evaluation.professor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    evaluation.finalizar();
    await evaluation.save();

    res.json({
      success: true,
      message: 'Avaliação finalizada com sucesso',
      data: { evaluation }
    });

  } catch (error) {
    console.error('Erro ao finalizar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Enviar avaliação para responsável
const sendToParent = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.tipo === 'professor' && evaluation.professor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    evaluation.enviarParaResponsavel();
    await evaluation.save();

    // Aqui poderia ser implementado o envio de email/notificação
    // para o responsável

    res.json({
      success: true,
      message: 'Avaliação enviada para o responsável com sucesso',
      data: { evaluation }
    });

  } catch (error) {
    console.error('Erro ao enviar avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter evolução do aluno
const getStudentEvolution = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { limit = 5 } = req.query;

    const evolution = await Evaluation.getEvolucaoAluno(studentId, parseInt(limit));

    res.json({
      success: true,
      data: { evolution }
    });

  } catch (error) {
    console.error('Erro ao obter evolução do aluno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas por turma
const getClassStats = async (req, res) => {
  try {
    const { classId } = req.params;
    const { periodo = 'mensal' } = req.query;

    const stats = await Evaluation.getEstatisticasPorTurma(classId, periodo);

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas da turma:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter relatório de desempenho
const getPerformanceReport = async (req, res) => {
  try {
    const {
      turma,
      periodo,
      dataInicio,
      dataFim
    } = req.query;

    const filtros = {};
    
    if (turma) filtros.turma = turma;
    if (periodo) filtros.periodo = periodo;
    if (dataInicio && dataFim) {
      filtros.data = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }

    // Se for professor, só pode ver suas próprias avaliações
    if (req.user.tipo === 'professor') {
      filtros.professor = req.user.id;
    }

    const pipeline = [
      { $match: { ...filtros, status: { $ne: 'rascunho' } } },
      {
        $group: {
          _id: '$aluno',
          totalAvaliacoes: { $sum: 1 },
          mediaTecnica: { $avg: '$notas.tecnica' },
          mediaComportamento: { $avg: '$notas.comportamento' },
          mediaGeral: { $avg: '$notas.geral' },
          ultimaAvaliacao: { $max: '$data' }
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
          totalAvaliacoes: 1,
          mediaTecnica: { $round: ['$mediaTecnica', 2] },
          mediaComportamento: { $round: ['$mediaComportamento', 2] },
          mediaGeral: { $round: ['$mediaGeral', 2] },
          ultimaAvaliacao: 1
        }
      },
      {
        $sort: { mediaGeral: -1 }
      }
    ];

    const report = await Evaluation.aggregate(pipeline);

    res.json({
      success: true,
      data: { report }
    });

  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Deletar avaliação
const deleteEvaluation = async (req, res) => {
  try {
    const { id } = req.params;

    const evaluation = await Evaluation.findById(id);

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Avaliação não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.tipo === 'professor' && evaluation.professor.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    // Não permitir exclusão se já foi enviada para o responsável
    if (evaluation.status === 'enviada_responsavel') {
      return res.status(400).json({
        success: false,
        message: 'Não é possível excluir avaliação já enviada para o responsável'
      });
    }

    await Evaluation.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Avaliação excluída com sucesso'
    });

  } catch (error) {
    console.error('Erro ao excluir avaliação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createEvaluation,
  getEvaluations,
  getEvaluationById,
  updateEvaluation,
  finalizeEvaluation,
  sendToParent,
  getStudentEvolution,
  getClassStats,
  getPerformanceReport,
  deleteEvaluation
};

