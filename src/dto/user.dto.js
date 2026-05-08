const { capitalize } = require("../utils/capitalize.helper")
const { normalize, normalizeNickname, normalizeEmail } = require("../utils/normalize.helper")

class UserDTO{
    constructor(user){
        this.name = capitalize(user.name)
        this.last_name = capitalize(user.last_name) || "No especificado"
        this.nickname = user.nickname
        this.birth = user.birth 
        this.dni= user.dni
        this.must_change_password
        this.email = user.email
        this.password = user.password
        this.rol = user.rol?.toLowerCase() || "user"
    }

    static toResponse(user){
        return {
            id: user._id || user.id, 
            name: user.name || "Not Declared",
            last_name: user.last_name || "Not Declared",
            nickname: user.nickname,
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

class AddressDTO{
    constructor(address){
        this.user_id = address.user_id;
        this.street = address.street;
        this.city = address.city;
        this.province = address.province;
        this.postal_code = address.postal_code;
        this.is_default = address.is_default;
    }
}

class StoreDTO{
    constructor(store){
        this.user_id = store.user_id;
        this.name = store.name;
        this.description = store.description;
    }
}

/**
 * DTO de Request
 */

class CreateCompleteUserRequestDTO{
    constructor(user){
        this.name = normalize(user.name);
        this.last_name = normalize(user.last_name);
        this.nickname = normalizeNickname(user.nickname);
        this.birth = user.birth;
        this.email = normalizeEmail(user.email);
        this.dni = user.dni;
        this.password = user.password;
        this.rol = user.rol;
        //Address
        this.street = normalize(user.street);
        this.province = normalize(user.province);
        this.city = normalize(user.city);
        this.postal_code = normalize(user.postal_code);
    }
}

class CreateUserRequestDTO{
    constructor(user){
        this.name = normalize(user.name);
        this.last_name = normalize(user.last_name);
        this.nickname = normalizeNickname(user.nickname);
        this.birth = user.birth;
        this.email = normalizeEmail(user.email);
        this.dni = user.dni;
        this.password = user.password;
        this.rol = user.rol;
    }
}

class UpdateUserRequestDTO{
    constructor(user){
        this.name = normalize(user.name);
        this.last_name = normalize(user.last_name);
        this.nickname = normalizeNickname(user.nickname);
        this.birth = user.birth;
        this.email = normalizeEmail(user.email);
        this.dni = user.dni;
        this.rol = user.rol;
    }
}

class UpdateToPremiumRequestDTO{
    constructor(store){
        this.name = store.name;
        this.description = store.description;
    }
}


module.exports = {
    UserDTO,
    AddressDTO,
    StoreDTO,
    CreateUserRequestDTO,
    CreateCompleteUserRequestDTO,
    UpdateUserRequestDTO,
    UpdateToPremiumRequestDTO
}