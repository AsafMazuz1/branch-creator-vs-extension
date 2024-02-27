import * as vscode from 'vscode';

const CONFIG_ROOT_NAME = 'branch-creator';



/**
 * Retrieves a configuration value for the given key from the extension's settings.
 * @param key The configuration key to retrieve.
 * @param defaultValue A default value to return if the configuration is not found.
 * @returns The value of the configuration setting.
 */
function getConfig<T>(key: string, defaultValue: T): T {
    return vscode.workspace.getConfiguration(CONFIG_ROOT_NAME).get<T>(key, defaultValue);
}

/**
 * Gets the branch name separator from the extension's configuration settings.
 * @returns {string} The branch name separator.
 */
export function getBranchNameSeparator(): string {
    return getConfig<string>('branchNameSeparator', '-');
}

/**
 * Determines whether to show remote branches in the branch list.
 * @returns {boolean} True if remote branches should be shown, false otherwise.
 */
export function showRemoteBranches(): boolean {
    return getConfig<boolean>('showRemoteBranches', true);
}

/**
 * Retrieves the configured branch prefixes from the extension's settings.
 * @returns {string[]} An array of branch prefixes.
 */
export function getPrefixes(): string[] {
    return getConfig<string[]>('prefixes', []);
}

/**
 * Determines whether to pull changes from the remote repository by default when switching branches.
 * @returns {boolean} True if changes should be pulled by default, false otherwise.
 */
export function defaultSwitchAndPull(): boolean {
    return getConfig<boolean>('defaultSwitchAndPull', false);
}

export function getValidateBranchNameWhiteList(): string[] {
    return getConfig<string[]>('validateWhiteList', []);
}
