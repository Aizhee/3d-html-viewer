'use strict';
/*
 * 3D HTML Viewer
 * 
 * An extension for Visual Studio Code that allows you to view your HTML files in 3D.
 *
 * Author: Aizhee
 * Repository: https://github.com/Aizhee/3d-html-viewer
 * License: GPL-3.0
 * 
*/ 

import * as vscode from 'vscode';
import * as iframeServer from 'iframe-server';
import * as path from 'path';
import * as Constants from './Constants'

export function activate(context: vscode.ExtensionContext) {
    let disposablePreview = vscode.commands.registerTextEditorCommand('extension.3dhtmlviewer.open', htmlPreview(context));
    context.subscriptions.push(disposablePreview);
}

export let panelActiveKey = 'extension.panelActive';

function htmlPreview(context: vscode.ExtensionContext) {

    return (textEditor: vscode.TextEditor) => {

        if (!isEditingHTML(textEditor.document)) {
            vscode.window.showErrorMessage('3D HTML Viewer can only open HTML files');
            return;
        }

        const workspacePath = vscode.workspace.rootPath;
        const documentPath = textEditor.document.uri.fsPath;

        const rootPath =
            (workspacePath && documentPath.startsWith(workspacePath))
                ? workspacePath 
                : path.dirname(documentPath);

        const server = iframeServer.start({
            port: 0,
            host: '127.0.0.1',
            root: rootPath,
            open: false,
            wait: 1000,
            injectJS:`window.onmessage=e=>{if(e.data.t==="ijS" && e.origin.includes("vscode")){const s=document.createElement("script");s.innerHTML=e.data.c;document.body.appendChild(s);}}`,
        });

        const relativePath = documentPath.slice(rootPath.length + 1);
        const documentName = path.basename(documentPath);

        const panel = vscode.window.createWebviewPanel(
            'extension.3dhtmlviewer',
            '3D | ' + documentName,
            vscode.ViewColumn.Two,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, 'main'))]
            }
        );

        vscode.commands.executeCommand('setContext', panelActiveKey, true);
        
        const iconPathLight = vscode.Uri.file(
            path.join(context.extensionPath, 'res', 'icons', 'start_preview_light.svg')
        );
        const iconPathDark = vscode.Uri.file(
            path.join(context.extensionPath, 'res', 'icons', 'start_preview_dark.svg')
        );

        (panel as vscode.WebviewPanel & { iconPath?: vscode.Uri }).iconPath = {
            light: iconPathLight,
            dark: iconPathDark
        };
        
        server.addListener('listening', () => {
            panel.webview.html = provideContent(server, relativePath);
        });

        vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && isEditingHTML(editor.document) && panelActiveKey) {
                const newDocumentPath = editor.document.uri.fsPath;
                const newRelativePath = newDocumentPath.slice(rootPath.length + 1);
                const newDocumentName = path.basename(newDocumentPath);
                
                panel.title = '3D | ' + newDocumentName;
                panel.webview.html = provideContent(server, newRelativePath);
            }
        });

        panel.onDidDispose(
            () => {
                console.log("Shutting down 3d html viewer...");
                iframeServer.shutdown();
                vscode.commands.executeCommand('setContext', panelActiveKey, false);
            },
            null,
            context.subscriptions
        );
    };
}

function booleanToCheck(value: boolean): string {
		return value ? 'checked' : '';
}	

