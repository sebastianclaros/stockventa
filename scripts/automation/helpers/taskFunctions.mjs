import {execSync} from "child_process";
import context from "./context.mjs";
import { getIssue, getIssueState } from "./github-graphql.mjs";

function mergeArgs(args) {
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
export function executeShell(command, args) {
    try {
       const buffer = execSync( command + ' ' + convertArgsToString(args)) ;
       const salida = buffer.toString().trim();
       return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
    } catch (error) {
        return false;
    }
}

export async function executeFunction(functionName, args) {
    let returnValue = false;
    try {
        if ( typeof taskFunctions[functionName] === 'function' ) {         
            returnValue = await taskFunctions[functionName](...mergeArgs(args));            
        } else {
            throw new Error(`No se encontro la funcion ${functionName}`);
        }
    } catch (error) {
        returnValue=false;        
    }
    return returnValue;  
}


export const taskFunctions = {   

    // type: 'scratchOrgs', 'sandboxes', others
    getOrganizationObject(alias, type = 'scratchOrgs') {
        const buffer = execSync( 'sf org list --json' ) ;
        const salida = buffer.toString().trim();
        const salidaJson = JSON.parse(salida);
        const orgObject =  salidaJson.result[type].filter( scratch => scratch.alias === branchName );

        if ( orgObject.isExpired === true ) {
            throw new Error(`La scratch ${scratch.alias} ha expirado!`);
        }  
        return orgObject;
    },

    getTargetOrg() {
        const buffer = execSync( 'sf force config get target-org --json' ) ;
        const salida = buffer.toString().trim();
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
    
    validaNoseaBranchActual(newBranchName) {
    // current_branch=$(git branch --show-current)
    
    },

    async validateIssue(issueNumber, states) {        
        const currentState = await getIssueState(issueNumber);        
        const arrayStates = states.toLocaleLowerCase().replace(' ', '').split(',');
        return arrayStates.includes(currentState.toLocaleLowerCase().replace(' ', ''));
    },
    validateScratch() {
        // hayCambios=$(sf project retrieve preview)
    
        // if [[ $hayCambios == *"No files will be deleted"* ]] && [[ $hayCambios == *"No files will be retrieved"* ]] && [[ $hayCambios == *"No conflicts found"* ]]; then
        //     doInfo "No hay cambios"
        // else
        //     doInfo "$hayCambios"
        //     doExit "Hay cambios en la Org que no estan impactados $hayCambios"
        // fi
    },
    
    
    checkCommitPending() {
        // cambios=$(git status --porcelain=v1 2>/dev/null | wc -l)
    },
    
    checkoutBranch() {
        // git checkout -b $newBranch
        // mergeBranch
    },
    
    mergeBranch() {
        // git fetch
        // git merge origin/main
    },
    
    
    getBranchName() {
        try {
            const buffer = execSync( "git branch --show-current" ) ;
            const salida = buffer.toString().trim();
            return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
        } catch (error) {
        }
    },
    
    moveIssueInProgress() {
    
    },
    
    assignIssueToMe() {
        
    },
    
    checkIssueType() {
    //    issueJson=$("$script_full_path/subtask/get-issue.sh" $issueNumber)
    //    if [[ $issueJson == *"labels"*"automation"* ]]; then
    //        issueType='automation';
    //    fi
    //    if [[ $issueJson == *"labels"*"documentation"* ]];  then
    //        issueType='doc';
    //    fi
    }
}