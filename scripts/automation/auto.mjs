// Comandos validos
import {getTasks, previewTask, helpTask, runTask, TASKS_FOLDER, SUBTASKS_FOLDER} from "./helpers/tasks.mjs";
import prompts from "prompts";
const proxyCommnad = {
    'preview': previewTask , 
    'help': helpTask, 
    'run': runTask
}

try {
    const config = getConfigFromArgs();
    const tasks = getTasks(config.taskFolder);
    const taskName = await askForTaskName(config.taskName, tasks);
    if ( taskName ) {        
        const task = tasks[taskName];
        await proxyCommnad[config.command](task);
    }
} catch(error) {
    console.error(error.message);
}

function getConfigFromArgs() {
    const config = { taskFolder: TASKS_FOLDER};
    if ( process.argv[2] == 'help' || process.argv[2] == 'preview' ) {
        config.command = process.argv[2];
        config.taskName = process.argv[3];
    } else {
        config.command = 'run'; 
        if ( process.argv[2] == 'subtask' ) {
            config.taskName = process.argv[3];
            config.taskFolder = SUBTASKS_FOLDER;
        } else {
            config.taskName = process.argv[2];
        }
    }
    return config;
}

async function askForTaskName(taskName, tasks) {
    // Si exite lo devuelve
    if ( tasks[taskName] ) {
        return taskName;
    }
    // Sino pregunta
    const response = await prompts({
        type: "select",
        name: "taskName",
        message: taskName
        ? `${taskName} no es un comando valido`
        : "Seleccione un comando",
        choices: Object.values(tasks).map((task) => {
            const selected = task.name == 'new';
            return { selected, title: task.name, value: task.name, description: task.description };
        })
    });

    return response.taskName;
}