import {Request, Response} from 'express';
import AppConnections from '../../classes/AppConnections';
import {User} from '../../models/User';
import { DataCommunicator, JSONResponse } from '@icfm/trust';

export async function get(req: Request,res: Response):Promise<any> {
  const sidebarmenus = res.locals.menus.sidebarmenus;
  const sidebarhomelogo = res.locals.menus.sidebarhomelogo;
  return { title:'Home', sidebarmenus:sidebarmenus, sidebarhomelogo:sidebarhomelogo };
}

export async function post(req: Request,res: Response):Promise<any> {
  const serv = req.fields?.a;
  if (serv === undefined) return JSONResponse.error('No service requested');

  if (serv === 'changePassword') return await changePassword(req, res);
  else return JSONResponse.error('Not implemented yet');
}

async function changePassword(req:Request, res: Response): Promise<any> {
  const login:User = res.locals.login;

  if (req.fields === undefined) return JSONResponse.error('Error POSTing data');
  //Check old password
  const oldPassHash = User.hashPass(<string> req.fields.oldpass);
  if (oldPassHash !== login.password) throw new Error('Old password is incorrect');

  //Validate new password
  if (req.fields.pass === '') throw new Error('Password should not be empty');
  // if (req.fields!.pass.length < 5) throw new Error('Password too short');
  //Validate password confirmation
  if (req.fields.pass !== req.fields.cpass) throw new Error('Password confirmation mismatch');
  //Update password
  const dcUser = new DataCommunicator(User);
  DataCommunicator.db = AppConnections.getLocalDB();
  login.password = User.hashPass(<string> req.fields.pass);
  await dcUser.update(login);
  DataCommunicator.db.closeConnection();

  return JSONResponse.success('');
}