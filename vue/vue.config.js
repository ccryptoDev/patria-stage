module.exports = {
  css: { extract: false },
  devServer: {
    //TODO: You'll need to update this if its ever copied to another project
    proxy: "http://localhost:1337"
  }
};
