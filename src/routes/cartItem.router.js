const express = require('express');
const { getCartItemsByUser, addProductToCart, removeProductFromCart, getCantItemsInCart } = require('../controllers/cartItem.controller');
const { checkLogin } = require('../middlewares/sessions.middleware');
const { Router } = express
const router = new Router()

router.get("/", checkLogin, getCartItemsByUser);
router.get("/cant", checkLogin, getCantItemsInCart);
router.post("/add", checkLogin, addProductToCart);
router.delete("/remove/:id", checkLogin, removeProductFromCart);



module.exports = router;