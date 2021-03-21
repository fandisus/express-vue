import { Model } from "@icfm/trust";

class UserACL extends Model{
  tableName(): string { return 'user_acl'}
  PK(): string[] { return ['uid'] }
  hasSerial(): boolean { return false; }
  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }
  public uid = 0;
  public profile = '';
}
export default UserACL;