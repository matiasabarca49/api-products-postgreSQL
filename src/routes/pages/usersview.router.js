const express = require('express')
const { Router } = express
const router = new Router()
//middleware
const { voidLogAndRegis, checkLogin } = require('../../middlewares/sessions.middleware.js')
//Controllers
const {getLogin, getRegister, getPerfil, getFail, getChangePassword, getGeneratePassword} = require('../../controllers/pages/sessions.pages.controller.js')
const { getUpgradeUser } = require('../../controllers/pages/users.pages.controller.js')


router.get("/login",voidLogAndRegis ,getLogin)
router.get("/register",voidLogAndRegis , getRegister)
router.get("/profile", checkLogin, getPerfil)
router.get("/fail", getFail)
router.get("/forgetpassword", getChangePassword)
router.get("/generatepassword", getGeneratePassword)
router.get("/upgrade", getUpgradeUser)

module.exports = router