import {Request, Response, NextFunction} from 'express';
import {User} from '../models/User';
import { ACLProfile } from '../models/ACLProfile';

const midware = function(req: Request, res: Response, next: NextFunction) {
  //Validate is logged in
  if (!res.locals.login) { res.redirect('/login'); } // res.status(403); next('Not logged in'); }
  const oUser:User = res.locals.login;

  (async () => {
    await oUser.getACL();
    // DataCommunicator.db.closeConnection();
  
    let menus:any[];
    if (oUser.username === 'admin') menus = ACLProfile.availableMenus();
    else {
      if (oUser._aclProfile === undefined) res.redirect('/user/logout');
      menus = oUser._aclProfile?.menus;
    }
    res.locals.menus= {
      sidebarmenus: menus,
      sidebarhomelogo: "/images/dot.png"
    };
    next();
  })();
}

export default midware;
