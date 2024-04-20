const path = require('path');

module.exports = {
  mode: 'production', // or 'development' depending on your needs
  target: 'node', // important if you're building for Node.js
  entry: './index.js', // your entry file
  output: {
    path: path.resolve(__dirname, 'dist'), // output directory
    filename: 'index.js', // output file
    clean: true, // clean the output directory before emit
  },
  resolve: {
    fallback: {
      "os": require.resolve("os-browserify/browser"),
      "http": require.resolve("stream-http"),
      "https": require.resolve("https-browserify"),
      "path": require.resolve("path-browserify"),
      "fs": false, // if you don't need filesystem operations in the browser
      "net": false, // if you don't need network operations in the browser
      "tls": false, // if you don't need TLS/SSL in the browser
      "events": require.resolve("events/"),
      "assert": require.resolve("assert/"),
      "util": require.resolve("util/")
    }
  },
  externals: {
    // Define Node.js native modules that should not be bundled
    '@actions/core': 'commonjs @actions/core',
    '@actions/github': 'commonjs @actions/github',
    // Add other modules that you don't want to bundle for Node.js here
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      // You can add other rules for different file types here
    ],
  },
  // Add any other Webpack plugins you need here
};
