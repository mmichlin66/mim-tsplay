/**
 * The IPlaygroundConfig represents configuration data tht is fetched from a file. This data
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
    htmlTemplatePath?: string

    /** String within the HTML template file that is replaced by the transpiled script */
    htmlTemplateMarker?: string,

    /** Text to display when the component is first shown */
    wellcomeMessage?: string,

    /** Text to display when the component is first shown */
    wellcomeFilePath?: string,

    /** Information about extra libraries to add to the editor  */
    extraLibList?: IExtraLibInfo[],

    /** Information about examples  */
    exampleList?: IExampleInfo[],

    /**
     * Path to an example file that should be shown in the editor. If undefined, empty file will
     * be shown.
     */
    firstExample?: string,

}



/**
 * The IExtraLibInfo interface represents information about a library whose typings will be added
 * to the monaco engine and will be available to the code in the editor.
 */
export interface IExtraLibInfo
{
    // Library name
    libName: string,

    // Library url
    url: string,

    // List of file paths
    files: string[],

    // path relative to which all files are located (must end with "/")
    rootPath?: string,

    // Name of the file whose content will be used as "index.d.ts". Not needed if the name of the
    // main file from which all typings are available is already "index.d.ts".
    index?: string,
}



// Type representing information about a single example
export interface IExampleInfo
{
    // User-readable example name.
    name: string;

    // Path to the example file. If undefied or empty, then it is treated as a group name. All
    // examples after this item and until the next group item will be considered as belonging to
    // this group.
    path?: string;

    // optional description
    descr?: string;
}

// Type representing the list of examples.
export type ExampleList = IExampleInfo[];



// Type representing the list of extra libraries.
export type ExtraLibList = IExtraLibInfo[];



