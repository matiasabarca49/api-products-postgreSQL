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
    checkLogin,
    voidLogAndRegis
}