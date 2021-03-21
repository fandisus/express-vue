import {Request, Response} from 'express';
import {DataCommunicator, JSONResponse } from '@icfm/trust';
import {User} from '../../models/User';
import AppConnections from '../../classes/AppConnections';

export async function get(req: Request,res: Response):Promise<any> {
  if (res.locals.login) res.redirect('/user');
  return { title:'Login'};
}

export async function post(req: Request,res: Response):Promise<any> {
  const dcUser = new DataCommunicator(User);
  DataCommunicator.db = AppConnections.getLocalDB();
  
  const count = await dcUser.dbCount();
  if (count === 0) {
    const admin = new User({
      username:'admin', password:User.hashPass('admin')
    });
    admin.updateLoginInfo();
    dcUser.insert(admin);
  }

  const username:string = <string> req.fields?.username;
  const pass:string = <string> req.fields?.password;
  const oUser:User|undefined = await dcUser.findWhere('WHERE username=$1',undefined, [username]);

  if (oUser === undefined) return JSONResponse.error('User not found');
  if (oUser.password !== User.hashPass(pass)) return JSONResponse.error('Incorrect password');

  oUser.login(res);
  return JSONResponse.success('');
}