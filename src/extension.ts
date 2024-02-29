import * as vscode from 'vscode';
import { registerCreateBranchCommand, registerSwitchBranchCommand, registerValidateBranchCommand } from './gitCommands';

export function activate(context: vscode.ExtensionContext) {
    let createBranchDisposable = registerCreateBranchCommand();
    context.subscriptions.push(createBranchDisposable);

    let switchBranchDisposable = registerSwitchBranchCommand();
    context.subscriptions.push(switchBranchDisposable);

    let registerValidateBranchDisposable = registerValidateBranchCommand();
    context.subscriptions.push(registerValidateBranchDisposable);
}

export function deactivate() { }
