To build dist:
- npm run build

To dev (hot reload):
- npm run buildWatcher (if watcher.ts changed)
- pm2 start ecosystem.config.js  (will start watcher and app)

To deploy:
- (git fetch, git pull)
- npm run build


Todo:
- watcher.ts  testing untuk running pug
- watcher.ts  tambahin fitur compile .vue
- builder.ts  tambahin fitur compile .vue
- DONE
