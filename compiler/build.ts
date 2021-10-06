import fse from 'fs-extra';
import Logger from 'jet-logger';
import childProcess from 'child_process';
import commandLineArgs from 'command-line-args';

// Setup logger
const logger = new Logger();
logger.timestamp = false;

const options = commandLineArgs([
	{name: 'obfuscate', alias: 'o', defaultValue: false, type: Boolean},
]);



(async () => {
	try {
		// Remove current build
		await remove('./dist/');
		logger.info('removed old compile');

		//Compile tsc
		// await exec('tsc --build tsconfig.prod.json', './');
		await exec('tsc --build', './');
		logger.info('tsc finished');

		// Copy pug files
		await exec('copyfiles "./**/*.pug" "./../dist/"', './src'); //copyfiles adalah module node global.

		//Obfuscate tsc and vue result
		if (options.obfuscate) {
			await exec('javascript-obfuscator ./dist --output ./dist', './');
			logger.info('obfuscation finished');
		}

		// Copy front-end files    //previous: await copy('./src/public', './dist/public');
		await exec('copyfiles "./public/**/*" "./../dist"', './src');
		logger.info('copy public finished');

	} catch (err) {
		logger.err(err);
	}
})();


function getFileExt(p: string): string | undefined { return p.split('.').pop(); }
// async function remove(loc: string): Promise<void> { await fs.remove(loc); }
function remove(loc: string): Promise<void> {
	return new Promise((res, rej) => {
		return fse.remove(loc, (err) => {
			return (!!err ? rej(err) : res());
		});
	});
}

// async function copy(src: string, dest: string): Promise<void> { await fs.copy(src, dest); }
function copy(src: string, dest: string): Promise<void> {
	return new Promise((res, rej) => {
		return fse.copy(src, dest, (err) => {
			return (!!err ? rej(err) : res());
		});
	});
}

function exec(cmd: string, loc: string):Promise<void> {
	return new Promise((reso, reje)=>{
		return childProcess.exec(cmd, {cwd:loc}, (err, stdout, stderr) => {
			if (!!stdout) logger.info(stdout);
			if (!!stderr) logger.warn(stderr);
			return (!!err ? reje(err) : reso());
		});
	});
};
