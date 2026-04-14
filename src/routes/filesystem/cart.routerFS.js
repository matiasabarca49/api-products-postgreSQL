const express = require('express')
const CartManager = require('../dao/fileManager/ProductManager')


const { Router } = express

const router = new Router()

const cartManager = new CartManager('./data/carts.json')

/** 
 *  GET
 **/

router.get("/:cid", (req,res)=>{
    const cart = cartManager.getCart(req.params.cid)
    if (cart){
        res.send({status:"Success", cart: cart})
    } else{
        res.send({status:"Error", reason: "No existe carrito con ese id"})

    }
})

/** 
 *  POST
 **/

router.post("/", (req, res) =>{
    cartManager.addCart(req.body)
    res.send({status: "Success", producto: req.body})
})

router.post("/:cid/product/:pid", (req,res) => {
    const productAdded = cartManager.addProductToCart(req.params.cid, req.params.pid)
    productAdded
        ?res.send({status: "Success", product: productAdded})
        :res.send({status: "Error", reason: "El carrito no existe"})
})


module.exports = router