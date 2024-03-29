﻿import * as mim from "mimbl";
import * as css from "mimcss";
import * as comp from "mimcl"
import * as monaco from "monaco-editor";
import {sharedStyles} from "./SharedStyles";
import {playgroundStyles} from "./PlaygroundStyles";
import {
    IExampleInfo, IExtraLibInfo, IPlaygroundConfig, ICodeSnippetInfo, ITemplateCodeSnippetInfo,
    ICustomCodeSnippetInfo
} from "./PlaygroundConfig";
import {CodeSnippetChooser, CodeSnippetParams} from "./CodeSnippets";

// import some JS files so that they are included into our bundle
import "monaco-editor/esm/vs/basic-languages/javascript/javascript";
import "monaco-editor/esm/vs/basic-languages/typescript/typescript";
// import "monaco-editor/esm/vs/language/typescript/languageFeatures";
import "monaco-editor/esm/vs/language/typescript/tsMode";
// import "monaco-editor/esm/vs/language/typescript/workerManager";



// Namespaces for brevity
let ts = monaco.languages.typescript;
let ed = monaco.editor;



// Path to the JSON file containing the configuration
const ConfigPath = "playground-config.json"

// Default string within the HTML template file that is replaced by the transpiled script
const DefaultHtmlTemplateMarker = "const replace_me = true;"

// Default content of HTML template if the path to HTML template file is not defined in configuration
const DefaultHtmlTemplate =
`<html>
<body>
	<script src="require.js"></script>
    <script>
        var exports = {};
        ${DefaultHtmlTemplateMarker}
    </script>
</body>
</html>`;

// Information about a scratch pad file - it always exists in the list of examples
const ScratchPadFileInfo: IExampleInfo = {
    name: "Scratch Pad",
    path: "$",
    description: "Initially empty file that preserves your work"
};

// Information (placeholder) about a local file - it always exists in the list of examples
const LocalFileInfo: IExampleInfo = {
    name: "Local file",
    path: "$$",
    description: "Open local file, which you can edit and save"
};



/**
 * Set of registered extension classes. Every Playground instance will create a new instance of
 * each registered extension.
 */
let registeredExtensions = new Set<IPlaygroundExtensionClass>();



/**
 * The Playground class is a Mimbl component that allows the user create TypeScript code using
 * Mimcss and Mimbl libraries in the monaco editor. The code is then transpiled to JavaScript,
 * which is embedded in a simple HTML file. The content of the HTML file is then displayed in
 * an IFRAME.
 */
class Playground extends mim.Component
{
    constructor( configFilePath?: string, firstExample?: string, runFirstExample?: boolean)
    {
        super();
        this.configFilePath = configFilePath ? configFilePath : ConfigPath;
        this.firstExample = firstExample;
        this.runFirstExample = runFirstExample;

        this.exampleMap.set( LocalFileInfo.path, LocalFileInfo);
        this.exampleMap.set( ScratchPadFileInfo.path, ScratchPadFileInfo);
    }


    public async willMount()
    {
        css.activate(comp.DefaultPopupTheme)

        // set compiler options
        ts.typescriptDefaults.setCompilerOptions({
            target: ts.ScriptTarget.ESNext,
            useDefineForClassFields: false,
            allowNonTsExtensions: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            module: ts.ModuleKind.CommonJS,
            // noEmit: true,
            typeRoots: ["node_modules"],
            declaration: true,
            experimentalDecorators: true,
            jsx: ts.JsxEmit.React,
            jsxFactory: "mim.jsx",
            jsxFragmentFactory: "mim.Fragment",
        })

        this.callMe( this.postMountInit, false);
    }

