const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const { isValidPassword } = require('../utils/utils.js')
//Users Service
const UsersService = require('../service/users.service.js')
const { UserDTO } = require('../dto/user.dto.js')
const usersService = new UsersService()

const initializePassport = () =>{
    passport.use('register', new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        async (req, username, password, done) => {
            const { name, last_name, birth, email} = req.body;
            //Verificamos que no falte ningun campo si no frenamos la operacion
            if(!name || !last_name || !birth || !email || !req.body.password) done({success: false, error: "Campos erronéos o faltantes"})
            try {
                //Verificamos si el usuario existe en la DB 
                const userFound = await usersService.findByEmailRAW(email);
                //En caso de que el usuario exista. Frenamos la operacion, redirigimos e indicamos que ya existe
                if(userFound){
                    done(null, false)
                }
                else{
                    //Se agrega a la DB el nuevo user
                    const userAdded = await usersService.createCompleteUser(req.body);
                    //Salimos y devolvemos el usuario creado
                    done(null, userAdded)
                }

            } catch (error) {
                console.log(error);
                done({success: false, error: error})
            }
        }
    )),
    passport.use("login", new LocalStrategy(
        {passReqToCallback: true, usernameField: "email"},
        async (req, username, password, done)=>{
            //Verificamos que no falte ningun campo si no frenamos la operacion
            if(!req.body.email || !req.body.password) done({status: "ERROR", reason: "Campos erronéos o faltantes"})
            try {
                //Verificamos si el usuario existe en la DB
                const {email, password} = req.body
                const userFound = await usersService.findByEmailRAW(email);
                //Si existe, verificamos que la "password" proviniente del body, sea correcta.
                if(userFound){
                    const checkPassword = isValidPassword(userFound.password, password);
                    checkPassword 
                        //Si la contraseña es correcta, se actualiza la fecha de ultima conexion
                        ? done(null, await usersService.updateLastConnection(userFound.id))
                        //Si no existe, devolvemos un error
                        : done(null, false, {status: "ERROR", reason: "Contraseña incorrecta"})
                } 
                //Si no existe, devolvemos un error
                else{
                    //En caso de que el usuario no exista o este mal las credenciales. Frenamos la operacion
                    done(null, false, {status: "ERROR", reason: "Usuario no encontrado o credenciales incorrectas"})
                }
            } catch (error) {
                done({status: "ERROR", reason: error})
            }
        }
    )),
    passport.serializeUser((user, done)=>{
        done(null, user.id)
    }),
    passport.deserializeUser(async (id, done)=>{
        const user = await usersService.findById(id)
        done(null, user)
    })
}

module.exports = initializePassport