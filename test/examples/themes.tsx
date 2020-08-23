// This example demonstrates how style definition class inheritance can be used to change styles
// of many elements just by activating and deactivating different style definition classes and
// without re-rendering the HTML content.

import * as mim from "mimbl";
import * as css from "mimcss"



// Use abstract style definition class as a theme interface
abstract class Theme extends css.StyleDefinition
{
    // define several abstract properties for rules that must be overridden in the derined style
    // definition classes. These rules define the names that will be used when rendering HTML.
    // We don't have to use the abstract keyword, but doing this forces the derived classes to
    // provide definitions for these rueles (otherwise, theTypeScript compiler will not be happy).
	abstract box = css.$class()
	abstract button = css.$class()
    abstract input = css.$class()

    // define several custom CSS properties that are used by rules of this class. We don't provide
    // values for these variables but we specify the CSS property name (in camel form) that
    // define the types of these variables. The @virtual decorator is necessary here because
    // although these variables are used by the rules in this base class, we want the values to
    // be those assigned in the derived classes.
    @css.virtual fontFamily = css.$var( "fontFamily")
    @css.virtual fontStyle = css.$var( "fontStyle")
    @css.virtual fontSize = css.$var( "fontSize")
    @css.virtual borderColor = css.$var( "color")
    @css.virtual boxBgColor = css.$var( "color")
   
    grid = css.$class({
        display: "grid",
        gridTemplateColumns: css.repeat(2, "1fr"),
        gridTemplateRows: css.repeat(2, "1fr"),
        gap: 20,
        width: "90%",
        minWidth: 300,
        height: 300,
        margin: 20
    })

    // use $abstract rule because the following rules are only used as bases for the rules in the
    // derived style definition classes. Using the $abstract rule means that we wil not create
    // actual CSS SOM objects for them.
    boxBase = css.$abstract({
        display: "flex",
        padding: 24,
        border: [3, "solid", this.borderColor],
        fontFamily: this.fontFamily,
        fontStyle: this.fontStyle,
        fontSize: this.fontSize,
        backgroundColor: this.boxBgColor
    })

    buttonBase = css.$abstract({
        padding: 16,
        border: [3, "solid", this.borderColor],
        fontFamily: this.fontFamily,
        fontStyle: this.fontStyle,
        margin: "auto",
        cursor: "pointer",
        ":hover": { opacity: 0.7 }
    })

    inputBase = css.$abstract({
        padding: 16,
        border: [3, "solid", this.borderColor],
        fontFamily: this.fontFamily,
        fontStyle: this.fontStyle,
        margin: "auto"
    })

    other = [
        css.$style( 'button, input[type="text"]', {
            fontFamily: this.fontFamily,
            fontSize: this.fontSize,
            ":focus": { outline: "none" }
        })
    ]
}



// Define style definition class for our "round" theme
class RoundTheme extends Theme
{
    // override values of custom CSS properties. Note that since these properties were defined
    // using the @virtual decorator in the base class, the values we provide here will be taken
    // by the rules defined in the base class.
    fontFamily = css.$var( "fontFamily", "Verdana")
    fontStyle = css.$var( "fontStyle", 45)
    fontSize = css.$var( "fontSize", 24)
    borderColor = css.$var( "color", "blue")
    boxBgColor = css.$var( "color", "cyan")

    // override the rules that were declared in the base class.
    box = css.$class({
        "+": this.boxBase,
        borderRadius: 16
    })

    button = css.$class({
        "+": this.buttonBase,
        borderRadius: 16
    })

    input = css.$class({
        "+": this.inputBase,
        borderRadius: 16,
    })
}



// Define style definition class for our "square" theme - this is very similar to what we did with
// the RoundTheme class - we just need to specify differen values for some properties.
class SquareTheme extends Theme
{
    fontFamily = css.$var( "fontFamily", "monospace")
    fontStyle = css.$var( "fontStyle", "normal")
    fontSize = css.$var( "fontSize", 24)
    borderColor = css.$var( "color", "red")
    boxBgColor = css.$var( "color", "lightpink")

    box = css.$class({
        "+": this.boxBase,
        borderStyle: "dotted"
    })

    button = css.$class({
        "+": this.buttonBase,
        borderStyle: "dotted"
    })

    input = css.$class({
        "+": this.inputBase,
        borderStyle: "dotted"
    })
}



// Define component that allows to change themes
export class Themes extends mim.Component
{
    // property that holds the currently ative theme. Notice that we use the base abstract class
    // as a type for this property. When we render HTML we will use this property to refer to the
    // class rules.
    private theme: Theme;

    // propert that holds the name of the current theme - to facilitate switching.
    private currentTheme = "round";

    willMount()
    {
        // activate the initial theme ( we decided to use the round one)
        this.theme = css.activate( RoundTheme);
    }

    willUnmount()
    {
        // deactivate the las selected theme
        css.deactivate( this.theme);
    }

    // Render our component's HTML content
	public render()
	{
		return <div class={this.theme.grid}>
            <div class={this.theme.box}>
                <input type="text" placeholder="First Name" class={this.theme.input}></input>
            </div>
             <div class={this.theme.box}>
                <input type="text" placeholder="Last Name" class={this.theme.input}></input>
            </div>
            <div class={this.theme.box}>
                <button click={this.onRoundThemeClicked} class={this.theme.button}>Round Theme</button>
            </div>
            <div class={this.theme.box}>
                <button click={this.onSquareThemeClicked} class={this.theme.button}>Square Theme</button>
            </div>
       </div>
    }
    
    private onRoundThemeClicked()
    {
        if (this.currentTheme !== "round")
        {
            this.currentTheme = "round";
            css.deactivate( this.theme);
            this.theme = css.activate( RoundTheme);
        }
    }
    
    private onSquareThemeClicked()
    {
        if (this.currentTheme !== "square")
        {
            this.currentTheme = "square";
            css.deactivate( this.theme);
            this.theme = css.activate( SquareTheme);
        }
    }
}



// Mount our component under the body element.
mim.mount( new Themes());


