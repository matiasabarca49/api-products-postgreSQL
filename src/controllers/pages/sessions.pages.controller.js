const sessionsService = require('../../service/session.service.js')


/**
 * En este controlador se manejan las vistas relacionadas con las sesiones, 
 * como el registro, login, perfil, recuperación de contraseña. 
 * No se manejan procesos de autenticación o lógica de negocio relacionada con las sesiones, 
 * ya que eso se maneja en el controlador de sesiones y en el servicio de sesiones respectivamente.
 */

const getRegister = (req, res, next) =>{
    try{
        res.render("register");
    }catch(error){
        next(error);
    }
}

const getLogin = async (req, res, next) =>{
    try{
        res.render("login");
    }catch(error){
        next(error);
    }
}

const getPerfil = async (req, res, next) =>{
    try{
        res.render("perfil", {userLoged: req.session});
    }catch(error){
        next(error);
    }
}

const getChangePassword = (req,res, next)=>{
    try{
        res.render('forgetPassword')
    }catch(error){
        next(error);
    }
}

const getGeneratePassword = async (req,res, next)=>{
    try{
        const {secret, email} = req.query;
        const secretFound = await sessionsService.verifySecret(secret, email);
        secretFound
            ?res.render('generatePassword')
            :res.render('forgetPassword')
    }catch(error){
        next(error);
    }
} 

const getFail = (req,res, next)=>{
    try{
        const {error} = req.query
        error === "register" && res.render("register", {error: true})
        error === "login" && res.render("login", {error: true})
        error === "github" && res.render("login", { githubError: true })
    }catch(error){
        next(error);
    }
}

module.exports = {
    getRegister,
    getLogin,
    getPerfil,
    getFail,
    getChangePassword,
    getGeneratePassword
}