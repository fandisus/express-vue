# vue-express

## Installation
ExpressJS and VueJS boilerplate. Using gulp-vue-single-file-component (and require.js) to compile and run vue.js SFC (.vue), and also by default using postgresql.

To use this boilerplate, you will need some globally installed npm packages (`ts-node`, `typescript` and `pm2`):
- `npm i -g pm2`
- `npm i -g ts-node typescript --save-dev`

After that, just checkout this github repo:
- `git clone https://github.com/fandisus/express-vue2.git your-project-name`

Then go to the project folder and install the npm packages:
- `cd your-project-name`
- `npm i`

## Running
Then compile the src to dist using gulp, using either of:
- `npm run build`
- `npm run buildProd`

`npm run build` will compile the ts, js and vue to the dist folder without obfuscation.

`npm run buildProd` will compile the ts, js and vue to the dist folder with obfuscation.

After compiling the src folder, you can now run the project using pm2:
- `pm2 start ecosystem.config.js`

Note that the default `JET_LOGGER_MODE` is `FILE`. So every page request will be recorded into the `jet-logger.log` file. If you want to observe the log using console, just change the `JET_LOGGER_MODE` parameter in `ecosystem.config.js` to `CONSOLE`. And then view the logs by running `pm2 logs`. Using `CONSOLE` to view the logs is the more recommended way to develop apps, since code development and server errors will also be shown there. More about jet-logger can be found in [npm jet-logger][1].

## Develop

While developing, you will need to run three commands:
- `pm2 start ecosystem.config.js` to run the app in the background.
- `pm2 start ecodev.config.js` which will observe all changes in src folder and copy or compile to dist folder.
- `pm2 logs` to view the server logs and errors and also web access logs (if you are using jet-logger CONSOLE)

The `pm2 logs` will be taking your cmd as hostages. So you might want to run them in VS Code built in terminals.

After running those 3 commands, just go to browser and type localhost. Default port is 80. To change, simply change the `PORT` parameter in `ecosystem.config.js`.

It is **STRONGLY ADVISED** that you change the `ACCESS_TOKEN_SECRET` parameter in `ecosystem.config.js` to some other random string to ensure the JWT security. It is most probably is secure though.

## First time running

This boilerplate will already have a MVP (Minimum Viable Product) ready. Except that it expects:
- PostgreSQL is already installed and running
- The `PGLOCAL` PostgreSQL parameters in `ecosystem.config.js` is correct. And
- The database `test` (or the `dbname` you provided in `PGLOCAL`) already created.

After setting up the db parameters, go to http://localhost/dev/db and copy all the commands into PostgreSQL console to create the default database tables.

Then you are good to go.

## About the MVP created

## Folder Structure

## Editting the files


[1]: https://www.npmjs.com/package/jet-logger "jet-logger"
