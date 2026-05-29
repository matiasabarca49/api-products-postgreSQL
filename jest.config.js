module.exports = {
  // El entorno de ejecución es Node.js
  testEnvironment: 'node',

  // Indica qué archivos buscar (cualquiera que termine en .test.js o .spec.js)
  testMatch: ['**/src/**/*.test.js', '**/tests/**/*.test.js'],

  // Un archivo que se ejecutará SIEMPRE antes de arrancar los tests
  // Ideal para configurar variables de entorno globales
  setupFiles: ['<rootDir>/tests/setupEnv.js'],

  // Un archivo que se ejecuta una vez que el entorno de Jest está listo
  // hooks globales de apertura/cierre de conexiones
  //setupFilesAfterEnv: ['<rootDir>/tests/globalSetup.js'],

  // Evitar que los tests se queden colgados si hay procesos abiertos
  forceExit: true,

  // Muestra cada test individual en la consola con un check verde o cruz roja
  verbose: true,
  
  // Si querés ver logs de Jest (útil para debugging)
  silent: false
};