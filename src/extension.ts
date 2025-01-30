// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import ollama from 'ollama';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "deepseek-vs" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  const disposable = vscode.commands.registerCommand('deepseek-vs.go-deep', () => {
    // The code you place here will be executed every time your command is executed
    // Display a message box to the user
    const panel = vscode.window.createWebviewPanel('go-deep', 'Go Deep', vscode.ViewColumn.One, {
      enableScripts: true
    });

    panel.webview.html = createWebViewToGoDeep();

    panel.webview.onDidReceiveMessage(async (message: { command: string; question: string }) => {
      if (message.command == 'go-deep') {
        const prompt = message.question;
        let response = '';

        try {
          const streamRes = await ollama.chat({
            model: 'deepseek-r1:7b',
            messages: [{ role: 'user', content: prompt }],
            stream: true
          });

          for await (const part of streamRes) {
            response += part.message.content;
            panel.webview.postMessage({
              command: 'go-deep-response',
              response
            });
          }
        } catch (err) {
          vscode.window.showErrorMessage('You are out of look right now. Try again later.');
        }
      }
    });
  });

  context.subscriptions.push(disposable);
}

const createWebViewToGoDeep = () => {
  return /*html*/ `
	<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Go Deep with DeepSeek</title>
  <style>
    /* Dark mode by default */
    :root {
      --background: #1e1e1e;
      --surface: #2d2d2d;
      --text: #ffffff;
      --primary: #007bff;
      --primary-hover: #0056b3;
      --border: #444;
      --response-bg: #3a3a3a;
    }

    body {
      font-family: 'Arial', sans-serif;
      background-color: var(--background);
      color: var(--text);
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 1rem;
      /* Add padding to prevent touching screen edges */
      height: 100%;
      box-sizing: border-box;
    }

    .container {
      background-color: var(--surface);
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      width: 100%;
      max-width: 600px;
      /* Adjusted for better fit */
      text-align: center;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      color: var(--text);
    }

    textarea {
      width: 100%;
      /* Adjust width to match container padding */
      height: 120px;
      padding: 0.75rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      resize: none;
      outline: none;
      background-color: var(--surface);
      color: var(--text);
      transition: border-color 0.3s ease;
      box-sizing: border-box;
    }

    textarea:focus {
      border-color: var(--primary);
    }

    button {
      background-color: var(--primary);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
      width: 100%;
      /* Make button full width */
      box-sizing: border-box;
    }

    button:hover {
      background-color: var(--primary-hover);
    }

    .response {
      margin-top: 1.5rem;
      padding: 1rem;
      background-color: var(--response-bg);
      border-radius: 8px;
      border: 1px solid var(--border);
      font-size: 1rem;
      color: var(--text);
      text-align: left;
      height: 200px;
      overflow-y: auto;
      transition: all 0.3s ease;
      width: 100%;
      /* Adjust width to match textarea */
      box-sizing: border-box;
    }

    /* Responsive design */
    @media (max-width: 600px) {
      .container {
        padding: 1.5rem;
        margin: 1rem;
      }

      h1 {
        font-size: 1.25rem;
      }

      textarea {
        height: 100px;
      }

      .response {
        height: 150px;
      }
    }
  </style>
</head>

<body>
  <div class="container">
    <h1>Go Deep with DeepSeek</h1>
    <textarea id="questionInput" placeholder="Type your question here..."></textarea>
    <button id="askButton">Go Deep!</button>
    <div id="response" class="response">Your response will appear here...</div>
  </div>

  <script>
    const vscode = acquireVsCodeApi();

    document.getElementById('askButton').addEventListener('click', function () {
      const question = document.getElementById('questionInput').value;
      const responseDiv = document.getElementById('response');

      if (question.trim() === '') {
        responseDiv.innerText = 'Please enter a question.';
        return;
      }

      // Send the question to the extension
      vscode.postMessage({ command: 'go-deep', question });

      // Clear the input and show a loading message
      responseDiv.innerText = 'Thinking deeply...';
    });

    // Listen for responses from the extension
    window.addEventListener('message', (event) => {
      const { command, response } = event.data;
      if (command === 'go-deep-response') {
        const responseDiv = document.getElementById('response');
        responseDiv.innerText = response;
      }
    });
  </script>
</body>

</html>

	`;
};

// This method is called when your extension is deactivated
export function deactivate() {}
