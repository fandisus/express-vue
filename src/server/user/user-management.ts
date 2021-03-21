import {Request, Response} from 'express';
import AppConnections from '../../classes/AppConnections';
import { DataCommunicator, JSONResponse } from '@icfm/trust';
import { ACLProfile, MenuNames } from '../../models/ACLProfile';
import {User, Departments, Roles} from '../../models/User';
import {Person} from '../../models/Person';
import UserACL from '../../models/UserACL';

export async function get(req: Request,res: Response):Promise<any> {
  const login = <User> res.locals.login;
  if (!login.canAccess(MenuNames.USERS, 'enter')) { res.status(403); res.send('403 Unauthorized');}
  return { title:'User Management' };
}

export async function post(req: Request,res: Response):Promise<any> {
  const serv = <string> req.fields!.a;
  if (serv === undefined) JSONResponse.error('No service requested');

  const login = res.locals.login;
  if (!login.canAccess(MenuNames.USERS, 'enter')) { return JSONResponse.error('403 Unauthorized');}
  const checkServ = (serv === 'init') ? 'enter' : serv;
  if (!login.canAccess(MenuNames.USERS, checkServ)) return JSONResponse.error('Not authorized');

  // 'enter','getUsers','saveUser','delUser','changePass',
  // 'getACLProfiles', 'saveACLProfile', 'delACLProfile'
  if (serv === 'init') return await init(req);
  else if (serv === 'getUsers') return await getUsers(req);
  else if (serv === 'saveUser') return await saveUser(req);
  else if (serv === 'delUser') return await delUser(req);
  else if (serv === 'changePass') return await changePass(req);

  else if (serv === 'getACLProfiles') return await getACLProfiles(req);
  else if (serv === 'saveACLProfile') return await saveACLProfile(req);
  else if (serv === 'delACLProfile') return await delACLProfile(req);

  else return JSONResponse.error('Unknown service');
}

async function init(req:Request):Promise<any> {
  const res:any = {};
  const dcACLProfile = new DataCommunicator(ACLProfile);
  const db = AppConnections.getLocalDB();
  DataCommunicator.db = db;

  const users = await db.get(`
SELECT u.id, u.username, u.email, u.phone, p.name, p.role, p.department, uacl.profile
FROM users u
LEFT JOIN persons p ON u.id=p.uid
LEFT JOIN user_acl uacl ON uacl.uid=u.id
ORDER BY u.username
`);
  for (const u of users) { u._aclProfile = {name:u.profile}; }

  res.users = users;
  res.aclProfiles = await dcACLProfile.all();
  res.menuOptions = ACLProfile.availableMenus();
  res.departments = Departments;
  res.roles = Roles;
  DataCommunicator.db.closeConnection();

  return JSONResponse.success('',res);
}

//ACL Users ------------------------------
async function getUsers(req:Request):Promise<any> {
  const res:any = {};
  const db = AppConnections.getLocalDB();
  DataCommunicator.db = db;

  const users = await db.get(`
SELECT u.id, u.username, u.email, u.phone, p.name, p.role, p.department, uacl.profile
FROM users u
LEFT JOIN persons p ON u.id=p.uid
LEFT JOIN user_acl uacl ON uacl.uid=u.id
ORDER BY u.username
`);
  for (const u of users) { u._aclProfile = {name:u.profile}; }

  res.users = users;
  DataCommunicator.db.closeConnection();

  return JSONResponse.success('',res);
}

async function saveUser(req:Request):Promise<any> {
  DataCommunicator.db = AppConnections.getLocalDB();
  if (req.fields === undefined) return JSONResponse.error('Error POSTing data');
  const postUser = JSON.parse(<string> req.fields.u);
  if (postUser.name.trim() === '') return JSONResponse.error('Name can not be empty');
  if (postUser.username.trim() === '') return JSONResponse.error('Username can not be empty');
  const dcUser = new DataCommunicator(User);
  if (postUser.id === 0) {
    let user = await dcUser.findWhere('WHERE username=$1',undefined, [postUser.username]);
    if (user !== undefined) return JSONResponse.error('Username already taken');
  } else {
    let user = await dcUser.findWhere('WHERE username=$1 AND id<>$2', undefined, [postUser.username, postUser.id]);
    if (user !== undefined) return JSONResponse.error('Username already taken');
  }

  if (!Object.values(Departments).includes(postUser.department)) JSONResponse.error('Invalid user department');
  if (!Object.values(Roles).includes(postUser.role)) JSONResponse.error('Invalid user role');
  if (postUser.pass !== postUser.cpass) return JSONResponse.error('Password confirmation incorrect');

  let dcACLProfile = new DataCommunicator(ACLProfile);
  let aclProfile = await dcACLProfile.find([postUser.aclProfile]);
  if (aclProfile === undefined) return JSONResponse.error('Invalid ACL Profile');

  let dcPerson = new DataCommunicator(Person);

  let dcUserACL = new DataCommunicator(UserACL);
  if (postUser.id === 0) {
    // console.log(req.fields);
    let user = new User({
      name:postUser.name, username:postUser.username, password:User.hashPass(postUser.pass),
      email:postUser.email, phone:postUser.phone,
    });
    user.updateLoginInfo();
    await dcUser.insert(user);
    // console.log(user);

    let userACL = new UserACL({ uid:user.id, profile:postUser.aclProfile });
    await dcUserACL.insert(userACL);
    // console.log(userACL);

    let person = new Person({
      name:postUser.name, email:postUser.email, phone:postUser.phone, role:postUser.role, department:postUser.department,
      uid:user.id
    });
    await dcPerson.insert(person);
    user.password = '';
    user!._aclProfile = new ACLProfile({name:postUser.aclProfile});
    // console.log(person);

    let res:any = {...user, ...person};
    res.id = user.id;

    return JSONResponse.success('ok',{u:res});
  } else {
    let user = await dcUser.find([postUser.id]);
    if (user === undefined) return JSONResponse.error('User not found');
    user.username = postUser.username;
    user.email = postUser.email;
    user.phone = postUser.phone;
    let person = <Person> await dcPerson.findWhere('WHERE uid=$1', undefined, [postUser.id]);
    if (person === undefined) return JSONResponse.error('Person data not found');
    person.name = postUser.name;
    person.department = postUser.department;
    person.role = postUser.role;
    person.email = postUser.email;
    person.phone = postUser.phone;
    let userACL = <UserACL> await dcUserACL.find([postUser.id]);
    userACL.profile = postUser.aclProfile;
    
    let updateUser = false;
    try { await dcUser.update(user); updateUser = true; } catch (e) { }
    try { await dcPerson.update(person); updateUser = true; } catch (e) { }
    try { await dcUserACL.update(userACL); updateUser = true; } catch(e) { }
    if (!updateUser) return JSONResponse.error('Update fail, or nothing to update.');

    user.password = ''; user._old = null;
    user!._aclProfile = new ACLProfile({name:postUser.aclProfile});
    let res = {...user, ...person};
    res.id = user.id;
    return JSONResponse.success('ok',{u:res});
  }
}

