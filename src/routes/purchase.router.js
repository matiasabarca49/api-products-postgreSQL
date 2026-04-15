const express = require('express')
const { purchase, getPurchasesFromUser } = require('../controllers/purchase.controller')
const { checkLogin } = require('../middlewares/sessions.middleware')
const { Router } = express
const router = new Router()

router.get("/checkout", checkLogin, purchase)
router.get("/me", getPurchasesFromUser)


module.exports = router