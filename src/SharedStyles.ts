import * as css from "mimcss"



class SharedStyles extends css.StyleDefinition
{
	init = [
		this.$style( "*, *::before, *::after", {
			boxSizing: "border-box",
		}),

        this.$style( "html", { height: "100%" }),

		this.$style( "body", {
            height: "100%",
            margin: 0,
			fontFamily: " 'Segoe UI', Verdana, Geneva, Tahoma, sans-serif",
			fontSize: 14,
        }),
	]

	h = this.$abstract({ fontWeight: "bold", marginTop: 0.75, marginBottom: 0.5 })
	headers = [
		this.$style( "h1", { "+": this.h, fontSize: 24 }),
		this.$style( "h2", { "+": this.h, fontSize: 20 }),
		this.$style( "h3", { "+": this.h, fontSize: 18 }),
		this.$style( "h4", { "+": this.h, fontSize: 16 }),
		this.$style( "h5", { "+": this.h, fontSize: 14 }),
		this.$style( "h6", { "+": this.h, fontSize: 12 }),
	]

	defaultInlineGap = this.$var( "<length>", 8)
	defaultBlockGap = this.$var( "<length>", 8)

	spaced = this.$class();
	elastic = this.$class();
	vbox = this.$class({
		display: "flex", flexDirection: "column",
		"&>": [
			["*", { flex: [0, 0, "auto"] }],
			[this.elastic, { flex: [1, 1, 0], overflow: "auto" }],
		],
		"&": [
			[css.selector`&${this.spaced} > *`, { marginBlockStart: this.defaultBlockGap, marginBlockEnd: this.defaultBlockGap }],
		]
	})
	hbox = this.$class({
		display: "flex", flexDirection: "row", alignItems: "center",
		"&>": [
			["*", { flex: [0, 0, "auto"] }],
			[this.elastic, { flex: [1, 1, 0], overflow: "auto" }],
		],
		"&": [
			[css.selector`&${this.spaced} > *`, { marginInlineStart: this.defaultInlineGap, marginInlineEnd: this.defaultInlineGap }],
		]
	})

    spacedHBox = this.$classname( this.hbox, this.spaced);
    spacedVBox = this.$classname( this.vbox, this.spaced);

    smallFont = this.$class({ fontSize: "x-small"})
}



export let sharedStyles = css.activate( SharedStyles);



