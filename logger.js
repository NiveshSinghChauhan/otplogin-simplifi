const pino = require('pino-http')({
    prettyPrint: {
        ignore: 'pid,hostname',
        translateTime: 'yyyy/mmm/dd HH:MM:ss.l o'
    }
});


module.exports = {
    middleware: pino,
    log: pino.logger
};