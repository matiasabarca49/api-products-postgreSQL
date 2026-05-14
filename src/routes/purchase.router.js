const express = require('express')
const { getPurchasesFromUser, checkout } = require('../controllers/purchase.controller')
const { auth } = require('../middlewares/sessions.middleware')
const { authorizeRoles } = require('../middlewares/permissions.middleware')
const { Router } = express
const router = new Router()

/**
 *  Realizar la compra del carrito del usuario logueado.
 *  Se debe estar logueado para poder realizar la compra.
 *  El proceso de compra incluye:
 *      - Verificar stock de los productos en el carrito
 *      - Crear un registro de compra con los productos y cantidades comprados
 *      - Vaciar el carrito del usuario
 *      - Decrementar el stock de los productos comprados
 * @route   GET /api/purchases/checkout
 * @access  Private (users, pero deben estar logueados)
 * @query   {number} [page=1] - Número de página
 * @query   {number} [limit=10] - Cantidad de registros por página
 * @query   {string} [sort=id] - Campo por el cual ordenar
 * @middleware auth verificar que el usuario esté logueado antes de permitir el acceso a esta ruta.
 * @middleware authorizeRoles (Autorizacion)
 */
router.get("/checkout", auth, authorizeRoles('user', 'premium'),checkout)

/**
 * Obtener las compras del usuario logueado con paginación.
 * @route   GET /api/purchases/me
 * @access  Private (users, pero deben estar logueados)
 * @query   {number} [page=1] - Número de página
 * @query   {number} [limit=10] - Cantidad de registros por página
 * @query   {string} [sort=id] - Campo por el cual ordenar
 * @middleware checkLogin para verificar que el usuario esté logueado antes de permitir el acceso a esta ruta.
 */
router.get("/me", auth, authorizeRoles("user", "premium"),getPurchasesFromUser)


module.exports = router