import { getContext } from "./taskFunctions.mjs"

const TASKS_FOLDER = process.cwd() + "/scripts/automation/tasks";

import fs from "fs";
import {getRepository} from "./github-graphql.mjs"

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

function getTask(taskName) {
    const filename = TASKS_FOLDER + "/" + taskName + ".json";
    const content = fs.readFileSync(filename, "utf8");
    return JSON.parse(content);
}


export function execute(task) {
  getContext();
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
  