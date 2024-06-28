import {execSync} from "child_process";
// import fs from "fs";
// import { getRepository, moveIssue } from "./github-graphql.mjs";

export function executeShell(command) {
    try {
        const buffer = execSync( command ) ;
        const salida = buffer.toString().trim();
        return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
    } catch (error) {
        return false;
    }
}

export function executeFunction(functionName) {
    try {

    } catch (error) {
        return false;        
    }
}


export function getBranchName() {
    try {
        const buffer = execSync( "git branch --show-current" ) ;
        const salida = buffer.toString().trim();
        return ( salida.endsWith("\n") ? salida.slice(0, -1) : salida );
    } catch (error) {
    }
}

function moveIssueInProgress() {

}

function assignIssueToMe() {
    
}

function checkIssueType() {
//    issueJson=$("$script_full_path/subtask/get-issue.sh" $issueNumber)
//    if [[ $issueJson == *"labels"*"automation"* ]]; then
//        issueType='automation';
//    fi
//    if [[ $issueJson == *"labels"*"documentation"* ]];  then
//        issueType='doc';
//    fi
}