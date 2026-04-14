/* require('dotenv').config() */
const config = require('./config/config.js')
const express = require("express")
const handlebars = require("express-handlebars")
const http = require('http')
const app = express()
const server = http.createServer(app)
const cors = require('cors')

//Inicio y conexion a DB
const MongoManager = require('./config/mongoDB.config.js')
const mongoManager = new MongoManager(process.env.MONGO_URL) 

//Sessions
const session = require('express-session')
const mongoSession = require('connect-mongo')

/* app.use(session({
    store: mongoSession.create({
        mongoUrl: process.env.MONGO_URL
    }),
    secret: process.env.SECRET_SESSIONS ,
    resave: true,
    saveUninitialized: false
})) */

app.use(session({
    secret: process.env.SECRET_SESSIONS ,
    resave: true,
    saveUninitialized: false
}))

//Passport
const passport = require('passport')
const initializePassport = require('./config/passport.config.js')
//Estrategia de autorizacion de terceros
require('./config/passport.github.config.js')
//Config de passport con estrategias
initializePassport()
app.use(passport.initialize())
app.use(passport.session())


//Parsear los datos que viene en formato JSON
app.use(express.json())
//recibir datos complejos del navegador
app.use(express.urlencoded({extended: true}))
//Archivos estaticos
app.use(express.static(__dirname + '/public'))
//Compresion
const compression = require('express-compression')
app.use(compression())
//Logger
const addLogger = require('./utils/logger/loggers.js')
app.use(addLogger)
//CORS
app.use(cors())

/** 
* Handlebars
**/
app.engine('handlebars', handlebars.engine())
app.set('views', __dirname + '/views')
app.set('view engine', 'handlebars')
//Crear una helpers que nos permite comporar dos terminos
const hbs = handlebars.create({})
hbs.handlebars.registerHelper('ifCond', function(v1, v2, options) {
    if(v1 === v2) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

/**
 * API Doc
 **/
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUiExpress = require('swagger-ui-express')

const swaggerOptions = {
    definition:{
        openapi:'3.0.1',
        info: {
            title: "Documentación API Productos y Carritos",
            description: "API que permite la obtencion de productos guardado en la DB y almacenar carritos de compras del usuario. A su vez genera todo el proceso y almacenamiento de la compra del usuario."
        }
    },
    apis: [`./src/docs/**/*.yaml`]
}
const specs = swaggerJsdoc(swaggerOptions)
app.use('/apidocs', swaggerUiExpress.serve, swaggerUiExpress.setup(specs))

/** 
* Routes
**/
const routeProducts = require('./routes/products.router.js')
const routeCarts = require('./routes/cart.router.js')
const routeCartItems = require('./routes/cartItem.router.js')
const routePurchase = require('./routes/purchase.router.js')
const routeChat = require('./routes/chat.router.js')
const routeLoggerTest = require('./routes/logger.router.js')
const routeMailAPI = require('./routes/mail.router.js')
const routeTicket = require('./routes/ticket.router.js')
const routeSessions = require('./routes/sessions.router.js')
const routeUsers = require('./routes/users.router.js')
const routeViewAdm = require('./routes/pages/adm.router.js')
const routeMocks = require('./routes/mocks.router.js')
const routeViewStore = require('./routes/pages/store.router.js')
const routeViewUsers = require('./routes/pages/usersview.router.js')
const routeGithubAuth = require('./routes/passport/github.passport.router.js')
const routeError = require('./routes/pages/404.router.js')

//API
app.use("/api/products", routeProducts)
app.use("/api/carts", routeCarts)
app.use("/api/cartItems", routeCartItems)
app.use("/api/purchase", routePurchase)
app.use("/api/sessions", routeSessions)
app.use("/api/users", routeUsers)
app.use("/api/mail", routeMailAPI)
app.use("/api/tickets", routeTicket)
app.use("/auth", routeGithubAuth)

//Vista Store
app.use("/", routeViewStore)
app.use("/admin", routeViewAdm)
app.use("/mockingproducts", routeMocks)
app.use("/chat", routeChat)
app.use("/loggerTest", routeLoggerTest)
app.use("/users", routeViewUsers)
app.use('*', routeError)

/**
 * Websockets 
 **/
const { webSocket } = require('./controllers/websockets.controller.js')
webSocket(server)

const port = process.env.PORT || config.port


//Levantar el servidor para que empiece a escuchar
server.listen(`${port}`, ()=>{ 
    //Conectar base de datos
    console.log("[INFO] Environment Mode Option: ", config.environment);
    /* mongoManager.connect() */
    
})