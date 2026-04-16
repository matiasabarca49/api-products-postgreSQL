const winston = require('winston');
const config = require('../../config/config.js');

const customLevels = {
  levels: {
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
    http: 'green',
    debug: 'white',
  }
};

winston.addColors(customLevels.colors);

const transports = [
  new winston.transports.Console({
    level: config.environment === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        return `${timestamp} [${level}] ${message} ${
          Object.keys(meta).length ? JSON.stringify(meta) : ''
        }`;
      })
    )
  }),

  new winston.transports.File({
    filename: './logs/error.log',
    level: 'error',
    format: winston.format.json()
  }),

  new winston.transports.File({
    filename: './logs/combined.log',
    level: 'info',
    format: winston.format.json()
  })
];

const logger = winston.createLogger({
  levels: customLevels.levels,
  level: config.environment === 'production' ? 'info' : 'debug',
  transports
});

module.exports = logger;


/* COMO USAR 

SERVICIOS

logger.info('Servicio ejecutándose');


CONTROLADORES

req.logger.info('Request entrante');

*/