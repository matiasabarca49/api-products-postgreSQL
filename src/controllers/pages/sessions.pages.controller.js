const { searchSecret } = require("../../utils/utils")

const getRegister = (req, res) =>{
    try{
        res.render("register")  
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/register" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cargar la vista de registro. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

const getLogin = async (req, res) =>{
    try{
        res.render("login")
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/login" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cargar la vista de login. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

const getPerfil = async (req, res) =>{
    try{
        res.render("perfil", {userLoged: req.session})
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/perfil" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cargar la vista de perfil. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

const getChangePassword = (req,res)=>{
    try{
        res.render('forgetPassword')
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/users/changepassword" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cargar la vista de cambio de contraseña. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

const getGeneratePassword = (req,res)=>{
    try{
        const secretFound = searchSecret(req.query.secret, req.query.email)
        secretFound
            ?res.render('generatePassword')
            :res.render('forgetPassword')
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/users/generatepassword" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cargar la vista de generar nueva contraseña. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
} 

const getFail = (req,res)=>{
    try{
        const {error} = req.query
        error === "register" && res.render("register", {error: true})
        error === "login" && res.render("login", {error: true})
        error === "github" && res.render("login", { githubError: true })
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/users/fail" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cargar la vista de fallo de autenticación. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
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