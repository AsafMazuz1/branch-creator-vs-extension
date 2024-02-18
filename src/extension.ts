// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "branch-creator" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('branch-creator.create', async () => {
        try {
            const selectedRepoPaths = await selectGitRepos();  // Adjusted to handle multiple selections
            if (!selectedRepoPaths || selectedRepoPaths.length === 0) {
                return;
            }
            // Get the configured branch name separator from settings
            const branchNameSeparator = vscode.workspace.getConfiguration('branch-creator').get<string>('branchNameSeparator', '-');
            const prefix = await selectPrefix();
            const ticketNumber = await getTicketNumber();
            const branchName = await getBranchName(branchNameSeparator);
            const branch = `${prefix}${branchNameSeparator}${ticketNumber}${branchNameSeparator}${branchName}`;

            const approval = await vscode.window.showQuickPick(['Yes', 'No'], {
                placeHolder: `Do you approve this name? ${branch}`
            });

            if (approval === 'Yes') {
                for (const repoPath of selectedRepoPaths) {
                    await createGitBranch(branch, repoPath);  // Create branch in each selected repo
                }
                vscode.window.showInformationMessage(`Branch created successfully in all selected repositories: ${branch}`);
            } else {
                vscode.window.showInformationMessage('Branch creation aborted.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`An error occurred: ${error}`);
        }
    });



    context.subscriptions.push(disposable);
}

export async function selectPrefix(): Promise<string> {
    // Get the configured prefixes from settings
    const prefixes = vscode.workspace.getConfiguration('branch-creator').get<string[]>('prefixes', []);
    // Add number before each prefix for quick selection
    prefixes.forEach((prefix, index) => {
        prefixes[index] = `${index + 1}. ${prefix}`;
    });
    const selected = await vscode.window.showQuickPick(prefixes, {
        placeHolder: 'Select a prefix'
    });
    // Remove the number from the selected prefix
    if (selected) {
        return selected.split('. ')[1];
    }
    return selected ?? "";
}

export async function getTicketNumber(): Promise<string> {
    const ticketNumber = await vscode.window.showInputBox({
        prompt: 'Enter the ticket number'
    });
    return ticketNumber ?? "";
}

export async function getBranchName(branchNameSeparator: string): Promise<string> {
    const branchName = await vscode.window.showInputBox({
        prompt: `Enter the branch name (lowercase, separated by '${branchNameSeparator}'):`,
    });
    return branchName ?? "";
}

export function createGitBranch(branchName: string, workspaceFolderPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(`git checkout -b ${branchName}`, { cwd: workspaceFolderPath }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error occurred while creating the branch: ${stderr}`);
                return;
            }
            resolve();
        });
    });
}

export async function getGitRepos(rootPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        fs.readdir(rootPath, { withFileTypes: true }, (err, entries) => {
            if (err) {
                reject(err);
                return;
            }
            let repoPaths = entries
                .filter(entry => entry.isDirectory())
                .map(dir => path.join(rootPath, dir.name))
                .filter(dirPath => fs.existsSync(path.join(dirPath, '.git')));

            // Check if the rootPath itself is a git repository
            if (fs.existsSync(path.join(rootPath, '.git'))) {
                repoPaths.unshift(rootPath); // Add the rootPath at the beginning of the array
            }

            resolve(repoPaths);
        });
    });
}

export async function selectGitRepos(): Promise<string[] | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found. Please open a workspace.');
        return undefined;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const repos = await getGitRepos(rootPath);

    if (repos.length === 0) {
        vscode.window.showErrorMessage('No Git repositories found in the workspace folder.');
        return undefined;
    }

    const repoChoices = repos.map(repoPath => ({
        label: repoPath === rootPath ? "$(file-directory) Workspace Root" : `$(file-submodule) ${path.basename(repoPath)}`,
        description: repoPath
    }));

    // Allow multiple selection in the QuickPick
    const selectedRepos = await vscode.window.showQuickPick(repoChoices, {
        placeHolder: 'Select Git repositories',
        canPickMany: true  // Enable multi-select
    });

    // Return the paths of the selected repositories
    return selectedRepos?.map(repo => repo.description);
}

// This method is called when your extension is deactivated
export function deactivate() { }
