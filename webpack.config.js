const MonacoPlugin = require("monaco-editor-webpack-plugin");


function config( isDev)
{
    var jsSuffix = isDev ? ".dev.js" : ".js";

    return {
        entry: "./lib/index.js",

        output:
        {
            filename: "mim-tsplay" + jsSuffix,
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
                languages: ["typescript"],
                filename: "[name].worker" + jsSuffix,
            }),

        ],

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



