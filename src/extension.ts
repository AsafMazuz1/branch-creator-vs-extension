import * as vscode from 'vscode';
import { registerCreateBranchCommand, registerSwitchBranchCommand } from './gitCommands';

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "branch-creator" is now active!');

    let createBranchDisposable = registerCreateBranchCommand();
    context.subscriptions.push(createBranchDisposable);

    let switchBranchDisposable = registerSwitchBranchCommand();
    context.subscriptions.push(switchBranchDisposable);
}

export function deactivate() {}
