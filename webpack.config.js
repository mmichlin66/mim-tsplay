const MonacoPlugin = require("monaco-editor-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');


function config( isDev)
{
    var jsSuffix = isDev ? ".dev.js" : ".js";
    var htmlSuffix = isDev ? ".dev.html" : ".html";

    return {
        entry: "./lib/index.js",
        // entry: { "mim-tsplay": './lib/index.js' },

        output:
        {
            filename: "mim-tsplay" + jsSuffix,
            chunkFilename: "[name]" + ".mim-tsplay" + jsSuffix,
            path: __dirname + "/lib",
            library: 'mim-tsplay',
            libraryTarget: 'umd',
            globalObject: 'this'
        },

        mode: isDev ? "development" : "production",
        devtool: isDev ? "#inline-source-map" : undefined,
        resolve: { extensions: [".js"] },

        module:
        {
            rules:
            [
                { test: /\.js$/, use: [{ loader: "ifdef-loader", options: {DEBUG: isDev} }] },
                { enforce: "pre", test: /\.js$/, loader: "source-map-loader" },
                { test: /\.css$/, use: ['style-loader', 'css-loader'] },
                { test: /\.ttf$/, use: ['file-loader'] }
            ]
        },

        plugins: [
            new MonacoPlugin({
                // languages: ["typescript"],
                filename: "[name].worker" + jsSuffix,
            }),

            new CopyPlugin({
                patterns: [
                    { from: "test/index" + htmlSuffix },

                    { from: "node_modules/mimcss/lib/mimcss" + jsSuffix },
                    { from: "node_modules/mimcss/lib/index.d.ts", to: "mimcss/" },
                    { context: "node_modules/mimcss/lib/api/", from: "*.d.ts", to: "mimcss/api/" },

                    { from: "node_modules/mimbl/lib/mimbl" + jsSuffix },
                    { from: "node_modules/mimbl/lib/index.d.ts", to: "mimbl/" },
                    { from: "node_modules/mimbl/lib/utils/EventSlot.d.ts", to: "mimbl/utils/" },
                    { from: "node_modules/mimbl/lib/utils/TriggerWatcher.d.ts", to: "mimbl/utils/" },
                    { from: "node_modules/mimbl/lib/api/UtilAPI.d.ts", to: "mimbl/api/" },
                    { from: "node_modules/mimbl/lib/api/HtmlTypes.d.ts", to: "mimbl/api/" },
                    { from: "node_modules/mimbl/lib/api/SvgTypes.d.ts", to: "mimbl/api/" },
                    { from: "node_modules/mimbl/lib/api/mim.d.ts", to: "mimbl/api/" },
                    { from: "node_modules/mimbl/lib/comp/Popups.d.ts", to: "mimbl/comp/" },

                    { from: "test/require.js" },
                    { from: "test/playground-config.json" },
                    { context: "test/", from: "examples/", to: "examples/" },
                ],
            })
        ],

        // optimization: { splitChunks: { chunks: 'all' } },

        externals:
        {
            mimcss: { root: 'mimcss', commonjs2: 'mimcss', commonjs: 'mimcss', amd: 'mimcss' },
            mimbl: { root: 'mimbl', commonjs2: 'mimbl', commonjs: 'mimbl', amd: 'mimbl' },
        }
    }
}



module.exports =
[
    config( true),
    config( false),
];



