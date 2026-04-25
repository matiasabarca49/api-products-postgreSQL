const { createHash} = require('../utils/utils.js')

class UserDTO{
    constructor(user){
        this.name = user.name
        this.last_name = user.last_name || "No especificado"
        this.nickname = user.nickname
        this.birth = user.birth 
        this.dni= user.dni
        this.must_change_password
        this.email = user.email
        this.password = createHash(user.password)
        this.rol = user.rol || "user"
    }

    static toResponse(user){
        return {
            id: user._id || user.id, 
            name: user.name || "Not Declared",
            last_name: user.last_name || "Not Declared",
            birth: user.birth || "Not Declared",
            dni: user.dni,
            email: user.email || "Not Declared",
            rol: user.rol || "Not Declared",
            last_connection: user.last_connection || "Not Declared",
            created_at: user.created_at || "Not Declared",
            updated_at: user.updated_at || "Not Declared"
        }
    }
    
}

const sendUserFormatted = (user) => {
    
    const userFormatted = {
        id: user._id, 
        name: user.name || "Not Declared",
        lastName: user.last_name || "Not Declared",
        age: user.age || "Not Declared",
        email: user.email || "Not Declared",
        rol: user.rol || "Not Declared",
        lastConnection: user.last_connection || "Not Declared",
    }
          
    return userFormatted
}

const sendUsersFormatted = (users) => {
    users.map( document => {   
            const documentReWrited = {
                id: document._id, 
                name: document.name || "Not Declared",
                lastName: document.lastName || "Not Declared",
                age: document.age || "Not Declared",
                email: document.email || "Not Declared",
                rol: document.rol || "Not Declared",
                lastConnection: document.lastConnection || "Not Declared",
                documents: document.documents || [],
                purchases: document.purchases || [],
                cart: document.cart || []
            }
            return documentReWrited
    })
    return users
}

module.exports = {
    UserDTO,
    sendUserFormatted,
    sendUsersFormatted
}