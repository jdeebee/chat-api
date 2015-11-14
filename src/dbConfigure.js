var mongoose = require('mongoose');
var config = require('./config');

function  connect(logger) {
  var connStr = 'mongodb://' + config.database.server.url + '/'+ config.database.name;

  console.log('connection string: ' + connStr);

  mongoose.connect(connStr);
  var db = mongoose.connection;
  db.on('error', function logError(err) {
    logger.error('mongodb connection error: ' + err);
  });
  db.once('open', function() {
    logger.info('connected to mongodb: ' + config.database.server.url);
  });
}

module.exports.connect = connect;