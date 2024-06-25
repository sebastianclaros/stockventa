// Comandos validos
import {getTasks} from "./helpers/auto.mjs";
let config = { taskName: process.argv[2] , argumentos: process.argv.slice(3) };

const tasks = getTasks();

if ( config.taskName && !tasks[config.taskName] ) {
    console.error(`${config.taskName} no es un comando valido ( ${Object.keys(tasks)} ) `);    
}

if ( !config.taskName ) {
    // Pedir TaskName
    console.info(`TODO`);    
}
