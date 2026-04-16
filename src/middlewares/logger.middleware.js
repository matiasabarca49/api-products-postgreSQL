const logger = require('../utils/logger/loggers.js');

const winstonLoggers = (req, res, next) => {
  req.logger = logger.child({
    requestId: `${btoa(Date.now())}${req.method}${req}`,
    method: req.method,
    path: req.path
  });

  next();
};

module.exports = winstonLoggers;