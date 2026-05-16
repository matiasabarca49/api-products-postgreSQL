const express = require('express');
const { findAll, changeState } = require('../controllers/sale.controller');
const { auth } = require('../middlewares/sessions.middleware');
const { authorizeRoles } = require('../middlewares/permissions.middleware');
const { validateUpdateState } = require('../validations/sale.validations');
const { Router } = express;
const router = new Router();

/**
 * @route GET /api/sales 
 * @description Obtener ventas de un usuario
 * @access Private(premium, admin)
 * @middleware auth(autenticacion)
 * @middleware authorizedRoles(autenticacion)
 */
router.get("/", auth, authorizeRoles("admin", "premium"), findAll);

/**
 * @route PUT /api/sales/states
 * @description Cambiar el estado de una venta
 * @access Private(premium, admin)
 * @middleware auth(autenticacion)
 * @middleware authorizedRoles(autenticacion)
 */
router.put("/states/", auth, authorizeRoles("admin", "premium"), validateUpdateState, changeState)

module.exports = router;