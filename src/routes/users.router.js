const express = require('express')
const { Router } = express
const router = new Router()
//Multer
const uploader = require('../utils/multer.js')
//controllers
const { getAll, updateRol, addProductToCart, addDocument, deleteUser, deleteInactiveUser, removeProductFromCart, create, update } = require('../controllers/users.controller.js')
//middleware
const {checkPerAdmCart, CheckPerRol, checkPermAdmin} = require('../middlewares/permissions.middleware.js')
const { validateCreateUser, validateUpdateUser, validateId } = require('../validations/user.validation.js')


/**
*   GET 
**/
router.get("/",checkPermAdmin ,getAll)

/**
*   POST 
**/
router.post('/', validateCreateUser, create)
/* router.post( '/addcart', checkPerAdmCart, addProductToCart) */
router.post( '/:uid/documents',uploader.single('file'),addDocument)
    
/**
*   PUT 
**/
router.put('/premium/:uid', CheckPerRol, updateRol)
/* router.put('/:uid', checkPermAdmin, validateUpdateUser, update) */
router.put('/:uid', checkPermAdmin, update);

/**
*   DELETE
**/
router.delete("/:id", CheckPerRol, deleteUser)
router.delete("/delete/withoutconnection", CheckPerRol, deleteInactiveUser)

module.exports = router