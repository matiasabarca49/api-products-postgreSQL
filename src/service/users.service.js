const { createHash, isValidPassword } = require('../utils/utils.js') 
const User = require('../model/users.model.js')
const { UserDTO } = require('../dto/user.dto.js')
const { transporter } = require('../config/config.js')
const { generateFormatEmail } = require('../utils/utils.js')
const BaseService = require('./base.service.js')
const MongoRepository = require('../repositories/implementations/mongoRepository.js')
const PostgresRepository = require('../repositories/implementations/postgresRepository.js')
const UsersRepository = require('../repositories/implementations/user.repository.js')


class UsersService{
    constructor(){
        /* const mongoRepository = new MongoRepository(User) */
        this.repository = new UsersRepository();
    }


    async findAll(filters = {}, limit, page, sort){
        //Repository
        const users = await this.repository.findAll(filters, limit,page, sort);

        if(!users || users.length === 0) return users;
     
        users.docs = this.toManyDTO(users.docs);

        //Wrapper Pattern
        return  users
    }

    async findById(id){
        const userFound = await this.repository.findById(id);
        if(!userFound){
            throw new Error('Usuario no encontrado');
        }
        return this.toDTO(userFound)
    }

    async findByEmail(email){
        const userFound = await this.repository.findUserByEmail(email);
        if(!userFound) return null
        return this.toDTO(userFound)
    }

    //uso interno para login, no se formatea a DTO
    async findByEmailRAW(email){
        const userFound = await this.repository.findUserByEmail(email);
        if(!userFound) return null
        return userFound
    }

    async create(document){
        //Formateamos el documento si la clase hija definió toFormatDTO
        const userCreated = await this.repository.create(this.toFormatDTO(document));

        //Si se produjo un error al crear el documento, lanzamos una excepción
        if (!userCreated){ 
            throw new Error('Error al crear el usuario')
        }
        // Buscar si la clase hija definió toDTO
        return this.toDTO(userCreated);
    }

   async addProductToCart(idUser, productToAdded){
        const userFound = await this.findById(idUser)
        if(!userFound){
            throw new Error('Usuario no encontrado')
        }
        if(userFound.email === productToAdded.owner){
            throw new Error('No se puede agregar un producto al carrito si el usuario es el dueño del producto')
        }
        const productFound = userFound.cart.find( product => product.product._id.toString() === productToAdded.id)
        productFound 
            ? productFound.quantity++
            : userFound.cart = [...userFound.cart, {product: productToAdded.id, quantity: 1 }]
        await this.update(idUser, {cart: userFound.cart})

        return await this.findById(idUser)
   }

   async addDocument(idUser,document){
    let documentsUpdated
    const userFound = await this.findById(idUser)
    //Buscando si ya existe el documento en DB
    const documentFound = userFound.documents.find( documentDB => documentDB.name === document.name)
    if(documentFound){
       const documentFilter = userFound.documents.filter( documentDB => documentDB.name !== document.name)
        documentsUpdated = [...documentFilter, document]
    }
    else{
        documentsUpdated = [...userFound.documents, document]  
    }
    //Agregamos el documento a la DB
    if(userFound){
        const userUpdated = await this.update(idUser, {documents: documentsUpdated})
        return userUpdated
    }else{
        return false
    }
   }

   async update(id, data){
        const userFound = await this.repository.existByID(id);
        if(!userFound){
            throw new Error('Usuario no encontrado');
        }
        const userUpdated = await this.repository.update(id, data)
        return this.toDTO(userUpdated)
   }

   async updatePassword(emailUser, password){
        const user = await this.findRawByFilter({ email: emailUser})
        //Revisar que la contraseña no sea igual a la anterior
        const isRepeated = isValidPassword(user, password)
        if(isRepeated){
            return {status: false, reason: "No se puede usar contraseñas anteriores"}
        }
        const userUpdate = await this.update(user._id, {password: createHash(password)})
        if(userUpdate){
            
            return {status: true, reason: "Contraseña cambiada con éxito"}
        }else{
            return {status: false, reason: "Error en el cambio de contraseña"}
        }    
       
   }

   async updateRol(idUser){
        const documents = ["Identificacion", "Comprobante de domicilio", "Comprobante de estado de cuenta"]
        const userFound = await this.findById(idUser)
        if (userFound.rol === "User"){
            let cont=0
            userFound.documents.forEach( document => {
                if(documents.includes(document.name)){
                    cont++
                }
            })
            if (cont === 3){
                const userUpdated = await this.update(idUser,{rol: "Premium"})
                return {status: true, userUpdated: {_id: userUpdated._id, name: userUpdated.name, lastName: userUpdated.lastName, email: userUpdated.email, rol: userUpdated.rol}} 
            }
            else{
                return {status: false, reason: "Faltan Cargar Documentos"}
            }
        }
        else if(userFound.rol === "Premium"){
            const userUpdated = await this.update(idUser,{rol: "User"})
            return {status: true, userUpdated: {_id: userUpdated._id, name: userUpdated.name, lastName: userUpdated.lastName, email: userUpdated.email, rol: userUpdated.rol}}
        }
        else{
            return {status: false, reason: "El usuario no fue encontrado"}
        }
    }  

    async updateLastConnection(idUser){
        const date = new Date()
        const userFound = await this.repository.existByID(idUser);
        if(!userFound){
            throw new Error('Usuario no encontrado');
        }
        
        const userUpdated = await this.repository.update(idUser,{ last_connection: date});

        console.log("Usuario actualizado: ", userUpdated);

        return this.toDTO(userUpdated);
    }

    async deleteInactiveUser(){
        const oldDate = new Date()
        oldDate.setDate(oldDate.getDate() - 2 )
        const usersToDelete = await this.findManyByFilter({ lastConnection: { $lt: oldDate.toISOString()}, rol: {$ne: "Admin"}})
        const usersDeleted = await this.deleteManyByFilter({ lastConnection: { $lt: oldDate.toISOString()}, rol: {$ne: "Admin"}})
        usersToDelete.forEach( user => {
            transporter.sendMail(generateFormatEmail(user.email, { subject: "Usuario Eliminado", head: "El Usuario fue eliminado correctamente", body: `El Usuario "${user.name} ${user.lastName}" con rol "${user.rol}" fue eliminado. Por ausencia de conexión ${new Date(user.lastConnection).toLocaleString()}.`}))
        } )
        return usersDeleted
    }

    async removeProductFromCart(userID, productID){
        const userFound = await this.findById(userID)
        if(userFound){
            const cartFiltered = userFound.cart.filter( product => product.product._id.toString() !== productID )
            await this.update(userID, {cart: cartFiltered})
            return cartFiltered
        }else{
            return false
        }
    } 

    /**
     * 
     *Wrapper Pattern
     */

    toFormatDTO(userData) {
        return new UserDTO(userData)
    }

    toDTO(user) {
        return UserDTO.toResponse(user) 
    }

    toManyDTO(users) {
        return users.map(user => UserDTO.toResponse(user)) 
    }

}


module.exports = UsersService;