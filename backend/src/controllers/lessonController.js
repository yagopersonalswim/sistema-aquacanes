const Lesson = require('../models/Lesson');
const Attendance = require('../models/Attendance');
const Class = require('../models/Class');
const Student = require('../models/Student');
const moment = require('moment');

// Criar nova aula
const createLesson = async (req, res) => {
  try {
    const {
      turma,
      professor,
      data,
      horaInicio,
      horaFim,
      titulo,
      descricao,
      objetivos,
      conteudo
    } = req.body;

    // Verificar se a turma existe
    const turmaExistente = await Class.findById(turma);
    if (!turmaExistente) {
      return res.status(404).json({
        success: false,
        message: 'Turma não encontrada'
      });
    }

    // Verificar conflitos de horário
    const conflito = await Lesson.findOne({
      professor,
      data: new Date(data),
      $or: [
        {
          horaInicio: { $lte: horaInicio },
          horaFim: { $gt: horaInicio }
        },
        {
          horaInicio: { $lt: horaFim },
          horaFim: { $gte: horaFim }
        }
      ],
      status: { $nin: ['cancelada'] }
    });

    if (conflito) {
      return res.status(400).json({
        success: false,
        message: 'Professor já possui aula agendada neste horário'
      });
    }

    const novaAula = new Lesson({
      turma,
      professor,
      data: new Date(data),
      horaInicio,
      horaFim,
      titulo,
      descricao,
      objetivos,
      conteudo,
      criadoPor: req.user.id
    });

    // Inicializar lista de presença com alunos da turma
    turmaExistente.alunosMatriculados.forEach(alunoId => {
      novaAula.listaPresenca.push({
        aluno: alunoId,
        status: 'falta'
      });
    });

    novaAula.calcularEstatisticas();
    await novaAula.save();

    res.status(201).json({
      success: true,
      message: 'Aula criada com sucesso',
      data: { lesson: novaAula }
    });

  } catch (error) {
    console.error('Erro ao criar aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Listar aulas
const getLessons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      turma,
      professor,
      dataInicio,
      dataFim,
      status
    } = req.query;

    const filtros = {};

    if (turma) filtros.turma = turma;
    if (professor) filtros.professor = professor;
    if (status) filtros.status = status;

    if (dataInicio && dataFim) {
      filtros.data = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    } else if (dataInicio) {
      filtros.data = { $gte: new Date(dataInicio) };
    } else if (dataFim) {
      filtros.data = { $lte: new Date(dataFim) };
    }

    const skip = (page - 1) * limit;

    const lessons = await Lesson.find(filtros)
      .sort({ data: -1, horaInicio: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Lesson.countDocuments(filtros);

    res.json({
      success: true,
      data: {
        lessons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar aulas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter aula por ID
const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    res.json({
      success: true,
      data: { lesson }
    });

  } catch (error) {
    console.error('Erro ao obter aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Atualizar aula
const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    // Verificar conflitos de horário se data/horário foram alterados
    if (updates.data || updates.horaInicio || updates.horaFim) {
      const novaData = updates.data ? new Date(updates.data) : lesson.data;
      const novoInicio = updates.horaInicio || lesson.horaInicio;
      const novoFim = updates.horaFim || lesson.horaFim;

      const conflito = await Lesson.findOne({
        _id: { $ne: id },
        professor: lesson.professor,
        data: novaData,
        $or: [
          {
            horaInicio: { $lte: novoInicio },
            horaFim: { $gt: novoInicio }
          },
          {
            horaInicio: { $lt: novoFim },
            horaFim: { $gte: novoFim }
          }
        ],
        status: { $nin: ['cancelada'] }
      });

      if (conflito) {
        return res.status(400).json({
          success: false,
          message: 'Professor já possui aula agendada neste horário'
        });
      }
    }

    Object.assign(lesson, updates);
    await lesson.save();

    res.json({
      success: true,
      message: 'Aula atualizada com sucesso',
      data: { lesson }
    });

  } catch (error) {
    console.error('Erro ao atualizar aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Marcar presença
const markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { presencas } = req.body; // Array de { alunoId, status, observacoes }

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    // Atualizar presenças
    presencas.forEach(({ alunoId, status, observacoes }) => {
      lesson.marcarPresenca(alunoId, status, observacoes);
    });

    await lesson.save();

    // Criar registros de presença individuais
    for (const { alunoId, status, observacoes } of presencas) {
      await Attendance.findOneAndUpdate(
        {
          aluno: alunoId,
          aula: id
        },
        {
          aluno: alunoId,
          turma: lesson.turma,
          aula: id,
          professor: lesson.professor,
          data: lesson.data,
          horaInicio: lesson.horaInicio,
          horaFim: lesson.horaFim,
          status,
          observacoes: observacoes ? { comentarios: observacoes } : undefined,
          registradoPor: req.user.id
        },
        {
          upsert: true,
          new: true
        }
      );
    }

    res.json({
      success: true,
      message: 'Presença registrada com sucesso',
      data: { lesson }
    });

  } catch (error) {
    console.error('Erro ao marcar presença:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Iniciar aula
const startLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    if (lesson.status !== 'agendada') {
      return res.status(400).json({
        success: false,
        message: 'Aula não pode ser iniciada'
      });
    }

    lesson.iniciarAula();
    await lesson.save();

    res.json({
      success: true,
      message: 'Aula iniciada com sucesso',
      data: { lesson }
    });

  } catch (error) {
    console.error('Erro ao iniciar aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Finalizar aula
const finishLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { avaliacao } = req.body;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    if (lesson.status !== 'em_andamento') {
      return res.status(400).json({
        success: false,
        message: 'Aula não está em andamento'
      });
    }

    if (avaliacao) {
      lesson.avaliacao = avaliacao;
    }

    lesson.finalizarAula();
    await lesson.save();

    res.json({
      success: true,
      message: 'Aula finalizada com sucesso',
      data: { lesson }
    });

  } catch (error) {
    console.error('Erro ao finalizar aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Cancelar aula
const cancelLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo, descricao, novaData } = req.body;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Aula não encontrada'
      });
    }

    lesson.cancelarAula(motivo, descricao, novaData);
    await lesson.save();

    res.json({
      success: true,
      message: novaData ? 'Aula adiada com sucesso' : 'Aula cancelada com sucesso',
      data: { lesson }
    });

  } catch (error) {
    console.error('Erro ao cancelar aula:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter calendário de aulas
const getCalendar = async (req, res) => {
  try {
    const { 
      mes = new Date().getMonth() + 1,
      ano = new Date().getFullYear(),
      turma,
      professor
    } = req.query;

    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0);

    const filtros = {
      data: {
        $gte: dataInicio,
        $lte: dataFim
      }
    };

    if (turma) filtros.turma = turma;
    if (professor) filtros.professor = professor;

    const lessons = await Lesson.find(filtros)
      .sort({ data: 1, horaInicio: 1 });

    // Agrupar por data
    const calendario = {};
    lessons.forEach(lesson => {
      const dataKey = moment(lesson.data).format('YYYY-MM-DD');
      if (!calendario[dataKey]) {
        calendario[dataKey] = [];
      }
      calendario[dataKey].push(lesson);
    });

    res.json({
      success: true,
      data: { calendario }
    });

  } catch (error) {
    console.error('Erro ao obter calendário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

// Obter estatísticas de presença
const getAttendanceStats = async (req, res) => {
  try {
    const {
      dataInicio = moment().startOf('month').toDate(),
      dataFim = moment().endOf('month').toDate(),
      turma,
      aluno
    } = req.query;

    let stats;

    if (aluno) {
      // Estatísticas por aluno
      stats = await Attendance.getFrequenciaPorAluno(aluno, dataInicio, dataFim);
    } else if (turma) {
      // Estatísticas por turma
      stats = await Attendance.getFrequenciaPorTurma(turma, dataInicio, dataFim);
    } else {
      // Estatísticas gerais
      const pipeline = [
        {
          $match: {
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
            totalPresencas: {
              $sum: {
                $cond: [{ $eq: ['$status', 'presente'] }, 1, 0]
              }
            },
            totalFaltas: {
              $sum: {
                $cond: [{ $eq: ['$status', 'falta'] }, 1, 0]
              }
            }
          }
        }
      ];

      const resultado = await Attendance.aggregate(pipeline);
      stats = resultado[0] || { totalAulas: 0, totalPresencas: 0, totalFaltas: 0 };
    }

    res.json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
};

module.exports = {
  createLesson,
  getLessons,
  getLessonById,
  updateLesson,
  markAttendance,
  startLesson,
  finishLesson,
  cancelLesson,
  getCalendar,
  getAttendanceStats
};

