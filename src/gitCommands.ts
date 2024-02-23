import * as vscode from 'vscode';
import { exec } from 'child_process';
import { getGitReposOrWorkspace, listLocalBranches, findCommonBranches } from './utils';
import { getBranchDetails } from './branchManagement';

/**
 * Registers the command for creating a new Git branch.
 * @returns {vscode.Disposable} The disposable object representing the command registration.
 */
export function registerCreateBranchCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('branch-creator.create', async () => {
        try {
            const repoPaths = await getGitReposOrWorkspace();
            if (!repoPaths || repoPaths.length === 0) {
                vscode.window.showErrorMessage('No Git repositories found.');
                return;
            }
            const branchDetails = await getBranchDetails();
            if (!branchDetails) { return; } // User aborted the input process

            const { branchNameSeparator, prefix, ticketNumber, branchName, approval } = branchDetails;

            if (approval === 'Yes') {
                for (const repoPath of repoPaths) {
                    await createGitBranch(`${prefix}${branchNameSeparator}${ticketNumber}${branchNameSeparator}${branchName}`, repoPath);
                }
                vscode.window.showInformationMessage(`Branch created successfully in selected repositories: ${prefix}${branchNameSeparator}${ticketNumber}${branchNameSeparator}${branchName}`);
            } else {
                vscode.window.showInformationMessage('Branch creation aborted.');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`An error occurred: ${error}`);
        }
    });
}

/**
 * Creates a new Git branch in the specified repository.
 * @param {string} branchName The name of the branch to create.
 * @param {string} workspaceFolderPath The path to the workspace folder or Git repository.
 * @returns {Promise<void>} A promise that resolves when the branch creation is complete.
 */
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

/**
 * Registers the command for switching to an existing Git branch.
 * @returns {vscode.Disposable} The disposable object representing the command registration.
 */
export function registerSwitchBranchCommand(): vscode.Disposable {
    return vscode.commands.registerCommand('branch-creator.switch', async () => {
        try {
            const repoPaths = await getGitReposOrWorkspace();
            if (!repoPaths || repoPaths.length === 0) {
                vscode.window.showErrorMessage('No Git repositories found.');
                return;
            }
            // If dealing with multiple repositories, find common branches; otherwise, list all branches from the single repo
            const branches = repoPaths.length > 1 ? await findCommonBranches(repoPaths) : await listLocalBranches(repoPaths[0]);

            const selectedBranch = await vscode.window.showQuickPick(branches, {
                placeHolder: 'Select the branch to switch to'
            });

            if (!selectedBranch) { return; } // User aborted the input process

            // Determine if we should pull after switching
            const shouldPull = vscode.workspace.getConfiguration('branch-creator').get<boolean>('defaultSwitchAndPull', false);
            let pullApproval = 'No';
            if (!shouldPull) {
                // Ask once before starting the loop if the setting is disabled
                const result = await vscode.window.showQuickPick(['Yes', 'No'], {
                    placeHolder: 'Pull changes from the remote repository for all selected branches?'
                });
                pullApproval = result ?? 'No';
            }

            for (const repoPath of repoPaths) {
                await switchGitBranch(selectedBranch, repoPath);
                if (shouldPull || pullApproval === 'Yes') {
                    await pullChanges(repoPath); // This function remains unchanged
                }
            }
            vscode.window.showInformationMessage(`Switched to branch ${selectedBranch} successfully in selected repositories.`);
        } catch (error) {
            vscode.window.showErrorMessage(`An error occurred: ${error}`);
        }
    });
}

/**
 * Switches to an existing Git branch in the specified repository.
 * @param {string} branchName The name of the branch to switch to.
 * @param {string} workspaceFolderPath The path to the workspace folder or Git repository.
 * @returns {Promise<void>} A promise that resolves when the branch switch is complete.
 */
export function switchGitBranch(branchName: string, workspaceFolderPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(`git checkout ${branchName}`, { cwd: workspaceFolderPath }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error occurred while switching branches: ${stderr}`);
                return;
            }
            resolve();
        });
    });
}

/**
 * Pulls changes from the remote repository for the current branch in the specified repository.
 * @param {string} workspaceFolderPath The path to the workspace folder or Git repository.
 * @returns {Promise<void>} A promise that resolves when the pull operation is complete.
 */
export async function pullChanges(workspaceFolderPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(`git pull`, { cwd: workspaceFolderPath }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error occurred while pulling changes: ${stderr}`);
                return;
            }
            vscode.window.showInformationMessage('Pulled changes from the remote repository successfully.');
            resolve();
        });
    });
}
