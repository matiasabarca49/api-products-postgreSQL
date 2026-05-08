const { createHash, isValidPassword } = require('../utils/utils.js') 
const { UserDTO, AddressDTO, StoreDTO } = require('../dto/user.dto.js')
const { transporter } = require('../config/config.js')
const { generateFormatEmail } = require('../utils/utils.js')
const UsersRepository = require('../repositories/postgreSQL/user.repository.js')
const { NotFoundException, ForbiddenException } = require('../exceptions/validation.exception.js')
const { use } = require('passport')


class UsersService{
    constructor(){
        /* const mongoRepository = new MongoRepository(User) */
        this.repository = new UsersRepository();
    }


    async findAll(filters = {}, limit, page, sort){
        //Repository
        const users = await this.repository.findAll(filters, limit,page, sort);

        if(!users || users.length === 0) return users;
     
        users.payload = this.toManyDTO(users.payload);

        //Wrapper Pattern
        return  users
    }

    async findById(id){
        const userFound = await this.repository.findById(id);
        if(!userFound){
            throw new NotFoundException("Usuario no encontrado");
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

    async getAddresess(idUser){
        return await this.repository.getAddresses(idUser)
    }

    async create(user){

        //passoword
        user.password = createHash(user.password)
        user.must_change_password = true;
        //Rol del usuario
        if(!user.rol) user.rol = "user";

        //Formateamos el documento
        const userCreated = await this.repository.create(this.toFormatDTO(user));

        //Formatear con DTO
        return this.toDTO(userCreated);
    }

    async createCompleteUser(user){

        //Formateamos el usuario
        const userDTO = this.toFormatDTO(user)
        //Creamos el usuario 
        const userAdded = await this.create(userDTO);

        //Agregamos la direccion a la DB
        user.user_id = userAdded.id;
        user.is_default = true;
        await this.addAddress(user);

        return userAdded;
    }

    async addAddress(data){

        //Formateamos la Direccion
        const addressDTO = new AddressDTO(data);

        return await this.repository.addAddress(addressDTO);
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

    async upgradeUser(idUser, data){
        //Creamos la tienda
        data.user_id = idUser;
        const storeDTO = new StoreDTO(data);
        await this.repository.createStore(storeDTO);

        //Actualizar el rol del usuario
        const user = await this.update(idUser, {rol: "premium"})

        return user
    }


   async update(id, data){
        const userFound = await this.repository.existByID(id);
        if(!userFound){
            throw new NotFoundException("Usuario no encontrado");
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

    async updateLastConnection(idUser){
        const date = new Date()
        
        const userFound = await this.repository.existByID(idUser);

        if(!userFound){
            throw new NotFoundException("Usuario no encontrado");
        }
        
        const userUpdated = await this.repository.update(idUser,{ last_connection: date});

        return this.toDTO(userUpdated);
    }

    async delete(idUSer){

        if(!await this.repository.existByID(idUSer)) throw new NotFoundException("El usuario no existe");

        return this.toDTO(await this.repository.delete(idUSer))
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