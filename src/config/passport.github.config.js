const passport = require('passport')
const UsersService = require('../service/users.service.js')
const { createHash } = require('../utils/utils.js')
const { Strategy } = require('passport-github2')
const githubStrategy = Strategy

const {validateEnvVars} = require('../utils/dotenv.helper.js')

if(validateEnvVars('github')){
    
    const usersService = new UsersService()
    
    passport.use('auth-github',
    new githubStrategy({
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:8080/auth/github/callback"
    },
    async function(accessToken, refreshToken, profile, done){
        //Variable que obtendra el mail de user
        let emailData
        try {
            //Obtenemos el mail de diferente manera ya que por defecto no nos devuelve el mail
            await fetch('https://api.github.com/user/emails',
            {
                headers: {
                  Accept: 'application/vnd.github+json',
                  Authorization: 'Bearer ' + accessToken,
                  'X-Github-Api-Version': '2022-11-28',
                },
            })
                .then(res => res.json())
                .then(data =>{
                    //Guardamos el mail obtenido
                    emailData = data
                })
            //Verificamos que el mail sea verificado por el usuario.
            const emailUser = emailData.find( emailDetail => emailDetail.verified === true)
            //En caso de que no este verificado. Paramos la operacion de autenticación
            if (!emailUser){
              done("No se pudo validar el usuario")
            }
            const userFound = await usersService.findByFilter({email: emailUser.email})
            //Si el usuario no se encontro en la DB, creamos uno nuevo
            if (!userFound){
                //Creamos el usuario formateado con DTO
                const newUser = {
                    name: profile._json.name || profile._json.login || "no especificado",
                    email: emailUser.email,
                    password: createHash(Date.now().toString()+ Math.random(99).toString())+ profile._json.login.toString()
                }
                const userAdded = await usersService.create(newUser)
                //Salimos y pasamos el user nuevo agregado
                done(null, userAdded)
            }
            else{
                //Si el usuario ya existe en la base de datos. Salimos y lo pasamos
                done(null,userFound)
            }
        } catch (error) {
            console.log(error)
            done("Error en ingresar con github")
        }
    }
    ))
}