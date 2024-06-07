import {assignBranchToIssue} from "./github.mjs";

const issueNumber = process.argv[2];
const branch  = process.argv[3];
const result = await assignBranchToIssue(issueNumber, branch);