import {createPullRequest} from "./github-graphql.mjs";

const title = process.argv[2];
const branchName  = process.argv[3];

const pull = await createPullRequest(title.replaceAll('-', ' '), branchName);

console.log( `pull: ${pull}`);