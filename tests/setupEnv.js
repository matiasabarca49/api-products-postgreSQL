const path = require('path');

//cargar las variables de entorno del archivo .env.test
require('dotenv').config({ 
  path: path.resolve(__dirname, '../.env.test') 
});
