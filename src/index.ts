import app from './Server.js';
import Logger from 'jet-logger';
// Setup logger
const logger = new Logger();
logger.timestamp = false;

// Start the server
const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
    logger.info('Express server started on port: ' + port);
});
