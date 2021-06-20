import cookieParser from 'cookie-parser';

import express, { Request, Response } from 'express';
import StatusCodes from 'http-status-codes';
import 'express-async-errors';

import expressFormidable from 'express-formidable';
import Logger from 'jet-logger';

// Setup logger
const logger = new Logger();
logger.timestamp = false;

const app = express();
const { NOT_FOUND } = StatusCodes;



/************************************************************************************
 *                              Set basic express settings
 ***********************************************************************************/

// app.use(express.json());
// app.use(express.urlencoded({extended: true}));
app.use(expressFormidable()); //size, path, name, type
app.use(cookieParser());


app.locals.basedir = __dirname; //Basedir for pug root path
app.set('view engine', 'pug');

/************************************************************************************
 *                              Serve public files
 ***********************************************************************************/
app.use(express.static(__dirname+'\\public'));

// The routes
import baseRouter from './routes/mainRoute';
app.use('/',baseRouter);


//Error 404
app.use('*', function(req: Request, res: Response) {
    const err = { message: 'Page not found', stack:'' }
    const statusCode = NOT_FOUND;
    app.set('views',__dirname+'/server/nologin'); //View folder for errors
    if (req.method === 'GET')
        res.status(statusCode)
        .render('error',{ error: err, statusCode: statusCode });
    else return res.status(statusCode).json({ error: err.message });
});

//Error 500 and Everything else
app.use((err: string|Error, req: Request, res: Response) => {
    logger.err(err, true);
    const statusCode = res.statusCode;
    app.set('views',__dirname+'/server/nologin'); //View folder for errors
    //err: string | {message:''} | {message:'', stack:''}
    if (typeof err === 'string') err = { name:'', message:err, stack:'' };
    if (req.method === 'GET') res.render('error',{ error: err, statusCode: statusCode });
    else return res.status(statusCode).json({ error: err.message });
});


// Export express instance
export default app;
