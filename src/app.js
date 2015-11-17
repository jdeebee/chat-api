var express       = require('express');
var app           = express();
var https         = require('https');
var fs            = require('fs');
var bodyParser    = require('body-parser');
var loggerFactory = require('./utils/loggerFactory');
var logger        = loggerFactory.getLogger();
var config        = require('./config');
var port          = config.serverPort;
var namespace     = config.restNamespace;
var SocketServer  = require('./socketServer');
var restEndpoints = require('./rest');
var dbConfig      = require('./dbConfigure');

function startServer(port, callback) {
  'use strict';

  dbConfig.connect(logger);

  var httpsOptions  = {
    key: fs.readFileSync(config.tlsKey),
    cert: fs.readFileSync(config.tlsCert)
  };

  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(express.static(__dirname + '/../public'));

  restEndpoints.configure(app, logger);
  var secureServer = https.createServer(httpsOptions, app);
  SocketServer.start(secureServer, config);
  secureServer.listen(port, callback);
}

startServer(port, function callback() {
  // always return from the callback. see the comment in test/rest/api.spec.js (the before hook)
  return logger.info('Server started! Listening on port ' + port);
});

module.exports.startServer = startServer;