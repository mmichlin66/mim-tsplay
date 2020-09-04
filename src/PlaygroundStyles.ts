import * as css from "mimcss"
import {sharedStyles} from "./SharedStyles";



export class PlaygroundStyles extends css.StyleDefinition
{
    editorToolbarArea = css.$gridarea();
    editorContentArea = css.$gridarea();
    htmlToolbarArea = css.$gridarea();
    htmlContentArea = css.$gridarea();
    statusbarArea = css.$gridarea();
    splitterArea = css.$gridarea();

    masterGrid = css.$class({
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "grid",
        gridTemplateColumns: ["1fr", "auto", "1fr"],
        gridTemplateRows: ["auto", "1fr", "auto"],
        gridTemplateAreas: [
            [this.editorToolbarArea, 1,1, 1,1],
            [this.editorContentArea, 2,1, 2,1],
            [this.htmlToolbarArea, 1,3, 1,3],
            [this.htmlContentArea, 2,3, 2,3],
            [this.statusbarArea, 3,1, 3,3],
            [this.splitterArea, 1,2, 2,2],
        ]
    })

    panel = css.$class({
        border: [2, "inset"],
        placeSelf: "stretch",
        minWidth: 200,
    })

    leftPane = css.$class({
        "+": this.panel,
        gridArea: this.editorContentArea,
    })

    rightPane = css.$class({
        "+": this.panel,
        gridArea: this.htmlContentArea,
    })

    toolbar = css.$class({
        backgroundColor: "lightgrey",
        padding: [4, 0],
    })

    editorToolbar = css.$class({
        "+": this.toolbar,
        gridArea: this.editorToolbarArea,
    })

    htmlToolbar = css.$class({
        "+": this.toolbar,
        gridArea: this.htmlToolbarArea,
    })

    statusbar = css.$class({
        padding: 4,
        backgroundColor: "lightgrey",
        gridArea: this.statusbarArea,
    })

    splitter = css.$class({
        width: 8,
        backgroundColor: "lightgrey",
        gridArea: this.splitterArea,
    })

    iframe = css.$class({
        width: "100%",
        height: "100%",
        border: "none"
    })

    compilationErrorsGrid = css.$class({
        padding: 4,
        display: "grid",
        gap: [8,12],
        gridTemplateColumns: [css.repeat( 3, "auto"), "1fr"],
        gridAutoRows: "auto"
    })

    padding4 = css.$class({
        padding: 4,
    })

    otherErrorsList = css.$classname( sharedStyles.spacedVBox, this.padding4);

    errorsTitle = css.$class({
        gridColumn: css.span(4),
        padding: [4,0],
        fontWeight: "bold"
    })

    snippetPanel = css.$class({
        "+": sharedStyles.hbox,
        alignItems: "flex-start",
        padding: 8,
        overflow: "auto"
    })

    snippetCategory = css.$class({
        "+": sharedStyles.vbox,
        gap: 8,
        width: css.em(12)
    })

    snippetToSelect = css.$class({
        "+": sharedStyles.vbox,
        marginLeft: 16,
    })

    codeSnippetParamPanel = css.$class({
        alignItems: "stretch",
        padding: 8
    })

    codeSnippetParams = css.$classname( sharedStyles.spacedVBox, this.codeSnippetParamPanel);

}



export let playgroundStyles = css.activate( PlaygroundStyles);



