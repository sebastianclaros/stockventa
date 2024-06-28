// Comandos validos
import {getTasks, execute} from "./helpers/auto.mjs";
import context from "./helpers/context.mjs";
import { getColored } from "./helpers/color.mjs";
import prompts from "prompts";
//const prompts = require("prompts");

let config = { taskName: process.argv[2] , argumentos: process.argv.slice(3) };
const tasks = getTasks();

const taskInvalid =  config.taskName && !tasks[config.taskName];

if ( !config.taskName ) {
    const response = await prompts({
        type: "select",
        name: "taskName",
        message: taskInvalid
        ? `${config.taskName} no es un comando valido`
        : "Seleccione un comando",
        choices: Object.values(tasks).map((task) => {
            const selected = task.name == 'new';
            return { selected, title: task.name, value: task.name, description: task.description };
        })
    });
    config.taskName = response.taskName;
}
const task = tasks[config.taskName];

console.info(getColored(`[INICIO] ${task.name}`, "green") )

console.log( context );
for ( const step of task.steps ) {
    if ( step.criteria ) {
        const { field, value } = step.criteria;
        const result = context.get(field) == value;
        if ( !result ) {
            break;
        }   
    }
    console.info(getColored(`[INICIO] ${step.name}`, "green") )
    if ( await execute(step) )  {
        console.info(getColored(`[FIN] ${step.name}`, "green") )        
    }
}
console.info(getColored(`[FIN] ${task.name}`, "green") );
