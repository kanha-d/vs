// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as path from 'path';
import OpenAI from "openai";

const openai = new OpenAI({apiKey: "ADD_OPEN_AI_KEY"});


export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "my-vscode-extension" is now active!');
    vscode.window.showInformationMessage("Extension Activated 2");


    let disp = vscode.workspace.onDidChangeTextDocument(async (event) => {
        // vscode.window.showInformationMessage("Key Strokes ", event.contentChanges.map((change) => change.text).join(""));
        const addedText = event.contentChanges.map((change) => change.text).join('');  
        // Check if the "Enter" key is pressed
        if (addedText.includes('\n') || addedText.includes('\r')) {
            vscode.window.showInformationMessage('Enter key pressed!');
        
            const editor = vscode.window.activeTextEditor!;
            const cursorPosition = editor.selection.active;
            const documentText = editor.document.getText(new vscode.Range(cursorPosition.line, 0, cursorPosition.line, cursorPosition.character));
            vscode.window.showInformationMessage('Document Text ', documentText);
            // if(documentText.startsWith("//") && documentText.endsWith("##$")) {
            //     vscode.window.showInformationMessage("Extension Regex Matched ");
            //     let promptString = documentText.replaceAll("//", "");
            //     promptString = promptString.replaceAll("##$", "");
            //     const stream = await openai.chat.completions.create({
            //     model: "text-embedding-ada-002",
            //     messages: [{ role: "user", content: promptString }],
            //     max_tokens: 20000
            // }).catch((err) => {
            //     vscode.window.showInformationMessage("Error in openai API", err);
            // });
            // vscode.window.showInformationMessage("RESP ");
            // editor?.edit((editBuilder) => {
            //     const currentPosition = editor.selection.active;
            //                     const newPosition = currentPosition.with(currentPosition.line + 2, 0);
            //                     editBuilder.insert(newPosition, stream.choices[0].message.content!); 
            // })


            // }
            const inputStringTrimmed = documentText.trim();
            if (inputStringTrimmed.endsWith('-J')) {
                vscode.window.showInformationMessage('Fetching JIRA ');

                const result = await fetchJira(inputStringTrimmed, 'J');

                editor?.edit((editBuilder) => {
                    const currentPosition = editor.selection.active;
                    const newPosition = currentPosition.with(currentPosition.line + 2, 0);
                    editBuilder.insert(newPosition, result); 
                });
            } else if (inputStringTrimmed.endsWith('-G')) {


                let prompt: string = inputStringTrimmed.split("//").slice(-1)[0];

                const match = prompt.match(/:\s(.*?)(?=\s-G)/);

                if (match) {
                    const extractedText: string = match[1];
                    prompt = extractedText;
                } else {
                    vscode.window.showInformationMessage('No story found!');

                    return false;
                }

                vscode.window.showInformationMessage('Query: ' + prompt);

                vscode.window.showInformationMessage('COMPLETE CODE');
                try {
                    const result = await completeCode(prompt, openai);
                    vscode.window.showInformationMessage('The Result ', result.choices[0].message.content);
                    editor?.edit((editBuilder) => {
                        const currentPosition = editor.selection.active;
                        const newPosition = currentPosition.with(currentPosition.line + 2, 0);
                        editBuilder.insert(newPosition,result.choices[0].message.content); 
                    });
                } catch(err) {
                    editor?.edit((editBuilder) => {
                        const currentPosition = editor.selection.active;
                        const newPosition = currentPosition.with(currentPosition.line + 2, 0);
                        editBuilder.insert(newPosition,"ERROR IN OPENAI API KEY!"); 
                    });
                }
        
            } else if (inputStringTrimmed.endsWith('-C')) {


                let prompt: string = inputStringTrimmed;

                const match = prompt.match(/\/\/(.*?)(?=\s-C)/);

                if (match) {
                    const extractedText: string = match[1].trim();
                    prompt = extractedText;
                    console.log(prompt);  // Output: create a Microservice in spring boot of user controller CRUD operation with Mysql Database and JWT Authentication
                } else {
                    console.log('Not found anything ');
                }

                vscode.window.showInformationMessage('COMPLETE CODE');
                try {
                    const result = await completeCode(prompt, openai);
                    vscode.window.showInformationMessage('The Result ', result.choices[0].message.content);
                    editor?.edit((editBuilder) => {
                        const currentPosition = editor.selection.active;
                        const newPosition = currentPosition.with(currentPosition.line + 2, 0);
                        editBuilder.insert(newPosition,result.choices[0].message.content); 
                    });
                } catch(err) {
                    editor?.edit((editBuilder) => {
                        const currentPosition = editor.selection.active;
                        const newPosition = currentPosition.with(currentPosition.line + 2, 0);
                        editBuilder.insert(newPosition,"ERROR IN OPENAI API KEY!"); 
                    });
                }


        
            } else if (inputStringTrimmed.endsWith('-S')) {
                const matches = inputStringTrimmed.match(/\[(.*?)\]/);
                let result: any = "";
                if (matches) {
                    vscode.window.showInformationMessage('The Key ', matches[1]);

                    const key = matches[1].trim();

                    result = fetchJira(key, 'S');
                } else {
                    console.log('Not found the Key');
                }
                editor?.edit((editBuilder) => {
                    const currentPosition = editor.selection.active;
                    const newPosition = currentPosition.with(currentPosition.line + 2, 0);
                    editBuilder.insert(newPosition, result); 
                })
            } else {
                const result = '';
            }
        }
    })

}
async function fetchJira(key: string, type: string) {
    const jiraBaseUrl = "https://pypilot.atlassian.net";
    const username = "k.developer.x@gmail.com";
    const apiToken = "ATATT3xFfGF0H9Tt5bG1Uq3yPdAwQbmycyu9CvcYqXosYjkGLOwcdSLqBDsjeIaD_8QeerAqOyDCEsxR0fIfJ6i2k58c7zwHMouIjdXpofYgZk69tfRr1ASVkVmWrauHru940z8m3MckeDFvELXCtzq-HK8iREAfdsBI-T0CtirrDA-4z1Uhsaw=9B4BF8C0";

    const url = `${jiraBaseUrl}/rest/api/3/search`;
    const headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": 'Basic ' +  btoa(`${username}:${apiToken}`)
    };

    const query = {
        'jql': 'project = XYZKEY'
    };
    const testUrl = `${url}?${new URLSearchParams(query).toString()}`
    console.log("URL ", testUrl);

    const response = await fetch(`${url}?${new URLSearchParams(query).toString()}`, {
        method: 'GET',
        headers: headers,
    });

    const data: any = await response.json();
    console.log("THE DATA ", data);
    const issues = data.issues;
    let story = "";

    for (const issue of issues) {
        if (type === "J") {
            if (issue.fields.issuetype.name === 'Story') {
                story += `\n// Story -  ${issue.key} : ${issue.fields.summary} -G`;
            } else {
                continue;
            }
        } else {
            if (issue.key === key) {
                story = `\n// Story : ${issue.fields.summary} -G`;
                break;
            } else {
                story = "Not found with this key!";
            }
        }
    }

    return story;
}

async function completeCode(promptString: string, openAI:any) {
    try {
        const stream: any= await openAI.chat.completions.create({
            model: "gpt-3.5-turbo-0613",
            messages: [{ role: "user", content: promptString }],
        }).catch((err: any) => {
            console.log("ERROR - ", err);
            vscode.window.showInformationMessage("Open AI API KEY ERROR");
        });
        return stream;
    } catch(err) {
        vscode.window.showInformationMessage("Error in openai API");
        throw err;

    }
    // const stream: any= await openAI.chat.completions.create({
    //         model: "gpt-3.5-turbo-0613",
    //         messages: [{ role: "user", content: promptString }],
    //         max_tokens: 20000
    //     }).catch((err: any) => {
    //         vscode.window.showInformationMessage("Error in openai API", err);
    //         throw err;
    //     }).then((rep: any) => {
    //         return rep;
    //     })
}

