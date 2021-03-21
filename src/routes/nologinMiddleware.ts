import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { DataCommunicator } from '@icfm/trust';
import AppConnections from '../classes/AppConnections';
import { MenuItem, TopMenu } from '../classes/TopMenu';
import { User } from '../models/User';

export default function (req: Request, res: Response, next:NextFunction) {
  const jwtCookie = req.cookies?.theJWT;
  if (jwtCookie === undefined) {
    //Fill top menu
    const guestTopMenu:TopMenu = new TopMenu(false, 'blue', [
      new MenuItem('/about', 'About')
    ]);
    guestTopMenu.leftLogo = '/images/dot.png';
    res.locals.topMenu;
    next(); return; //When no login/cookie, next route.
  }

  jwt.verify(jwtCookie, <string>process.env.ACCESS_TOKEN_SECRET, (err:any, user:any) => {
    if (err) next ('Invalid login token');
    else {
      if (user.username === undefined) { //If jwt got no username, just logout and send error.
        res.cookie('theJWT', '', {expires: new Date()});
        next('Error getting login username'); return;
      }
      const dcUser = new DataCommunicator(User);
      DataCommunicator.db = AppConnections.getLocalDB();
      (async ()=>{
        const oUser = await dcUser.findWhere('WHERE username=$1',undefined, [user.username]);
        //TODO: Might want to check if user is no longer active.
        if (oUser === undefined) { //if user not found in db, logout and send error.
          res.cookie('theJWT', '', {expires: new Date()});
          next('Error getting login from database');
        } else { res.locals.login = oUser; next(); }
      })();
    }
  });
}