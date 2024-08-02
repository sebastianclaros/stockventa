import { graphql } from "@octokit/graphql";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'sebastianclaros';
const REPO = 'stockventa';
const PROJECT_NUMBER = 3;

const repoVar = { owner: OWNER, repo: REPO }
const graphqlAuth = graphql.defaults({
  headers: {
    authorization: `Bearer ${GITHUB_TOKEN}`,
    "X-Github-Next-Global-ID": 1
  },
});

async function getUser() {
  const query = `{
    viewer {
      login
      id
    }
  }`;
  const {viewer } = await graphqlAuth(query);
  return viewer;
}

export async function getColumnValueMap() {
  const query = `
      query getFieldOptions($owner:String!, $repo: String!, $projectNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          projectV2(number: $projectNumber) {
            field(name: "Status") {
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  name
                  id
                }
              }                
            }
          }
        }
      }
  `; 

  const { repository } = await graphqlAuth(query, { projectNumber: PROJECT_NUMBER,...repoVar});
  let mapValues = {}
  for ( const option of repository.projectV2.field.options ) {
    mapValues[option.name] = option.id;
  }
  return mapValues;
}

export async function createPullRequest(issueNumber) {
  const repository = await getRepository();
  const repositoryId = repository.id;
  const issue = await getIssue(issueNumber);
  const headRefName = 'main';
  if ( !issue.linkedBranches.nodes.length > 0 ) {
    return false;
  }
  const baseRefName = result.linkedBranches.nodes[0].ref.name;

  const mutationPullRequest = `
    mutation createPullRequest( $baseRefName: String!, $headRefName: String!, $headRepositoryId: ID, $repositoryId: ID!, $title: String!, $body: String ) {
      createIssue(
          input: {
            repositoryId: $repositoryId,
            headRefName: $headRefName,
            headRepositoryId: $headRepositoryId,
            baseRefName: $baseRefName,
            title: $title,
            body: $body
          }
      ) {
        createPullRequest {
          id
          number
        }
      }
    }`;
  const result = await graphqlAuth(mutationPullRequest, { baseRefName, headRefName, headRepositoryId: repositoryId, repositoryId, title, body });
  console.log(result);
  return false;
}

export async function createIssue(title, columnName, label, milestone, body ) {
  const user = await getUser();
  const repository = await getRepository(label);
  const repositoryId = repository.id;
  const labelId = repository.label?.id;
  const projectId = repository.projectV2.id;
  const mutationIssue = `
    mutation createIssue($repositoryId: ID!, $assignId: ID!, $title: String!, $body: String, ${ labelId ? '$labelId: ID!': ''} , $milestoneId: ID ) {
      createIssue(
          input: {
            repositoryId: $repositoryId,
            assigneeIds: [$assignId],
            ${labelId ? 'labelIds: [$labelId],': ''}
            title: $title,
            milestoneId: $milestoneId,
            body: $body
          }
      ) {
        issue {
          id
          number
        }
      }
    }`;
  const { createIssue } = await graphqlAuth(mutationIssue, { labelId,  body, assignId: user.id,  projectId, repositoryId, title, label: label?  [label]: null });
  const issue = createIssue.issue;
  if ( !columnName || !issue.number) {
    return issue.number;
  }
  const mutationItem = `
    mutation addProjectV2ItemById($projectId: ID!, $contentId: ID! ) {
      addProjectV2ItemById(
          input: {
            projectId: $projectId
            contentId: $contentId
          }
      ) {
        clientMutationId,
        item {
          id
        }
      }
    }`;
  const { addProjectV2ItemById } = await graphqlAuth(mutationItem, { projectId, contentId: issue.id });  
  const itemId = addProjectV2ItemById.item.id;

  const fieldId = repository.projectV2.field.id;
  const mapValues = await getColumnValueMap();
  const columnValue = mapValues[columnName]; 
  const mutationColumn = `
  mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $columnValue: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: {singleSelectOptionId: $columnValue}
      }
    ) {
      clientMutationId
    }
  }`;
  const {updateProjectV2ItemFieldValue } = await graphqlAuth(mutationColumn, { projectId, itemId, fieldId, columnValue });

  return issue.number;  
}

export async function moveIssue(issueNumber, columnName) {
  const issue = await getIssue(issueNumber);
  const itemId = issue.projectItems.nodes[0].id;
  const projectId = issue.projectItems.nodes[0].project.id;  
  const fieldId = issue.projectItems.nodes[0].fieldValueByName.field.id;
  const mapValues = await getColumnValueMap();
  const columnValue = mapValues[columnName]; 
  const mutation = `
  mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $columnValue: String!) {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: {singleSelectOptionId: $columnValue}
      }
    ) {
      projectV2Item {
        id
      }
    }
  }`;
  const {updateProjectV2ItemFieldValue } = await graphqlAuth(mutation, { projectId, itemId, fieldId, columnValue });
  return updateProjectV2ItemFieldValue?.projectV2Item ? true: false ;  
}

