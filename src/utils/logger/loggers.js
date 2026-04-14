const winston = require('winston')
const config = require('../../config/config.js')

const customLevels = {
    levels:{
        fatal: 0,
        error: 1, 
        warning: 2, 
        info: 3, 
        http: 4, 
        debug: 5, 
    },
    colors: {
        fatal: 'red',
        error: 'magenta',
        warning: 'yellow',
        info: 'blue',
        http: "green",
        debug: 'white'
    }
}

const devLogger = winston.createLogger({
    levels: customLevels.levels,
    transports:[
        //Errores en consola
        new winston.transports.Console({
            level: "debug",
            format: winston.format.combine(winston.format.colorize({ colors: customLevels.colors }),
            winston.format.simple())
        })
    ]
})

const proLogger = winston.createLogger({
    levels: customLevels.levels,
    transports:[
        new winston.transports.Console({level: "info"}),
        new winston.transports.File({ filename: './errors.log', level: 'error' })

    ]
})

const addLogger = (req, res, next)=>{
    if (config.environment === "production"){
        req.logger = proLogger
    }
    else{
        req.logger = devLogger
    }
    next() 
}

module.exports = addLogger