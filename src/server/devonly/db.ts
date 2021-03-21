import {Request, Response} from 'express';
import fse from 'fs-extra';

export async function get(req: Request,res: Response):Promise<any> {
  const output:Array<string> = [];
  const fileslist = fse.readdirSync(__dirname+'/../_tabledefs/');
  for (const f of fileslist) {
    // require(__dirname+`/../_tabledefs/${f}`).default;
    const tableDef:Array<string> = (await import(__dirname+`/../_tabledefs/${f}`)).default;
    output.push(tableDef.join('\n'));
  }
  res.send('<pre>' + output.join('\n\n\n') + '</pre>');
}

export async function post():Promise<any> {
  return { result:'error', message:'Not implemented yet'};
}

