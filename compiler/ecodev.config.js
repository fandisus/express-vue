module.exports = {
  apps : [{
      name: 'watcher',
      script: 'compiler/watcher.js',
      cwd: '.',
      // out_file: "/dev/null",
      // error_file: "/dev/null",
      watch: './compiler/watcher.js',
      env: {
        NODE_ENV: 'development', //development, production or nowatch
        IGNORE_INITIAL: 'true',
      }
  }],
};