    private async postMountInit()
    {
        let progress = new comp.ProgressBox( "Loading playground configuration...", {caption: "Please wait"});
        progress.showModal();

        // load and parse configuration file
        let errors = await this.loadConfig( progress);
        if (errors && errors.length > 0)
        {
            this.otherErrors = errors;
            this.rightPaneState = RightPaneState.OtherErrors;
        }

        // create the editor - we need to do it in didMount because it needs a DOM element
        this.editor = ed.create( this.contaierRef.r, {
            model: null,
            language: "typescript",
            fontSize: 12,
            minimap: {enabled: false},
            automaticLayout: true,
            renderLineHighlight: "gutter",
            roundedSelection: false,
            mouseWheelZoom: true,
        });

        // display the first example if the file path was passed in the constuctor or if the
        // configuration says so; otherwise, show empty file
        let firstExample = this.firstExample ?? this.config.firstExample;
        if (firstExample)
        {
            // open first example if the config indicates so
            let fileInfo = this.exampleMap.get( firstExample);
            if (fileInfo)
            {
                try
                {
                    await this.loadOrSelectFile( fileInfo.path);
                    this.currentFileInfo = fileInfo;
                }
                catch( err)
                {
                    // report errors
                    this.otherErrors = errors;
                    this.rightPaneState = RightPaneState.OtherErrors;

                    // show empty file
                    this.addOrSelectFile( ScratchPadFileInfo.path, "");
                    this.currentFileInfo = ScratchPadFileInfo;
                }
            }
        }
        else
        {
            this.addOrSelectFile( ScratchPadFileInfo.path, "");
            this.currentFileInfo = ScratchPadFileInfo;
        }

        progress.close();
    }

    public willUnmount()
    {
        if (this.editor)
        {
            this.editor.dispose()
            this.editor = null;
        }
    }

    public render(): any
	{
        return <div class={playgroundStyles.masterGrid}>
            {this.renderEditorToolbar}
            <comp.Splitter>
                <div class={playgroundStyles.panel}>
                    <div ref={this.contaierRef} style={{ width: "100%", height: "100%", overflow: "hidden"}} />
                </div>
                {this.renderRightPane}
            </comp.Splitter>
            <div class={playgroundStyles.statusbar}>
                Current example: <span>{this.currentFileInfo && this.currentFileInfo.name}</span>
            </div>
        </div>
    }

    private renderEditorToolbar(): any
	{
        return <div class={[playgroundStyles.toolbar, sharedStyles.spacedHBox]}>
            {this.renderExampleList()}
            <button id="run" click={this.onRunClicked} title="Compile code and display results">Run</button>
            <button id="reload" click={this.onReloadClicked} title="Reload original example code" disabled={this.isCurrentFileLocal}>Reload</button>
            <button id="insertCodeSnippet" click={this.onInsertCodeSnippetClicked} title="Choose a code snippet to insert into code">
                Insert Code Snippet
            </button>
            <input type="file" accept=".tsx,.ts" style={{ display: "none"}} ref={this.hiddenFileInputRef} change={this.onHiddenFileSelected} />
            <button id="loadFile" click={this.onLoadFileClicked} title="Load local file">Load File</button>
            <button id="saveFileAs" click={this.onSaveFileAsClicked} title="Save local file under a different name">Save As...</button>
            <button id="run" click={this.onClearClicked} title="Clear the right pane">Clear</button>
        </div>
    }

    private renderExampleList(): any
	{
        return <>
            <span>Examples:</span>
            <select change={this.onExampleSelected}>
                {this.exampleList && this.exampleList.length > 0 && this.renderExampleOptions()}
            </select>
        </>
    }

    private renderExampleOptions(): any[]
	{
        let options: any[] = [];
        for( let i = 0; i < this.exampleList.length; i++)
        {
            let info = this.exampleList[i];
            if (info.path)
                options.push( this.renderExampleOption( info));
            else
            {
                let subOptions: any[] = [];
                for( let j = i + 1; j < this.exampleList.length; j++)
                {
                    let info = this.exampleList[j];
                    if (info.path)
                    {
                        subOptions.push( this.renderExampleOption( info));
                        i++;
                    }
                    else
                    {
                        // the next item is a new group
                        i = j - 1;
                        break;
                    }
                }

                options.push( <optgroup label={info.name} title={info.description}>
                    {subOptions}
                </optgroup>);
            }
        }

        return options;
    }

