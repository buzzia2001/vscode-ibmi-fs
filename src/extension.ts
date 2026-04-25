// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import ObjectProvider from './objectProvider';
import { DataQueueActions } from './types/dataQueue';
import { SaveFileActions } from './types/saveFile';
import { loadBase } from './ibmi';
import { DataAreaActions } from './types/dataArea';
import { JobQueueActions } from './types/jobQueue';
import { OutputQueueActions } from './types/outputQueue';
import { UserSpaceActions } from './types/userSpace';
import { BindingDirectoryActions } from './types/bindingDirectory';
import { JournalActions } from './types/journal';
import { SubsystemActions } from './types/subsystemDescription';
import { MessageQueueActions } from './types/messageQueue';
import { FileActions } from './types/file';
import { UserIndexActions } from './types/userIndex';
import { DspobjActions } from './dspobj';
import { DocumentManager } from './DocumentManager';

/**
 * Extension activation function
 * This method is called when the extension is activated for the first time
 * @param context - The extension context provided by VS Code
 */
export async function activate(context: vscode.ExtensionContext) {
  // Load the base IBM i extension
  loadBase();

  // Register the document manager
  DocumentManager.register(context);

  // Register the custom editor provider for IBM i file system objects
  context.subscriptions.push(
    vscode.window.registerCustomEditorProvider(`vscode-ibmi-fs.editor`, new ObjectProvider(), {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    })
  );

  SaveFileActions.register(context);
  DataQueueActions.register(context);
  DataAreaActions.register(context);
  JobQueueActions.register(context);
  OutputQueueActions.register(context);
  UserSpaceActions.register(context);
  BindingDirectoryActions.register(context);
  JournalActions.register(context);
  SubsystemActions.register(context);
  MessageQueueActions.register(context);
  FileActions.register(context);
  UserIndexActions.register(context);
  DspobjActions.register(context);

  // === FS Actions Status Bar ===
  const fsActionsStatusBar = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  fsActionsStatusBar.text = "$(tools) FS Actions";
  fsActionsStatusBar.tooltip = "IBM i FS Actions";
  fsActionsStatusBar.command = "vscode-ibmi-fs.showFsActionsMenu";
  fsActionsStatusBar.show();
  context.subscriptions.push(fsActionsStatusBar);

  // Comando per mostrare il menu FS Actions
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ibmi-fs.showFsActionsMenu', async () => {
      const action = await vscode.window.showQuickPick(
        [
          { label: 'WRKJOB', description: 'Work with Job' }
        ],
        { placeHolder: 'Seleziona un\'azione FS' }
      );

      if (action?.label === 'WRKJOB') {
        vscode.commands.executeCommand('vscode-ibmi-fs.wrkjob');
      }
    })
  );

  // Comando WRKJOB - Esempio di output in sola lettura con ricerca funzionante
  context.subscriptions.push(
    vscode.commands.registerCommand('vscode-ibmi-fs.wrkjob', async () => {
      // Crea il contenuto
      const output = [
        '╔════════════════════════════════════════════════════════════╗',
        '║           Work with Job - Esempio                         ║',
        '╚════════════════════════════════════════════════════════════╝',
        '',
        'Ciao mondo!',
        '',
        'Questo è un esempio di visualizzazione in sola lettura.',
        'Il contenuto è statico e non può essere modificato.',
        '',
        '💡 Suggerimento: Premi Ctrl+F (Cmd+F su Mac) per cercare nel testo',
        '',
        '────────────────────────────────────────────────────────────',
        'Output del comando:',
        '────────────────────────────────────────────────────────────',
        '',
        'Ciao mondo!',
        'Questa è una tab in sola lettura.',
        'Non puoi modificare questo testo.',
        '',
        'Prova a cercare la parola "mondo" o "sola lettura".',
        'La funzione di ricerca è completamente abilitata!',
        '',
        'Puoi anche cercare:',
        '  - "ciao"',
        '  - "esempio"',
        '  - "comando"',
        '  - qualsiasi altra parola presente in questo documento',
        '',
        '════════════════════════════════════════════════════════════',
        'Fine del documento',
        '════════════════════════════════════════════════════════════'
      ];

      // Metadata opzionale
      const metadata = {
        'Comando': 'WRKJOB',
        'Data': new Date().toLocaleString('it-IT'),
        'Stato': 'Completato'
      };

      // Mostra il documento in sola lettura
      await DocumentManager.showOutput('WRKJOB - Output', output, metadata);
      
      vscode.window.showInformationMessage('Tab in sola lettura aperta! Usa Ctrl+F per cercare nel testo.');
    })
  );

  console.log(vscode.l10n.t('Congratulations, your extension "vscode-ibmi-fs" is now active!'));
}

/**
 * Extension deactivation function
 * This method is called when the extension is deactivated
 */
export function deactivate() { }
