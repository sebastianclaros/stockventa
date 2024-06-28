//import { getContext } from "./taskFunctions.mjs"
import context from "./context.mjs";
import { getColored } from "./color.mjs";

const TASKS_FOLDER = process.cwd() + "/scripts/automation/tasks";
const SUBTASKS_FOLDER = process.cwd() + "/scripts/automation/subtasks";

import fs from "fs";
import {getRepository} from "./github-graphql.mjs"
import { executeFunction, executeShell } from "./taskFunctions.mjs";

const filterJson = (file) => file.endsWith(".json");

function getTaskLists() {
    const files = getFiles(TASKS_FOLDER, filterJson);
    return files.map( filename => filename.split(".")[0] );
}

export function getTasks() {
  const tasks = {};
  for (const taskName of getTaskLists()) {
    tasks[taskName] = getTask(taskName);
  }
  return tasks;
}

function getTask(taskName, folder = TASKS_FOLDER) {
    const filename =  folder + "/" + taskName + ".json";
    const content = fs.readFileSync(filename, "utf8");
    return JSON.parse(content);
}

export async function runTask(task){
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
}

export function execute(task, verbose = false) {
  let success = false;

  if ( task.command ) {
    success = executeShell(task.command);
  } else if ( task.function ) {
    success = executeFunction(task.function);
  } else if ( task.subtasks ) {
    const subtask = getTask(task.subtasks, SUBTASKS_FOLDER);
    success = runTask(subtask);
  }

  if ( !success && verbose) {
    // pregunta si quiere skipear el error
    success = true;
  }
  return success;
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
  