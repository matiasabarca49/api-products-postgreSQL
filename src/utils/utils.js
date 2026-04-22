const bcrypt = require('bcrypt')

/** 
 * Hashea una contraseña utilizando bcrypt.
*@param {string} password - La contraseña que se desea hashear.
*@returns {string} - La contraseña hasheada utilizando bcrypt.
*/
const createHash = (password) => {
   return bcrypt.hashSync(password, bcrypt.genSaltSync(10))
   
}

/**
 * Compara una contraseña sin hashear con una contraseña hasheada utilizando bcrypt.
 * @param {string} passwordDB - La contraseña hasheada almacenada en la base de datos.
 * @param {string} passwordToValidate - La contraseña sin hashear que se desea validar.
 * @returns {boolean} - Devuelve true si las contraseñas coinciden, de lo contrario, devuelve false.
 */
const isValidPassword = (passwordDB ,passwordToValidate) =>{
    return bcrypt.compareSync(passwordToValidate, passwordDB);
}

module.exports= {
    createHash,
    isValidPassword,
}