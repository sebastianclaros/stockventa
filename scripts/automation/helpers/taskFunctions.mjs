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
        console.log(functionName, args);
        // taskFunctions[functionName]();      
        return true;  
    } catch (error) {
        return false;        
    }
}

export const taskFunctions = {
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