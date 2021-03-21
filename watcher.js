"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar = __importStar(require("chokidar"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const child_process_1 = __importDefault(require("child_process"));
const path_1 = __importDefault(require("path"));
// import { resolve } from 'path';
// import e from 'express';
// import { stderr } from 'process';
const log = console.log.bind(console);
const logger = new jet_logger_1.default();
logger.timestamp = false;
var EnvValues;
(function (EnvValues) {
    EnvValues["DEV"] = "development";
    EnvValues["PROD"] = "production";
    EnvValues["NOWATCH"] = "nowatch";
})(EnvValues || (EnvValues = {}));
const ignoreInitial = (process.env.IGNORE_INITIAL === 'true');
const deployEnv = process.env.NODE_ENV;
if (deployEnv === EnvValues.NOWATCH)
    process.exit();
const watcher = chokidar.watch('./src/**/*', { persistent: true, ignoreInitial: ignoreInitial });
watcher
    .on('add', compile)
    .on('change', compile)
    .on('unlink', removeDist)
    // .on('addDir', path => { console.log(`${path} removed`); })
    // .on('unlinkDir', path => { console.log(`${path} removed`); })
    .on('error', error => { log(`Error: ${error}`); })
    .on('ready', () => {
    logger.info(`--- Chokidar is ready ---`);
    logger.info(`Environment: ${process.env.NODE_ENV}`);
    logger.info(`ignoreInitial: ${process.env.IGNORE_INITIAL}`);
    logger.info('-------------------------');
});
function slashPath(p) { return p.replace(/\\/g, '/'); }
function getFileExt(p) { return p.split('.').pop(); }
function compile(p) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            log(`${p} added/changed`);
            p = slashPath(p);
            const ext = getFileExt(p);
            const startTime = Date.now();
            let didSomething = false;
            const dest = `dist/${p.substr(4, 1000)}`; //replace "src/" with "dist/"
            //Server side typescript
            if (ext === 'ts') {
                yield compileTs(p);
                didSomething = true;
            }
            //Client side javascript
            else if (ext === 'js') {
                yield compileClientJs(p);
                didSomething = true;
            }
            //Client side vue
            else if (ext === 'vue') {
                yield compileVue(p);
                didSomething = true;
            }
            else { //pug, htm, html, png, gif, blah blah blah.
                yield copy(p, dest);
                logger.info(`Copied to ${dest}`);
                didSomething = true;
            }
            let duration = (Date.now() - startTime) / 1000;
            if (didSomething)
                log(` in ${duration} s`);
        }
        catch (error) {
            logger.err(error);
        }
    });
}
function compileTs(p) {
    return __awaiter(this, void 0, void 0, function* () {
        let config = { "extends": "./tsconfig.json", "include": [p] };
        yield fs_extra_1.default.writeFile('tsconfig.temp.json', JSON.stringify(config, null, '\t'));
        yield exec('tsc --build tsconfig.temp.json', './');
        yield remove('tsconfig.temp.json');
        process.stdout.write(`\x1b[32m${'recompiled ts'}\x1b[0m`);
        //Because possibly more than 1 file affected, can not do obfuscation here.
    });
}
function compileClientJs(p) {
    return __awaiter(this, void 0, void 0, function* () {
        const dest = `dist/${p.substr(4, 1000)}`; //replace "src/" with "dist/"
        const isJslib = (p.substr(0, 15) === 'src/public/libs');
        if (deployEnv === EnvValues.DEV) {
            yield copy(p, dest);
            logger.info(`Copied to ${dest}`);
        }
        else if (deployEnv === EnvValues.PROD) {
            if (isJslib) {
                yield copy(p, dest);
                logger.info(`Copied to ${dest}`);
            }
            else {
                yield exec(`javascript-obfuscator "${p}" --output "${dest}"`, './');
                logger.info(`Obfuscated to ${dest}`);
            }
        }
    });
}
function compileVue(p) {
    return __awaiter(this, void 0, void 0, function* () {
        const dest = `dist/${p.substr(4, 1000)}`; //replace "src/" with "dist/"
        const destDir = path_1.default.dirname(dest);
        const base = path_1.default.basename(dest, '.vue');
        const tempDir = 'vuewcTemp';
        yield exec(`vue build --target wc --dest ${tempDir} "${p}"`, './');
        let compiledJs = '';
        if (deployEnv === EnvValues.DEV) {
            compiledJs = `${tempDir}/${base}.js`;
            yield copy(compiledJs, `${destDir}/${base}.js`);
        }
        else if (deployEnv === EnvValues.PROD) {
            compiledJs = `${tempDir}/${base}.min.js`;
            yield exec(`javascript-obfuscator "${tempDir}/${base}.min.js" --output "${destDir}/${base}.js"`, './');
        }
        yield remove(tempDir);
        // if (deployEnv === EnvValues.DEV) await copy(p, dest);
    });
}
function removeDist(p) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let dest = `dist/${p.substr(4, 1000)}`;
            yield remove(dest);
            logger.info('Dest file removed');
        }
        catch (error) {
            logger.err(error);
        }
    });
}
// async function remove(loc: string): Promise<void> { await fs.remove(loc); }
function remove(loc) {
    return new Promise((res, rej) => {
        return fs_extra_1.default.remove(loc, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}
// async function copy(src: string, dest: string): Promise<void> { await fs.copy(src, dest); }
function copy(src, dest) {
    return new Promise((res, rej) => {
        return fs_extra_1.default.copy(src, dest, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}
function exec(cmd, loc) {
    return new Promise((reso, reje) => {
        return child_process_1.default.exec(cmd, { cwd: loc, windowsHide: true }, (err, stdout, stderr) => {
            if (!!stdout)
                logger.info(stdout);
            if (!!stderr)
                logger.warn(stderr);
            return (!!err ? reje(err) : reso());
        });
    });
}
;
