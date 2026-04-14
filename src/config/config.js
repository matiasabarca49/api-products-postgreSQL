const dotenv = require('dotenv')
const { Command } = require('commander')
const program = new Command()

program
    .option('-d', 'Variable para debug', false)
    .option('-p <port>', 'Puerto del servidor', 8080)
    .option('--mode <mode>', 'Modo de trabajo', 'development')
program.parse();

const environment = program.opts().mode;

//Cargar variables de entorno segun el ambiente
dotenv.config({
    path:environment==="production"? "./.env": "./.env"
});

//Transporter de mail
const transporter = require('./mail.config.js')

module.exports = {
    port: program.opts().p,
    environment: environment,
    transporter
}
