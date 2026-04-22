const sessionsService = require('../service/session.service.js');

const getLogout = async (req, res, next) =>{
    try{
        if(req.session.passport?.user) await sessionsService.updateLastConnection(req.session.idUser) //Actualizamos la fecha de la última conexión del usuario
        //Destruimos la session y redirigimos al login
        req.session.destroy( async err =>{
            if(!err) res.redirect("/users/login")
            else res.status(500).json({success: false, message: "Error al cerrar sesión"})
        })
    }catch(error){ 
        next(error);
    }
}


const getUserCurrent = (req, res, next) =>{
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

        return res.status(200).json({success: true, data: user})

    }catch(error){
       next(error);
    }
}

const registerUser = (req, res, next) =>{
    try{
        res.redirect("/users/login")
    }catch(error){
        next(error);
    }
}

//En esta funcion se asume que si se ejecuta es porque se logró el proceso de autenticación, por lo tanto, se asigna la session y se redirige dependiendo del rol del usuario
const loginUser = async (req, res, next)=>{
    try{
        //Obtenemos los datos del usuario autenticado
        const userFound = req.user
        //Asignamos la session con los datos del usuario
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
        next(error);
    }
}


const recoverPass = async (req, res, next)=>{
    try {
        const userMail = req.body.mail;
        
        await sessionsService.recoverPass(userMail);
        
        return res.status(400).json({success: true, message: "Si el correo existe en nuestra base de datos, se ha enviado un email con las instrucciones para recuperar la contraseña"})
    } catch (error) {
        next(error);
    }
}

const updatePassword =  async (req, res, next)=>{
    try {
        const {secret, email} = req.query;
        const password = req.body.password;
        await sessionsService.updatePassword(secret, email, password);
        return res.status(200).redirect("/users/login")
    } catch(error) {
        next(error);
    }
    
}

module.exports = {
    getLogout,
    getUserCurrent,
    registerUser, 
    loginUser,
    recoverPass,
    updatePassword
}