    private renderExampleOption( info: IExampleInfo): any
	{
        let selected = this.currentFileInfo && info.path === this.currentFileInfo.path;
        return <option value={info.path} title={info.description} selected={selected}>
            {info.name}
        </option>;
    }

    private renderRightPane(): any
	{
        let content: any;
        switch( this.rightPaneState)
        {
            case RightPaneState.CompilationErrors:
                content = <div class={playgroundStyles.compilationErrorsGrid}>
                    <span class={playgroundStyles.errorsTitle}>There were compilation errors. Fix them and try again.</span>
                    {this.compilationErrors.map( e => this.renderCompilationError(e))}
                </div>;
                break;

            case RightPaneState.OtherErrors:
                content = <div class={playgroundStyles.otherErrorsList}>
                    <span class={playgroundStyles.errorsTitle}>There are errors.</span>
                    {this.otherErrors.map( e => this.renderOtherError(e))}
                </div>;
                break;

            case RightPaneState.HTML:
                content = <iframe srcdoc={this.currentHtml} class={playgroundStyles.iframe} />;
                break

            default:
                content = <div/>;
                break
        }

        return <div class={playgroundStyles.panel}>{content}</div>
    }

    private renderCompilationError( e: ICompilationErrorInfo): any
	{
        return <>
            <span>{`TS${e.code}`}</span>
            <span>at</span>
            <span click={() => this.gotoPosition( e.row, e.col, e.length)} style={{cursor: "pointer", color: "blue"}}>
                {`${e.row},${e.col}`}
            </span>
            <span>{e.message}</span>
        </>
    }

    private renderOtherError( e: Error): any
	{
        return <>
            <span>{e.message}</span>
        </>
    }



    private async onExampleSelected( e: Event): Promise<void>
    {
        let path = (e.target as HTMLSelectElement).value;
        if (!path)
            return;

        this.showExample( path);
        this.isCurrentFileLocal = false;
    }

    private async onReloadClicked(): Promise<void>
    {
        if (!this.currentFileInfo || this.isCurrentFileLocal)
            return;

        let path = this.currentFileInfo.path;
        let model = this.files.get( path);
        if (model)
        {
            model.dispose();
            this.files.delete( path);
        }

        this.showExample( path);
    }

    private async onRunClicked(): Promise<void>
    {
        if (!this.currentFileInfo)
            return;

        // first clear the right panel
        this.clearRighPaneData();

        let progress = new comp.ProgressBox( undefined, {caption: "Please wait"});
        progress.showModalWithDelay( 750);

        try
        {
            progress.setContent( `Compiling file '${this.currentFileInfo.path}'`);
            let result = await this.compileFile( this.currentFileInfo.path);
            this.compilationErrors = result.errors;
            if (result.errors.length === 0)
            {
                progress.setContent( "Creating HTML file...")
                this.currentHtml = await this.createHtml( result.outputFiles[0].text);
                this.rightPaneState = RightPaneState.HTML;
            }
            else
                this.rightPaneState = RightPaneState.CompilationErrors;
        }
        catch( err)
        {
            this.otherErrors = [err];
            this.rightPaneState = RightPaneState.OtherErrors;
        }

        progress.close();
        this.editor.focus();
    }

