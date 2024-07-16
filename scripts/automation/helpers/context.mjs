import { executeShell, taskFunctions } from "./taskFunctions.mjs"
import prompts from "prompts";
import fs from "fs";

class Context {
    isGitRepo = true;
    sfInstalled = true; 
    sfToken = true;
    gitToken;

    branchName;
    issueNumber;
    issueType;

    _newIssueNumber;
    _newIssueType;
    newBranchName;
    
    defaultDias = 7
    permissionSet;
    issueTitle;
    isVerbose = false;
    projectPath = process.cwd();
    _scratch;
    existNewBranch = false; 

    loadConfig() {
        const filename =  this.projectPath +  "/.autoforce.json";
        const content = fs.readFileSync(filename, "utf8");
        try {
          const config = JSON.parse(content);
          for( const key in config ) {
            this.set( key, config[key] );
          }
        } catch (error) {
          throw new Error(`Verifique que el ${filename} sea json valido`  );
        }
      
    }

    init() {
        // Busca variables de entorno    
        this.gitToken = process.env.GITHUB_TOKEN ;

        this.loadConfig();
        // 
        this.branchName = taskFunctions.getBranchName();

        if ( this.branchName ) {
            this.issueFromBranch(this.branchName);
        }
    }

    get targetOrg() {
        if ( !this._targetOrg ) {
            this._targetOrg= taskFunctions.getTargetOrg();        
        }
        return this._targetOrg;
    }

    get existBranchScratch() {
        if ( !this._scratch ) {
            this._scratch= taskFunctions.getOrganizationObject(this.getBranchName);
        }
        return this._scratch;

        return typeof this.scratch !== 'undefined';
    }

    
    get existScratch() {
        return typeof this.scratch !== 'undefined';
    }
    get scratch() {
        if ( !this._scratch ) {
            this._scratch= taskFunctions.getCurrentOrganization();
        }
        return this._scratch;
    }

    async validate(guards) {
        for(const guard of guards) {
            const value = await this.get(guard);
            if ( !value ) {
                throw new Error(`No se encontro la variable ${guard} en el contexto. Ejecute yarn auto config o lea el index.md para mas informacion.`);
            }
        }
    }

    issueFromBranch(branchName) {
        const branchSplit = branchName.split("/");
        if ( branchSplit.length > 1 ) {
            this.issueType = branchSplit[0];
            if ( Number.isInteger(branchSplit[1]) ) {
                this.issueNumber = branchSplit[1];
            } else {
//                    [this.issueNumber, this.issueTitle] = branchSplit[1].split() // /^([^ -]+)[ -](.*)$/.exec( branchSplit[1]).slice(1);
            }
        }
    }
    branchNameFromIssue (issueType, issueNumber, title) {
        let baseName =  issueType + '/' + issueNumber;
        if ( title ) {
            baseName += ' - ' + title.replaceAll(' ', '-');
        }
        return baseName;
    } 
    get isDevelopment() {
        return this.issueType === 'feature' || this.issueType === 'fix';
    }
    get isNewDevelopment() {
        return this.newIssueType === 'feature' || this.newIssueType === 'fix';
    }

    get newIssueNumber() {
        return this._newIssueNumber;
    }
    set newIssueNumber(value) {
        this._newIssueNumber = value;        
        if ( this.newIssueType )  {
            this.setNewBranchName();
        }
    }
    get newIssueType() {
        return this._newIssueType;
    }
    set newIssueType(value) {
        this._newIssueType = value;
        if ( this.newIssueNumber )  {
            this.setNewBranchName();
        }
    }
    setNewBranchName() {
        this.newBranchName =  this.branchNameFromIssue(this.newIssueType, this.newIssueNumber );
        const salida =  executeShell(`git show-ref refs/heads/${this.newBranchName}`);
        this.existNewBranch = salida && (salida.includes(this.newBranchName));        
    }
    async askFornewBranchName() { 
        if ( !this.newBranchName ) {
            if ( !this.newIssueType  ) {
                this.newIssueType = await this.askFornewIssueType();
            }

            if ( !this.newIssueNumber  ) {
                this.newIssueNumber = await this.askFornewIssueNumber();
            }
            this.setNewBranchName();
        }
        return this.newBranchName;
    }    

    async askFornewIssueNumber() {
        const answer = await prompts([
            {
              type: "text",
              name: "newIssueNumber",
              message: "Por favor ingrese el nuevo issueNumber?"
            }
          ]);  
                        
        return answer.newIssueNumber;
    }

    async askFornewIssueType() {
        const answer = await prompts([
            {
              type: "list",
              name: "newIssueType",
              initial: "feature",
              message: "Por favor ingrese el type del issue?",
              choices: [ "feature", "bug", "documentation", "automation" ]
            }
          ]);
        return answer.newIssueType;
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

    saveCredentials() {
        const scratchInfo = this.scratch();
        console.log(scratchInfo);
    }

    async askForArguments(inputs) {
        // unifica los dos tipos de inputs (array y objeto) en un array de inputs
        const inputsArray = this.convertToArrayOfInputs(inputs);

        for(const input of inputsArray) {
            const hasValue = await this.get(input.name);
            if ( !hasValue ) {
                const answer = await prompts([input]);
                if ( !answer ) {
                    process.exit();
                }
                this[input.name] =  answer[input.name];
            }
        }
    }
    setObject( obj ) {
        for ( const field in obj ) {
            this[field] = obj[field];    
        }
    }

    set( field, value ) {
        this[field] = value;    
    }

    // Devuelve el valor o hace un askFor si esta vacio
    async get(variable) { 
        if ( !this[variable] ) {
            const askForMethod = 'askFor' + variable;
            if ( this[askForMethod] && typeof this[askForMethod] == 'function' ) {
                this[variable] = await this[askForMethod]();
            }
        }
        return this[variable];
    }

    merge(text) {
        const mergeVariables = (t) => {
            if (!t) return '';
            return t.replace(/\$\{([^}]+)}/g, (match, variable) => {
                return this[variable];
            });
        };
        
        return mergeVariables(text);
    }
}

const context= new Context();

context.init();
export default context;