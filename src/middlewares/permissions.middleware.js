const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {

    const { rol } = req.user;

    if (!allowedRoles.includes(rol)) {
      return res.status(403).json({ success:false, error: {message: "No autorizado", statusCode: 403} });
    }

    next();
  };
};

const checkPermAdmin = (req, res ,next) =>{
    if(!req.session || req.session.rol !== "admin"){
        return res.status(401).json({success: false, error: "no autorizado"})
    }
    else{
        next()
    }
}

function checkPermAdminAndPremium(req, res, next){
    if(!req.session || req.session.rol !== "admin" && req.session.rol !== "premium"){
        return res.status(401).json({success: false, error: "no autorizado"})
    }
    else{
        next()
    }
}

const checkPerAddProduct = (req, res ,next) => {
    if (req.session.rol === "admin" || req.session.rol === "premium" ){
        next()
    }
    else{
        res.send("Los usuarios comunes no puede administrar productos o no ha iniciado sesión")
    }
}

const checkPerAdmCart = (req, res, next) =>{
    if(req.session.rol === "user" || req.session.rol === "premium"){
        next()
    }
    else{
        res.status(401).send({status: "ERROR", reason: "Solo los usuarios normales y los premium pueden agregar productos al carrito"})
    }
}

const CheckPerRol = (req, res, next) =>{
    if(req.session.rol === "admin"){
        next()
    }else{
        res.status(401).send({status: "ERROR", reason: "Solo los administradores pueden administrar a los usuarios"}) 
    }
}

const checkPerCart = (req, res, next)=>{
    if(req.session.rol === "admin"){
        next()
    }
    else if(req.session.rol === "user" || req.session.rol === "premium"){
        /* res.send({status: "ERROR", reason: "Solo los usuarios pueden agregar productos al carrito" }) */
        res.send("Solo los Administradores pueden ver los carritos de compra")
    }
    else{
        /* res.send({status: "ERROR", reason: "No está logueado" }) */
        res.redirect("/users/login")
    }
}

const checkPerShowCart = (req, res, next)=>{
    if(req.session.rol === "admin"){
        next()
    }
    else{
        res.send("Solo los administradores puede ver carritos")
    }
}


const checkPerChat = ( req, res, next )=> {
    if (req.session.rol === "admin"){
        res.send("Los administradores no pueden acceder al chat")
    }
    else{
        next()
    }
}

module.exports = {
    authorizeRoles,
    checkPermAdmin,
    checkPermAdminAndPremium,
    checkPerAddProduct,
    checkPerAdmCart,
    CheckPerRol,
    checkPerShowCart,
    checkPerCart,
    checkPerChat
}