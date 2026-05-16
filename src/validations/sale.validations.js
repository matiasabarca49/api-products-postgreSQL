const { body } = require("express-validator");
const { handleValidationErrors } = require("../middlewares/validations.middleware");

const validateUpdateState = [
    body("ids")
       .notEmpty().withMessage("Se necesita el o los ids para actualizar")
       .isArray().withMessage("Debe ser un array"),
    body("status")
        .notEmpty().withMessage("Se necesita el estado")
        .isString().withMessage("Debe ser un string")
        .isIn(['pending', 'processed', 'shipped', 'delivered', 'cancelled', 'approved'])
        .withMessage('status no valido'),
    handleValidationErrors
]


module.exports = {
    validateUpdateState
}