import {Request, Response} from 'express';

export async function get(req: Request,res: Response):Promise<any> {
  const sidebarmenus = res.locals.menus.sidebarmenus;
  const sidebarhomelogo = res.locals.menus.sidebarhomelogo;
  return { title:'Home', sidebarmenus:sidebarmenus, sidebarhomelogo:sidebarhomelogo };
}

export async function post():Promise<any> {
  return { result:'error', message:'Not implemented yet'};
}