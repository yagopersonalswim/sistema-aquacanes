const express = require('express');
const router = express.Router();
const {
  createPayment,
  getPayments,
  getPaymentById,
  confirmPayment,
  cancelPayment,
  applyDiscount,
  getFinancialStats,
  generateFinancialReport,
  generateBulkCharges
} = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Aplicar autenticação a todas as rotas
router.use(auth);

// Rotas de pagamentos
router.post('/', authorize(['admin']), createPayment);
router.get('/', getPayments);
router.get('/stats', getFinancialStats);
router.get('/report', generateFinancialReport);
router.post('/bulk-charges', authorize(['admin']), generateBulkCharges);
router.get('/:id', getPaymentById);

// Ações específicas
router.patch('/:id/confirm', authorize(['admin']), confirmPayment);
router.patch('/:id/cancel', authorize(['admin']), cancelPayment);
router.patch('/:id/discount', authorize(['admin']), applyDiscount);

module.exports = router;

