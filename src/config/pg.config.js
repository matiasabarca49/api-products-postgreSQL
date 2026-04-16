const { Pool } = require('pg')
const logger = require('../utils/logger/loggers.js')

const pool = new Pool({
    host:     process.env.PG_HOST,
    port:     process.env.PG_PORT,
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
})

// Verificamos la conexión al iniciar
pool.connect((err, client, release) => {
    if (err) {
        logger.error('Error conectando a PostgreSQL:', err.message)
        return
    }
    logger.info('✅ PostgreSQL conectado')
    release() // devuelve la conexión al pool
})

module.exports = pool