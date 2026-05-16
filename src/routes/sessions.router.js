const express = require('express')
const passport = require('passport')
const { Router } = express
const router = new Router()
//middleware
const { checkLogin, auth } = require('../middlewares/sessions.middleware.js')
//controllers
const controller = require('../controllers/sessions.controller.js')

/**
* GET 
**/

/**
 * @route GET /api/sessions/logout
 * @description Desconectar la session del usuario
 * @access Private (usuarios autenticados)
 * @middleware auth
 */
router.get("/logout", auth, controller.getLogout)

/**
 * @route GET /api/sessions/logout
 * @description Obtener usuario actual
 * @access Private (usuarios autenticados)
 * @middleware auth
 */
router.get("/current", auth, controller.getUserCurrent)

/**
* POST 
**/

/**
 * @route POST /api/sessions/register
 * @description Registrar un usuario
 * @access Public 
 */
router.post("/register", passport.authenticate('register',{failureRedirect: "/users/fail?error=register"}),
controller.registerUser) 

/**
 * @route POST /api/sessions/register
 * @description Login un usuario
 * @access Public 
 */
router.post("/login", passport.authenticate("login", {failureRedirect: "/users/fail?error=login"}),
controller.loginUser)

/**
 * @route POST /api/sessions/recoverpass
 * @description El usuario solicitó el cambio de contraseña. Si es correcto se enviaŕa un mail
 * @access Public 
 */
router.post("/recoverpass", controller.recoverPass)

/**
 * @route POST /api/sessions/changepassword
 * @description Actualizar la contraseña nueva del usuario
 * @access Public 
 */
router.post("/changepassword", controller.updatePassword)
  
module.exports = router