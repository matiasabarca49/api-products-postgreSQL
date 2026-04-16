const nodemailer = require('nodemailer')

//Importar verificacion de variables de entorno
const reqVars = require("../utils/dotenv.helper.js");
const logger = require('../utils/logger/loggers.js');

//Crear transporter para enviar mails
let transporter = {};
//if(process.env.GMAIL_CREDENTIAL_USER?.trim() && process.env.GMAIL_CREDENTIAL_TOKEN?.trim()){
if(reqVars.validateEnvVars('gmail')){
    //Creando trasnporter
    transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 578,
        auth:{
            user: process.env.GMAIL_CREDENTIAL_USER,
            pass: process.env.GMAIL_CREDENTIAL_TOKEN
        }
    })

    //Verificar conexion
    transporter.verify(function (error, success) {
        if (error) {
            logger.error(error);
        } else {
            logger.info('✅ Server está listo para enviar mails');
        }
    });
}

module.exports = transporter
