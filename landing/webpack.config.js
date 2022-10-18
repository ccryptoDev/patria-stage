const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

let mode = "development";
if (process.env.NODE_ENV === "production") mode = "production";

module.exports = {
  mode,
  entry: {
    bundle: path.resolve(__dirname, "src/js/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name][contenthash].js",
    clean: true,
    assetModuleFilename: "[name][ext]",
  },
  devtool: "source-map",
  devServer: {
    static: {
      directory: path.resolve(__dirname, "build"),
    },
    port: 3000,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.s?css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
      {
        test: /\.html$/i,
        loader: "html-loader",
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: "asset/resource",
      },
      {
        test: /\.svg$/,
        loader: "svg-inline-loader",
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new HtmlWebpackPlugin({
      filename: "index.html",
      template: "src/index.html",
    }),
    new HtmlWebpackPlugin({
      title: "Contact Us",
      filename: "contact.html",
      template: "src/pages/contact.html",
    }),
    new HtmlWebpackPlugin({
      title: "About Us",
      filename: "about.html",
      template: "src/pages/about.html",
    }),
    new HtmlWebpackPlugin({
      title: "Apply",
      filename: "apply.html",
      template: "src/pages/apply.html",
    }),
    new HtmlWebpackPlugin({
      title: "Out Loans",
      filename: "loans.html",
      template: "src/pages/loans.html",
    }),
    new HtmlWebpackPlugin({
      title: "Resources",
      filename: "resources.html",
      template: "src/pages/resources.html",
    }),
    new HtmlWebpackPlugin({
      title: "Interest Rates",
      filename: "rates.html",
      template: "src/pages/rates.html",
    }),
    new HtmlWebpackPlugin({
      title: "FAQ",
      filename: "faq.html",
      template: "src/pages/faq.html",
    }),
    new HtmlWebpackPlugin({
      title: "Privacy",
      filename: "privacy.html",
      template: "src/pages/privacy.html",
    }),
    new HtmlWebpackPlugin({
      title: "Privacy Notice",
      filename: "privacy-notice.html",
      template: "src/documents/privacy-notice.html",
    }),
    new HtmlWebpackPlugin({
      title: "Terms of Use",
      filename: "terms-of-use.html",
      template: "src/documents/terms-of-use.html",
    }),
    new HtmlWebpackPlugin({
      title: "Patria Lending LLC Online Privacy Notice",
      filename: "online-privacy-notice-agreement.html",
      template: "src/documents/online-privacy-notice-agreement.html",
    }),
    new HtmlWebpackPlugin({
      title: "Terms of Use",
      filename: "terms.html",
      template: "src/pages/terms.html",
    }),
    new HtmlWebpackPlugin({
      title: "Online Privacy Notice",
      filename: "online-privacy-notice.html",
      template: "src/pages/online-privacy-notice.html",
    }),
    new HtmlWebpackPlugin({
      title: "Not Found",
      filename: "not-found.html",
      template: "src/pages/not-found.html",
    }),
  ],
};
