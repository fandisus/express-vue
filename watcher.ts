import * as chokidar from 'chokidar';
import fs from 'fs-extra';
import Logger, { Formats, LoggerModes } from 'jet-logger';
import childProcess from 'child_process';
import path from 'path';
// import { resolve } from 'path';
// import e from 'express';
// import { stderr } from 'process';

const log = console.log.bind(console);
const logger = new Logger();
logger.timestamp = false;

enum EnvValues {
	DEV='development', PROD='production', NOWATCH = 'nowatch'
}


const ignoreInitial:boolean = (process.env.IGNORE_INITIAL === 'true');
const deployEnv:EnvValues = <EnvValues> process.env.NODE_ENV;
if (deployEnv === EnvValues.NOWATCH) process.exit();
const watcher = chokidar.watch('./src/**/*', { persistent: true, ignoreInitial:ignoreInitial });

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

function slashPath(p: string): string { return p.replace(/\\/g, '/'); }
function getFileExt(p: string): string | undefined { return p.split('.').pop(); }

async function compile(p:string):Promise<void> {
	try {
		log(`${p} added/changed`);
		p = slashPath(p);
		const ext:string = <string>getFileExt(p);
		const startTime = Date.now();
		let didSomething = false;
		const dest = `dist/${p.substr(4,1000)}`; //replace "src/" with "dist/"
		//Server side typescript
		if (ext === 'ts') { await compileTs(p); didSomething = true; }
		//Client side javascript
		else if (ext === 'js') { await compileClientJs(p); didSomething = true; }
		//Client side vue
		else if (ext === 'vue') { await compileVue(p); didSomething = true; }
		else { //pug, htm, html, png, gif, blah blah blah.
			await copy(p, dest);
			logger.info(`Copied to ${dest}`);
			didSomething = true;
		}
		let duration = (Date.now() - startTime)/1000;
		if (didSomething) log(` in ${duration} s`);
	} catch (error) {
		logger.err(error);
	}
}
async function compileTs(p: string): Promise<void> {
	let config = { "extends": "./tsconfig.json", "include":[p] };
	await fs.writeFile('tsconfig.temp.json', JSON.stringify(config,null, '\t'));
	await exec('tsc --build tsconfig.temp.json', './');
	await remove('tsconfig.temp.json');
	process.stdout.write(`\x1b[32m${'recompiled ts'}\x1b[0m`);
	//Because possibly more than 1 file affected, can not do obfuscation here.
}
async function compileClientJs(p: string): Promise<void> {
	const dest = `dist/${p.substr(4,1000)}`; //replace "src/" with "dist/"
	const isJslib = (p.substr(0,15) === 'src/public/libs');
	if (deployEnv === EnvValues.DEV) {
		await copy(p, dest);
		logger.info(`Copied to ${dest}`);
	} else if (deployEnv === EnvValues.PROD) {
		if (isJslib) { 
			await copy(p, dest);
			logger.info(`Copied to ${dest}`);
		} else {
			await exec(`javascript-obfuscator "${p}" --output "${dest}"`, './');
			logger.info(`Obfuscated to ${dest}`);
		}
	}
}
async function compileVue(p: string): Promise<void> {
	const dest = `dist/${p.substr(4,1000)}`; //replace "src/" with "dist/"
	const destDir = path.dirname(dest);
	const base = path.basename(dest, '.vue');
	const tempDir = 'vuewcTemp'
	await exec(`vue build --target wc --dest ${tempDir} "${p}"`,'./');
	let compiledJs = '';
	if (deployEnv === EnvValues.DEV) {
		compiledJs = `${tempDir}/${base}.js`;
		await copy(compiledJs, `${destDir}/${base}.js`);
	} else if (deployEnv === EnvValues.PROD) {
		compiledJs = `${tempDir}/${base}.min.js`;
		await exec(`javascript-obfuscator "${tempDir}/${base}.min.js" --output "${destDir}/${base}.js"`, './');
	}
	await remove(tempDir);

	// if (deployEnv === EnvValues.DEV) await copy(p, dest);
}
async function removeDist(p:string): Promise<void> {
	try {
		let dest = `dist/${p.substr(4,1000)}`;
		await remove(dest);
		logger.info('Dest file removed');
	} catch (error) {
		logger.err(error);
	}
}
// async function remove(loc: string): Promise<void> { await fs.remove(loc); }
function remove(loc: string): Promise<void> {
	return new Promise((res, rej) => {
		return fs.remove(loc, (err) => {
			return (!!err ? rej(err) : res());
		});
	});
}

// async function copy(src: string, dest: string): Promise<void> { await fs.copy(src, dest); }
function copy(src: string, dest: string): Promise<void> {
	return new Promise((res, rej) => {
		return fs.copy(src, dest, (err) => {
			return (!!err ? rej(err) : res());
		});
	});
}

function exec(cmd: string, loc: string):Promise<void> {
	return new Promise((reso, reje)=>{
		return childProcess.exec(cmd, {cwd:loc, windowsHide:true}, (err, stdout, stderr) => {
			if (!!stdout) logger.info(stdout);
			if (!!stderr) logger.warn(stderr);
			return (!!err ? reje(err) : reso());
		});
	});
};