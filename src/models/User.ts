import { Model, Crypter } from "@icfm/trust";
import AppConnections from "../classes/AppConnections";
import { ACLProfile, MenuNames } from './ACLProfile';
import { Response } from 'express';
import jwt from 'jsonwebtoken';


enum Departments {
  ITSD_L1 = 'ITSD L1',
  ITSD_L2 = 'ITSD L2'
}
enum Roles {
  Programmer = 'Programmer',
  Technical_Writer = 'Technical Writer',
  System_Analyst = 'System Analyst',
  Coordinator = 'Coordinator'
}


class User extends Model {
  tableName(): string { return 'users'; }
  PK(): string[] { return ['id'];}
  hasSerial(): boolean { return true; }
  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }

  id =0;
  username='';
  password='';
  email='';
  phone='';
  login_sys:any={};
  login_info:any={};
  other_info:any={};
  _aclProfile:ACLProfile|undefined = undefined;

  public static hashPass(str:string): string { return Crypter.sha256(str); }
  public updateLoginInfo() {
    this.login_info.updated_at = new Date();
    if (this.login_info?.created_at === undefined) this.login_info.created_at = new Date();
  }
  public async getACL():Promise<void> {
    const db = AppConnections.getLocalDB();
    const sql = `
SELECT p.name, p.menus
FROM user_acl a
LEFT JOIN acl_profiles p ON a.profile=p.name
WHERE a.uid=$1
`;
    const res = await db.getOneRow(sql, [this.id]);
    db.closeConnection();
    if (res === undefined) { this._aclProfile = undefined; return; }

    this._aclProfile = new ACLProfile({name:res.name, menus:res.menus});
  }
  public canAccess(menuName:MenuNames, subMenu=''):boolean {
    //If admin
    if (this.username === 'admin') return true;
    //Other than admin
    const menu = this._aclProfile?.menus.find((m:any)=>m.text === menuName);
    if (menu === undefined) return false;
    if (subMenu === '') return true;
    if (menu.access.includes(subMenu)) return true;
    return false;
  }

  public login(res:Response) {
    //TODO: Might want to log login actions here.
    const token = jwt.sign(
      {"username":this.username, "id":this.id, "email":this.email},
      <string>process.env.ACCESS_TOKEN_SECRET
    );
    res.cookie('theJWT', token, { httpOnly:true, maxAge: 86_400_000_000 });
  }

  public logout(res:Response) {
    //TODO: Might want to log logout actions here.
    res.cookie('theJWT', '', {expires: new Date() });
  }
}
export {User, Departments, Roles};