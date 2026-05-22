/**
 * Redis para cola de tareas
 */
const Redis = require("ioredis");

const redisQueue = new Redis({
  host: process.env.HOST_REDIS || "127.0.0.1",
  port: process.env.PORT_REDIS || 6379,
  maxRetriesPerRequest: null
});

module.exports = redisQueue;