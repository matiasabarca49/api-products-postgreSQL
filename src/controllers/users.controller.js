//const UsersService = require('../service/mongo/users.service.js')
const UsersService = require('../service/users.service.js')
const usersService = new UsersService()

/**
* GET
*/

const getAll = async (req, res) =>{
    try{

        const { limit , page, sort } = req.query;
        //Filtros
        const { name, last_name, email, rol} = req.query
        const filters = {};
        if (name) filters.name = name;
        if (last_name) filters.last_name = last_name;
        if (email) filters.email = email;
        if(rol) filters.rol = rol;

        const usersGetted = await usersService.findAll(filters, limit, page, sort)
        return res.status(200).send({status: "Succesfull", data: usersGetted})

    }catch(error){
        console.log(error)
        return res.status(500).send({status: "Error", reason: error.message || "Error al obtener los usuarios"})
    }
}

const updateRol = async (req, res) =>{
    try{
        const userUpdated = await usersService.updateRol(req.params.uid)
        userUpdated.status
            ? res.status(201).send({status: "Succesfull", userUpdated: userUpdated.userUpdated})
            : res.status(500).send({status: "ERROR", reason: userUpdated.reason ||"Los Administradores no pueden cambiar de rol"})
    }catch(error){
        console.log(error)
        res.status(500).send({status: "Error", reason: error.message || "Error al cambiar el rol del usuario"})
    }
}
/**
* POST
*/

const create = async (req, res) =>{
    try{
        const userCreated = await usersService.create(req.body)
        res.status(201).send({status: "Succesfull", user: userCreated})
    }catch(error){
        console.log(error)
        res.status(error.statusCode || 500).send({status: "Error", reason: error.message || "Error al crear el usuario"})
    }
}



/**
* PUT
*/

const update = async (req, res) =>{
    try{
        const { uid } = req.params
        const userUpdated = await usersService.update(uid, req.body)
        res.status(200).json({status: "Succesfull", userUpdated})
    }catch(error){
        console.log(error)
        res.status(500).json({status: "Error", reason: error.message || "Error al agregar el producto al carrito"})
    }
}

const addProductToCart = async (req,res) =>{
    try{
        const datedUser = await usersService.addProductToCart(req.session.passport.user, req.body)
        if (datedUser){
            //Para que se actualice el usuario sin tener que salir y volver entrar a la cuenta
            req.session.cart = datedUser.cart
            res.status(201).send({status:" Succesfull ",userUpdated: datedUser.cart})

        }else{
            res.status(500).send({status: "ERROR" , reason: "No puede agregar un producto propio"})
        }
    }catch(error){
        console.log(error)
        res.status(500).send({status: "Error", reason: error.message || "Error al agregar el producto al carrito"})
    }
}

const addDocument = async (req, res) => {
    try{
        const isValid = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"].includes(req.file.originalname.split(".")[0])
        if(isValid){
            const document ={
                name:req.file.originalname,
                reference: req.file.path
            }
            const userUpdated = await usersService.addDocument(req.params.uid, document)
            res.status(201).send({status: "Charged", file: userUpdated.documents[userUpdated.documents.length - 1]})
        }
        else{
            res.status(500).send({status: "Error"})
        }
    }catch(error){
        console.log(error)
        res.status(500).send({status: "Error", reason: error.message || "Error al agregar el documento al usuario"})
    }
}

/**
* DELETE
*/
const deleteUser = async (req, res) =>{
    try{
        const userDeleted = await usersService.delete(req.params.id)
        userDeleted 
            ? res.status(200).send({status: "Successful", user: userDeleted})
            : res.status(500).send({status: "Error", reason: "El usuario no existe o error en el servidor"})
    }catch(error){
        console.log(error)
        res.status(500).send({status: "Error", reason: error.message || "Error al eliminar el usuario"})
    }
}

const deleteInactiveUser = async (req, res) =>{
    try{
        const usersUpdated = await usersService.deleteInactiveUser()
        res.send(usersUpdated)
    }catch(error){
        console.log(error)
        res.status(500).send({status: "Error", reason: error.message || "Error al eliminar los usuarios inactivos"})
    }
}

const removeProductFromCart = async(req, res)=>{
    try{
        const cartUpdated = await usersService.removeProductFromCart(req.session.passport.user, req.params.id)
        //Actualiza el cart del usuario
        req.session.cart = cartUpdated
        cartUpdated
            ? res.send({status: "Successful", cart: cartUpdated})
            : res.status(500).send({status: "Error"})
    }catch(error){
        console.log(error)
        res.status(500).send({status: "Error", reason: error.message || "Error al eliminar el producto del carrito"})
    }
}

module.exports = {
    getAll,
    updateRol,
    create,
    addProductToCart,
    addDocument,
    update,
    deleteUser,
    deleteInactiveUser,
    removeProductFromCart
}