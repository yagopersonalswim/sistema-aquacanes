const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/lessonController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Aplicar autenticação a todas as rotas
router.use(auth);

// Rotas de aulas
router.post('/', authorize(['admin', 'professor']), createLesson);
router.get('/', getLessons);
router.get('/calendar', getCalendar);
router.get('/attendance/stats', getAttendanceStats);
router.get('/:id', getLessonById);
router.put('/:id', authorize(['admin', 'professor']), updateLesson);

// Rotas de controle de aula
router.patch('/:id/start', authorize(['admin', 'professor']), startLesson);
router.patch('/:id/finish', authorize(['admin', 'professor']), finishLesson);
router.patch('/:id/cancel', authorize(['admin', 'professor']), cancelLesson);

// Rotas de presença
router.post('/:id/attendance', authorize(['admin', 'professor']), markAttendance);

module.exports = router;

