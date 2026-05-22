const { Queue } = require("bullmq");
const redisQueue  = require("../config/ioredisQueue.config.js");

const emailQueue = new Queue("emailQueue", {
  connection: redisQueue
});

module.exports = emailQueue;