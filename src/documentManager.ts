/**
 * DocumentManager - Manager for read-only text documents
 * 
 * This class provides a way to display read-only text content in VS Code
 * with full search functionality using VS Code's native find widget.
 */

import * as vscode from 'vscode';

/**
 * Content provider for read-only documents
 */
class ReadOnlyDocumentProvider implements vscode.TextDocumentContentProvider {
  private static instance: ReadOnlyDocumentProvider;
  private documents = new Map<string, string>();
  private _onDidChange = new vscode.EventEmitter<vscode.Uri>();
  
  readonly onDidChange = this._onDidChange.event;

  private constructor() {}

  static getInstance(): ReadOnlyDocumentProvider {
    if (!ReadOnlyDocumentProvider.instance) {
      ReadOnlyDocumentProvider.instance = new ReadOnlyDocumentProvider();
    }
    return ReadOnlyDocumentProvider.instance;
  }

  provideTextDocumentContent(uri: vscode.Uri): string {
    return this.documents.get(uri.toString()) || '';
  }

  setContent(uri: vscode.Uri, content: string): void {
    this.documents.set(uri.toString(), content);
    this._onDidChange.fire(uri);
  }

  deleteContent(uri: vscode.Uri): void {
    this.documents.delete(uri.toString());
  }
}

/**
 * Document Manager - Main class for managing read-only documents
 */
export class DocumentManager {
  private static provider: ReadOnlyDocumentProvider;
  private static scheme = 'ibmi-readonly';
  private static counter = 0;

  /**
   * Register the document manager
   * @param context - Extension context
   */
  static register(context: vscode.ExtensionContext): void {
    DocumentManager.provider = ReadOnlyDocumentProvider.getInstance();
    
    context.subscriptions.push(
      vscode.workspace.registerTextDocumentContentProvider(
        DocumentManager.scheme,
        DocumentManager.provider
      )
    );
  }

  /**
   * Generate URI for a document
   * @param title - Document title
   * @param extension - File extension (determines language mode)
   * @returns Generated URI
   */
  private static generateUri(title: string, extension: string): vscode.Uri {
    const id = ++DocumentManager.counter;
    return vscode.Uri.parse(
      `${DocumentManager.scheme}:${encodeURIComponent(title)}.${extension}?id=${id}`
    );
  }

  /**
   * Show a read-only document with the given content
   * @param title - Document title
   * @param content - Document content
   * @param extension - File extension for language mode (default: 'txt')
   * @returns Promise that resolves to the text editor
   */
  static async show(
    title: string,
    content: string,
    extension: string = 'txt'
  ): Promise<vscode.TextEditor> {
    // Generate URI with extension
    const uri = DocumentManager.generateUri(title, extension);

    // Set content
    DocumentManager.provider.setContent(uri, content);

    // Open document
    const doc = await vscode.workspace.openTextDocument(uri);
    const editor = await vscode.window.showTextDocument(doc, {
      preview: false,
      preserveFocus: false
    });

    return editor;
  }

  /**
   * Show command output in a read-only document
   * @param title - Document title
   * @param output - Command output lines
   * @param metadata - Optional metadata to prepend
   * @param extension - File extension (default: 'log')
   * @returns Promise that resolves to the text editor
   */
  static async showOutput(
    title: string,
    output: string[],
    metadata?: Record<string, string>,
    extension: string = 'log'
  ): Promise<vscode.TextEditor> {
    let content = '';

    // Add metadata if provided
    if (metadata) {
      content += '='.repeat(60) + '\n';
      for (const [key, value] of Object.entries(metadata)) {
        content += `${key}: ${value}\n`;
      }
      content += '='.repeat(60) + '\n\n';
    }

    // Add output
    content += output.join('\n');

    return DocumentManager.show(title, content, extension);
  }

  /**
   * Show formatted text in a read-only document
   * @param title - Document title
   * @param sections - Array of sections with titles and content
   * @param extension - File extension (default: 'log')
   * @returns Promise that resolves to the text editor
   */
  static async showFormatted(
    title: string,
    sections: Array<{ title: string; content: string }>,
    extension: string = 'log'
  ): Promise<vscode.TextEditor> {
    let content = '';

    for (const section of sections) {
      content += '\n' + '='.repeat(60) + '\n';
      content += section.title.toUpperCase() + '\n';
      content += '='.repeat(60) + '\n\n';
      content += section.content + '\n';
    }

    return DocumentManager.show(title, content, extension);
  }

  /**
   * Show JSON data in a read-only document with syntax highlighting
   * @param title - Document title
   * @param data - Data to display as JSON
   * @returns Promise that resolves to the text editor
   */
  static async showJson(
    title: string,
    data: any
  ): Promise<vscode.TextEditor> {
    const content = JSON.stringify(data, null, 2);
    return DocumentManager.show(title, content, 'json');
  }

  /**
   * Show SQL query in a read-only document with syntax highlighting
   * @param title - Document title
   * @param sql - SQL query
   * @returns Promise that resolves to the text editor
   */
  static async showSql(
    title: string,
    sql: string
  ): Promise<vscode.TextEditor> {
    return DocumentManager.show(title, sql, 'sql');
  }

  /**
   * Show XML content in a read-only document with syntax highlighting
   * @param title - Document title
   * @param xml - XML content
   * @returns Promise that resolves to the text editor
   */
  static async showXml(
    title: string,
    xml: string
  ): Promise<vscode.TextEditor> {
    return DocumentManager.show(title, xml, 'xml');
  }

  /**
   * Open a text template in a new editor
   * @param content - Content to display
   * @param language - Language ID for syntax highlighting (default: 'plaintext')
   * @returns Promise that resolves to true if successful
   */
  static async openTextTemplate(
    content: string,
    language: string = 'plaintext'
  ): Promise<boolean> {
    try {
      await DocumentManager.show('Untitled', content, language);
      return true;
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to open text template: ${error}`);
      return false;
    }
  }
}
