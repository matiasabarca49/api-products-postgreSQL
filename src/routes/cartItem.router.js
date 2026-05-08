const express = require('express');
const { getCartItemsByUser, addProductToCart, removeProductFromCart, getCantItemsInCart } = require('../controllers/cartItem.controller');
const { auth } = require('../middlewares/sessions.middleware');
const { authorizeRoles } = require('../middlewares/permissions.middleware');
const { validateCreateCartItem } = require('../validations/cartItems.validations');
const { Router } = express
const router = new Router()

/**
 * GET /api/cartItems
 *
 * Devuelve el carrito actual del usuario.
 *
 * No usamos offset/limit: con carrito en tiempo real
 */
router.get("/", auth, authorizeRoles("user", "premium"), getCartItemsByUser);

/**
 * GET /api/cartItems/cant
 *
 * Devuelve la cantidad de productos en el carrito del usuario.
 * Se retorna un número
 *
 */
router.get("/cant", auth, authorizeRoles("user", "premium"),getCantItemsInCart);

/**
 * POST /api/cartITems/add
 *
 * Agrega un producto al carrito del usuario.
 * Se debe estar logueado para poder agregar un producto al carrito.
 *
 * Body: { product_id: number, quantity: number }
 * Response: 200 { data: CartITemDTO }
 */
router.post("/add", auth, authorizeRoles("user", "premium"), validateCreateCartItem, addProductToCart);


/**
 * DELETE /api/cartITems/remove/:id
 *
 * Eliminar un producto del carrito del usuario.
 *
 * Param: { id: number }
 * Response: 200 { message: string }
 */
router.delete("/remove/:seller_product_id", auth, removeProductFromCart);



module.exports = router;