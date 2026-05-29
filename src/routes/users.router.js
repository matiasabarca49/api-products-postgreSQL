const express = require('express')
const { Router } = express
const router = new Router()
//Multer
const uploader = require('../utils/multer.js')
//controllers
const { getAll, updateRol, addDocument, deleteUser, deleteInactiveUser, create, update, getAdreddess, upgradeUser } = require('../controllers/users.controller.js')
//middleware
const {checkPerAdmCart, CheckPerRol, checkPermAdmin, authorizeRoles} = require('../middlewares/permissions.middleware.js')
const { validateCreateUser, validateUpdateUser, validateId, validateUpgradeUserToPremium } = require('../validations/user.validation.js')
const { checkLogin, auth } = require('../middlewares/sessions.middleware.js')


/**
*   GET 
**/

/**
 * @route GET /api/users
 * @description Obtener los usuarios del sistema
 * @access Private (Admin)
 * @middleware auth (Autenticacion)
 * @middleware authRoles (Autorizacion) 
 */
router.get("/", auth, authorizeRoles("admin") ,getAll)


/**
 * @route GET /api/users/addressess
 * @description Obtener direcciones de usuario del sistema
 * @access Private (Todos los usuarios)
 * @middleware auth (Autenticacion)
 */
router.get("/addresses", auth, getAdreddess);

/**
*   POST 
**/

/**
 * @route POST /api/users/
 * @description Crear usuario del sistema
 * @access Private (Admin)
 * @middleware auth (Autenticacion)
 * @middleware authorizeRoles (Autorización)
 * @middleware validateCreateUser (Validación)
 */
router.post('/', auth , authorizeRoles("admin"), validateCreateUser, create)
//router.post( '/:uid/documents',uploader.single('file'),addDocument)

/**
 *   PUT 
**/

/**
 * @route PUT /api/users/upgrade
 * @description Subir de rol a un usuario user -> premium
 * @access Private (user)
 * @middleware auth (Autenticacion)
 * @middleware authorizeRoles (Autorización)
 * @middleware validateUpgradeUserToPremium (Validación)
 */
router.put("/upgrade", auth, authorizeRoles("user"), validateUpgradeUserToPremium, upgradeUser);


/**
 * @route PUT /api/users/:uid
 * @description Actualizar un usuario
 * @access Private (Todos los usuarios)
 * @parama uid ID de usuario a actualizar
 * @middleware auth (Autenticacion)
 * @middleware validateUpdateUser(Validación)
 */
router.put('/:uid', auth, validateUpdateUser, update);

/**
*  DELETE
**/

/**
 * @route DELETE /api/users/:id
 * @description Actualizar un usuario
 * @access Private (Admin)
 * @parama id ID de usuario a eliminar
 * @middleware auth (Autenticacion)
 * @middleware validateUpdateUser(Validación)
 */
router.delete("/:id", auth, authorizeRoles("admin"), deleteUser)

//router.delete("/delete/withoutconnection", CheckPerRol, deleteInactiveUser)

module.exports = router