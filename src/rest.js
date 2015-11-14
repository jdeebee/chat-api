var util          = require('util');
var paperwork     = require('paperwork');
var Q             = require('q');
var _             = require('lodash');
var jwt           = require('jsonwebtoken');
var config        = require('./config');
var bodyValidator = require('./utils/bodyValidator');
var model         = require('./model/model');
var User          = model.User;
var MessageModel  = model.Message;
var jwtSecret     = config.webTokenSecret;

function configure(app, logger) {
  app.post('/login', function (req, res) {
    User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
      if (err)
        return res.status(504).send('Database error');
      if (!user)
        return res.status(401).send('Authentication failed');
      if (reason === User.failedLogin.MAX_ATTEMPTS)
        return res.status(401).send('This user account is locked');

      res.json({token: getToken(user)});
    });
  });

  app.post('/user', paperwork.accept(bodyValidator.userTemplate), function(req, res, next) {
    logger.info('req.body=' + util.inspect(req.body));

    User.findOne({email: req.body.email}, function calback(error, foundUser) {
      console.log('error finding the user in the database. error=', error);
      console.log('foundUser=', foundUser);

      if (error) {
        console.log('error is not null');
        return res.status(504).send('Database failure. Try again later.');
      }

      if (foundUser) {
        console.log('foundUser is not null');
        return res.status(409).send('A user already exists with this email address');
      }

      // TODO: check other edge cases as well

      var user = new User({
        email: req.body.email,
        password: req.body.password,
        firstname: req.body.firstname,
        lastname: req.body.lastname
      });
      user.save(function callback(err) {
        if (err) {
          console.log('err=', err);
          return res.status(504).send('Database failure. Try again later.');
        }
        res.json({token: getToken(user)});
      });
    });
  });

  /*  validate the request using a paperwork template before passing it to the next middleware ,*/
  app.post('/message/:receiver', function sendMessage(req, res, next) {
    var message = req.body.message;
    Q.all([
      sendToUser(), // TODO: to be implemented
      persistToDb() // TODO: to be implemented
    ])
    .spread(function(deliveryResult, dbResult) {
      if (deliveryResult === 'ok')
        console.log('message was delivered');
      if (dbResult === 'ok')
        console.logger('message persisted successfully');
    })
    .fail(function(deliveryError, dbError) {
      // inform the user about the failure
    });
  });
}

function getToken(user) {
  var userProfile = _.pick(user, ['email', 'firstname', 'lastname']);
  var token = jwt.sign(userProfile, jwtSecret, { expiresIn: 60*60*5 /* in seconds*/});
  return token;
}

module.exports.configure = configure;