async function changePass(req:Request):Promise<any> {
  let uid:number = parseInt(<string> req!.fields!.u);
  let pass:string = <string> req!.fields!.pass;
  let dcUser = new DataCommunicator(User);
  DataCommunicator.db = AppConnections.getLocalDB();
  let u = await dcUser.find([uid]);
  if (u === undefined) return JSONResponse.error('User not found');

  u.password = User.hashPass(pass);
  await dcUser.update(u);
  return JSONResponse.success('ok');
}

async function delUser(req:Request):Promise<any> {
  let uid:number = parseInt(<string> req!.fields!.target);

  let dcUser = new DataCommunicator(User);
  DataCommunicator.db = AppConnections.getLocalDB();
  let u = await dcUser.find([uid]);
  if (u === undefined) return JSONResponse.error('User not found');
  
  let count = await dcUser.dbCount();
  if (count === 1) return JSONResponse.error('Please dont delete all users');

  await dcUser.delete(u);
  return JSONResponse.success('ok');
}
// //END ACL Users ------------------------------

//ACL Profile ------------------------------
async function getACLProfiles(req:Request):Promise<any> {
  let res:any = {};
  let dcACLProfile = new DataCommunicator(ACLProfile);
  DataCommunicator.db = AppConnections.getLocalDB();

  res.aclProfiles = await dcACLProfile.all();
  res.menuOptions = ACLProfile.availableMenus();

  return JSONResponse.success('',res);
}
async function saveACLProfile(req:Request):Promise<any> {
  let oPost:any = JSON.parse(<string> req!.fields!.m);
  let name:string = oPost.name;
  if (name.trim() === '') return JSONResponse.error('Please input ACL Profile name');
  let menus:any[] = oPost.menus;
  menus = menus.filter(m => m.checked !== false);

  //Sesuaikan format dengan availableMenus();
  let aMenus:any[] = ACLProfile.availableMenus();
  menus.forEach((val, idx) => {
    let aMenu = aMenus.find(m => m.text === val.text);
    if (aMenu === undefined) return JSONResponse.error(`ACL Menu ${val.text} is not available`);
    val.href = aMenu.href;
    val.icon = aMenu.icon;
    val.access = val.selAccess;
    delete val.selAccess;
    delete val.checked;
  });

  //TODO: Validate against login access. Login should not give more access than itself.
  let dcACLProfile = new DataCommunicator(ACLProfile);
  DataCommunicator.db = AppConnections.getLocalDB();
  let oProfile = new ACLProfile({name:name, menus:menus});
  
  if (oPost.isNew) {
    let old = await dcACLProfile.find([oProfile.name]);
    if (old !== undefined) return JSONResponse.error('ACL Profile name already taken');
    //Go save the ACLProfile
    await dcACLProfile.insert(oProfile);
    return JSONResponse.success('',oProfile);
  } else {
    let old = await dcACLProfile.find([oPost.oldName]);
    if (old === undefined) return JSONResponse.error('ACL Menu not found');
    //Go update the ACLMenu
    old.name = oProfile.name;
    old.menus = oProfile.menus;
    await dcACLProfile.update(old);
    return JSONResponse.success('',oProfile);
  }
}
async function delACLProfile(req:Request):Promise<any> {
  let target:string = <string> req!.fields!.target;
  let dcACLProfile = new DataCommunicator(ACLProfile);
  DataCommunicator.db = AppConnections.getLocalDB();
  let aclProfile = await dcACLProfile.find([target]);
  if (aclProfile === undefined) return JSONResponse.error('Data not found');
  await dcACLProfile.delete(aclProfile);
  return JSONResponse.success('OK');
}
//END ACL Profile ------------------------------