const express = require('express')
//controllers
const {getProducts, getById, create, addManyProducts, update, deleteProduct, getManageableProducts} = require('../controllers/products.controller.js')
//middleware
const { checkPerAddProduct, checkPermAdminAndPremium } = require('../middlewares/permissions.middleware.js')
const { validateProduct, validateId, validateUpdateProduct } = require('../middlewares/validations.middleware.js')

//Desestructuramos el objeto para obtener el constructor de Rutas
const { Router } = express
//Creamos una nueva instancia de Router
const router = new Router()


/**
* GET
**/
router.get("/", getProducts)
router.get("/admin",getManageableProducts)
/* router.get("/admin", checkPermAdminAndPremium ,getManageableProducts) */
/* router.get("/search", getSearchProducts) */
/* router.get("/:id", validateId('id'), getById) */
router.get("/:id", getById)

/**
* POST
**/
/* router.post("/", checkPerAddProduct, validateProduct, create) */
router.post("/", validateProduct, create);
router.post("/manyproducts", checkPerAddProduct, addManyProducts)

/**
* PUT
*/
/* router.put("/:id", checkPerAddProduct, validateUpdateProduct, update) */
router.put("/:id", update);

/**
* DELETE
*/
/* router.delete("/:id", checkPerAddProduct, validateId('id'), deleteProduct) */
router.delete("/:id", deleteProduct);


module.exports = router