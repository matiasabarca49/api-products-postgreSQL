const express = require('express')
const { Router } = express
const router = new Router()
const { auth } = require('../middlewares/sessions.middleware.js')

const { getTicket, getTicketByIDCart } = require('../controllers/ticket.controller.js')

/**
 * @route GET /api/ticket
 * @description Conseguir un ticket por su código
 * @access Private
 * @middleware auth
 */
router.get("/", auth, getTicket)
//router.get("/filter", auth, getTicketByIDCart)


module.exports = router