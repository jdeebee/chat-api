var _ = require('lodash');
var config = require('../config.defaults.json');

try {
  var userConfig = require('../config.json');
  config = _.extend(config, userConfig);
} catch(err) {
  if (err.code !== 'MODULE_NOT_FOUND') {
    throw err;
  }
}

module.exports = config;
