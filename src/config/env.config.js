//No se usa logger porque esta configuracion se ejecuta antes de que el logger este disponible.
//Configuracion de variables de entorno
const dotenv = require('dotenv');
const {environment} = require('./config.js')

dotenv.config({
    path:
        environment === 'production'
            ? './.env.production'
            : './.env',
});

const env = {
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
};

//validadores
function validateEnv() {
    const required = [
        'REDIS_HOST',
        'REDIS_PORT',
        'PG_HOST',
        'PG_PORT',
        'PG_DATABASE',
        'PG_USER',
        'PG_PASSWORD',
        'SECRET_SESSIONS',
    ];

    const missing = required.filter((key) => !env[key]);

    if (missing.length > 0) {
        console.error(
            `Variables faltantes:\n- ${missing.join('\n- ')}`
        );
    }

    if(!process.env.REDIS_HOST?.trim() || !process.env.REDIS_PORT?.trim()){
        console.error("🔴 Las variables de entorno para Redis no están definidas.");
        process.exit(1)
    }

    if(!process.env.PG_HOST?.trim() || !process.env.PG_PORT?.trim() || !process.env.PG_DATABASE?.trim() || !process.env.PG_USER?.trim() || !process.env.PG_PASSWORD?.trim() || !process.env.SECRET_SESSIONS?.trim()){
        console.error("🔴 Las variables de entorno para PostgreSQL o SECRET_SESSIONS no están definidas.");
        process.exit(1)
    }

    if(!process.env.GMAIL_CREDENTIAL_USER?.trim() && !process.env.GMAIL_CREDENTIAL_TOKEN?.trim()){
        console.info("⚠️ Envío de emails Desactivado")
        requiredEnvVars.gmail = false
    }

    if(!process.env.GITHUB_CLIENT_ID?.trim() || !process.env.GITHUB_CLIENT_SECRET?.trim()){
        console.info("⚠️ Autenticacion con GITHUB Desactivada")
        requiredEnvVars.github = false
    }
}

function isGithubEnabled() {
    return !!(
        env.GITHUB_CLIENT_ID &&
        env.GITHUB_CLIENT_SECRET
    );
}

function isEmailEnabled() {
    return !!(
        env.GMAIL_CREDENTIAL_USER &&
        env.GMAIL_CREDENTIAL_TOKEN
    );
}

module.exports = {
    env,
    validateEnv,
    isGithubEnabled,
    isEmailEnabled,
};