import { Router } from 'express';
import folderRoute from '@icfm/express-folder-route';
import { TopMenu, MenuItem } from '../classes/TopMenu';

const globalAny:any = global;

// Init router and path
const router = Router();
const cwd = process.cwd();

//Route for guest (no need to login)
const routeNoLogin = folderRoute(cwd+'/dist/server/nologin');
import nologinMiddleware from './nologinMiddleware';
router.use('/', nologinMiddleware, routeNoLogin);

//Route for development/deployment purpose only:
if (process.env.NODE_ENV === 'development') {
  const routeDevOnly = folderRoute(cwd+'/dist/server/devonly');
  //TODO: create an index for /dev.
  router.use('/dev', routeDevOnly);
}

//Route for users
const routeUser = folderRoute(cwd + '/dist/server/user');
import userMiddleware from './userMiddleware';
router.use('/user', userMiddleware, routeUser);

// Export the base-router
export default router;
