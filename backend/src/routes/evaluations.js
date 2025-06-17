const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/evaluationController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Aplicar autenticação a todas as rotas
router.use(auth);

// Rotas de avaliações
router.post('/', authorize(['admin', 'professor']), createEvaluation);
router.get('/', getEvaluations);
router.get('/report', getPerformanceReport);
router.get('/student/:studentId/evolution', getStudentEvolution);
router.get('/class/:classId/stats', getClassStats);
router.get('/:id', getEvaluationById);
router.put('/:id', authorize(['admin', 'professor']), updateEvaluation);
router.delete('/:id', authorize(['admin', 'professor']), deleteEvaluation);

// Rotas de ações específicas
router.patch('/:id/finalize', authorize(['admin', 'professor']), finalizeEvaluation);
router.patch('/:id/send', authorize(['admin', 'professor']), sendToParent);

module.exports = router;

