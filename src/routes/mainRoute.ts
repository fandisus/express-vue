import { Router, Request, Response } from 'express';
import folderRoute, {RouteHandler} from '@icfm/express-folder-route';
import Logger from 'jet-logger';

// Init router and path
const router = Router();
const cwd = process.cwd();

RouteHandler.before = function(req:Request, res:Response) {
  let log = { method:req.method, path:req.path, ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress};
  Logger.Info(log);
}
RouteHandler.after = function(req:Request, res:Response) {}

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
