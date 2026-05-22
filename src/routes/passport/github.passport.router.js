const express = require('express')
const passport = require('passport');
const { getGithubCallback } = require('../../controllers/passport/github.passport.controller');
const { Router } = express
const router = new Router()

const {isGithubEnabled} = require('../../config/env.config.js')

if(!isGithubEnabled()){
  router.get('/github', (req, res) => {
    res.status(503).json({status: "error", message: "Autenticación con GITHUB no disponible"})
  });
}else{
  router.get('/github',
    passport.authenticate('auth-github', { scope: [ 'user:email' ] }));
  
  router.get('/github/callback', 
    passport.authenticate('auth-github', { failureRedirect: "/api/sessions/fail?error=github" }),
    getGithubCallback);
}

module.exports = router