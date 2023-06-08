// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import {existsSync} from 'fs';
import * as path from 'path';
function getProjectPath(document:vscode.TextDocument) {
	const fileName = document.fileName;
	const workDir = path.dirname(fileName);
	const projectPath = vscode?.workspace?.getWorkspaceFolder(document.uri)?.uri.fsPath;
	return projectPath;
}

function provideDefinition(document:vscode.TextDocument, position:vscode.Position, token:vscode.CancellationToken) {
    const fileName    = document.fileName;
    const word        = document.getText(document.getWordRangeAtPosition(position));
    const line        = document.lineAt(position);
    const projectPath = getProjectPath(document);
    if(new RegExp(`goto://`).test(line.text)){
        let rem = line.text.match(/goto:\/\/(.+):(\d+):(\d+)/);
        if(rem === null){
            return;
        } 
        let [filePath, lineNum, charNum] = rem.slice(1);
        const goto = new vscode.Position(Number(lineNum) - 1, Number(charNum));
        const gotoUri = vscode.Uri.file(path.join(projectPath || '', filePath));
        return new vscode.Location(gotoUri, goto);
    }
}


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.languages.registerDefinitionProvider(['javascript'], {
        provideDefinition
    }));

	let disposable2 = vscode.commands.registerCommand('goto.copygoto', (document:vscode.TextDocument, position:vscode.Position, token:vscode.CancellationToken) => {
		const editor = vscode.window.activeTextEditor;
        if(editor) {
            // 获取选中文本
            const doc = editor.document;
            const selection = editor.selection;
			let relativePath = path.relative(getProjectPath(doc)||'', doc.fileName);
			let goto = `// goto://${relativePath}:${selection.start.line+1}:${selection.start.character+1}`;
			vscode.env.clipboard.writeText(goto);
        }
	});
	context.subscriptions.push(disposable2);

}

// This method is called when your extension is deactivated
export function deactivate() {}
