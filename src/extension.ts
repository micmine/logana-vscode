// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import fs from "node:fs";
import path from "path";
const sep = path.sep;

const diagnosticsCollection =
  vscode.languages.createDiagnosticCollection("logana");

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand("logana.helloWorld", () => {
    readLoganaFile();
  });

  context.subscriptions.push(disposable);
}

function getProjectPath() {
  const activeEditor = vscode.window.activeTextEditor;

  if (activeEditor) {
    const currentFileUri = activeEditor.document.uri;
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(currentFileUri);

    if (workspaceFolder) {
      return workspaceFolder.uri.fsPath;
    } else {
      vscode.window.showErrorMessage(
        "No workspace folder found for the current file.",
      );
    }
  } else {
    vscode.window.showErrorMessage("No active text editor found.");
  }
}

/**
 * @description Read logafile tirgger the rest of the process
 */
function readLoganaFile() {
  const projectPath = getProjectPath();
  if (!projectPath) {
    return;
  }

  fs.readFile(projectPath + sep + ".logana-report", "utf8", (err, data) => {
    const errors = parse(data);
    setProblems(errors);
  });
}

interface Message {
  filename: string;
  lnum: string;
  col: string;
  text: string;
}

/**
 * @description parse messages from string
 */
export function parse(content: string): Array<Message> {
  if (content === null) {
    return [];
  }

  const result: Array<Message> = [];

  for (let line of content.split(/([^\r\n]*)[\r\n]?/)) {
    if (line !== "") {
      // Handle windows drive
      let drive = "";
      if (line[1] === ":") {
        drive = line.substring(0, 3);
        line = line.substring(3);
      }

      const message = line.split("|");
      const location = message[0];
      const text = message[1];

      const splitLocation = location.split(":");
      const path = splitLocation[0];
      const row = splitLocation[1];
      const col = splitLocation[2];

      result.push({
        filename: drive + path,
        lnum: row,
        col: col,
        text: text,
      });
    }
  }

  return result;
}

/**
 * @description convert Message to Diagnostic
 */
function createDiagnostic(message: Message): vscode.Diagnostic {
  const lineNumber = parseInt(message.lnum, 10);
  const columnNumber = parseInt(message.col, 10);

  const range = new vscode.Range(
    lineNumber - 1,
    columnNumber - 1,
    lineNumber - 1,
    columnNumber,
  );

  const diagnostic = new vscode.Diagnostic(
    range,
    message.text,
    vscode.DiagnosticSeverity.Error,
  );

  return diagnostic;
}

/**
 * @description Clear problems and set new errors
 */
function setProblems(messages: Array<Message>) {
  diagnosticsCollection.clear();
  messages.forEach((message) => {
    diagnosticsCollection.set(vscode.Uri.file(message.filename), [
      createDiagnostic(message),
    ]);
  });
}

// This method is called when your extension is deactivated
export function deactivate() {}
