const { handleValidationErrors } = require("../middlewares/validations.middleware");
const { body, param } = require('express-validator');

// Validaciones para crear usuario
const validateCreateUser = [
  body('name')
    .exists().withMessage('El nombre es requerido')
    .notEmpty().withMessage('El nombre no puede estar vacío')
    .isString().withMessage('El nombre debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras y espacios')
    .trim()  // Elimina espacios antes y después
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .toLowerCase()// Todo a minúsculas: "JuAN" -> "juan"
    .customSanitizer(value => {
      // Capitaliza: primera letra mayúscula
      return value.charAt(0).toUpperCase() + value.slice(1);
    }),
  body('last_name')
    .exists().withMessage('El apellido es requerido')
    .notEmpty().withMessage('El apellido no puede estar vacío')
    .isString().withMessage('El apellido debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras y espacios')
    .trim() 
    .isLength({ min: 3, max: 50 }).withMessage('El apellido debe tener entre 3 y 50 caracteres')
    .toLowerCase()
    .customSanitizer(value => {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }),
  body('age')
    .optional()
    .isInt({ min: 0 }).withMessage('La edad debe ser un número entero positivo'),
  body('email')
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida')
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('rol')
    .notEmpty().withMessage('El rol es requerido')
    .isIn(['user', 'premium', 'admin']).withMessage('El rol debe ser User, Premium o Admin'),
  
  handleValidationErrors
];

/**
 * USUARIOS
 */

// Validaciones para actualizar usuario
const validateUpdateUser = [
  param('uid')
    .isMongoId().withMessage('ID inválido'), // o isInt() si usas SQL
  
  body('name')
    .optional()
    .trim()
    .isString().withMessage('El nombre debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El nombre solo debe contener letras y espacios')
    .isLength({ min: 3, max: 50 }).withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .toLowerCase()// Todo a minúsculas: "JuAN" -> "juan"
    .customSanitizer(value => {
      // Capitaliza: primera letra mayúscula: "juan" -> "Juan"
      return value.charAt(0).toUpperCase() + value.slice(1);
    }),

  body('lastName')
    .optional()
    .trim()
    .isString().withMessage('El apellido debe ser un texto')
    .isAlpha('es-ES', { ignore: ' ' }).withMessage('El apellido solo debe contener letras y espacios')
    .isLength({ min: 3, max: 50 }).withMessage('El apellido debe tener entre 3 y 50 caracteres')
    .toLowerCase()// Todo a minúsculas: "JuAN" -> "juan"
    .customSanitizer(value => {
      // Capitaliza: primera letra mayúscula: "juan" -> "Juan"
      return value.charAt(0).toUpperCase() + value.slice(1);
    }),
  
  body('email')
    .optional()
    .isEmail().withMessage('Debe ser un email válido')
    .normalizeEmail(),

  body('age')
    .optional()
    .isInt({ min: 0 }).withMessage('La edad debe ser un número entero positivo'),
  
  handleValidationErrors
];

// Validaciones para parámetros de ruta
const validateId = (paramName = 'id') => {
  return [
    param(paramName)
      .exists().withMessage(`El parámetro ${paramName} es requerido`)
      .isMongoId().withMessage(`El ${paramName} no es válido`),
      
    handleValidationErrors
  ]
}

module.exports = {
    validateCreateUser,
    validateUpdateUser
}