    private async onInsertCodeSnippetClicked(): Promise<void>
    {
        if (this.codeSnippetMap.size === 0)
        {
            await comp.MsgBox.showModal( "No code snippets defined in playground configuration",
                    {caption: "Playground", buttons: comp.MsgBoxButtonBar.OK, icon: comp.MsgBoxIcon.Info});
            return;
        }

        let snippet = await new CodeSnippetChooser( this.codeSnippetMap).showModal() as ICodeSnippetInfo;
        if (!snippet)
            return;

        let codeToInsert: string;
        if ("template" in snippet)
        {
            let templateSnippet = snippet as ITemplateCodeSnippetInfo;

            // if the snippet has parameters, display the dialog where the user can provide/ values
            if (templateSnippet.params && templateSnippet.params.length > 0)
            {
                codeToInsert = await new CodeSnippetParams( templateSnippet).showModal();
                if (!codeToInsert)
                    return;
            }
            else
                codeToInsert = templateSnippet.template;
        }
        else
            codeToInsert = await (snippet as ICustomCodeSnippetInfo).createSnippet();

        this.editor.focus();

        let selection = this.editor.getSelection();
        let range = new monaco.Range( selection.startLineNumber, selection.startColumn, selection.endLineNumber, selection.endColumn);
        let op = {identifier: { major: 1, minor: 1 }, range: range, text: codeToInsert, forceMoveMarkers: true};
        this.editor.executeEdits( "snippet", [op]);
    }

    private async onLoadFileClicked(): Promise<void>
    {
        let showOpenFilePicker = (window as any).showOpenFilePicker;
        if (showOpenFilePicker)
        {
            try
            {
                let [fileHandle] = await showOpenFilePicker({
                    types: [{
                        description: 'TypeScript Files',
                        accept: { 'application/x-typescript': ['.tsx', '.ts'] }
                    }],
                    excludeAcceptAllOption: true,
                    multiple: false
                })

                let file = await fileHandle.getFile();
                await this.loadLocalFileContent( file);
            }
            catch(x)
            {
            }
        }
        else
            this.hiddenFileInputRef?.click();
    }

    // This method is called when the "click" method is called on the hidden input element
    private async onHiddenFileSelected(): Promise<void>
    {
        const inputElm = this.hiddenFileInputRef;
        const file = !inputElm.files || inputElm.files.length === 0 ? null : inputElm.files.item(0);
        if (file)
            this.loadLocalFileContent( file);

        this.hiddenFileInputRef.value = "";
    }

    private async loadLocalFileContent( file: File): Promise<void>
    {
        try
        {
            let content = await file.text()
            let path = "localfile/" + file.name;
            let info: IExampleInfo = { name: file.name, path };
            this.currentFileInfo = info;
            this.isCurrentFileLocal = true;

            let model = this.files.get( path);
            if (!model)
            {
                let uri = monaco.Uri.parse( `file:///${path}`);
                model = monaco.editor.createModel( content, "typescript", uri);
                this.files.set( path, model);
            }
            else
                model.setValue( content);

            this.editor.setModel( model);
            this.editor.focus();
        }
        catch(x)
        {
            comp.MsgBox.showModal( `Cannot read file. Error: ${x.message}`,
                {buttons: comp.MsgBoxButtonBar.OK, icon: comp.MsgBoxIcon.Error});
        }
    }

    private async onSaveFileAsClicked(): Promise<void>
    {
        if (!this.currentFileInfo)
            return;

        let model = this.files.get( this.currentFileInfo.path);
        if (!model)
            return;

        let content = model.getValue();

        // do different things for browser that support File System API and those that don't
        let showSaveFilePicker = (window as any).showSaveFilePicker;
        if (showSaveFilePicker)
        {
            try
            {
                let fileHandle = await showSaveFilePicker({
                    types: [{
                        description: 'TypeScript Files',
                        accept: { 'application/x-typescript': ['.tsx', '.ts'] }
                    }],
                    excludeAcceptAllOption: true,
                    multiple: false
                })

                let fileStream = await fileHandle.createWritable();
                await fileStream.write( content);
                await fileStream.close();
            }
            catch(x)
            {
            }
        }
        else
        {
            // create temporary URL and temporary anchor element for downloading; the "download"
            // attribute and the BLOB URL instruct the browser to download the file instead of
            // navigating to it.
            let anchorUrl = URL.createObjectURL( new Blob([content], {type: "text/json;charset=utf-8;"}));
            let a = document.createElement( "a");
            a.href = anchorUrl;

            // get the name of the file to download from the current file info object
            let name = this.currentFileInfo.name;
            if (!name.endsWith( ".tsx"))
                name += ".tsx";

            a.download = name;

            // the click handler is only needed to do a clean up
            let clickHandler = () => setTimeout( () => URL.revokeObjectURL( anchorUrl), 0);

            a.addEventListener( "click", clickHandler);
            a.click();
        }
    }



