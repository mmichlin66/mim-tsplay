import * as mim from "mimbl"
import * as comp from "mimcl"
import {sharedStyles} from "./SharedStyles"
import {playgroundStyles} from "./PlaygroundStyles"
import {ICodeSnippetInfo, ITemplateCodeSnippetInfo, ITemplateCodeSnippetParamInfo} from "./PlaygroundConfig"



/**
 * A dialog that allows the user to choose a code snippet to be inserted.
 */
export class CodeSnippetChooser extends comp.Dialog
{
    constructor( codeSnippetMap: Map<string,ICodeSnippetInfo[]>)
    {
        super( undefined, { caption: "Choose Code Snippet", escapeValue: null },
            { id: "cancel", content: "Cancel", returnValue: null});

            this.codeSnippetMap = codeSnippetMap;
    }

    public renderBody(): any
    {
        return <div class={playgroundStyles.snippetPanel}>
            {Array.from( this.codeSnippetMap.entries()).map( ([category, snippets]) =>
                this.renderCategory( category, snippets)
            )}
        </div>
    }

    private renderCategory( category: string, snippets: ICodeSnippetInfo[]): any
    {
        return <div class={playgroundStyles.snippetCategory}>
            <strong>{category}</strong>
            {snippets.map( info =>
                <div class={playgroundStyles.snippetToSelect}>
                    <a href="#" click={() => this.onSnippetClicked( info)}>{info.name}</a>
                    <span class={sharedStyles.smallFont}>{info.description}</span>
                </div>
            )}
        </div>
    }

    private onSnippetClicked( info: ICodeSnippetInfo): void
    {
        this.close( info)
    }



    private codeSnippetMap: Map<string,ICodeSnippetInfo[]>;
}



/**
 * A dialog that allows the user to provide values for code snippet parameters.
 */
export class CodeSnippetParams extends comp.Dialog
{
    constructor( snippet: ITemplateCodeSnippetInfo)
    {
        super( undefined, { caption: `${snippet.name} Parameters` });
        this.snippet = snippet;

        this.addButton( { id: "ok", content: "OK", callback: () => this.onOKClicked()})
        this.addButton( { id: "cancel", content: "Cancel", returnValue: null})
    }

    public renderBody(): any
    {
        return <div class={playgroundStyles.codeSnippetParams}>
            {this.snippet.params.map( param =>
                this.renderParam( param)
            )}
        </div>
    }

    private renderParam( param: ITemplateCodeSnippetParamInfo): any
    {
        return <div class={sharedStyles.vbox}>
            <div>
                <strong>{param.name}</strong>
                {param.isRequired && <span style={{color: "red"}}>*</span>}
            </div>
            <span class={sharedStyles.smallFont}>{`(${param.description})`}</span>
            <input type="text" ref={r => this.inputRefMap.set( param, r)}></input>
        </div>
    }

    private async onOKClicked(): Promise<void>
    {
        // loop over parameters and check whether all required ones are filled in
        let elmsWithErrors: HTMLInputElement[] = [];
        let valueMap = new Map<string,string>();
        this.inputRefMap.forEach( (elm, param) => {
            let val = elm.value;
            if (val)
                valueMap.set( param.id, elm.value);
            else if (param.isRequired)
                elmsWithErrors.push( elm);
            else
                valueMap.set( param.id, "");
        });

        if (elmsWithErrors.length > 0)
        {
            await comp.MsgBox.showModal( "Please provide values for required parameters",
                {caption: "Parameters", buttons: comp.MsgBoxButtonBar.OK, icon: comp.MsgBoxIcon.Warning});
            return;
        }

        // replace parameters in the template string
        this.close( replacePlaceholders( this.snippet.template, valueMap));
    }



    private snippet: ITemplateCodeSnippetInfo;

    // Map of parameter info objects to HTML input elements where the user enters the value for
    // this parameter.
    private inputRefMap = new Map<ITemplateCodeSnippetParamInfo,HTMLInputElement>();
}



/**
 * Replaces placeholders in the given string with the string from the given map and returns the
 * result as a string. The placeholders have the form of {s} where s is a key in the map of
 * value to replace the placeholders.
 * @param template
 * @param valueMap
 * @returns string with substitution
 */
function replacePlaceholders( template: string, valueMap: Map<string,string>): string
{
    if (!template)
        return "";
    else if (valueMap.size === 0)
        return template;

    let res = "";

    let tokens: string[] = template.split( /{([^{}\s]+)}/g);
    if (tokens && tokens.length > 0)
    {
        let tokenIsPlaceholder = false;
        for (let token of tokens)
        {
            if (tokenIsPlaceholder)
            {
                let val = valueMap.get( token);
                if (val === undefined)
                    val = ""

                res += val;
            }
            else if (token)
                res += token;

            tokenIsPlaceholder = !tokenIsPlaceholder;
        }
    }

    return res;
}



