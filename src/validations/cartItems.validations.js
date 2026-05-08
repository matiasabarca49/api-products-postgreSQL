const { handleValidationErrors } = require("../middlewares/validations.middleware");
const { body } = require('express-validator');

const validateCreateCartItem = [
    body('seller_product_id')
        .exists().withMessage('El título es requerido')
        .notEmpty().withMessage('El título no puede estar vacío')
        .isInt().withMessage('El título no puede estar vacío'),
    
    handleValidationErrors
]

module.exports = {
    validateCreateCartItem 
}