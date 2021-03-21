import Logger from 'jet-logger';
import childProcess, {spawn} from 'child_process';

const log = console.log.bind(console);
const logger = new Logger();
logger.timestamp = false;

if (process.env.comspec !== undefined) {
  let spawner = spawn(process.env.comspec,['/c','tsc','--build','tsconfig.temp.json'], {cwd:'./'});
  spawner.stdout.on('data', (data) => { logger.info(data+1); });
  spawner.stderr.on('data', (data) => { logger.warn(data); });
  spawner.on('error', (error)=>{logger.err(error);})
  spawner.on('close', (code)=>{ logger.info('exited with code: '+ code)});
}

// (async()=>{
//   let spawnRes = await spawn('dir',['./']);
//   logger.info(spawnRes.stdout);
//   logger.info(spawnRes.stderr);
// })();

interface iExecResult { stdout:string, stderr:string, exitCode:number|null }
// function spawn(cmd: string, options:Array<string> = []): Promise<iExecResult> {
// 	return new Promise((res, rej)=>{
// 		let result:iExecResult = { stdout:'', stderr:'', exitCode:0 };
// 		let tsc = childProcess.spawn(cmd, options, {
// 			detached:true,
// 			cwd:'./',
// 			env: process.env
// 		});
// 		tsc.stdout.on('data', (data) => { result.stdout += data; logger.info(data); });
// 		tsc.stderr.on('data', (data) => { result.stderr += data; logger.warn(data); });
// 		tsc.on('error', (err)=>{ logger.err(err); rej(err)});
// 		tsc.on('close', (code)=>{ result.exitCode = code; res(result); });
// 	});
// }