    private onClearClicked(): void
    {
        this.clearRighPaneData();
        this.editor.focus();
    }



    private clearRighPaneData(): void
    {
        this.currentHtml = null;
        this.compilationErrors = null;
        this.otherErrors = null;
        this.rightPaneState = RightPaneState.Clear;
    }

    private gotoPosition( row: number, col: number, length: number = 0): void
    {
        let range = new monaco.Range( row, col, row, col + length);
        this.editor.revealRange( range);
        this.editor.setPosition( new monaco.Position( row, col));
        this.editor.focus();
    }



    /**
     * Loads and parses playground configuration. Returns array of errors. Empty error indicates
     * full success.
     */
    private async loadConfig( progress: comp.ProgressBox): Promise<Error[]>
    {
        // parse the configuration and accumulate errors
        let errors: Error[] = [];

        // read configuration file; if we can't, create an empty configuration
        progress.setContent( "Loading playground configuration file...")
        try
        {
            this.config = await fetchFileJsonContent( this.configFilePath);
        }
        catch( err)
        {
            this.config = {};
            errors.push(err);
        }

        this.addExtraLibs( this.config.extraLibs, errors, progress);
        this.addExamples( this.config.examples, errors, progress);
        this.addCodeSnippets( this.config.codeSnippets, errors, progress);

        // load extensions if specified
        registeredExtensions.forEach( ext => this.loadExtension( ext, errors, progress));
        return errors;
    }

    /**
     * Adds extra libraries to the editor.
     */
    private async loadExtension( extClass: IPlaygroundExtensionClass, errors: Error[], progress: comp.ProgressBox): Promise<void>
    {
        progress.setContent( `Loading playground extension '${extClass.displayName}'...`);

        try
        {
            let ext = new extClass();
            this.addExtraLibs( ext.getExtraLibs(), errors, progress);
            this.addExamples( ext.getExamples(), errors, progress);
            this.addCodeSnippets( ext.getCodeSnippets(), errors, progress);
        }
        catch( err)
        {
            errors.push(err);
        }
    }

    /**
     * Adds extra libraries to the editor.
     */
    private async addExtraLibs( extraLibs: IExtraLibInfo[], errors: Error[], progress: comp.ProgressBox): Promise<void>
    {
        // parse extra libraries
        if (!extraLibs || extraLibs.length === 0)
            return;

        this.extraLibList = this.config.extraLibs;

        // add extra libraries (files with typings)
        for( let libInfo of this.extraLibList)
        {
            if (!libInfo.libName)
            {
                errors.push( new Error( "Empty name specified for external library in configuration"));
                continue;
            }
            else if (this.extraLibInfos.has( libInfo.libName))
                continue;
            else
                this.extraLibInfos.set( libInfo.libName, libInfo);

            // fetch all files and add them to the TS system
            let libRootPath = `file:///node_modules/${libInfo.libName}`;
            progress.setContent( `Loading library '${libInfo.libName}'...`)
            for( let file of libInfo.files)
            {
                try
                {
                    let fileContent = await fetchFileTextContent( file, libInfo.rootPath);
                    let filePath = file === libInfo.index ? "index.d.ts" : file;
                    ts.typescriptDefaults.addExtraLib( fileContent, `${libRootPath}/${filePath}`)
                }
                catch( err)
                {
                    errors.push( err);
                }
            }
        }
    }

