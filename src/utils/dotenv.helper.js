const requiredEnvVars = {
    MONGO_URL: process.env.MONGO_URL?.trim(),
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
    console.log(`Variables de entorno faltantes o vacías:\n- ${missing.join(', \n- ')}`);
}

if(!process.env.MONGO_URL?.trim() || !process.env.SECRET_SESSIONS?.trim()){
    console.log("🔴 [Error] Las variables de entorno MONGO_URL y SECRET_SESSIONS no están definidas.");
    process.exit()
}

if(!process.env.GMAIL_CREDENTIAL_USER?.trim() && !process.env.GMAIL_CREDENTIAL_TOKEN?.trim()){
    console.log("⚠️ [Info] Envío de emails Desactivado")
    requiredEnvVars.gmail = false
}

if(!process.env.GITHUB_CLIENT_ID?.trim() || !process.env.GITHUB_CLIENT_SECRET?.trim()){
    console.log("⚠️ [Info] Autenticacion con GITHUB Desactivada")
    requiredEnvVars.github = false
}

const validateEnvVars = (type) => {
    return requiredEnvVars[type];
}

module.exports = {
    validateEnvVars
}

