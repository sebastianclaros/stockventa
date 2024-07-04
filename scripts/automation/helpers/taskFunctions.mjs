import {execSync} from "child_process";
// import { getRepository, moveIssue } from "./github-graphql.mjs";

export function executeShell(command, args) {
    try {
        console.log(command, args);
        // const buffer = execSync( command ) ;
        // const salida = buffer.toString().trim();
        // return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
        return true;  
    } catch (error) {
        return false;
    }
}

export function executeFunction(functionName, args) {
    try {
        if ( typeof taskFunctions[functionName] === 'function' ) {
            // taskFunctions[functionName](args);            
        } else {
            throw new Error(`No se encontro la funcion ${functionName}`);
        }
        return true;  
    } catch (error) {
        return false;        
    }
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

    validateIssue() {
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