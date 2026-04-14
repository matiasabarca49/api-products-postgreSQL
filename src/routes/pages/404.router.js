const express = require('express')
const { Router } = express
const router = new Router()

router.get('/', (req,res)=>{
    res.render('404')
})


module.exports = router