    /**
     * Adds examples.
     */
    private async addExamples( examples: IExampleInfo[], errors: Error[], progress: comp.ProgressBox): Promise<void>
    {
        // parse examples
        if (!examples || examples.length === 0)
            return;

        // our internal map contains only real examples with paths - not group names
        for( let info of examples)
        {
            this.exampleList.push( info);
            if (info.path)
                this.exampleMap.set( info.path, info);
        }
    }

    /**
     * Adds code snippets.
     */
    private async addCodeSnippets( snippets: ICodeSnippetInfo[], errors: Error[], progress: comp.ProgressBox): Promise<void>
    {
        if (!snippets || snippets.length === 0)
            return;

        for( let info of snippets)
        {
            // skip code snippets if category is not specified
            if (!info.category)
                continue;

            // check whether we already have this category and obtain the array of snippes
            let categorySnippets: ICodeSnippetInfo[] = this.codeSnippetMap.get( info.category);
            if (!categorySnippets)
            {
                categorySnippets = [];
                this.codeSnippetMap.set( info.category, categorySnippets);
            }

            categorySnippets.push( info);
        };
    }



    /**
     * Loads example with the given path.
     */
    private async showExample( path: string): Promise<void>
    {
        this.clearRighPaneData();
        let fileInfo = this.exampleMap.get( path);
        if (fileInfo === LocalFileInfo)
        {
            this.onLoadFileClicked();
            return;
        }
        else if (fileInfo === ScratchPadFileInfo)
        {
            this.addOrSelectFile( ScratchPadFileInfo.path, "");
            this.currentFileInfo = ScratchPadFileInfo;
        }
        else
        {
            try
            {
                let promise = this.loadOrSelectFile( path);
                comp.ProgressBox.showUntil( promise, `Loading file '${path}'...`, "Please wait");
                await promise;
                this.currentFileInfo = fileInfo;
            }
            catch( err)
            {
                this.otherErrors = [err];
                this.rightPaneState = RightPaneState.OtherErrors;
            }
        }

        this.editor.focus();
    }

    /**
     * Adds a file with the given content to the editor. If the file with the given path already
     * exists in the editor, it is is simply selected and the content is ignored.
     * @param path
     * @param content
     */
    private addOrSelectFile( path: string, content: string): void
    {
        let model = this.files.get( path);
        if (!model)
        {
            let uri = monaco.Uri.parse( `file:///${path}`);
            model = monaco.editor.createModel( content, "typescript", uri);
            this.files.set( path, model);
        }

        this.editor.setModel( model);
        this.editor.focus();
    }



    /**
     * Loads a file from the given with the given path and adds its content to the editor. Path
     * is either absolute URL or relative to the site root. If the file with the given path already
     * exists in the editor, it is is simply selected.
     * @param path
     */
    private async loadOrSelectFile( path: string): Promise<void>
    {
        let model = this.files.get( path);
        if (!model)
        {
            let content = await fetchFileTextContent( path);
            this.addOrSelectFile( path, content);
        }
        else
        {
            this.editor.setModel( model);
            this.editor.focus();
        }
    }



    /**
     * Loads a file from the given with the given path and adds its content to the editor. Path
     * is either absolute URL or relative to the site root.
     * @param path
     */
    private getFile( path: string): monaco.editor.ITextModel
    {
        return this.files.get( path);
    }



