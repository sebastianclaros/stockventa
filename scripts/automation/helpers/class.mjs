import sf from "./connect.mjs";
import templateGenerator from "./template.mjs";
const templateEngine = templateGenerator("dictionary", "md");

import {
  sortByName,
  getNamesByExtension,
  verFecha,
  splitFilename,
  DICTIONARY_FOLDER,
  DOCS_FOLDER,
  WORKING_FOLDER,
  DEFAULT_INTRO
} from "./util.mjs";
const DEFAULT_FILENAME = DOCS_FOLDER + "/.classes.json";

async function getContext(clases) {
  try {
    await sf.connect();
    const classRecords = await sf.getClasses(clases);
    return classRecords;
  } catch (e) {
    console.error(e);
  }
}

export function getClasses(files) {
  let contexts;
  const items = new Set();

  for ( const file of files ) {
    if (file.indexOf("/classes/") > 0 ) {
      const {filename} = splitFilename(file);
      items.add(filename.split(".")[0]);
    }
  }
  return [...items.values()];
}

function classLink() {
  const name = this.Name;
  return `./diccionarios/classes/${name}`;
}

function classLinkGraph() {
  const name = this.Name;
  return `./diccionarios/classes/${name}`;
}

function linkToType() {
  const dictionaryClasses = getNamesByExtension(
    DICTIONARY_FOLDER + "/classes",
    "md"
  );
  
  const fullType = this.replace("<", "~").replace(">", "~");
  const types = fullType.split("~");
  for (const t in types) {
    if (dictionaryClasses.includes(t)) {
      fullType.replace(t, `[{t}](./diccionarios/classes/{t})`);
    }
  }
  return fullType;
}

function filterByPublic() {
  return this.modifiers.includes("public") || this.modifiers.includes("global");
}

function scopeModifiers() {
  const modifiers = [];

  if (this.modifiers.includes("public") || this.modifiers.includes("global")) {
    modifiers.push(`+`);
  }
  if (this.modifiers.includes("private")) {
    modifiers.push(`-`);
  }
  if (this.modifiers.includes("protected")) {
    modifiers.push(`#`);
  }
  return modifiers.join(" ");
}

function modifiers() {
  const modifiers = [];

  if (this.modifiers.includes("abstract")) {
    attributes.push(`*`);
  }
  if (this.modifiers.includes("override")) {
    modifiers.push(`o`);
  }
  if (this.modifiers.includes("static") || this.modifiers.includes("final")) {
    modifiers.push(`$`);
  }
  return modifiers.join(" ");
}

function classAttributes() {
  const attributes = [];

  // if (this.isValid === "true") {
  //   attributes.push(`![Encripted](/img/password_60.png)`);
  // }
  if (this.SymbolTable.tableDeclaration.modifiers.includes("static")) {
    attributes.push(`$`);
  }
  if (
    this.SymbolTable.tableDeclaration.modifiers.includes("public") ||
    this.SymbolTable.tableDeclaration.modifiers.includes("global")
  ) {
    attributes.push(`+`);
  }
  if (this.SymbolTable.tableDeclaration.modifiers.includes("private")) {
    attributes.push(`-`);
  }
  if (this.SymbolTable.tableDeclaration.modifiers.includes("protected")) {
    attributes.push(`#`);
  }
  if (this.SymbolTable.tableDeclaration.modifiers.includes("global")) {
    attributes.push(`G`);
  }

  return attributes.join(" ");
}

function getInnerClasses(classes) {
  let ret = [];

  for (const clase of classes) {
    if (clase.SymbolTable?.innerClasses?.length > 0) {
      const innerClases = clase.SymbolTable.innerClasses.map((subclase) => {
        subclase.namespace =
          (clase.namespace ? clase.namespace + "." : "") + clase.Name;
        return {
          Name: subclase.name,
          type: "inner",
          namespace: subclase.namespace,
          SymbolTable: subclase
        };
      });
      ret = ret.concat(innerClases);
      const subInner = getInnerClasses(clase.SymbolTable.innerClasses);
      ret = ret.concat(subInner);
    }
  }
  return ret;
}

export async function executeClasses(items) {
  if (items.length === 0) {
    return;
  }
  // Busca la metadata
  let contexts = await getContext(items );
  if (!contexts || contexts.length === 0) {
    return;
  }
  
  // Arma el diccionario de cada Clase
  templateEngine.read("class");
  for (const context of contexts) {
    templateEngine.render(context, {
      helpers: {
        verFecha,
        modifiers,
        linkToType,
        classLinkGraph,
        filterByPublic
      }
    });
    templateEngine.save(context.Name, DICTIONARY_FOLDER + "/classes");
  }

  // Saca las innerClass y las pone como clases con namespace
  const innerClasses = getInnerClasses(contexts);
  let namespaces = {};
  if (innerClasses.length > 0) {
    templateEngine.read("class-inner");
    for (const context of innerClasses) {
      templateEngine.render(context, {
        helpers: { verFecha, modifiers, linkToType }
      });
      templateEngine.save(
        context.Name,
        DICTIONARY_FOLDER + "/classes/" + context.namespace,
        { create: true }
      );
      // arma un mapa de namespace con el array de sus innerclases
      if (namespaces[context.namespace] === undefined) {
        namespaces[context.namespace] = [context.Name];
      } else {
        namespaces[context.namespace].push(context.Name);
      }
    }
    contexts = contexts.concat(innerClasses);
  }

  // Arma el documento indice del grupo de clases
  contexts.sort(sortByName);
  templateEngine.read("classes");

  const classContext = { classes: contexts, namespaces };
  templateEngine.render(classContext, {
    helpers: {
      verFecha,
      modifiers,
      linkToType,
      filterByPublic,
      classLinkGraph,
      classLink
    }
  });
  const { folder, filename } = splitFilename(DEFAULT_INTRO, WORKING_FOLDER);
  templateEngine.save(filename, folder);
}


export default {
  getItems: getClasses,
  execute: executeClasses
}

/**
 * TODO
 * innerClass
 * annotations
 * locations links
 * complex types Map<Class, Class>
 * relaciones composicion, etc
 */

/* annotations
@AuraEnabled
@TestSetup
@TestVisible
@IsTest
@Future

@Deprecated
@InvocableMethod
@InvocableVariable
@JsonAccess
@NamespaceAccessible
@ReadOnly
@RemoteAction
@SuppressWarnings

@ReadOnly

REST API 
@RestResource(urlMapping='/nombremiapi')
@HttpDelete
@HttpGet
@HttpPatch
@HttpPost
@HttpPut
*/
