const { Worker } = require("bullmq");
const redisQueue  = require("../config/ioredisQueue.config.js");
const transporter = require("../config/mail.config.js");
const logger = require("../utils/logger/loggers.js");
const { isEmailEnabled } = require("../config/env.config.js")

const worker = new Worker(
  "emailQueue",
  async (job) =>{
    if(!isEmailEnabled()){
         logger.info("⚠️ [Worker] Envío de emails Desactivado. No se procesarán trabajos de email.")
    }else{
        if (job.name === "sendMail"){
            await transporter.sendMail({
                from: job.data.from,
                to: job.data.to,
                subject: job.data.subject,
                html: job.data.html
            },
            (error, info) => {
                if (error) {
                    if(info){
                        return logger.error(`[Worker] Error al enviar a ${info.envelope.to}: ${error.message}`);
                    }
                
                    logger.error(`[Worker] Error en el transporter`)
                } else {
                    logger.info(`[Worker] Correo enviado con éxito a ${info.envelope.to}`);
                }
            }
            );
        }
    }
  },
  {
    connection: redisQueue
  }
);