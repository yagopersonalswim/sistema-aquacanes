const express = require('express');
const router = express.Router();

// Importar controllers
const {
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
} = require('../controllers/studentController');

// Importar middleware
const { auth } = require('../middleware/auth');
const { 
  adminOnly, 
  professorOrAdmin, 
  responsavelOrProfessorOrAdmin,
  canAccessStudent 
} = require('../middleware/authorize');

// @desc    Obter estatísticas de alunos
// @route   GET /api/students/statistics
// @access  Private (Admin/Professor)
router.get('/statistics', auth, professorOrAdmin, getStudentStatistics);

// @desc    Buscar alunos por responsável
// @route   GET /api/students/by-responsible/:responsibleId
// @access  Private
router.get('/by-responsible/:responsibleId', auth, responsavelOrProfessorOrAdmin, getStudentsByResponsible);

// @desc    Buscar alunos por turma
// @route   GET /api/students/by-class/:classId
// @access  Private
router.get('/by-class/:classId', auth, professorOrAdmin, getStudentsByClass);

// @desc    Listar todos os alunos
// @route   GET /api/students
// @access  Private (Professor/Admin)
router.get('/', auth, professorOrAdmin, getStudents);

// @desc    Obter aluno por ID
// @route   GET /api/students/:id
// @access  Private
router.get('/:id', auth, canAccessStudent, getStudent);

// @desc    Criar novo aluno
// @route   POST /api/students
// @access  Private (Admin)
router.post('/', auth, adminOnly, createStudent);

// @desc    Atualizar aluno
// @route   PUT /api/students/:id
// @access  Private (Admin/Professor)
router.put('/:id', auth, professorOrAdmin, updateStudent);

// @desc    Inativar aluno
// @route   PUT /api/students/:id/inactivate
// @access  Private (Admin)
router.put('/:id/inactivate', auth, adminOnly, inactivateStudent);

// @desc    Reativar aluno
// @route   PUT /api/students/:id/reactivate
// @access  Private (Admin)
router.put('/:id/reactivate', auth, adminOnly, reactivateStudent);

// @desc    Mudar aluno de turma
// @route   PUT /api/students/:id/change-class
// @access  Private (Admin)
router.put('/:id/change-class', auth, adminOnly, changeStudentClass);

// @desc    Upload de documento
// @route   POST /api/students/:id/documents
// @access  Private
router.post('/:id/documents', auth, canAccessStudent, uploadDocument);

// @desc    Remover documento
// @route   DELETE /api/students/:id/documents/:documentId
// @access  Private
router.delete('/:id/documents/:documentId', auth, canAccessStudent, removeDocument);

module.exports = router;
