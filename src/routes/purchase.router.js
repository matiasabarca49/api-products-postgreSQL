const express = require('express')
const { purchase, getPurchasesFromUser, checkout } = require('../controllers/purchase.controller')
const { checkLogin } = require('../middlewares/sessions.middleware')
const { Router } = express
const router = new Router()

router.get("/checkout", checkLogin, checkout)
router.get("/me", checkLogin, getPurchasesFromUser)


module.exports = router