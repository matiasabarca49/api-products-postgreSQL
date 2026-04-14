const express = require('express')
const { Router } = express
const router = new Router()
const { sendMailPurchase, sendMailRecoverPass, updatePassword} = require('../controllers/mail.controller')

//Recuperación de Constraseña
router.post("/sendmailpass", sendMailRecoverPass)
router.post("/changepassword", updatePassword)
router.post("/send/mail", sendMailPurchase)




module.exports = router