const UsersService = require('../service/users.service.js')
const usersService = new UsersService()

const getLogout = async (req, res) =>{
    try{
        if(req.session.passport?.user) await usersService.updateLastConnection(req.session.passport.user)
        req.session.destroy( async err =>{
            if(!err) res.redirect("/users/login")
            else res.status(500).send({status: "ERROR"})
        })
    }catch(error){ 
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/logout" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al cerrar la sesión. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}


const getUserCurrent = (req, res) =>{
    try{

        const user = {
            id: req.session.idUser,
            name: req.session.user,
            last_name: req.session.last_name,
            email: req.session.email,
            rol: req.session.rol,
            age: req.session.age,
            last_connection: req.session.last_connection
        }

        return res.status(200).send({success: true, data: user})

    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/current" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al obtener el usuario actual. EL error es:\n
        ${error}`)
        return res.status(500).send({success: false , error: "Error al obtener el usuario"})
    }
}

const registerUser = (req, res) =>{
    try{
        res.redirect("/users/login")
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/register" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al registrar el usuario. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

//En esta funcion se asume que si se ejecuta es porque se logró el proceso de autenticación, por lo tanto, se asigna la session y se redirige dependiendo del rol del usuario
const loginUser = async (req, res)=>{
    try{
        //Si se ejecuta la funcion es porque se logró el proceso de autenticación
        const userFound = req.user
        req.session.idUser = userFound.id
        req.session.user = userFound.name
        req.session.last_name = userFound.last_name
        req.session.email = userFound.email
        req.session.age = userFound.age
        req.session.rol = userFound.rol
        req.session.last_connection = userFound.last_connection
        
        if(req.session.rol === "Admin"){
            res.redirect("/admin")
        }else{
            res.redirect("/")
        }
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/sessions/login" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al loguear el usuario. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

module.exports = {
    getLogout,
    getUserCurrent,
    registerUser, 
    loginUser
}