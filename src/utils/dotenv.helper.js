const logger = require("./logger/loggers.js");

const requiredEnvVars = {
    REDIS_HOST: process.env.REDIS_HOST?.trim(),
    REDIS_PORT: process.env.REDIS_PORT?.trim(),
    PG_HOST: process.env.PG_HOST?.trim(),
    PG_PORT: process.env.PG_PORT?.trim(),
    PG_DATABASE: process.env.PG_DATABASE?.trim(),
    PG_USER: process.env.PG_USER?.trim(),
    PG_PASSWORD: process.env.PG_PASSWORD?.trim(),
    SECRET_SESSIONS: process.env.SECRET_SESSIONS?.trim(),
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID?.trim(),
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET?.trim(),
    GMAIL_CREDENTIAL_USER: process.env.GMAIL_CREDENTIAL_USER?.trim(), 
    GMAIL_CREDENTIAL_TOKEN: process.env.GMAIL_CREDENTIAL_TOKEN?.trim(),
    gmail: true,
    github: true,
};

const missing = Object.entries(requiredEnvVars)
    .filter(env => {
        const [, Value] = env;
        return !Value || Value.length === 0})
    .map(([key]) => key);


if (missing.length > 0) {
    logger.info(`Variables de entorno faltantes o vacías:\n- ${missing.join(', \n- ')}`);
}

if(!process.env.REDIS_HOST?.trim() || !process.env.REDIS_PORT?.trim()){
    logger.error("🔴 Las variables de entorno para Redis no están definidas.");
    process.exit()
}

if(!process.env.PG_HOST?.trim() || !process.env.PG_PORT?.trim() || !process.env.PG_DATABASE?.trim() || !process.env.PG_USER?.trim() || !process.env.PG_PASSWORD?.trim() || !process.env.SECRET_SESSIONS?.trim()){
    logger.error("🔴 Las variables de entorno para PostgreSQL o SECRET_SESSIONS no están definidas.");
    process.exit()
}

if(!process.env.GMAIL_CREDENTIAL_USER?.trim() && !process.env.GMAIL_CREDENTIAL_TOKEN?.trim()){
    logger.info("⚠️ Envío de emails Desactivado")
    requiredEnvVars.gmail = false
}

if(!process.env.GITHUB_CLIENT_ID?.trim() || !process.env.GITHUB_CLIENT_SECRET?.trim()){
    logger.info("⚠️ Autenticacion con GITHUB Desactivada")
    requiredEnvVars.github = false
}

const validateEnvVars = (type) => {
    return requiredEnvVars[type];
}

module.exports = {
    validateEnvVars
}

