import { taskFunctions } from "./taskFunctions.mjs"
import prompts from "prompts";

/*
branchName 
defaultDias
permissionSet
issueNumber
*/

class Context {
    isGitRepo = true;
    sfToken = true;
    gitToken;
    branchName;
    defaultDias = 7
    permissionSet;
    issueNumber;
    issueTitle;
    newIssueNumber;
    issueType;
    isVerbose = false;
    projectPath = process.cwd();
    _scratch;
    existNewBranch = false; // git show-ref refs/heads/

    init() {
        // Busca variables de entorno    
        this.gitToken = process.env.GITHUB_TOKEN ;
        this.permissionSet = process.env.PERMISSION_SET;
        // 

        this.branchName = taskFunctions.getBranchName();

        if ( this.branchName ) {
            const branchSplit = this.branchName.split("/");
            if ( branchSplit.length > 1 ) {
                this.issueType = branchSplit[0];
                if ( Number.isInteger(branchSplit[1]) ) {
                    this.issueNumber = branchSplit[1];
                } else {
//                    [this.issueNumber, this.issueTitle] = branchSplit[1].split() // /^([^ -]+)[ -](.*)$/.exec( branchSplit[1]).slice(1);
                }
            }
        }
    }

    get targetOrg() {
        if ( !this._targetOrg ) {
            this._targetOrg= taskFunctions.getTargetOrg();        
        }
        return this._targetOrg;
    }
    get scratch() {
        if ( !this._scratch ) {
            this._scratch= taskFunctions.getOrganizationObject(this.branchName);
        }
        return this._scratch;
    }

    validate(guards) {
        for(const guard of guards) {
            if ( !this.get(guard) ) {
                throw new Error(`No se encontro la variable ${guard} en el contexto. Ejecute yarn auto config o lea el index.md para mas informacion.`);
            }
        }
    }

    async getnewIssueNumber() {
        const answer = await prompts([
            {
              type: "text",
              name: "newIssueNumber",
              message: "Por favor ingrese el nuevo issueNumber?"
            }
          ]);                
        return answer.newIssueNumber;
    }

    convertToArrayOfInputs(inputs) {
        let inputsArray = [];
        if ( Array.isArray(inputs) ) {
            // Si viene los args como ['name1', 'names] lo convierte a [{name: 'name1'}, {name: 'name2'}]
            inputsArray = inputs.map( input => { return { name: input, type: 'text', message: `Por favor ingrese ${input}?` }});
        } else {
            // Si viene args como objeto { name1: {...}, name2: {...}} lo convierte a [{name: name1...}, {name: name2...}]
            for (let key in inputs) {
                const initial = inputs[key].default ? this.merge(inputs[key].default): undefined;
                inputsArray.push( {name: key, type: 'text', initial, message: `Por favor ingrese ${key}?`, ...inputs[key]} ) ;
            }
        }
        return inputsArray;
    }

    async askForArguments(inputs) {
        // unifica los dos tipos de inputs (array y objeto) en un array de inputs
        const inputsArray = this.convertToArrayOfInputs(inputs);

        for(const input of inputsArray) {
            if ( !this.get(input.name) ) {
                const answer = await prompts([input]);
                this[input.name] =  answer[input.name];
            }
        }
    }

    set() {    
    }

    get(variable) { 
         return this[variable] ? this[variable]: ''; 
    }

    merge(text) {
        const mergeVariables = (t) => {
            if (!t) return '';
            return t.replace(/\$\{([^}]+)}/g, (match, variable) => {
                return this.get(variable);
            });
        };
        
        if ( Array.isArray(text) ) {
            return text.map( t => mergeVariables(t) );
        } else if ( typeof text === 'object' ) {            
            const mergedObject = {}
            for ( const key in text) {
                mergedObject[key] = mergeVariables(text[key]);
            }
            return mergedObject;
        } else {
            return mergeVariables(text);
        }
    }
}

const context= new Context();

context.init();
export default context;