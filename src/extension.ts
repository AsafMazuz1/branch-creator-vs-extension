import * as vscode from 'vscode';
import { registerCreateBranchCommand, registerSwitchBranchCommand, registerValidateBranchCommand } from './gitCommands';

export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension "branch-creator" is now active!');

    let createBranchDisposable = registerCreateBranchCommand();
    context.subscriptions.push(createBranchDisposable);

    let switchBranchDisposable = registerSwitchBranchCommand();
    context.subscriptions.push(switchBranchDisposable);

    let registerValidateBranchDisposable = registerValidateBranchCommand();
    context.subscriptions.push(registerValidateBranchDisposable);
}

export function deactivate() { }
