const express = require('express');
const router = express.Router();

// Importar controllers
const {
  register,
  login,
  logout,
  logoutAll,
  refreshToken,
  getMe,
  updateMe,
  changePassword,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// Importar middleware
const { auth, verifyRefreshToken } = require('../middleware/auth');
const { adminOnly } = require('../middleware/authorize');

// Importar validações
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken
} = require('../middleware/validate');

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Private (apenas admin)
router.post('/register', auth, adminOnly, validateRegister, register);

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, login);

// @desc    Logout de usuário
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', auth, logout);

// @desc    Logout de todos os dispositivos
// @route   POST /api/auth/logout-all
// @access  Private
router.post('/logout-all', auth, logoutAll);

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Public
router.post('/refresh', validateRefreshToken, verifyRefreshToken, refreshToken);

// @desc    Obter dados do usuário atual
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, getMe);

// @desc    Atualizar dados do usuário atual
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', auth, validateUpdateProfile, updateMe);

// @desc    Alterar senha
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', auth, validateChangePassword, changePassword);

// @desc    Solicitar reset de senha
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', validateForgotPassword, forgotPassword);

// @desc    Reset de senha
// @route   PUT /api/auth/reset-password/:resettoken
// @access  Public
router.put('/reset-password/:resettoken', validateResetPassword, resetPassword);

module.exports = router;

