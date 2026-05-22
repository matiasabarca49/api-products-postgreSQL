const { NotFoundException, DuplicateException, AppError } = require("../exceptions/excepciones.js");
const { sendMailRecoverPass, sendMailChangedPass } = require("../utils/mail.halper");
const { createHash, isValidPassword } = require("../utils/utils");
const UsersService = require("./users.service");

class SessionsService {
    constructor(){
        this.userService = new UsersService();
        this.secrets = new Map();
    }


    /**
     * Verifica que el secreto para recuperar contraseña sea válido y no haya expirado, 
     * además de verificar que el email corresponda a un usuario existente. 
     * Si todo es correcto, devuelve true, de lo contrario, devuelve false.
     * @param {string} secret - El secreto a verificar
     * @param {string} email - El email del usuario que solicita el cambio de contraseña
     * @returns {boolean} - Devuelve true si el secreto es válido y el email corresponde a un usuario existente, de lo contrario, devuelve false.
     */
    async verifySecret(secret, email){
        secret = `${secret}&qui=45604545rgfdt355iuiljhgfdsS43&filter=user&type=change&user=notFound`
        
        const secretExpiration = this.secrets.get(secret)

        //Verificamos que el secreto exista y no haya expirado
        if (!secretExpiration || secretExpiration < new Date().getTime()){
            return false
        }
        const userFound = await this.userService.findByEmail(email)
        if (!userFound) return false
        return true
    }
    
    /**
     * Actualiza la fecha de la última conexión del usuario
     * @param {number} idUser - El ID del usuario
     */
    async updateLastConnection(idUser){
        await this.userService.updateLastConnection(idUser);
    }

    /**
     * Solicita el restablecimiento de contraseña para un usuario dado su email. 
     * Verifica que el usuario exista, genera un secreto único con una expiración de 10 minutos, 
     * lo guarda en un Map y envía un correo electrónico al usuario con un enlace para restablecer 
     * su contraseña.
     * @param {string} email - El email del usuario que solicita el cambio de contraseña
     */
    async recoverPass(email){

        //Verificamos que el usuario exista
        const userFound = await this.userService.findByEmail(email);
        if (!userFound) throw new NotFoundException("No se encontró un usuario con ese email")
        
        //Generamos el secreto y lo guardamos
        const key = createHash(`${userFound.name}-${Date.now()}-${ email }`)
        const secret = `${key}&qui=45604545rgfdt355iuiljhgfdsS43&filter=user&type=change&user=notFound` 

        this.secrets.set(secret, new Date().getTime() + 600000) //Guardamos el secreto con una expiración de 10 minutos

        //Enviamos el mail con el link para restaurar la contraseña
        await sendMailRecoverPass(email, secret);
    
    }

    /**
     * Actualiza la contraseña del usuario
     * @param {string} secret - El secreto para verificar la solicitud
     * @param {string} email - El email del usuario
     * @param {string} newPassword - La nueva contraseña
     */
    async updatePassword(secret, email, newPassword){
        //Construimos el secreto con el formato que se guardó para buscarlo en el Map
        secret = `${secret}&qui=45604545rgfdt355iuiljhgfdsS43&filter=user&type=change&user=notFound`
        //Verificamos que el secreto exista y no haya expirado
        const secretExpiration = this.secrets.get(secret)
        if (!secretExpiration || secretExpiration < new Date().getTime()){
            throw new NotFoundException("El enlace ha expirado o es inválido")
        }
        //Verificamos que el email corresponda a un usuario existente
        const userFound = await this.userService.findByEmailRAW(email);
        if (!userFound) throw new NotFoundException("No se encontró un usuario con ese email")
        //verificamos que la nueva contraseña no sea igual a la anterior
        if (isValidPassword(userFound.password, newPassword)) throw new DuplicateException("La nueva contraseña no puede ser igual a las anteriores")
        //Actualizamos la contraseña del usuario
        const passwordHash = createHash(newPassword)
        const userUpdated = await this.userService.update(userFound.id, {password: passwordHash});
        this.secrets.delete(secret) //Eliminamos el secreto para que no pueda ser reutilizado
        if (!userUpdated) throw new AppError(500, "No se pudo actualizar la contraseña del usuario")
        //enviar un mail de cambio de contraseña exitoso
        await sendMailChangedPass(email)
    }


}

//Exportamos una instancia de la clase SessionsService para que pueda ser utilizada en otros módulos sin necesidad de instanciarla cada vez. Esto es útil porque el servicio de sesiones no mantiene estado específico de cada usuario, sino que maneja funcionalidades generales relacionadas con las sesiones, como la recuperación de contraseña y la actualización de la última conexión.
module.exports = new SessionsService();