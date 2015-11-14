var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var validator = require('validator');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var MAX_LOGIN_ATTEMPTS = 5;
var LOCK_TIME = 2 * 60 * 60 * 1000;

var UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    index: { unique: true },
    validate: [ validator.isEmail, 'invalid email' ]
  },
  firstname: {type: String, required: true},
  lastname:  {type: String, required: true},
  password:  {type: String, required: true},
  loginAttempts: { type: Number, required: true, default: 0 },
  lockUntil: Number
});

var MessageSchema = new Schema({
  from      : {type: String, required: true, validate: [ validator.isEmail, 'invalid sender' ]},
  to        : {type: String, required: true, validate: [ validator.isEmail, 'invalid receiver' ]},
  timestamp : {type: Date, required: true, default: Date.now, validate: [ validator.isDate, 'invalid timestamp' ]},
  message   : {type: String, required: true}
});

// a mongoose middleware. remember to invoke next() in different branches
UserSchema.pre('save', function(next) {
    var user = this;
    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password'))
      return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        // hash the password using the generated (new) salt
        // avoid using a constant/static salt. bcrypt module manages bookkeeping of generated salts internally
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);
            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

UserSchema.virtual('isLocked').get(function() {
    // check for a future lockUntil timestamp
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

UserSchema.methods.incLoginAttempts = function(cb) {
    // if we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return this.update({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        }, cb);
    }
    // otherwise we're incrementing
    var updates = { $inc: { loginAttempts: 1 } };
    // lock the account if we've reached max attempts and it's not locked already
    if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }
    return this.update(updates, cb);
};

// expose enum on the model, and provide an internal convenience reference
var reasons = UserSchema.statics.failedLogin = {
    NOT_FOUND: 0,
    PASSWORD_INCORRECT: 1,
    MAX_ATTEMPTS: 2
};

UserSchema.statics.getAuthenticated = function(email, password, callback) {
    this.findOne({ email: email }, function(err, user) {
        if (err) return callback(err);

        // make sure the user exists
        if (!user)
            return callback(null, null, reasons.NOT_FOUND);

        // check if the account is currently locked
        if (user.isLocked) {
            // just increment login attempts if account is already locked
            return user.incLoginAttempts(function(err) {
                if (err) return callback(err);
                return callback(null, null, reasons.MAX_ATTEMPTS);
            });
        }

        // test for a matching password
        user.comparePassword(password, function(err, isMatch) {
            if (err) return callback(err);

            // check if the password was a match
            if (isMatch) {
                // if there's no lock or failed attempts, just return the user
                if (!user.loginAttempts && !user.lockUntil)
                  return callback(null, user);
                // reset attempts and lock info
                var updates = {
                    $set: { loginAttempts: 0 },
                    $unset: { lockUntil: 1 }
                };
                return user.update(updates, function(err) {
                    if (err) return callback(err);
                    return callback(null, user);
                });
            }

            // password is incorrect, so increment login attempts before responding
            user.incLoginAttempts(function(err) {
                if (err) return callback(err);
                return callback(null, null, reasons.PASSWORD_INCORRECT);
            });
        });
    });
};

module.exports.User = mongoose.model('User', UserSchema);
module.exports.Message = mongoose.model('Message', MessageSchema);