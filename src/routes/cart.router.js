const express = require('express')
//controllers
const controller = require('../controllers/cart.controller.js')

const { Router } = express
const router = new Router()

//middleware
const { checkPerCart,checkPerAdmCart, checkPermAdmin } = require('../middlewares/permissions.middleware.js')


/** 
 *  GET
 **/
//Obtener el carritos por ID
router.get("/", checkPermAdmin, controller.findAll);
//Obtener el carritos por ID
router.get("/:cid", checkPerCart, controller.getCartByID )
//Realiza la compra de los productos almacenados en el carrito del usuario
router.get("/:cid/purchase", checkPerAdmCart, controller.completeCartPurchase)

/** 
 *  POST
 **/
//Agrega un cart a la DB(/api/carts/). Para agregar productos al usuario revise su enpoint(/api/users/addcart)
router.post("/", checkPerAdmCart,controller.addCart)
router.post("/:cid/product/:pid", checkPerAdmCart,controller.addProductInCart)

/** 
 *  PUT
 **/
router.put("/:cid", checkPerCart,controller.updateFullCartInDB)
router.put("/:cid/product/:pid", checkPerAdmCart,controller.updateProductCartInDB)

/** 
 *  DELETE
 **/
router.delete("/:cid/product/:pid", checkPerAdmCart,controller.deleteProductInCart )
router.delete("/:cid", checkPerCart, controller.deleteFullCart)


module.exports = router