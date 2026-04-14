const express = require('express')
const passport = require('passport')
const { Router } = express
const router = new Router()
//middleware
const { checkLogin } = require('../middlewares/sessions.middleware.js')
//controllers
const controller = require('../controllers/sessions.controller.js')

/**
* GET 
**/
router.get("/logout", controller.getLogout)
router.get("/current", checkLogin, controller.getUserCurrent)

/**
* POST 
**/
router.post("/register", passport.authenticate('register',{failureRedirect: "/users/fail?error=register"}),
controller.registerUser) 
router.post("/login", passport.authenticate("login", {failureRedirect: "/users/fail?error=login"}),
controller.loginUser)
  
module.exports = router