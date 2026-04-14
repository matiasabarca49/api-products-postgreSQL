const express = require('express')
const { Router } = express
const router = new Router()

//middleware
const {checkLogin} = require("../../middlewares/sessions.middleware.js")
const { checkPermAdmin, checkPermAdminAndPremium } = require('../../middlewares/permissions.middleware.js')
//Controller
const { getUsersPageController } = require('../../controllers/pages/users.pages.controller.js')

//routes
router.get("/", checkLogin, checkPermAdmin, getUsersPageController)

router.get("/products", checkPermAdminAndPremium ,(req,res)=>{
    res.render("admProducts", {userLoged: req.session})
})

router.get( "/products/add", checkPermAdminAndPremium, (req,res) => {
    res.render('realTimeProducts', {rol: req.session.rol, userLoged: req.session})
})

router.get("/users", checkPermAdmin ,async (req, res)=>{
    res.render("users", {userLoged: req.session})
})

router.get("/carts", checkPermAdmin,(req,res)=>{
    res.render("cartview", {userLoged: req.session})
})

module.exports = router

