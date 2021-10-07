import * as css from "mimcss"
import {sharedStyles} from "./SharedStyles";



export class PlaygroundStyles extends css.StyleDefinition
{
    editorToolbarArea = this.$gridarea();
    editorContentArea = this.$gridarea();
    htmlToolbarArea = this.$gridarea();
    htmlContentArea = this.$gridarea();
    statusbarArea = this.$gridarea();
    splitterArea = this.$gridarea();

    masterGrid = this.$class({
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

    panel = this.$class({
        border: [2, "inset"],
        placeSelf: "stretch",
        minWidth: 200,
    })

    leftPane = this.$class({
        "+": this.panel,
        gridArea: this.editorContentArea,
    })

    rightPane = this.$class({
        "+": this.panel,
        gridArea: this.htmlContentArea,
    })

    toolbar = this.$class({
        backgroundColor: "lightgrey",
        padding: [4, 0],
    })

    editorToolbar = this.$class({
        "+": this.toolbar,
        gridArea: this.editorToolbarArea,
    })

    htmlToolbar = this.$class({
        "+": this.toolbar,
        gridArea: this.htmlToolbarArea,
    })

    statusbar = this.$class({
        padding: 4,
        backgroundColor: "lightgrey",
        gridArea: this.statusbarArea,
    })

    splitter = this.$class({
        width: 8,
        backgroundColor: "lightgrey",
        gridArea: this.splitterArea,
    })

    iframe = this.$class({
        width: "100%",
        height: "100%",
        border: "none"
    })

    compilationErrorsGrid = this.$class({
        padding: 4,
        display: "grid",
        gap: [8,12],
        gridTemplateColumns: [css.repeat( 3, "auto"), "1fr"],
        gridAutoRows: "auto"
    })

    padding4 = this.$class({
        padding: 4,
    })

    otherErrorsList = this.$classname( sharedStyles.spacedVBox, this.padding4);

    errorsTitle = this.$class({
        gridColumn: css.span(4),
        padding: [4,0],
        fontWeight: "bold"
    })

    snippetPanel = this.$class({
        "+": sharedStyles.hbox,
        alignItems: "flex-start",
        padding: 8,
        overflow: "auto"
    })

    snippetCategory = this.$class({
        "+": sharedStyles.vbox,
        gap: 8,
        width: css.em(12)
    })

    snippetToSelect = this.$class({
        "+": sharedStyles.vbox,
        marginLeft: 16,
    })

    codeSnippetParamPanel = this.$class({
        alignItems: "stretch",
        padding: 8
    })

    codeSnippetParams = this.$classname( sharedStyles.spacedVBox, this.codeSnippetParamPanel);

}



export let playgroundStyles = css.activate( PlaygroundStyles);



