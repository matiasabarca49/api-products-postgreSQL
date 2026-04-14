const express = require('express')
const { Router } = express
const router = new Router()
const { getMockProducts } = require('../controllers/mocks.controller.js')

router.get("/", getMockProducts)

module.exports = router