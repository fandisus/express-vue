module.exports = {
  apps : [{
    name: 'vue-express',
    script: './dist/index.js',
    // node_args: '--require module-alias/register',
    cwd: '.',
    env: {
      NODE_ENV: "development",
      JET_LOGGER_MODE: 'FILE',
      JET_LOGGER_FILEPATH: './jet-logger.log',
      JET_LOGGER_TIMESTAMP: 'TRUE',
      JET_LOGGER_FORMAT: 'JSON',
      ACCESS_TOKEN_SECRET:'75523cdfa6958a6b1badd350a5b2d50c9dfc389452d7c79aa9cae58714d4ac16b5fe9953b8e0395a353d579d32775ca616ae55f502abf4b8c9dcac7609768a6e',
      PORT: 80,
      PGLOCAL:'{"host":"localhost","user":"postgres","pass":"postgres","dbname":"test","port":5432}',
    },
    out_file: "/dev/null",
    error_file: "pm2error.log",
    watch: ['dist'],
    // wach_delay:500
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
