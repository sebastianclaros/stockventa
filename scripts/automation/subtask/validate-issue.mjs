import assert from "assert";
import {getIssueState} from "../helpers/github-graphql.mjs";

const compareStates = ( state ) => state.toLocaleLowerCase().replace(' ', '');
const issueNumber = process.argv[2];
const columns  = process.argv[3].split(',');
const state = await getIssueState(issueNumber);


for ( const column of columns) {
    if ( compareStates(column) === compareStates(state) ){
        process.exit(0) ;
    }
}


console.error(`El issue ${issueNumber} esta en ${state} en vez de: [${columns}]`);
process.exit(-1) ;
