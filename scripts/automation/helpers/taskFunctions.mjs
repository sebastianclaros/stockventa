import {execSync} from "child_process";
import context from "./context.mjs";
import { getIssue, getIssueObject, moveIssue, assignBranchToIssue, assignIssueToMe, getIssueState } from "./github-graphql.mjs";
import { logError} from "./color.mjs";

export function mergeArgs(args) {
    if ( Array.isArray(args) ) {
        let argsArray = [];
        for ( const argName of args) {
            argsArray.push( context.merge(argName) );
        }
        return argsArray;
    } else if ( typeof args === 'object' ) {
        let argsObject = {};    
        for ( const argName in args) {
            argsObject[argName] =  context.merge(args[argName]);
        }
        return argsObject;
    }
    return null;
}
function convertArgsToString(args) {
    let argsString = '';
    if ( Array.isArray(args) ) {
        for ( const argName of args) {
            argsString += context.merge(argName) + ' ';
        }    
    } else if ( typeof args === 'object' ) {
        for ( const argName in args) {
            argsString += argName + '=' + context.merge(args[argName]) + ' ';
        }
    }
    return argsString;

}

export function executeCommand(command, args) {
    try {
       const execute = command + ' ' + convertArgsToString(args);
       context.set('command', execute );
       const buffer = execSync( execute) ;
       //const salida = buffer.toString().trim();
       //return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
       return true;
    } catch (error) {
        return false;
    }
}

export function validateCommand(command, args) {
    return true;
}

export function validateFunction(functionName, args) {
    if ( typeof taskFunctions[functionName] !== 'function' ) {       
        logError(`No se encontro la funcion ${functionName}`);
        return false;
    }
    if ( typeof args !== 'undefined' ) {        
        if ( typeof args !== 'object'  ) {
            logError(`La funcion ${functionName} recibio un argumento de tipo ${typeof args} y solo soporta object`);
            return false;    
        }
    }

    return true;
}

function getParams(func) {
    // String representation of the function code
    let str = func.toString(); 
    str = str.replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/(.)*/g, '')
        .replace(/{[\s\S]*}/, '')
        .replace(/=>/g, '')
        .trim();
    // Start parameter names after first '('
    let start = str.indexOf("(") + 1;
    // End parameter names is just before last ')'
    let end = str.length - 1;
    let result = str.substring(start, end).split(", ");
    let params = [];
    result.forEach(element => {
        element = element.replace(/=[\s\S]*/g, '').trim();
        if (element.length > 0)
            params.push(element);
    });
    return params;
}
function createArray(fields, object) {
    const fieldArray =[]; 
    for ( const field of fields ) {
        const value = object[field];
        fieldArray.push( value );    
    }
    return fieldArray;
} 
   
  

export async function executeFunction(functionName, args) {
    let returnValue = false;
    if ( typeof taskFunctions[functionName] === 'function' ) {       
        if ( args && typeof args === 'object' ) {
            let mergedArgs = mergeArgs(args);
            if ( !Array.isArray(mergedArgs) ) {
                const paramNames = getParams(taskFunctions[functionName]);
                mergedArgs = createArray(paramNames, mergedArgs );
            }
            returnValue = await taskFunctions[functionName](...mergedArgs);            
        } else {
            returnValue = await taskFunctions[functionName]();            
        }
    } else {
        throw new Error(`No se encontro la funcion ${functionName}`);
    }
    return returnValue;  
}

export function executeShell(command ) {
    try {
        const buffer = execSync( command ) ;
        const salida = buffer.toString().trim();
        return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
     } catch (error) {
        return false;
     }     
}


export const taskFunctions = {   

    // type: 'scratchOrgs', 'sandboxes', others
    getOrganizationObject(alias, type = 'scratchOrgs') {
        const salida = executeShell( 'sf org list --json' ) ;
        const salidaJson = JSON.parse(salida);
        const orgObject =  salidaJson.result[type].filter( scratch => scratch.alias === branchName );

        if ( orgObject.isExpired === true ) {
            throw new Error(`La scratch ${scratch.alias} ha expirado!`);
        }  
        return orgObject;
    },

    getTargetOrg() {
        const salida = executeShell( 'sf force config get target-org --json' ) ;
        const salidaJson = JSON.parse(salida);
        return salidaJson.result[0].value;
    },
    
    cancelIssue() {
        console.log('Not implemented');
    },
    deployIssue() {
        console.log('Not implemented');
    },
    rollbackIssue() {
        console.log('Not implemented');
    },
    createIssue() {
        console.log('Not implemented');
    },
    
    async validateIssue(issueNumber, states) {        
        const currentState = await getIssueState(issueNumber);        
        const arrayStates = states.toLocaleLowerCase().replace(' ', '').split(',');
        return arrayStates.includes(currentState.toLocaleLowerCase().replace(' ', ''));
    },
    validateScratch() {
        const salida = executeShell( "sf project retrieve preview" ) ;
        const noHayCambios = salida.substring('No files will be deleted') === -1 && hayCambios.substring('No files will be retrieved') === -1 && hayCambios.substring('No conflicts found') === -1
        if ( !noHayCambios ) {
            context.set('hayCambios', salida );
        }
        return noHayCambios;
    },
    
    
    getBranchName() {
        try {
            return  executeShell( "git branch --show-current" ) ;
        } catch (error) {
        }
    },

    async validaNoseaBranchActual(newBranchName) {
        return this.getBranchName() !== newBranchName;
    },

    
    async checkCommitPending() {
        try {
            const cambios = executeShell( "git status --porcelain=v1 2>/dev/null | wc -l" ) ;
            return cambios == '0' ;
        } catch (error) {
        }
        return false;
    },
    async createBranch() {
        try {
            const newBranchName = context.newBranchName;
            executeShell( `git checkout -b ${newBranchName}` ) ;
            context.set('branchName', this.getBranchName() );
            return true ;
        } catch (error) {
            console.log(error);
        }
        // mergeBranch
        return false;
    },    
    async mergeBranch() {
        try {
            executeShell( `git fetch` ) ;

            executeShell( `git merge origin/main` ) ;
            
            return true ;
        } catch (error) {
            console.log(error);
        }
        return false;
    },
    
    async moveIssue(issueNumber, state) {
        const result = await moveIssue(issueNumber, state);    
        return result;
    },
    
    async assignBranchToIssue(issueNumber, newBranchName) {
        const commitSha = executeShell( `git rev-parse --verify main` ) ; 
        const result = await assignBranchToIssue(issueNumber,newBranchName, commitSha);
        return result;
        
    },    

    
    async assignIssueToMe(issueNumber) {
        const result = await assignIssueToMe(issueNumber);    
        return result;
        
    },    

    async checkIssueType(issueNumber) {
        const issue = await getIssueObject(issueNumber);
        // Setea el issueType segun el issue
        try {
            let newIssueType = 'feature';
            if ( issue.labels?.length > 0 ) {
                if ( issue.labels.includes('documentation') ) {
                    newIssueType = 'doc';
                } else if ( issue.labels.includes('automation') ) {
                    newIssueType = 'automation';
                } else if ( issue.labels.includes('bug') ) {
                    newIssueType = 'fix';
                }
            }
            context.newIssueType =  newIssueType;
        } catch (error) {
            console.log(error);
        }

        return true;
    }
}