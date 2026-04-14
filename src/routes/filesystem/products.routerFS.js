const express = require('express')
const ProductManager = require("../dao/fileManager/ProductManager")

//Desestructuramos el objeto para obtener el constructor de Rutas
const { Router } = express
//Creamos una nueva instancia de Router
const router = new Router()

const productManager = new ProductManager("./data/products.json")


/**
* GET
**/
router.get("/", (req,res) =>{
    const products = productManager.getProducts()
    if (req.query.limit){
        products.splice(req.query.limit)
    }
    res.send({productos: products})
})


router.get("/:id", (req,res) =>{
    const products = productManager.getProducts()
    const productFound = products.find( product => product.id === parseFloat(req.params.id))
    productFound
        ? res.send({status: "Success", producto: productFound})
        : res.send({status: "Error", reason: "Producto no encontrado"})
})

/**
* POST
**/

router.post("/", (req, res) =>{
    console.log(req.body)
    const productAdded = productManager.addProduct(req.body)
    productAdded
        ?res.send({status: "Success", action: "Producto creado correctamente", producto: req.body})
        :res.send({status: "Error", action: 'Campos Faltantes, mal escritos o  campo code repetido'})
})

/**
* PUT
*/

router.put("/:id", (req,res)=>{
   const productUpdated =  productManager.updateProduct( req.params.id, req.body )
   productUpdated
    ? res.send({status: "Success", action: "Producto actualizado correctamente", product: productUpdated})
    : res.send({status: "Error", reason: "Al producto le faltan campos o no existe "})
    
})

/**
* DELETE
*/

router.delete("/:id", (req,res) => {
    const productDelete = productManager.deleteProduct(req.params.id)
    productDelete
     ?res.send({status: "Success", action: "Producto borrado correctamente", product: productDelete})
     :res.send({status: "Error", reason: "El producto no existe"})
})


module.exports = router