    /**
     * Compiles the given typescript file to JavaScript.
     * @param path
     */
    private async compileFile( path: string): Promise<ICompilationResult | null>
    {
        let model = this.files.get( path);
        if (!model)
            return null;

        let modelName = model.uri.toString();
        let worker = await (await ts.getTypeScriptWorker())( model.uri);

        let syntaxDiagnostics = await worker.getSyntacticDiagnostics( modelName);
        let semanticDiagnostics = await worker.getSemanticDiagnostics( modelName);
        let output = await worker.getEmitOutput( modelName) as monaco.languages.typescript.EmitOutput;

        // combine syntax and semantix errors into a single array
        let errors: ICompilationErrorInfo[] = [];
        for( let diag of syntaxDiagnostics)
            errors.push( this.convertDiagnosticToError( model, true, diag))
        for( let diag of semanticDiagnostics)
            errors.push( this.convertDiagnosticToError( model, false, diag))

        // sort the array by error position
        errors.sort( (a, b) => a.diag.start - b.diag.start);

        return {
            emitSkipped: output.emitSkipped,
            outputFiles: output.outputFiles.map( file => { return { name: file.name, text: file.text}}),
            errors,
        }
    }



    private convertDiagnosticToError( model: monaco.editor.ITextModel, isSyntax: boolean,
        diag: monaco.languages.typescript.Diagnostic): ICompilationErrorInfo
    {
        let pos = model.getPositionAt( diag.start);
        return {
            isSyntax,
            category: diag.category,
            code: diag.code,
            message: typeof diag.messageText === "string" ? diag.messageText : diag.messageText.messageText,
            row: pos.lineNumber,
            col: pos.column,
            length: diag.length,
            diag
        };
    }



    private async createHtml( js:string): Promise<string>
    {
        // fetch template HTML if needed
        if (!this.htmlTemplate)
        {
            if (!this.config.htmlTemplatePath)
                this.htmlTemplate = DefaultHtmlTemplate;
            else
                this.htmlTemplate = await fetchFileTextContent( this.config.htmlTemplatePath);
        }

        let configCode = `require.config({paths: {` +
            this.extraLibList.map( info => `"${info.libName}":"${info.url}"`).join(",") +
            `}});\n`;

        // build require code that contains the JavaScript
        let requireCode = `require([` +
            this.extraLibList.map( info => `"${info.libName}"`).join(",") +
            `], function(` +
            this.extraLibList.map( info => `${info.libName}`).join(",") +
            `){;\n${js}\n});`;

        let marker = this.config.htmlTemplateMarker ? this.config.htmlTemplateMarker : DefaultHtmlTemplateMarker;
        return this.htmlTemplate.replace( marker, configCode + requireCode);
    };



    // Path to the playground configuration file
    private configFilePath: string;

    // Path to the first example to display
    firstExample: string;

    // Flag indicating whether the first example should be run immediately upon load
    runFirstExample: boolean

    // Configuration information.
    private config: IPlaygroundConfig;

    // List of extra libraries read from the extra-lib-list JSON file. It is initially empty.
    private extraLibList: IExtraLibInfo[];

    // Example list read from the example-list JSON file. It initially contains the local file
    // and scratch file information as the first items.
    private exampleList: IExampleInfo[] = [LocalFileInfo, ScratchPadFileInfo];

    // Map of example paths to ExampleInfo objects
    private exampleMap = new Map<string,IExampleInfo>();

    // Map of code snippet category names to arrays of code snippet objects
    private codeSnippetMap = new Map<string,ICodeSnippetInfo[]>();

    // Current file selected in the monaco editor
    @mim.trigger
    private currentFileInfo: IExampleInfo;

    // Flag indicating that the current file corresponds to a local file and to an example
    private isCurrentFileLocal: boolean;

    // State of the right pane
    @mim.trigger
    private rightPaneState = RightPaneState.Clear;

    // HTML template within which we need to replace a marker with the JavaScript transpiled
    // from the current file in the editor.
    private htmlTemplate: string | null = null;

    // HTML as a string created after running a transpiled program.
    private currentHtml: string = null;

    // List of compilation errors and warnings created after running a transpiled program.
    private compilationErrors: ICompilationErrorInfo[] = null;

    // Error objects if something went wrong
    private otherErrors: Error[] = null;

    // Reference to the file input HTML element for loading local files
    @mim.ref private hiddenFileInputRef: HTMLInputElement;

