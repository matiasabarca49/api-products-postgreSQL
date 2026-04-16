const express = require('express')
//controllers
const {getProducts, getById, create, update, deleteProduct, getManageableProducts} = require('../controllers/products.controller.js')
//middleware
const { checkPerAddProduct, checkPermAdminAndPremium, checkPermAdmin } = require('../middlewares/permissions.middleware.js')
const { validateProduct, validateId, validateUpdateProduct } = require('../validations/product.validations.js')

//Desestructuramos el objeto para obtener el constructor de Rutas
const { Router } = express
//Creamos una nueva instancia de Router
const router = new Router()


/**
* GET
**/
router.get("/", getProducts)
router.get("/admin",checkPermAdmin, getManageableProducts)
router.get("/:id",getById)

/**
* POST
**/
router.post("/", checkPerAddProduct, validateProduct, create)

/**
* PUT
*/
/* router.put("/:id", checkPerAddProduct, validateUpdateProduct, update) */
router.put("/:id", checkPermAdminAndPremium, update);

/**
* DELETE
*/
/* router.delete("/:id", checkPerAddProduct, validateId('id'), deleteProduct) */
router.delete("/:id", checkPermAdminAndPremium, deleteProduct);


module.exports = router