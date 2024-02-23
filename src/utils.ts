import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { exec } from 'child_process';

/**
 * Asynchronously finds Git repositories in a given root path.
 * @param {string} rootPath The root path to search for Git repositories.
 * @returns {Promise<string[]>} A promise that resolves to an array of paths to Git repositories.
 */
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

/**
 * Selects Git repositories from the workspace or returns the workspace root if it's a Git repository.
 * @returns {Promise<string[] | undefined>} A promise that resolves to an array of selected repository paths or undefined if no workspace is found.
 */
export async function getGitReposOrWorkspace(): Promise<string[] | undefined> {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found. Please open a workspace.');
        return undefined;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;
    const repos = await getGitRepos(rootPath);

    // If only the root is a Git repo or no other Git repos found, return the root path
    if (repos.length === 0 || (repos.length === 1 && repos[0] === rootPath)) {
        return [rootPath];
    }

    // If multiple repos found, including the root, let the user select
    const repoChoices = repos.map(repoPath => ({
        label: repoPath === rootPath ? "$(file-directory) Workspace Root" : `$(file-submodule) ${path.basename(repoPath)}`,
        description: repoPath
    }));

    const selectedRepos = await vscode.window.showQuickPick(repoChoices, {
        placeHolder: 'Select Git repositories',
        canPickMany: true
    });

    return selectedRepos?.map(repo => repo.description);
}

/**
 * Lists local branches of a Git repository, optionally including remote branches based on extension settings.
 * @param {string} workspaceFolderPath The path to the workspace folder or Git repository.
 * @returns {Promise<string[]>} A promise that resolves to an array of branch names.
 */
export function listLocalBranches(workspaceFolderPath: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
        // Check the user's setting for showing remote branches
        const showRemoteBranches = vscode.workspace.getConfiguration('branch-creator').get<boolean>('showRemoteBranches', true);
        const listCommand = showRemoteBranches ? `git branch --list --all` : `git branch --list`;

        exec(listCommand, { cwd: workspaceFolderPath }, (error, stdout, stderr) => {
            if (error) {
                reject(`Error occurred while listing branches: ${stderr}`);
                return;
            }
            // Parse branches
            const branches = stdout.trim().split('\n').map(branch => {
                branch = branch.replace('*', '').trim();
                // Optionally format or filter branch names
                if (showRemoteBranches) {
                    // Remove the remote prefix if showing remote branches
                    return branch.replace(/^remotes\/[^\/]+\//, '');
                }
                return branch;
            });

            // Remove duplicates, useful if showing remote branches
            const uniqueBranches = [...new Set(branches)];

            resolve(uniqueBranches);
        });
    });
}

/**
 * Finds common branches among multiple Git repositories.
 * @param {string[]} repoPaths The paths to the repositories to compare.
 * @returns {Promise<string[]>} A promise that resolves to an array of common branch names.
 */
export async function findCommonBranches(repoPaths: string[]): Promise<string[]> {
    const branchLists = await Promise.all(repoPaths.map(path => listLocalBranches(path)));
    // Find intersection of all branch lists
    const commonBranches = branchLists.reduce((a, b) => a.filter(c => b.includes(c)));
    return commonBranches;
}
