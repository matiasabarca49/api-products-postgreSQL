const UsersService = require('../service/users.service.js')
const usersService = new UsersService()

/**
* GET
*/

const getAll = async (req, res, next) =>{
    try{

        const { limit , page, sort } = req.query;
        //Filtros
        const { name, last_name, email, rol} = req.query
        const filters = {};
        if (name) filters.name = name;
        if (last_name) filters.last_name = last_name;
        if (email) filters.email = email;
        if(rol) filters.rol = rol;

        const usersGetted = await usersService.findAll(filters, limit, page, sort);

        return res.status(200).json({success: true, data: usersGetted})

    }catch(error){
       next(error)
    }
}

const updateRol = async (req, res) =>{
    try{
        const userUpdated = await usersService.updateRol(req.params.uid)
        userUpdated.status
            ? res.status(201).json({success: true, data: userUpdated.userUpdated})
            : res.status(500).json({success: false , error: userUpdated.reason ||"Los Administradores no pueden cambiar de rol"})
    }catch(error){
        console.log(error)
        res.status(500).json({success: false , reason: error.message || "Error al cambiar el rol del usuario"})
    }
}
/**
* POST
*/

const create = async (req, res, next) =>{
    try{
        const userCreated = await usersService.create(req.body)

        return res.status(201).json({success: true , data: userCreated});
    }catch(error){
        next(error);
    }
}

/**
* PUT
*/

const update = async (req, res, next) =>{
    try{
        const { uid } = req.params
        const userUpdated = await usersService.update(uid, req.body)
        return res.status(200).json({success: true, data: userUpdated})
    }catch(error){
        next(error)
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
const deleteUser = async (req, res, next) =>{
    try{
        const userDeleted = await usersService.delete(req.params.id)
        
        return res.status(200).send({success: true, data: userDeleted})
            
    }catch(error){
        next(error);
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

module.exports = {
    getAll,
    updateRol,
    create,
    addDocument,
    update,
    deleteUser,
    deleteInactiveUser
}