const express = require('express')
//controllers
const controller = require('../controllers/cart.controller.js')

const { Router } = express
const router = new Router()

//middleware
const { checkPermAdmin, authorizeRoles } = require('../middlewares/permissions.middleware.js')
const { auth } = require('../middlewares/sessions.middleware.js')


/** 
 *  GET
 **/

/**
 * @route   GET /api/carts
 * @desc    Obtener lista paginada de carritos con filtros
 * @access  Private (Admin)
 * @query   {number} [page=1] - Número de página
 * @query   {number} [limit=10] - Cantidad de registros por página
 * @query   {string} [sort=id] - Campo por el cual ordenar
 * @query   {string} [order=asc] - Dirección del orden (asc/desc)
 * @middleware auth (Autenticación)
 * @middleware authorizeRoles (Autorizacion)
 */
router.get("/", auth, authorizeRoles("admin"), controller.findAll);

/**
 * @route   GET /api/carts/:cid
 * @desc    Obtener carrito por id
 * @access  Private (Admin)
 * @middleware auth (Autenticación)
 * @middleware authorizeRoles (Autorizacion)
 */
router.get("/:cid", auth, authorizeRoles("admin"), controller.getCartByID )

module.exports = router