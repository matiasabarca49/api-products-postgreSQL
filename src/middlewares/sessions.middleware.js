function auth(req, res, next){
    if(!req.session ||!req.session.passport || !req.session.idUser ){
        return res.status(403).json({success:false , error: {message: "No autenticado", statusCode: 403}})
    }

    req.user = {
        id: req.session.idUser,
        email: req.session.email,
        rol: req.session.rol
    }

    next()
}

//Check Login
function checkLogin(req, res, next){
    if(req.session.user){
        next()
    }
    else{
        res.redirect("/users/login")
    }
}

function voidLogAndRegis(req, res, next){
    if(req.session.user){
        res.redirect("/users/perfil")
    }
    else{
        next()
    }
}

module.exports = {
    auth,
    checkLogin,
    voidLogAndRegis
}