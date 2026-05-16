const express = require('express')
const { Router } = express
const router = new Router()
const { auth } = require('../middlewares/sessions.middleware.js')

const { getTicket, getTicketByIDCart } = require('../controllers/ticket.controller.js')

router.get("/", auth, getTicket)
router.get("/filter", auth, getTicketByIDCart)


module.exports = router