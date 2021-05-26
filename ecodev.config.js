module.exports = {
  apps : [{
      name: 'watcher',
      script: 'watcher.js',
      cwd: '.',
      // out_file: "/dev/null",
      // error_file: "/dev/null",
      watch: './watcher.js',
      env: {
        NODE_ENV: 'development', //development, production or nowatch
        IGNORE_INITIAL: 'true',
      }
  }],
};
