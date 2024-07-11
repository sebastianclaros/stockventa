//import { getContext } from "./taskFunctions.mjs"
import context from "./context.mjs";
import { logError, logStep } from "./color.mjs";
import fs from "fs";
import { mergeArgs, executeFunction, executeCommand } from "./taskFunctions.mjs";
import prompts from "prompts";
export const TASKS_FOLDER = process.cwd() + "/scripts/automation/tasks";
export const SUBTASKS_FOLDER = process.cwd() + "/scripts/automation/subtasks";

const filterJson = (file) => file.endsWith(".json");

function getTaskLists(folder) {
    const files = getFiles(folder, filterJson);
    return files.map( filename => filename.split(".")[0] );
}

export function getTasks(folder=TASKS_FOLDER) {
  const tasks = {};
  for (const taskName of getTaskLists(folder)) {
    tasks[taskName] = getTask(taskName, folder);
  }
  return tasks;
}

function getTask(taskName, folder) {
    const filename =  folder + "/" + taskName + ".json";
    const content = fs.readFileSync(filename, "utf8");
    try {
      return JSON.parse(content);
    } catch (error) {
      throw new Error(`Verifique que el ${filename} sea json valido`  );
    }
}

function isCriteriaMet(criteria) {
  if ( !criteria ) {
    return true;
  }
  const { field, value} = criteria;
  // si no viene valor solo verifica que tenga no este vacio
  if ( !value ) {
    return context[field] ;
  } 
  const result = context[field] == value;
  return result;
}

export async function helpTask(task){

}
export async function runTask(task, taskContext, tabs = ''){
  // Valida que este ya esten las variables de enotorno y  configuracion
  if ( task.guards ) {
    await context.validate(task.guards);
  }
  // Pide datos de entrada y los deja en context
  if ( task.arguments ) {
    if ( taskContext ) {
      context.setObject(taskContext);
    }
    await context.askForArguments(task.arguments);
  }
  logStep( `[INICIO] ${task.name}`, tabs );
  for ( const step of task.steps ) {
    if ( isCriteriaMet(step.criteria) ) {
      if ( ! await executeStep(step, tabs + '\t') ) {
        return false;
      }
    }
  }
  logStep(`[FIN] ${task.name}`, tabs);  
  return true;
}

export async function previewTask(task, tabs = '') {
  logStep(`${task.name}: ${task.description}`, tabs );
    
  for ( const step of task.steps ) {
    previewStep(step, tabs); 
  }
}

function previewStep(step, tabs = '') {
  if ( step.criteria ) {
    logStep(`Si ${step.criteria.field} ${step.criteria.operator || '=='} ${step.criteria.value}`, tabs );
    tabs += '\t';
  }
  if ( step.subtask ) {
    tabs += '\t';
    const subtask = getTask(task.subtask, SUBTASKS_FOLDER);
    previewTask(subtask, tabs);
  } else {
    logStep(`${step.name}`, tabs );
  }
}
export function createObject(fields, values) {
  const fieldArray = Array.isArray(fields) ? fields: Object.keys(fields); 
  const argsObject = {};    
  for ( const value of values ) {
      const field = fieldArray.shift();
      argsObject[field] = value;    
  }
  return argsObject;
}    

async function runStep(step, tabs) {
  if ( step.command ) {
    return executeCommand( step.command, step.arguments );
  } else if ( step.function ) {
    return await executeFunction(step.function, step.arguments);
  } else if ( step.subtask ) {
    const subtask = getTask(step.subtask, SUBTASKS_FOLDER);
    
    let stepContext = mergeArgs(step.arguments);
    if ( Array.isArray(stepContext) ) {
      stepContext = createObject( subtask.arguments, stepContext);    
    }     
    return await runTask(subtask, stepContext ,tabs);
  }
  throw new Error(`No se pudo ejecutar el step ${step.name} porque no tiene command, function o subtasks`);
}

async function askForContinue() {
  if (!context.isVerbose ) {
    return false;
  }
  const answer = await prompts([
    {
      type: "confirm",
      name: "continue",
      message: "Desea continuar?"
    }
  ]);

  return answer.continue;
} 

function getStepError(step) {
  return step.errorMessage ? context.merge(step.errorMessage): step.name ? `Fallo el step ${step.name}` : '';
}
async function executeStep(step, tabs) {
  if ( step.name ) {
    logStep(`[INICIO] ${step.name}`, tabs);
  }
  
  const success = await runStep(step, tabs);
  if ( !success) {
    logError(`[ERROR] ${getStepError(step)}`, tabs );
    if ( ! await askForContinue() ) {
      return false;
    } 
  }
  if ( step.name ) {
    logStep(`[FIN] ${step.name}`, tabs );
  }
  return true;
}

function getFiles(source, filter=(file)=>true, recursive = false, ignoreList = []) {
    const files = [];
    for (const file of fs.readdirSync(source)) {
      const fullPath = source + "/" + file;
      const filtered = filter(file);
      if ( filtered ) {
          if (fs.lstatSync(fullPath).isDirectory() && recursive && !ignoreList.includes(file)) {
            getFiles(fullPath, recursive, ignoreList).forEach((x) => files.push(file + "/" + x));
          } else {
            files.push(file);
          }
      }
    }
    return files;
  }
  