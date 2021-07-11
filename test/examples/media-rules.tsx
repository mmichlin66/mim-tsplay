// This example is taken from the article of Chris Coyier on css-tricks.com with names and emails changed
// https://css-tricks.com/css-media-queries/

import * as mim from "mimbl";
import * as css from "mimcss"


class MyStyles extends css.StyleDefinition
{
    elementRules = [
        css.$style( "*", {
            margin: 0,
            padding: 0 }
        ),

        css.$style( "body", {
            fontSize: 14,
            fontFamily: "Georgia, serif",
            background: 0xcccccc
        }),

        css.$style( "article, aside, figure, footer, header, hgroup, menu, nav, section", {
            display: "block"
        }),

        css.$style( "h2", {
            fontSize: 24,
            fontFamily: "Georgia",
            margin: [0, 0, 10, 0]
        }),

        css.$style( "h3", {
            margin: [0, 0, 8, 0]
        }),

        css.$style( "p", {
            margin: [0, 0, 20, 0]
        }),
    ]

    fluidWrap = css.$id({
        width: "70%",
        margin: [60, "auto"],
        padding: 20,
        background: 0xeeeeee,
        overflow: "hidden"
    })

    sidebar = css.$id({
        width: "35%",
        float: "left"
    })

    sidebarRules = [
        css.$style( [this.sidebar, css.raw` ul`], {
            listStyle: "none"
        }),

        css.$style( css.selector`${this.sidebar} ul li a`, {
            color: 0x990000,
            textDecoration: "none",
            padding: [3, 0],
            display: "block"
        })
    ]

    mainContent = css.$id({
        width: "65%",
        float: "right"
    })

    // the media feature-set defines the media type and width condition
    ifWide = css.$media( { $mediaType: "all", minWidth: 1001 },
        class extends css.StyleDefinition<MyStyles>
        {
            sidebarRules = [
                css.$style( css.selector`${this.$parent.sidebar} ul li a:after`, {
                    content: css.raw`" (" ${css.attr("data-email")} ")"`,
                    fontSize: 11,
                    fontStyle: "italic",
                    color: 0x666666
                })
            ]
        }
    )

    // Specifying range as an array, whcih wil be translated to min-width and max-width features
    ifMedium = css.$media( { $mediaType: "all", width: [700, 1000] },
        class extends css.StyleDefinition<MyStyles>
        {
            sidebarRules = [
                css.$style( css.selector`${this.$parent.sidebar} ul li a:before`, {
                    content: "\"Email: \"",
                    fontStyle: "italic",
                    color: 0x666666
                })
            ]
        }
    )

    // multiple feature-sets are combined with "or"
    ifNarrowOrVeryWide = css.$media( [
            { $mediaType: "all", width: [520, 699] },
            { minWidth: 1151 }
        ],
        class extends css.StyleDefinition<MyStyles>
        {
            sidebarRules = [
                css.$style( css.selector`${this.$parent.sidebar} ul li a`, {
                    paddingLeft: 21,
                    background: {
                        image: css.url("email.png"),
                        position: ["left", "center"],
                        repeat: "no-repeat"
                    }
                })
            ]
        }
    )
}

// activate our styles
let styles = css.activate( MyStyles);



class MyComponent extends mim.Component
{
	public render()
	{
		return <div id={styles.fluidWrap}>

            <div id={styles.sidebar}>
                <h3>Super team:</h3>
                <ul id="nav">
                    <li><a data-email="johndoe@mail.com" href="mailto:johndoe@mail.com">John Doe</a></li>
                    <li><a data-email="johnsmith@mail.com" href="mailto:johnsmith@mail.com">John Smith</a></li>
                    <li><a data-email="janedoe@mail.com" href="mailto:janedoe@mail.com">Jane Doe</a></li>
                </ul>
            </div>

            <div id={styles.mainContent}>
                <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam,
                    feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies
                    mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat
                    wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros
                    ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis.
                    Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam
                    erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
                <p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam,
                    feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. Aenean ultricies
                    mi vitae est. Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat
                    wisi, condimentum sed, commodo vitae, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros
                    ipsum rutrum orci, sagittis tempus lacus enim ac dui. Donec non enim in turpis pulvinar facilisis. Ut felis.
                    Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam
                    erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus</p>
            </div>

      </div>
	}
}



// mount our component under the body element.
mim.mount( new MyComponent());


