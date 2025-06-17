const { body } = require('express-validator');

// Validações para registro
const validateRegister = [
  body('nome')
    .trim()
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('tipo')
    .notEmpty()
    .withMessage('Tipo de usuário é obrigatório')
    .isIn(['admin', 'professor', 'responsavel'])
    .withMessage('Tipo deve ser: admin, professor ou responsavel')
];

// Validações para login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail(),
  
  body('senha')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

// Validações para atualização de perfil
const validateUpdateProfile = [
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail()
];

// Validações para alteração de senha
const validateChangePassword = [
  body('senhaAtual')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('novaSenha')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('confirmarSenha')
    .custom((value, { req }) => {
      if (value !== req.body.novaSenha) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    })
];

// Validações para esqueci minha senha
const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email é obrigatório')
    .isEmail()
    .withMessage('Email deve ser válido')
    .normalizeEmail()
];

// Validações para reset de senha
const validateResetPassword = [
  body('senha')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('confirmarSenha')
    .custom((value, { req }) => {
      if (value !== req.body.senha) {
        throw new Error('Confirmação de senha não confere');
      }
      return true;
    })
];

// Validações para refresh token
const validateRefreshToken = [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token é obrigatório')
];

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword,
  validateRefreshToken
};

