import { Model } from "@icfm/trust";
enum MenuNames {
  USERS = "Users",
}
class ACLProfile extends Model {
  tableName(): string { return 'acl_profiles'; }
  PK(): string[] { return ['name']; }
  hasSerial(): boolean { return false; }
  jsonColumns():Array<string> { return ['menus']; }
  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }

  public name = '';
  public menus:any = [];

  public static availableMenus():any[] {
    return [
      {text:MenuNames.USERS, icon:'users', href:'/user/user-management', access:[
        'enter','getUsers','saveUser','delUser','changePass',
        'getACLProfiles', 'saveACLProfile', 'delACLProfile'
      ]},
    ]
  }
}
export {ACLProfile, MenuNames };