export async function assignIssueToMe(issueNumber) {
  const user = await getUser();
  const issue = await getIssue(issueNumber);
  const mutation = `
    mutation assignUser( $issueId: ID!, $userId: ID!) { 
      addAssigneesToAssignable(input: {
        assignableId: $issueId
        assigneeIds: [ $userId ]
      }) {
        assignable {
          assignees {
            totalCount
          }
        }
      } 
    }    
  `;
  const {addAssigneesToAssignable } = await graphqlAuth(mutation, { issueId: issue.id, userId: user.id });
  return addAssigneesToAssignable.assignable.assignees.totalCount > 0 ;  
}

export async function getCommit(commitSha) {
  const query = `
    query getCommit($owner:String!, $repo: String!, $commitSha: String!) {
      repository(owner: $owner, name: $repo) {
        object(expression: $commitSha) {
              ... on Commit {
                id
                oid
              }
            }
      }
    } `; 
  const { repository } = await graphqlAuth(query, { commitSha,...repoVar});
  return repository.object; 
}

export async function assignBranchToIssue(issueNumber, branchName, commitSha) {
  const issue = await getIssue(issueNumber);  
  const commit = await getCommit(commitSha);
  const mutation = `
    mutation createLinkedBranch( $issueId: ID!, $oid: GitObjectID!, $branchName: String!) { 
      createLinkedBranch(input: {
        issueId: $issueId
        oid: $oid
        name: $branchName
      })
      {
        issue {
          id
        }
      }
    }`;
  const {createLinkedBranch } = await graphqlAuth(mutation, { issueId: issue.id, oid: commit.oid, branchName });
  console.log(createLinkedBranch);
  return createLinkedBranch?.issue?.id ? true: false ;  
}

export async function getValidateIssueColumn(issueNumber, columnName) {
    const issue = await getIssue(issueNumber);
}


/*
query ($owner:String!, $repo: String!, $issueNumber: Int!) {
  repository(owner: $owner, name: $repo) {
    issue(number: $issueNumber) {
      title
      linkedBranches(last:1){
      	  nodes {
          	  ref {
          	    name
          	  }
          }
      }
    }
  }
}
*/  

export async function getIssueState(issueNumber){
  const issue = await getIssue(issueNumber);
  return issue.projectItems?.nodes[0]?.fieldValueByName?.name;
}

export async function getMyIssues(issueNumber){

}

function getIssueName(title) {
  return title.toLowerCase().replaceAll(' ', '-');
}
export async function getIssueObject(issueNumber){
  const result = await getIssue(issueNumber);
  const addFields = {};
  addFields.name = getIssueName(result.title);
  if ( result.linkedBranches.nodes.length > 0 ) {
    addFields.branch = result.linkedBranches.nodes[0].ref.name;
  }
  delete result.linkedBranches;

  if ( result.projectItems.nodes.length > 0 ) {
    addFields.state = result.projectItems.nodes[0].fieldValueByName.name;
  }
  delete result.projectItems;

  if ( result.labels.nodes.length > 0 ) {
    addFields.labels = [];
    for ( const node of result.labels.nodes ) {
      addFields.labels.push(node.name);
    }
  }
  delete result.labels;

  return { ...addFields,  ...result};
}

export async function getRepository(label){
  const query = `
      query getRepo($owner:String!, $repo: String!, $projectNumber: Int!, ${label ?  '$label: String!': ''} ) {
        repository(owner: $owner, name: $repo) {
          id
          ${ label ? 
            `label(name: $label) {
              id
            }` :''
          }
          projectV2( number: $projectNumber ) {
            id
            field(name: "Status") {
              ... on ProjectV2SingleSelectField {
                id
                name
                options {
                  name
                  id
                }
              }                
            }
          }
        }
      }
  `; 
  const { repository } = await graphqlAuth(query, { label, projectNumber: PROJECT_NUMBER,...repoVar});
  return repository;
}

export async function getIssue(issueNumber){
  const query = `
      query getIssue($owner:String!, $repo: String!, $issueNumber: Int!) {
        repository(owner: $owner, name: $repo) {
          issue(number: $issueNumber) {
            title
            id
            labels(first:3, orderBy:  { field: CREATED_AT, direction: DESC}) {
              nodes {
                color
                name
              }
            }
            projectItems(last: 1) {
              nodes{
                id, 
                project {
                  id
                }
                fieldValueByName(name: "Status"){
      						... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    id
                    field {
                      ... on ProjectV2SingleSelectField {
                        id
                      }
                    }
                  }
                }
              }
            }             
            linkedBranches(last:1){
                nodes {
                    ref {
                      id
                      name
                    }
                }
            }
          }
        }
      }
  `; 

  const { repository } = await graphqlAuth(query, { issueNumber: parseInt(issueNumber),...repoVar});

  return repository.issue;
}

export async function getIssuesByState(state){
    // let issues = [];
    // const result = await octokit.request(`GET /repos/${owner}/${repo}/issues`, {
    //     headers: {
    //     'X-GitHub-Api-Version': '2022-11-28'
    // }
    // });
    // if ( result.status === 200 ) {
    //     for ( const issue of result.data) {
    //         const labels = issue.labels.map( label=> label.name );
    //         const assignees = issue.assignees.map( assignee => assignee.login );
    //         issues.push( { body: issue.body, labels, assignees, state: issue.state, number: issue.number, title: issue.title } );
    //     }
    // }
    // return issues;
}