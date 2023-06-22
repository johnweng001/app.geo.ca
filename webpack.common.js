/* eslint-disable prettier/prettier */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/no-var-requires */
const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const package = require("./package.json");

// get version numbers and the hash of the current commit
const [major, minor, patch] = package.version.split(".");
console.log(`Build app.geo.ca: ${major}.${minor}.${patch}`);

const config = {
  entry: { main: "./src/index.tsx" },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    chunkFilename: "[name].js",
  },
  resolve: {
    extensions: [".mjs", ".ts", ".tsx", ".js", ".jsx", ".json", ".jpg"],
  },
  externals: {
    react: "cgpv.react",
    "react-dom": "cgpv.reactDOM",
  },
  performance: {
    maxEntrypointSize: 2048000,
    maxAssetSize: 4096000,
  },
  module: {
    rules: [
      {
        test: /.(ts|tsx|js|jsx)$/,
        exclude: [path.resolve(__dirname, "node_modules")],
        loader: "babel-loader",
      },
      {
        test: /\.s?[ac]ss$/,
        use: ["style-loader", "css-loader", "sass-loader"],
      },
      {
        test: /\.(png|jpg|gif)$/,
        use: [
          {
            loader: "file-loader",
          },
        ],
      },
      {
        test: /\.svg$/,
        use: ["@svgr/webpack"],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./public/assets", to: "assets", noErrorOnMissing: true },
        {
          from: path.resolve(__dirname, "public/root"),
          to: path.resolve(__dirname, "dist/"),
          force: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
      title: "GEO.CA Viewer",
    }),
    new webpack.DefinePlugin({
      __VERSION__: {
        major,
        minor,
        patch,
        timestamp: Date.now(),
      },
    }),
  ],
};

module.exports = config;
