const bunyan = require('bunyan');     // logger for creating detailed machine-readable json logs

function getLogger(errorLogFilePath) {
  if (!errorLogFilePath)
    errorLogFilePath = 'error.log';

  const logger = bunyan.createLogger({
    name: 'myapp',
    streams: [
      {
        level: 'info',
        stream: process.stdout            // log INFO and above to stdout
      },
      {
        level: 'error',
        path: errorLogFilePath               // log ERROR and above to a file
      }
    ]
  });

  return logger;
}

module.exports.getLogger = getLogger;