import { getBranchName } from "./taskFunctions.mjs"
/*
branchName 
defaultDias
permissionSet
issueNumber
*/

class Context {
    hasGithubToken = false;
    branchName;
    defaultDias = 7
    permissionSet;
    issueNumber;
    issueTitle;
    issueType;
    
    init() {
        console.log('init context');
        // Busca variables de entorno    
        this.hasGithubToken = process.env.GITHUB_TOKEN ;
        this.permissionSet = process.env.PERMISSION_SET;
        // 
        this.branchName = getBranchName();
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

    set() {    
    }

    get() { 

    }

    merge(text) {
    
    }
}

const context= new Context();

context.init();
export default context;