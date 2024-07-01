import { taskFunctions } from "./taskFunctions.mjs"
import prompts from "prompts";

/*
branchName 
defaultDias
permissionSet
issueNumber
*/

class Context {
    gitToken;
    branchName;
    defaultDias = 7
    permissionSet;
    issueNumber;
    issueTitle;
    newIssueNumber;
    issueType;
    isVerbose = false;
    
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

    async askForInputs(inputs) {        
        for(const input of inputs) {
            if ( !this.get(input) ) {
                if ( typeof this[`get${input}`] === 'function' ) {
                    this[input] = await this[`get${input}`]();
                } else {
                    const answer = await prompts([
                        {
                          type: "text",
                          name: input,
                          message: `Por favor ingrese ${input}?`
                        }
                      ]);                
                      this[input] =  answer[input];                
                }
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
        } else {
            return mergeVariables(text);
        }
    }
}

const context= new Context();

context.init();
export default context;