    // Monaco editor object
    public editor: monaco.editor.IStandaloneCodeEditor;

    // Map of libraries for which typings were added.
    private extraLibInfos = new Map<string,IExtraLibInfo>();

    // Reference to the container HTML element
    private contaierRef = new mim.Ref<HTMLDivElement>();

    // Map of file names to models.
    private files = new Map<string,monaco.editor.ITextModel>();

}



/**
 * The ICompilationResult interface represents the result of compilation of the code in the editor.
 */
interface ICompilationResult
{
    // Flag whether file emittion was skipped
    emitSkipped: boolean;

    // Array of objects representing errors - both syntax and semantic.
    errors: ICompilationErrorInfo[],

    // Array of file names and their text content
    outputFiles: { name: string, text: string}[];
}



/**
 * The ICompilationErrorInfo interface represents a single compilation error or warning.
 */
interface ICompilationErrorInfo
{
    // True for syntax errors and false for semantic ones.
    isSyntax: boolean;

    // Category
    category: CompilationIssueCategory;

    // Category
    code: number;

    // Row number in the file
    message: string;

    // Row number in the file
    row: number;

    // Column number in the row
    col: number;

    // Length of the offending code
    length: number;

    // Array of objects representing errors - both syntax and semantic.
    diag: monaco.languages.typescript.Diagnostic,
}



/**
 * Reported error categories.
 */
const enum CompilationIssueCategory
{
    Warning = 0,
    Error = 1,
    Suggestion = 2,
    Message = 3,
}



// Enumeration defining possible states of the right pane
const enum RightPaneState
{
    Clear = 1,
    Welcome,
    HTML,
    CompilationErrors,
    OtherErrors,
    Instructions,
}



/**
 * The IPlaygroundExtension interface represents an object that provides additional features to the
 * playground. These features include custom code snippets, help items and others.
 */
export interface IPlaygroundExtension
{
    /**
     * Returns a list of extra library objects providing information about type files that will
     * be added to the editor for type checking.
     */
    getExtraLibs(): IExtraLibInfo[];

    /**
     * Returns a list of examples.
     */
    getExamples(): IExampleInfo[];

    /**
     * Returns a list of code snippets. Extensions can provide regular template-based snippets, but
     * they can also implement custom snippets with arbitrary UI.
     */
    getCodeSnippets(): ICodeSnippetInfo[];
}



/**
 * The IPlaygroundExtnsionClass interface represents a constructor that creates IPlaygroundExtension
 * objects.
 */
export interface IPlaygroundExtensionClass
{
    new (): IPlaygroundExtension;

    /** User friendly extension name */
    readonly displayName: string;
}



/**
 * Registers the given extensions
 * @param extensionClass Constuctor interface representing the extension class.
 * @returns True if the extension was successfully registered and false otherwise. False is
 * returned if the extension tries to register itself multiple times.
 */
export function registerExtension( extensionClass: IPlaygroundExtensionClass): boolean
{
    // check if we already have this etension in our set
    if (registeredExtensions.has( extensionClass))
        return false;

    registeredExtensions.add( extensionClass);
}



async function fetchFileTextContent( file: string, rootPath?: string): Promise<string>
{
    let path = (rootPath ? rootPath : "") + file;
    let res = await fetch( path);
    if (res.ok)
        return await res.text();
    else
        throw new Error( `Caanot fetch file '${path}': ${res.status} -  ${res.statusText}.`)
}



async function fetchFileJsonContent<T = any>( file: string, rootPath?: string): Promise<T>
{
    let text = await fetchFileTextContent( file, rootPath);
    return JSON.parse( text) as T;
}



// Create global function that can be called from HTML scripts to mount the Playground component
(window as any).mountPlayground = function( anchor?: Node, configFilePath?: string,
    firstExample?: string, runFirstExample?: boolean)
{
    mim.mount( new Playground( configFilePath, firstExample, runFirstExample), anchor);
}