const express = require('express')
const { purchase } = require('../controllers/purchase.controller')
const { checkLogin } = require('../middlewares/sessions.middleware')
const { Router } = express
const router = new Router()

router.get("/", checkLogin, purchase)


module.exports = router