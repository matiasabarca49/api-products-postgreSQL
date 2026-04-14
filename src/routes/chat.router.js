const express = require('express')
const { Router } = express
//controllers
const { getChatPage } = require('../controllers/chat.controller')

const router = new Router()

//middleware
const { checkPerChat } = require('../middlewares/permissions.middleware.js')


/**
* GET
*/
router.get("/", checkPerChat,getChatPage)

module.exports = router