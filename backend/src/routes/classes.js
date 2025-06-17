const express = require('express');
const router = express.Router();

// Importar controllers
const {
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
} = require('../controllers/classController');

// Importar middleware
const { auth } = require('../middleware/auth');
const { 
  adminOnly, 
  professorOrAdmin, 
  responsavelOrProfessorOrAdmin,
  canAccessClass 
} = require('../middleware/authorize');

// @desc    Buscar turmas por professor
// @route   GET /api/classes/by-teacher/:teacherId
// @access  Private
router.get('/by-teacher/:teacherId', auth, professorOrAdmin, getClassesByTeacher);

// @desc    Buscar turmas com vagas
// @route   GET /api/classes/available
// @access  Private
router.get('/available', auth, responsavelOrProfessorOrAdmin, getAvailableClasses);

// @desc    Buscar turmas por horário
// @route   GET /api/classes/by-schedule
// @access  Private
router.get('/by-schedule', auth, professorOrAdmin, getClassesBySchedule);

// @desc    Listar todas as turmas
// @route   GET /api/classes
// @access  Private
router.get('/', auth, professorOrAdmin, getClasses);

// @desc    Obter turma por ID
// @route   GET /api/classes/:id
// @access  Private
router.get('/:id', auth, canAccessClass, getClass);

// @desc    Criar nova turma
// @route   POST /api/classes
// @access  Private (Admin)
router.post('/', auth, adminOnly, createClass);

// @desc    Atualizar turma
// @route   PUT /api/classes/:id
// @access  Private (Admin)
router.put('/:id', auth, adminOnly, updateClass);

// @desc    Adicionar aluno à turma
// @route   POST /api/classes/:id/students
// @access  Private (Admin)
router.post('/:id/students', auth, adminOnly, addStudentToClass);

// @desc    Remover aluno da turma
// @route   DELETE /api/classes/:id/students/:studentId
// @access  Private (Admin)
router.delete('/:id/students/:studentId', auth, adminOnly, removeStudentFromClass);

// @desc    Adicionar aluno à lista de espera
// @route   POST /api/classes/:id/waiting-list
// @access  Private (Admin)
router.post('/:id/waiting-list', auth, adminOnly, addToWaitingList);

// @desc    Encerrar turma
// @route   PUT /api/classes/:id/close
// @access  Private (Admin)
router.put('/:id/close', auth, adminOnly, closeClass);

// @desc    Reativar turma
// @route   PUT /api/classes/:id/reopen
// @access  Private (Admin)
router.put('/:id/reopen', auth, adminOnly, reopenClass);

module.exports = router;;
