const express = require('express');
const { findAll, changeState } = require('../controllers/sale.controller');
const { Router } = express;
const router = new Router();


router.get("/", findAll);
router.put("/states/", changeState)

module.exports = router;