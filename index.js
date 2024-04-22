const core = require('@actions/core');
const github = require('@actions/github');
const { Client } = require('@notionhq/client');
const { usersList } = require('@notionhq/client/build/src/api-endpoints');

async function connectToNotion(notion) {
  const response = notion.databases.retrieve({ database_id: core.getInput('notion_database') })
  return response;
}



async function createCommit(notion, commits) {
  commits.forEach(async(commit) => {
    const array = commit.message.split(/\r?\n/);
    const title = array.shift();
    let description = ''
    array.forEach((element)=>{
      description +=  ' '+element
    })

    const index = commit.message.toUpperCase().indexOf("HQF-");
    const task = index !== -1 ? commit.message.substring(index + 4, index + 4 + 3) : '';
    core.info(`Extracted task ID: ${task}`);  // Log the task ID extracted from the commit message
    console.log("This is a test log message.");

    const taskDatabase = core.getInput('notion_task_database');
    core.info(`Task Database ID: ${taskDatabase}`); 
    const response =  await notion.databases.query({
      database_id: taskDatabase,
      filter: {
        property: 'Task ID',
        number: {
          equals: parseInt(task)
        }
      }
    });
    const page = response.results[0];

    core.info(`Page found: ${page ? page.id : 'No page found'}`); 

    notion.pages.create({
      parent: {
        database_id: core.getInput('notion_database')
      },
      properties:
      {
        title: {
          title: [
            {
              type: 'text',
              text: {
                content: title
              }
            }
          ]
        },
        task: {
          relation: [{ id: page.id }],
        },
        [core.getInput('commit_url')]:{
          url: commit.url
        },
        [core.getInput('commit_id')]:{
          rich_text:[
            {
              type: 'text',
              text:{
                content: commit.id
              }
            }
          ]
        },
        [core.getInput('commit_description')]:{
          rich_text:[
            {
              type: 'text',
              text:{
                content: description
              }
            }
          ]
        },
        [core.getInput('commit_project')]:{
          multi_select:[
            {
              name: github.context.repo.repo
            }
          ]
          
        },
        [core.getInput('commit_user')]:{
          multi_select:[
            {
              name: commit.committer.name
            }
          ]
        },
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: description
                }
              }
            ]
          }
        }
      ]
    })
  })
}


(async () => {
  try {
    const notion = new Client({ auth: core.getInput('notion_secret') })
    createCommit(notion, github.context.payload.commits)
  } catch (error) {

    core.setFailed(error.message);
  }
})();
