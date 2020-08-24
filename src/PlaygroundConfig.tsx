/**
 * The IPlaygroundConfig interface represents configuration data tht is fetched from a file. This data
 * contain information about:
 *
 * - extra libraries to load into the editor
 * - list of examples
 * - HTML template used to create HTML that will invoke the transpiled code
 * - other configuration pieces
 */
export interface IPlaygroundConfig
{
    /** Path to the HTML template file */
    htmlTemplatePath?: string;

    /** String within the HTML template file that is replaced by the transpiled script */
    htmlTemplateMarker?: string;

    /** Text to display when the component is first shown */
    wellcomeMessage?: string;

    /** Text to display when the component is first shown */
    wellcomeFilePath?: string;

    /** Information about extra libraries to add to the editor  */
    extraLibs?: IExtraLibInfo[];

    /** Information about examples  */
    examples?: IExampleInfo[];

    /**
     * Path to an example file that should be shown in the editor. If undefined, empty file will
     * be shown.
     */
    firstExample?: string;

    codeSnippets?: ITemplateCodeSnippetInfo[];
}



/**
 * The IExtraLibInfo interface represents information about a library whose typings will be added
 * to the monaco engine and will be available to the code in the editor.
 */
export interface IExtraLibInfo
{
    /** Library name */
    libName: string;

    /** Library url */
    url: string;

    /** List of file paths */
    files: string[];

    /** Path relative to which all files are located (must end with "/") */
    rootPath?: string;

    /**
     * Name of the file whose content will be used as "index.d.ts". Not needed if the name of the
     * main file from which all typings are available is already "index.d.ts".
     */
    index?: string;
}



/**
 * Type representing information about a single example.
 */
export interface IExampleInfo
{
    /**
     * User-readable example name. If this is the only property in the object, the object is
     * treated as a category and not as an individual example.
     */
    name: string;

    /** Optional description */
    description?: string;

    /**
     * Path to the example file. If undefied or empty, then it is treated as a group name. All
     * examples after this item and until the next group item will be considered as belonging to
     * this group.
     */
    path?: string;
}



/**
 * Type representing information about a single code snippet that can be inserted by the user.
 * This interface is a base for two types of code snippets: template-based and custom. Template-
 * based code snippets define a template strings with optional parameters. Template-based code
 * snippets can be specified in the playground configuration. Custom code snippets provide a
 * function that returns a string-based promise. The function can display any UI and resolve the
 * promise when all the information needed to create an actual snippet has been gathered from the
 * user.
 */
export interface ICodeSnippetInfo
{
    /**
     * User-readable code snippet name.
     */
    name: string;

    /** Optional description */
    description?: string;

    /**
     * Name of the category the code snippet belongs to. Note that category is mandatory for
     * code snippets.
     */
    category: string;
}



/**
 * Type representing information about a single template-based code snippet that can be inserted
 * by the user. Template-based code snippets can be provied either in the playground configuration
 * or added by playground extension.
 */
export interface ITemplateCodeSnippetInfo extends ICodeSnippetInfo
{
    /**
     * Template of the code snippet. The template can contain multiple placeholders for parameters,
     * which are enclosed in braces. The params property defines these parameters. When the code
     * snippet containing parameters is selected by the user, a popup is displayed where the user
     * can provide values for these parameters.
     * For example, the template `import * as {ns} from "{lib}"` defines two parameters.
     */
    template: string;

    /**
     * List of parameters that the user can provide when inserting the code snippet. If this
     * property is undefined or empty, the code snippet is inserted directly as specified in the
     * codeTemplate property without any substitutions.
     */
    params?: ITemplateCodeSnippetParamInfo[];
}



/**
 * Type representing information about a single parameter of a code snippet. When a code snippet
 * has a parameter, the user will be asked to provide value for it before it is inserted into the
 * code.
 */
export interface ITemplateCodeSnippetParamInfo
{
    /**
     * Identifier of the parameter that is used in the code snippet template string.
     */
    id: string;

    /**
     * User-readable parametert name.
     */
    name: string;

    /** Optional description */
    description?: string;

    /**
     * Flag indicating whether this parameter is required; that is, the user has to provide a value
     * for it before it can be inserted into the code.
     */
    isRequired?: boolean;
}



/**
 * Type representing information about a single custom code snippet that can be inserted
 * by the user. CUstom code snippets can only be provided by playground extensions.
 */
export interface ICustomCodeSnippetInfo extends ICodeSnippetInfo
{
    /**
     * This method is invoked when the user selected this custom snippet. The method can display
     * any UI in order to gather the necessary information from the user. When the user has
     * provided this information, the snippet is returned in the resolved promise. If the user
     * canceled snippet creation, the promis should either be rejected or resolved with an
     * undefined or enoty string.
     */
    createSnippet(): Promise<string>;
}



