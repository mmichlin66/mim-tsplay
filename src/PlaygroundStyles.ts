import * as css from "mimcss"
import {sharedStyles} from "./SharedStyles";



export class PlaygroundStyles extends css.StyleDefinition
{
    // editorToolbarArea = this.$gridarea();
    // editorContentArea = this.$gridarea();
    // htmlToolbarArea = this.$gridarea();
    // htmlContentArea = this.$gridarea();
    // statusbarArea = this.$gridarea();
    // splitterArea = this.$gridarea();

    masterGrid = this.$class({
        width: "100%",
        height: "100%",
        overflow: "hidden",
        display: "grid",
        gridTemplateRows: ["auto", "1fr", "auto"],
    })

    panel = this.$class({
        border: [2, "inset"],
        placeSelf: "stretch",
    })

    toolbar = this.$class({
        backgroundColor: "ButtonFace",
        padding: [4, 0],
    })

    statusbar = this.$class({
        padding: 4,
        backgroundColor: "ButtonFace",
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



