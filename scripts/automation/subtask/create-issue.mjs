import {createIssue} from "./github-graphql.mjs";

const title = process.argv[2];
const issueType  = process.argv[3];

const issueNumber = await createIssue(title.replaceAll('-', ' '), 'Ready', issueType);

console.log( `issueNumber: ${issueNumber}`);