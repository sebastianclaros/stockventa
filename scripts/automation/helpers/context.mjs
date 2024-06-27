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

const context= new Context();

context.init();
export default context;