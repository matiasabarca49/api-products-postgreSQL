const { body, param, query, validationResult, checkExact } = require('express-validator');

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

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
    .isIn(['User', 'Premium', 'Admin']).withMessage('El rol debe ser User, Premium o Admin'),
  
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

/**
 * Productos
 */


const validateProduct = [
    body('title')
        .exists().withMessage('El título es requerido')
        .notEmpty().withMessage('El título no puede estar vacío')
        .isString().withMessage('El título debe ser un texto')
        .trim()
        .isLength({ min: 4, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres'),
    body('description')
        .exists().withMessage('El título es requerido')
        .notEmpty().withMessage('El título no puede estar vacío')
        .isString().withMessage('El título debe ser un texto')
        .trim()
        .isLength({ min: 4, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres'),
    body('price')
        .exists().withMessage('El precio es requerido')
        .notEmpty().withMessage('El precio no puede estar vacío')
        .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor que 0'),
    body('code')
        .exists().withMessage('El código es requerido')
        .notEmpty().withMessage('El código no puede estar vacío')
        .isString().withMessage('El código debe ser un texto')
        .trim()
        .isLength({ min: 5, max: 20 }).withMessage('El código debe tener entre 3 y 20 caracteres'),
    body('stock')
        .exists().withMessage('El stock es requerido')
        .notEmpty().withMessage('El stock no puede estar vacío')
        .isInt({ min: 1 }).withMessage('El stock debe ser un número entero mayor o igual a 1'),
    body('status')
         .exists().withMessage('El estado es requerido')
        .isBoolean().withMessage('El estado debe ser true o false'),
    /* body('category')
        .exists().withMessage('La categoría es requerida')
        .notEmpty().withMessage('La categoría no puede estar vacía')
        .isIn(["Tecnología", "Ropa", "Bazar","Accesorios","Calzado"]).withMessage('Categoría inválida'), */
    body('thumbnail')
        .optional()
        .isString().withMessage('La miniatura debe ser una URL válida')
        .trim(),
    body('owner')
        .exists().withMessage('El propietario es requerido')
        .notEmpty().withMessage('El propietario no puede estar vacío')
        .isString().withMessage('El propietario debe ser un texto')
        .trim(),
        
    handleValidationErrors
]

const validateUpdateProduct = [
    param('id')
        .isMongoId().withMessage('ID inválido'),
    body('title')
        .exists().withMessage('El título es requerido')
        .notEmpty().withMessage('El título no puede estar vacío')
        .isString().withMessage('El título debe ser un texto')
        .trim()
        .isLength({ min: 4, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres'),
    body('description')
        .exists().withMessage('El título es requerido')
        .notEmpty().withMessage('El título no puede estar vacío')
        .isString().withMessage('El título debe ser un texto')
        .trim()
        .isLength({ min: 4, max: 100 }).withMessage('El título debe tener entre 5 y 100 caracteres'),
    body('price')
        .exists().withMessage('El precio es requerido')
        .notEmpty().withMessage('El precio no puede estar vacío')
        .isFloat({ gt: 0 }).withMessage('El precio debe ser un número mayor que 0'),
    body('stock')
        .exists().withMessage('El stock es requerido')
        .notEmpty().withMessage('El stock no puede estar vacío')
        .isInt({ min: 1 }).withMessage('El stock debe ser un número entero mayor o igual a 1'),
    body('category')
        .exists().withMessage('La categoría es requerida')
        .notEmpty().withMessage('La categoría no puede estar vacía')
        .isIn(["Tecnología", "Ropa", "Bazar","Accesorios","Calzado"]).withMessage('Categoría inválida'),
    
    handleValidationErrors
]


module.exports = {
  validateId,
  validateCreateUser,
  validateUpdateUser,
  validateProduct,
  validateUpdateProduct
};