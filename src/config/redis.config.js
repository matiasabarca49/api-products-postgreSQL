const { createClient } = require('redis');
const logger = require('../utils/logger/loggers');

// Configuración de Redis global para sesiones
const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

// Manejo de eventos de conexión
redisClient.on('connect', () => {
  logger.info('✅ Conectado a Redis');
});

redisClient.on('error', (err) => {
  logger.error(`🔴 Error al conectar a Redis: ${err.message}`);
});

async function connectRedis() {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
}

async function disconnectRedis() {
    if (redisClient.isOpen) {
      await redisClient.quit();
    }
}

module.exports = {
  redisClient,
  connectRedis,
  disconnectRedis
};