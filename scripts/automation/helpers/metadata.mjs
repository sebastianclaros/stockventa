import prompts from "prompts";
import { getMetadataFromContext } from "./util.mjs";
import objectImport from "./object.mjs";
import classImport  from "./class.mjs";
import lwc  from "./lwc.mjs";
import newHelper  from "./new.mjs";

// Logica especificas de cada componente
const helpers = {
  objects: objectImport,
  classes: classImport,
  lwc
};


async function execute({ opciones }) {
  const hasRefresh =
    Object.keys(opciones).includes("r") &&
    opciones.r !== "false" &&
    opciones.r !== false;
  const components = Object.keys(helpers);
  //const nodes = getMetadataFromFile(opciones.f, components);
  const nodes = getMetadataFromContext(components);

  for (const node of nodes) {
    let hasRefreshed = false;
    const filename = node.hasChilds
      ? `${node.path}/intro.md`
      : `${node.path}/${node.name}.md`;
    await newHelper.execute({ template: "intro", filename, context: node });
    for (const component of components) {
      const items = node[component];
      if (items?.length > 0) {
        const helper = helpers[component];
        const opciones = { m: filename };
        if ( hasRefresh && !hasRefreshed) {
          opciones.o = "";
          hasRefreshed = true;
        } else {
          opciones.i = "";
        }
        await helper.execute({ items, opciones });
      }
    }
  }
}

export default {
  prompt,
  help,
  execute
};

/** To Depracate */
async function prompt(config) {
  const opciones = Object.keys(config.opciones);
  if (!opciones.includes("r")) {
    const response = await prompts([
      {
        type: "select",
        name: "refresh",
        initial: false,
        message: "Tiene que bajar o actualizar la metadata de Saleforce ?",
        choices: [
          { title: "Si (baja y actualiza el cache en docs)", value: true },
          { title: "No (lee el cache que esta en docs)", value: false }
        ]
      },
      {
        type: "text",
        name: "filename",
        initial: "docs/metadata.json",
        message: "Nombre del archivo metadata json"
      }
    ]);
    if (!response.refresh) {
      return;
    }
    config.opciones.r = response.refresh;
    config.opciones.f = response.filename;
  }
}

function help() {
  console.info("Este comando pretende documentar soluciones modularizadas.");
  console.info(
    "Recibe un json con la estructura jerarquica, ejemplo modulos, submodulos y procesos."
  );
  console.info(
    "El ultimo elemento, en el ejemplo el proceso tiene las clases, objetos, lwc y demas componenetes de documentacion relacionados."
  );
  console.info(
    "El comando genera un markdown indice para cada nodo, de forma tal que el modulo contiene todos los componentes de sus submodulos y estos los de sus procesos."
  );
  console.info(
    "Si se invoca con --r (refresh), baja primero toda la metadata de SF. Si no recibe el archivo .json toma por default docs/metadata.json "
  );
  console.info("> yarn doc:create metadata --r --f=<<archivo.json>>");
  console.info("> yarn doc:create metadata --f=<<archivo.json>>");
}

/**
 * example json

[
    {
    "name": "modulo",
    "description": "descripcion del modulo",
    "directory": "path", // si no viene es el name
    "components": [ 
        { 
        "name": "",
        "description": "descripcion del item",
        "folder": "folder-name-only", 
        "objects": [ "", ""], 
        "classes": [ "", ""],
        "lwc": [ "", ""]
        }
    ]
    }
]
 */
