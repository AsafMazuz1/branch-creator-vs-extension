import * as vscode from 'vscode';
import { getGitReposOrWorkspace, listLocalBranches } from './utils';
import { getBranchNameSeparator, getPrefixes, getValidateBranchNameWhiteList } from './config';

/**
 * Initiates the process to gather all necessary details for creating a new branch.
 * This includes selecting a prefix, entering a ticket number, and specifying a branch name.
 * @returns {Promise<{branchNameSeparator: string, prefix: string, ticketNumber: string, branchName: string, approval: string} | null>}
 * A promise that resolves to an object containing all branch details or null if the process is aborted.
 */
export async function getBranchDetails(): Promise<{ branchNameFinal: string; approval: string } | null> {
    const branchNameSeparator = vscode.workspace.getConfiguration('branch-creator').get<string>('branchNameSeparator', '-');
    const apps = vscode.workspace.getConfiguration('branch-creator').get<string[]>('appsList', []);
    const appFirst = vscode.workspace.getConfiguration('branch-creator').get<boolean>('appFirst', false);
    let appName = '';
    if (appFirst && apps.length > 0) {
        appName = await selectAppName();
        if (!appName) { return null; } // Exit if app selection is required but none is selected
    }

    const prefix = await selectPrefix();
    if (!prefix) { return null; } // Exit if no prefix selected

    if (!appFirst && apps.length > 0) {
        appName = await selectAppName();
        if (!appName) { return null; } // Exit if app selection is required but none is selected
    }

    const ticketNumber = await getTicketNumber();
    //Check if ticket number is must or not from settings
    const isTicketNumberMust = vscode.workspace.getConfiguration('branch-creator').get<boolean>('isTicketNumberMust', true);
    if (!ticketNumber && isTicketNumberMust ) {
        vscode.window.showErrorMessage('Ticket number is required.');
        return null;
     } // Exit if no ticket number provided
    const branchName = await getBranchName(branchNameSeparator);
    if (!branchName) { return null; } // Exit if no branch name provided

    //Build final branch name based on settings
    let branchNameFinal = '';
    //If prefix ends with / then dont add separator
    let finalPrefix = prefix;

    if(apps.length > 0){
        if(appFirst){
            const sep = appName.endsWith('/') ? '' : '/';
            finalPrefix = `${appName}${sep}${prefix}`;
        }else{
            const sep = prefix.endsWith('/') ? '' : '/';
            const appSep = appName.endsWith('/') ? '' : '/';
            finalPrefix = `${prefix}${sep}${appName}${appSep}`;
        }
    }

    if(!finalPrefix.endsWith('/')){
        finalPrefix = `${finalPrefix}${branchNameSeparator}`;
    }
    if(ticketNumber){
        branchNameFinal = `${finalPrefix}${ticketNumber}${branchNameSeparator}${branchName}`;
    }else{
        branchNameFinal = `${finalPrefix}${branchName}`;
    }

    const approval = await vscode.window.showQuickPick(['Yes', 'No'], {
        placeHolder: `Do you approve this name? ${branchNameFinal}`
    });

    return approval === 'Yes' ? { branchNameFinal, approval } : null;
}

/**
 * Presents a quick pick selection of configured apps for the user to choose from.
 * @returns {Promise<string>} A promise that resolves to the selected app or an empty string if aborted.
 */
export async function selectAppName(): Promise<string> {
    const apps = vscode.workspace.getConfiguration('branch-creator').get<string[]>('appsList', []);
    // Add number before each prefix for quick selection
    const formattedApps = apps.map((prefix, index) => `${index + 1}. ${prefix}`);
    const selected = await vscode.window.showQuickPick(formattedApps, {
        placeHolder: 'Select a app name'
    });
    // Remove the number from the selected prefix
    return selected ? selected.split('. ')[1] : "";
}

/**
 * Presents a quick pick selection of configured prefixes for the user to choose from.
 * @returns {Promise<string>} A promise that resolves to the selected prefix or an empty string if aborted.
 */
export async function selectPrefix(): Promise<string> {
    const prefixes = vscode.workspace.getConfiguration('branch-creator').get<string[]>('prefixes', []);
    // Add number before each prefix for quick selection
    const formattedPrefixes = prefixes.map((prefix, index) => `${index + 1}. ${prefix}`);
    const selected = await vscode.window.showQuickPick(formattedPrefixes, {
        placeHolder: 'Select a prefix'
    });
    // Remove the number from the selected prefix
    return selected ? selected.split('. ')[1] : "";
}

/**
 * Requests the user to enter a ticket number through an input box.
 * @returns {Promise<string>} A promise that resolves to the entered ticket number or an empty string if no input is provided.
 */
export async function getTicketNumber(): Promise<string> {
    const ticketNumber = await vscode.window.showInputBox({
        prompt: 'Enter the ticket number'
    });
    return ticketNumber ?? "";
}

/**
 * Requests the user to enter a branch name, following the provided branch name separator for formatting.
 * @param {string} branchNameSeparator The separator to use in the branch name, typically a dash (-) or underscore (_).
 * @returns {Promise<string>} A promise that resolves to the entered branch name or an empty string if no input is provided.
 */
export async function getBranchName(branchNameSeparator: string): Promise<string> {
    const branchName = await vscode.window.showInputBox({
        prompt: `Enter the branch name (use '${branchNameSeparator}' to separate words):`
    });
    return branchName ?? "";
}

export async function validateBranchNames(): Promise<void> {
    const branchNameSeparator = getBranchNameSeparator();
    const branchPrefixes = getPrefixes();
    if (branchPrefixes.length === 0) {
        vscode.window.showInformationMessage('No branch prefixes are configured. Please configure them in the extension settings.');
        return;
    }
    const repoPaths = await getGitReposOrWorkspace();
    if (!repoPaths || repoPaths?.length === 0) {
        vscode.window.showErrorMessage('No Git repositories found.');
        return;
    }
    const path = repoPaths.at(0);
    if (!path) {
        return;
    }
    const allGitBranches = await listLocalBranches(path);

    const whiteListBranches = getValidateBranchNameWhiteList();

    const filteredBranches = allGitBranches.filter(branch => !whiteListBranches.includes(branch));

    const branchNameParts = filteredBranches.map(branch => branch.split(branchNameSeparator).at(0)).filter(Boolean);

    const arePrefixesValid = branchNameParts.every(part => branchPrefixes.includes(part));

    if (arePrefixesValid) {
        vscode.window.showInformationMessage('All branch prefixes are valid.');
        return;
    }
    const invalidPrefixes = branchNameParts.filter(part => !branchPrefixes.includes(part));
    vscode.window.showErrorMessage(`The following branch prefixes do not match the prefixes: ${invalidPrefixes.join(', ')}`);
    return;

}