function addScript(path:string, esc:boolean): string {
    let extensionPath = vscode.extensions.getExtension(Constants.ExtensionConstants.EXTENSION_ID).extensionPath;
    let scriptPath = vscode.Uri.file(`${extensionPath}/${path}`);
    let scriptContent = getFileContent(scriptPath);
    if (esc) {
        scriptContent = scriptContent.replace(/\\/g, "\\\\");
        scriptContent = scriptContent.replace(/`/g, "\\`");
        scriptContent = scriptContent.replace(/\$/g, "\\$");
    }
    return scriptContent;
}

function addStyle(): string {
    let extensionPath = vscode.extensions.getExtension(Constants.ExtensionConstants.EXTENSION_ID).extensionPath;
    let stylePath = vscode.Uri.file(`${extensionPath}/${Constants.ExtensionConstants.CUSTOM_CSS_PATH}`);
    let styleContent = getFileContent(stylePath);
    return styleContent;
}

function getFileContent(uri: vscode.Uri): string {
    const fsPath = uri.fsPath;
    const fs = require('fs');
    return fs.readFileSync(fsPath, 'utf8');
}

function isEditingHTML(document: vscode.TextDocument) {
    return document.languageId.toLowerCase() == 'html' || document.fileName.match(/\.html$/);
}

export function deactivate() {
    console.log("3d html viewer has been deactivated.");
}

function provideContent(server: any, relativePath: string): string {
    const port = server.address().port;

	const config = vscode.workspace.getConfiguration('3dhtmlviewer');
	const zoom = config.get<number>('zoom', 0.8);
	const colorTheLayers = config.get<boolean>('colorTheLayers', true);
	const colorRandom = config.get<boolean>('colorRandom', false);
	const hue = config.get<number>('hue', 0);
	const gap = config.get<number>('gap', 20);

    return `
		<!DOCTYPE html>
		<html lang="en">
			<head><meta http-equiv="Content-type" content="text/html;charset=UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
			<body>
			<style>${addStyle()}</style>
			<div class="displayContents">
				<div class="header">
					<div class="headercontent">
						<nav class="controls">
							<button
								id="center"
								title="Recenter"
								class="back-button icon leftmost-nav"><i class="codicon codicon-arrow-left"><?xml version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
									<svg width="16px" height="20px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
									  <path fill="currentColor" d="M64,496H184V464H64a16.019,16.019,0,0,1-16-16V328H16V448A48.054,48.054,0,0,0,64,496Z" class="ci-primary"/>
									  <path fill="currentColor" d="M48,64A16.019,16.019,0,0,1,64,48H184V16H64A48.054,48.054,0,0,0,16,64V184H48Z" class="ci-primary"/>
									  <path fill="currentColor" d="M448,16H328V48H448a16.019,16.019,0,0,1,16,16V184h32V64A48.054,48.054,0,0,0,448,16Z" class="ci-primary"/>
									  <path fill="currentColor" d="M464,448a16.019,16.019,0,0,1-16,16H328v32H448a48.054,48.054,0,0,0,48-48V328H464Z" class="ci-primary"/>
									  <path fill="currentColor" d="M400,256c0-79.4-64.6-144-144-144S112,176.6,112,256s64.6,144,144,144S400,335.4,400,256ZM256,368A112,112,0,1,1,368,256,112.127,112.127,0,0,1,256,368Z" class="ci-primary"/>
									</svg></i></button>
							<button
								id="refresh"
								title="Refresh"
								class="refresh-button icon "><i class="codicon codicon-refresh">
									<?xml version="1.0" encoding="utf-8"?>
									<svg width="18px" height="20px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" stroke-width="3" stroke="currentColor" fill="none">
										<path d="M53.72,36.61A21.91,21.91,0,1,1,50.37,20.1"/>
										<polyline points="51.72 7.85 50.85 20.78 37.92 19.9"/>
										<path d="M53.72,36.61A21.91,21.91,0,1,1,50.37,20.1"/>
										<polyline points="51.72 7.85 50.85 20.78 37.92 19.9"/></svg>
							</i></button>

                            <select id="viewtype" class="viewtype" title="Mode">
                                <option value="DOM">DOM</option>
                                <option value="Z-INDEX">Z-INDEX</option>
                                <option value="BOTH">BOTH</option>
                            </select>

							<button
								id="settings"
								title="Settings"
								class="settings icon rightmost-nav"><i class="settings">
									<?xml class="settings" version="1.0" encoding="utf-8"?><!-- Uploaded to: SVG Repo, www.svgrepo.com, Generator: SVG Repo Mixer Tools -->
									<svg class="settings" width="20px" height="20px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path class="settings" d="M13.5 2L13.9961 1.93798C13.9649 1.68777 13.7522 1.5 13.5 1.5V2ZM10.5 2V1.5C10.2478 1.5 10.0351 1.68777 10.0039 1.93798L10.5 2ZM13.7747 4.19754L13.2786 4.25955C13.3047 4.46849 13.4589 4.63867 13.6642 4.68519L13.7747 4.19754ZM16.2617 5.22838L15.995 5.6513C16.1731 5.76362 16.4024 5.75233 16.5687 5.62306L16.2617 5.22838ZM18.0104 3.86826L18.364 3.51471C18.1857 3.3364 17.9025 3.31877 17.7034 3.47359L18.0104 3.86826ZM20.1317 5.98958L20.5264 6.29655C20.6812 6.09751 20.6636 5.81434 20.4853 5.63603L20.1317 5.98958ZM18.7716 7.73831L18.3769 7.43134C18.2477 7.59754 18.2364 7.82693 18.3487 8.00503L18.7716 7.73831ZM19.8025 10.2253L19.3148 10.3358C19.3613 10.5411 19.5315 10.6953 19.7404 10.7214L19.8025 10.2253ZM22 10.5H22.5C22.5 10.2478 22.3122 10.0351 22.062 10.0039L22 10.5ZM22 13.5L22.062 13.9961C22.3122 13.9649 22.5 13.7522 22.5 13.5H22ZM19.8025 13.7747L19.7404 13.2786C19.5315 13.3047 19.3613 13.4589 19.3148 13.6642L19.8025 13.7747ZM18.7716 16.2617L18.3487 15.995C18.2364 16.1731 18.2477 16.4025 18.3769 16.5687L18.7716 16.2617ZM20.1317 18.0104L20.4853 18.364C20.6636 18.1857 20.6812 17.9025 20.5264 17.7034L20.1317 18.0104ZM18.0104 20.1317L17.7034 20.5264C17.9025 20.6812 18.1857 20.6636 18.364 20.4853L18.0104 20.1317ZM16.2617 18.7716L16.5687 18.3769C16.4024 18.2477 16.1731 18.2364 15.995 18.3487L16.2617 18.7716ZM13.7747 19.8025L13.6642 19.3148C13.4589 19.3613 13.3047 19.5315 13.2786 19.7404L13.7747 19.8025ZM13.5 22V22.5C13.7522 22.5 13.9649 22.3122 13.9961 22.062L13.5 22ZM10.5 22L10.0039 22.062C10.0351 22.3122 10.2478 22.5 10.5 22.5V22ZM10.2253 19.8025L10.7214 19.7404C10.6953 19.5315 10.5411 19.3613 10.3358 19.3148L10.2253 19.8025ZM7.73832 18.7716L8.00504 18.3487C7.82694 18.2364 7.59756 18.2477 7.43135 18.3769L7.73832 18.7716ZM5.98959 20.1317L5.63604 20.4853C5.81435 20.6636 6.09752 20.6812 6.29656 20.5264L5.98959 20.1317ZM3.86827 18.0104L3.4736 17.7034C3.31878 17.9025 3.33641 18.1857 3.51472 18.364L3.86827 18.0104ZM5.22839 16.2617L5.62307 16.5687C5.75234 16.4025 5.76363 16.1731 5.65131 15.995L5.22839 16.2617ZM4.19754 13.7747L4.68519 13.6642C4.63867 13.4589 4.46849 13.3047 4.25955 13.2786L4.19754 13.7747ZM2 13.5H1.5C1.5 13.7522 1.68777 13.9649 1.93798 13.9961L2 13.5ZM2 10.5L1.93798 10.0039C1.68777 10.0351 1.5 10.2478 1.5 10.5H2ZM4.19754 10.2253L4.25955 10.7214C4.46849 10.6953 4.63867 10.5411 4.68519 10.3358L4.19754 10.2253ZM5.22839 7.73831L5.65131 8.00503C5.76363 7.82693 5.75234 7.59755 5.62307 7.43134L5.22839 7.73831ZM3.86827 5.98959L3.51472 5.63603C3.33641 5.81434 3.31878 6.09751 3.47359 6.29656L3.86827 5.98959ZM5.98959 3.86827L6.29656 3.47359C6.09752 3.31878 5.81434 3.33641 5.63604 3.51471L5.98959 3.86827ZM7.73832 5.22839L7.43135 5.62306C7.59755 5.75233 7.82694 5.76363 8.00504 5.6513L7.73832 5.22839ZM10.2253 4.19754L10.3358 4.68519C10.5411 4.63867 10.6953 4.46849 10.7214 4.25955L10.2253 4.19754ZM13.5 1.5H10.5V2.5H13.5V1.5ZM14.2708 4.13552L13.9961 1.93798L13.0039 2.06202L13.2786 4.25955L14.2708 4.13552ZM16.5284 4.80547C15.7279 4.30059 14.8369 3.92545 13.8851 3.70989L13.6642 4.68519C14.503 4.87517 15.2886 5.20583 15.995 5.6513L16.5284 4.80547ZM16.5687 5.62306L18.3174 4.26294L17.7034 3.47359L15.9547 4.83371L16.5687 5.62306ZM17.6569 4.22182L19.7782 6.34314L20.4853 5.63603L18.364 3.51471L17.6569 4.22182ZM19.7371 5.68261L18.3769 7.43134L19.1663 8.04528L20.5264 6.29655L19.7371 5.68261ZM20.2901 10.1149C20.0746 9.16313 19.6994 8.27213 19.1945 7.47158L18.3487 8.00503C18.7942 8.71138 19.1248 9.49695 19.3148 10.3358L20.2901 10.1149ZM22.062 10.0039L19.8645 9.72917L19.7404 10.7214L21.938 10.9961L22.062 10.0039ZM22.5 13.5V10.5H21.5V13.5H22.5ZM19.8645 14.2708L22.062 13.9961L21.938 13.0039L19.7404 13.2786L19.8645 14.2708ZM19.1945 16.5284C19.6994 15.7279 20.0746 14.8369 20.2901 13.8851L19.3148 13.6642C19.1248 14.503 18.7942 15.2886 18.3487 15.995L19.1945 16.5284ZM20.5264 17.7034L19.1663 15.9547L18.3769 16.5687L19.7371 18.3174L20.5264 17.7034ZM18.364 20.4853L20.4853 18.364L19.7782 17.6569L17.6569 19.7782L18.364 20.4853ZM15.9547 19.1663L17.7034 20.5264L18.3174 19.7371L16.5687 18.3769L15.9547 19.1663ZM13.8851 20.2901C14.8369 20.0746 15.7279 19.6994 16.5284 19.1945L15.995 18.3487C15.2886 18.7942 14.503 19.1248 13.6642 19.3148L13.8851 20.2901ZM13.9961 22.062L14.2708 19.8645L13.2786 19.7404L13.0039 21.938L13.9961 22.062ZM10.5 22.5H13.5V21.5H10.5V22.5ZM9.72917 19.8645L10.0039 22.062L10.9961 21.938L10.7214 19.7404L9.72917 19.8645ZM7.4716 19.1945C8.27214 19.6994 9.16314 20.0746 10.1149 20.2901L10.3358 19.3148C9.49696 19.1248 8.71139 18.7942 8.00504 18.3487L7.4716 19.1945ZM6.29656 20.5264L8.04529 19.1663L7.43135 18.3769L5.68262 19.7371L6.29656 20.5264ZM3.51472 18.364L5.63604 20.4853L6.34315 19.7782L4.22183 17.6569L3.51472 18.364ZM4.83372 15.9547L3.4736 17.7034L4.26295 18.3174L5.62307 16.5687L4.83372 15.9547ZM3.70989 13.8851C3.92545 14.8369 4.30059 15.7279 4.80547 16.5284L5.65131 15.995C5.20584 15.2886 4.87517 14.503 4.68519 13.6642L3.70989 13.8851ZM1.93798 13.9961L4.13552 14.2708L4.25955 13.2786L2.06202 13.0039L1.93798 13.9961ZM1.5 10.5V13.5H2.5V10.5H1.5ZM4.13552 9.72917L1.93798 10.0039L2.06202 10.9961L4.25955 10.7214L4.13552 9.72917ZM4.80547 7.47159C4.30059 8.27213 3.92545 9.16313 3.70989 10.1149L4.68519 10.3358C4.87517 9.49696 5.20583 8.71138 5.65131 8.00503L4.80547 7.47159ZM3.47359 6.29656L4.83371 8.04528L5.62307 7.43134L4.26295 5.68262L3.47359 6.29656ZM5.63604 3.51471L3.51472 5.63603L4.22182 6.34314L6.34314 4.22182L5.63604 3.51471ZM8.04529 4.83371L6.29656 3.47359L5.68262 4.26294L7.43135 5.62306L8.04529 4.83371ZM10.1149 3.70989C9.16313 3.92545 8.27214 4.30059 7.4716 4.80547L8.00504 5.6513C8.71139 5.20583 9.49696 4.87517 10.3358 4.68519L10.1149 3.70989ZM10.0039 1.93798L9.72917 4.13552L10.7214 4.25955L10.9961 2.06202L10.0039 1.93798Z" fill="currentColor"/>
									<circle class="settings" cx="12" cy="12" r="4" stroke="currentColor" stroke-linejoin="round"/>
									</svg>
								</i></button>

							<button
								id="refresh"
								title="Refresh"
								class="refresh-button icon rightmost-nav"><i class="codicon codicon-refresh">	
							</i></button>

						</nav>
					</div>
					<div class="extras-menu" id="extras-menu-pane" hidden="true">
						<table cellspacing="0" cellpadding="0">
                            <tr>
								<td>
									<label for="zoom">Zoom</label><br/>
                                    <input title="The zoom constant of the camera" id="zoom" name="zoom" class="extra-menu-nav" type="range" min="0" max="1" value="${zoom}" step="0.1"></input>
								</td>
							</tr>
							<tr>
								<td>
									<label for="color_surface">Color the layers</label><br/>
									<input title="Add colors to the layers" type="checkbox" tabIndex=-1 ${booleanToCheck(colorTheLayers)}
									id="color_surface" name="color_surface" class="extra-menu-nav"></input>
								</td>
							</tr>
							<tr>
								<td>
									<label for="color_random">Color random</label><br/>
                                    <input type="checkbox" tabIndex=-1 title="Color the layers randomly" ${booleanToCheck(colorRandom)}
                                    id="color_random" name="color_number" class="extra-menu-nav"></input>
								</td>
							</tr>
							<tr>
								<td>
									<label for="hue">Hue</label><br/>
                                    <input title="The hue of the layers" id="hue" name="hue" class="extra-menu-nav" type="range" min="0" max="360" value="${hue}" id="hue-slider" oninput="this.style.filter = 'hue-rotate(' + this.value + 'deg)'" style="accent-color: red;" ></input>
								</td>
							</tr>
                            <tr>
								<td>
									<label for="gap">Gap</label><br/>
                                    <input title="The length of the gap between layers" type="range" tabIndex=-1 min="0" max="100" value="${gap}" 
                                    id="gap" name="gap" class="extra-menu-nav"></input>
								</td>
							</tr>
						</table>
					</div>
				</div>
				<div class="content"><iframe id="hostedContent" src="http://127.0.0.1:${port}/${relativePath}"></iframe></div>
			</div>
			<script> const addDOM3D = \`${addScript(Constants.ExtensionConstants.DOM3D_JS_PATH, true)}\`; </script> 
			<script> ${addScript(Constants.ExtensionConstants.UI_JS_PATH, false)} </script>
		</body>
	</html>`;
}
