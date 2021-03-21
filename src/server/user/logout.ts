import {Request, Response} from 'express';
import {DataCommunicator} from '@icfm/trust';
import {User} from '../../models/User';

export async function get(req: Request,res: Response):Promise<any> {
  const loginObj = res.locals.login;
  const dcUser = new DataCommunicator(User);
  const oUser = await dcUser.find([loginObj.id]);
  if (oUser !== undefined) oUser.logout(res);
  res.redirect('/login');
}

export async function post():Promise<any> {
  return { result:'error', message:'No service available here'};
}