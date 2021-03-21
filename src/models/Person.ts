import { Model } from "@icfm/trust";

class Person extends Model {
  tableName(): string { return 'persons'; }
  PK(): string[] { return ['id'];}
  hasSerial(): boolean { return true; }
  constructor(obj:any={}) {
    super();
    this.cloneFrom(obj);
  }
  id =0;
  name='';
  email='';
  phone='';
  role='';
  department='';
  uid=0;
}
export {Person};