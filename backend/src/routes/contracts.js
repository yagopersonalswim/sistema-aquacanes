const express = require('express');
const router = express.Router();
const {
  createContract,
  getContracts,
  getContractById,
  signContractParent,
  signContractSchool,
  activateContract,
  cancelContract,
  getExpiringContracts,
  getContractStats,
  generateContractPDF,
  verifyContractIntegrity
} = require('../controllers/contractController');
const { auth } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

// Aplicar autenticação a todas as rotas
router.use(auth);

// Rotas de contratos
router.post('/', authorize(['admin']), createContract);
router.get('/', getContracts);
router.get('/stats', getContractStats);
router.get('/expiring', getExpiringContracts);
router.get('/:id', getContractById);

// Ações específicas
router.patch('/:id/sign-parent', authorize(['responsavel']), signContractParent);
router.patch('/:id/sign-school', authorize(['admin']), signContractSchool);
router.patch('/:id/activate', authorize(['admin']), activateContract);
router.patch('/:id/cancel', authorize(['admin']), cancelContract);

// Utilitários
router.get('/:id/pdf', generateContractPDF);
router.get('/:id/verify', verifyContractIntegrity);

module.exports = router;

