// Comandos validos
import {getTasks, runTask} from "./helpers/auto.mjs";
import prompts from "prompts";

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

runTask(task);