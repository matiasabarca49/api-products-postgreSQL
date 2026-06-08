//Inyección de variables de entorno para el frontend
const envFrontHandler = (req, res, next) => {

   res.locals.runtimeConfig = {
      apiUrl: process.env.API_URL || 'http://localhost:8080',
      frontendUrl: process.env.URL_FRONTEND || 'http://localhost:8080'
   }

   next()
}

module.exports = envFrontHandler