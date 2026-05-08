const { handleValidationErrors } = require("../middlewares/validations.middleware")
const { body, param } = require('express-validator');


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
    body('category')
        .exists().withMessage('La categoría es requerida')
        .notEmpty().withMessage('La categoría no puede estar vacía')
        .isString().withMessage("Debe ser un string"),
    body('thumbnail')
        .optional()
        .isString().withMessage('La miniatura debe ser una URL válida')
        .trim(),
        
    handleValidationErrors
]

const validateUpdateProduct = [
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
    body('category')
        .exists().withMessage('La categoría es requerida')
        .notEmpty().withMessage('La categoría no puede estar vacía o nula')
        .isString().withMessage("Debe ser un string"),
    body('thumbnail')
        .optional()
        .isString().withMessage('La miniatura debe ser una URL válida')
        .trim(),
    
    handleValidationErrors
]

const validateComment = [
    body('product_id')
        .exists().withMessage('La referencia al producto es necesaria')
        .notEmpty().withMessage('No puede estar vacío')
        .trim(),
    body('rating')
        .exists().withMessage('El rating es requerido')
        .notEmpty().withMessage('No puede estar vacío')
        .isInt({ min: 1 , max: 5}).withMessage('Debe ser un número entero mayor o igual a 1 y menor o igual a 5')
        .trim(),
    body('comment')
        .exists().withMessage('El comment es requerido')
        .notEmpty().withMessage('No puede estar vacío')
        .isString().withMessage('Debe ser un texto')
        .isLength({ min: 20, max: 170 }).withMessage('El comentario debe tener entre 20 y 100 caracteres')
        .trim(),

    handleValidationErrors
]



// Validaciones para parámetros de ruta
const validateId = (paramName = 'id') => {
  return [
    param(paramName)
      .exists().withMessage(`El parámetro ${paramName} es requerido`)
      .isInt().withMessage(`El ${paramName} no es válido`),
      
    handleValidationErrors
  ]
}

module.exports = {
    validateProduct,
    validateUpdateProduct,
    validateComment,
    validateId
}