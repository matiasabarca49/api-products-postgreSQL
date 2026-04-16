//Configuraciones del servidor
const config = require('./config/config.js')
const logger = require('./utils/logger/loggers.js')
const app = require('./app.js')
const http = require('http')
const server = http.createServer(app)

//Pool de conexiones
const pool = require('./config/pg.config.js')

/**
 * Websockets 
 **/
const { webSocket } = require('./controllers/websockets.controller.js')
webSocket(server)


const port = process.env.PORT || config.port


//Levantar el servidor para que empiece a escuchar
server.listen(`${port}`, ()=>{ 
    //Conectar base de datos
    logger.info("Environment Mode Option: ", config.environment);
    logger.info(`Servidor escuchando en el puerto ${port}`);
    
})