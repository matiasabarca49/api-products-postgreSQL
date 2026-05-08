const { handleValidationErrors } = require("../middlewares/validations.middleware");
const { body, param } = require('express-validator');

// Validaciones para crear usuario
const validateCreateUser = [
  body('name')
    .exists().withMessage('El nombre es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('Solo debe contener letras y espacios')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  body('last_name')
    .exists().withMessage('El apellido es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('Solo Debe contener letras y espacios')
    .isLength({ min: 3, max: 50 }).withMessage('El apellido debe tener entre 3 y 50 caracteres'),
  body('nickname')
    .exists().withMessage('El nickname es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .isLength({ min: 5, max: 50 }).withMessage('El apellido debe tener entre 3 y 50 caracteres'),
  body('birth')
    .exists().withMessage('El apellido es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isDate().withMessage("Debe ser del tipo fecha"),
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('Debe tener al menos 6 caracteres'),
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['user', 'premium', 'admin']).withMessage('Debe estar en el rago: user, premium o admin'),
  
  handleValidationErrors
];

// Validaciones para actualizar usuario
const validateUpdateUser = [
  param('uid')
    .isInt().withMessage('ID inválido'),
  body('name')
    .exists().withMessage('El nombre es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('El nombre debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras y espacios')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  body('last_name')
    .exists().withMessage('El apellido es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('El apellido debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('Debe contener letras y espacios')
    .isLength({ min: 3, max: 50 }).withMessage('Debe tener entre 3 y 50 caracteres'),
  body('email')
    .exists().withMessage('El email es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isEmail().withMessage('Debe ser un email válido'),
  body('birth')
    .exists().withMessage('El nacimiento es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isDate().withMessage('Debe ser del tipo fecha'),
  
  handleValidationErrors
];

// 
const validateUpgradeUserToPremium = [
  body('name')
    .exists().withMessage('El nombre de la tienda es requerido')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres'),
  body('description')
    .exists().withMessage('La descripción es requerida')
    .notEmpty().withMessage('No puede estar vacío')
    .isString().withMessage('Debe ser un texto')
    .isLength({ min: 10, max: 170 }).withMessage('Debe tener entre 10 y 170 caracteres'),
  
  handleValidationErrors
];

module.exports = {
    validateCreateUser,
    validateUpdateUser,
    validateUpgradeUserToPremium
}