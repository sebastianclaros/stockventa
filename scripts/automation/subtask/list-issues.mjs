import {getIssuesByState, getMyIssues, getIssue} from "./github-graphql.mjs";

const filterType  = process.argv[2] || 'mine';

if ( filterType === 'issue' ) {
    const issueNumber = process.argv[3];
    const result = await getIssue(issueNumber);
    console.log( result.title );
    console.log( result.body);
}

if ( filterType === 'state' ) {
    const state = process.argv[3];
    const result = await getIssuesByState(state);
    console.log( result );
}

if ( filterType === 'mine' ) {
    const result = await getMyIssues();
    console.log( result );
}