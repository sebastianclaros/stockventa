/*
branchName 
defaultDias
permissionSet
issueNumber
*/

class Context {
    branchName;
    defaultDias = 7
    permissionSet;
    issueNumber;
    
    constructor() {
        this.init()
    }

    init() {
        console.log('init context');
        // Busca variables de entorno    
    }

    set() {    
    }

    get() {    
    }

    merge(text) {
    
    }
}

export const context= new Context();
