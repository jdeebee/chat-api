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
var path          = require('path');

function configure(app, logger) {
  app.get('/', function (req, res) {
    res.sendFile(path.resolve(__dirname + '/../public/develop/frontend/index.html'));
  });

  app.post('/signin', function (req, res) {
    User.getAuthenticated(req.body.email, req.body.password, function(err, user, reason) {
      if (err)
        return res.status(504).send('Database error');
      if (!user)
        return res.status(401).send('Authentication failed');
      if (reason === User.failedLogin.MAX_ATTEMPTS)
        return res.status(401).send('This user account is locked');

      res.json({ token: getToken(user), tokenExpiresInSecond: config.tokenExpiresInSecond });
    });
  });

  app.post('/startchat', checkWebToken, function(req, res) {
    if (!req.body.email)
      return res.status(400).send('Email address is missing');

    User.findOne({email: req.body.email}, function calback(error, foundUser) {
      if (error) {
        console.log('error is not null');
        return res.status(504).send('Database failure. Try again later.');
      }
      if (!foundUser) {
        console.error('Could not find the user');
        return res.status(400).send('Could not find that user. Please double check the email address.');
      }

      // initiate a chat session
      res.send({success: true, message: 'welcome'});
    });

  });

  app.post('/user', paperwork.accept(bodyValidator.userTemplate), function(req, res) {
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
  app.post('/message/:receiver', function sendMessage(req, res) {
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

// helper functions
function getToken(user) {
  var userProfile = _.pick(user, ['email', 'firstname', 'lastname']);
  var token = jwt.sign(userProfile, jwtSecret, { expiresIn: config.tokenExpiresInSecond });
  return token;
}

function checkWebToken(req, res, next) {
  // console.log('req.body=', req.body);
  var token = req.body.token;
  if (!token) {
    console.log('no token provided');
    return res.status(401).send({ message: 'No web token was provided' });
  }

  jwt.verify(token, jwtSecret, function(err, decodedUser) {
    if (err)
      return res.status(401).send({ message: 'Failed to authenticate token' });

    req.decodedUser = decodedUser;
    next();
  });
}

module.exports.configure = configure;