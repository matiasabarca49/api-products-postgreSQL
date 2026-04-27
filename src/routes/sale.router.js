const express = require('express');
const { findAll } = require('../controllers/sale.controller');
const { Router } = express;
const router = new Router();


router.get("/", findAll);

module.exports = router;