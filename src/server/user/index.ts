import {Request, Response} from 'express';

export async function get(req: Request,res: Response):Promise<any> {
  return { title:'User home' };
}

export async function post():Promise<any> {
  return { result:'error', message:'Not implemented yet'};
}