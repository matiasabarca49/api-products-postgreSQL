const { searchSecret, generateFormatEmail, generateLink } = require('../utils/utils.js')
const UsersService = require('../service/users.service.js')
const usersService = new UsersService()
const { transporter } = require('../config/config.js')


const sendMailPurchase = (req, res)=>{
    try{
        if(!process.env.GMAIL_CREDENTIAL_USER && !process.env.GMAIL_CREDENTIAL_TOKEN){
            console.log("=======")
            console.log("⚠️ [Info] Envío de emails desactivado")
            console.log("Faltan Credenciales")
            console.log("=======")
            res.send("OK")
        }else{
            //Para enviar ticket de compra
            transporter.sendMail(generateFormatEmail(req.body.email, { subject: "Compra Realizada", head: "La compra fue realizada correctamente", body: `Compra realiza el "${req.body.purchase_datetime}" con código "${req.body.code}". Con email de cuenta ${req.body.purchaser}. El Total de la compra es: $${req.body.amount}`}), (error, info)=>{
                if(error){
                    req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/mail" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
                    ERROR: Fallo al enviar el mail. EL error es:\n
                    ${error}`)
                    res.status(500).send({status: "ERROR", reason: error}) 
                }
                else{
                    req.logger.info(`Mensaje enviado con éxito solicitado en el endpoint${"http://"+req.headers.host + "/api/mail" +req.url}"`)
                }
            })
            res.send("OK")
        }
    }catch(error){
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/mail" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al enviar el mail. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

const sendMailRecoverPass = async (req, res)=>{
    const userMail = req.body.mail
    try {
        const userFound = await usersService.findByFilter({email: userMail})
        if (userFound){
            let result = transporter.sendMail(generateLink(userFound), (error, info)=>{
                if(error){
                    req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/mail" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
                    ERROR: Fallo al enviar el mail. EL error es:\n
                    ${error}`)
                    res.status(500).send({status: "ERROR", reason: error}) 
                }
                else{
                    req.logger.info(`Mensaje enviado con éxito solicitado en el endpoint${"http://"+req.headers.host + "/api/mail" +req.url}"`)
                    
                }
            })
        }else{
            req.logger.info("El usuario no existe en la app")
        }
        res.status(400).render('mailSended')
    } catch (error) {
        req.logger.error(`Peticion ${req.method} en "${"http://"+req.headers.host + "/api/mail/sendmailpass" +req.url}" a las ${new Date().toLocaleTimeString()} el ${new Date().toLocaleDateString()}\n
        ERROR: Fallo al enviar el mail. EL error es:\n
        ${error}`)
        res.status(500).send({status: "ERROR", reason: error})
    }
}

const updatePassword =  async (req, res)=>{
    try {
        const isValid = searchSecret(req.query.secret, req.query.email)
        if (!isValid){
            req.logger.warning("Intento de manipulacion en restauracion contraseña")
            res.status(500).send({status: "ERROR"})
        }else{
            const passwordChanged = await usersService.updatePassword(req.query.email, req.body.password)
            if (passwordChanged.status){
                const userFound = await usersService.findByFilter({email: req.query.email})
                let result = transporter.sendMail({
                    from: `Tienda de Productos  <${process.env.GMAIL_CREDENTIAL_USER}>`,
                    to: `${userFound.email}`,
                    subject: "Contraseña cambiada",
                    html:`
                        <div>  
                            <h1>Hola ${userFound.name}</h1>
                            <h3> Su contraseña ha sido cambiada</h3>
                            <p style="margin-top: 20px">En caso de no haya sido usted el que cambió la contraseña. Cambiela de inmediato</p>
                        </div>
                    `,
                    attachments: []  
                })
                req.logger.info(passwordChanged.reason)
                res.status(200).redirect("/users/login")
            }
            else{
                res.status(500).send({status: "ERROR", reason: passwordChanged.reason })
            } 
        }
         

    } catch(error) {
        console.log(error)
        req.logger.warning("Intento de manipulacion en restauracion contraseña")
        res.status(500).send({status: "ERROR"})
    }
    
}


module.exports= {
    sendMailPurchase,
    sendMailRecoverPass,
    updatePassword
}