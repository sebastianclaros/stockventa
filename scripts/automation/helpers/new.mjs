import prompts from "prompts";
import fs from "fs";
import { splitFilename, WORKING_FOLDER } from "./util.mjs";
import templateGenerator from "./template.mjs";
const templateEngine = templateGenerator(".", "md");

async function readPipedInput() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;

  return data;
}

// async function readPipedInput() {
//     const stdin = process.stdin;
//     let data = '';

//     stdin.setEncoding('utf8');

//     stdin.on('data', function (chunk) {
//       data += chunk;
//     });

//     stdin.on('end', function () {
//       return  data;
//     });
// }

export async function execute( template, filename, context) {
  if (!template || !filename) {
    return;
  }

  const file = splitFilename(filename, WORKING_FOLDER);
  const formulas = {
    today: Date.now(),
    filename: file.filename
  };
  let view;

  if (context) {
    const contextFile = WORKING_FOLDER + "/" + context;
    if (fs.existsSync(contextFile)) {
      const content = fs.readFileSync(contextFile, "utf8");
      view = JSON.parse(content);
    } else if (typeof context == "object") {
      view = context;
    }
  } else {
    const content = await readPipedInput();
    view = JSON.parse(content);
  }
  templateEngine.read(template);
  templateEngine.render(view ? Object.assign(view, formulas) : formulas);
  templateEngine.save(file.filename, file.folder, { create: true });
}