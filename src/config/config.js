const { Command } = require('commander')
const program = new Command()

program
    .option('-d', 'Variable para debug', false)
    .option('-p <port>', 'Puerto del servidor', 8080)
    .option('--mode <mode>', 'Modo de trabajo', 'development')

// SI EJECUTAMOS TESTS, pasamos un array vacío para que Commander no intente leer los flags de Jest
if (process.env.NODE_ENV === 'test') {
  program.parse([], { from: 'user' }); 
} else {
  program.parse(process.argv);
}

const environment = program.opts().mode;

module.exports = {
    port: program.opts().p,
    environment: environment
}
