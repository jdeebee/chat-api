/* jshint expr:true */

var util = require('util');
var chai   = require('chai');
var expect = chai.expect;
var should = chai.should();
var mongoose = require('mongoose');
var db = mongoose.connection;

var config = require('../../config');
var model = require('../../model/model');
var User = model.User;

describe('User model', function() {
    var dummyUser = {
        email: 'foo@bar.com',
        password: 'BarBaaz123',
        firstname: 'foo',
        lastname: 'bar'
    };
    var testUser = new User(dummyUser);

    before(function connectToDb(done) {
        var connStr = 'mongodb://' + config.database.server.url + '/'+ config.database.name;
        mongoose.connect(connStr);
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', function() {
          done();
        });
    });

    after(function removeTestUser(done) {
        User.findOneAndRemove({email: dummyUser.email}, function callback(err, doc) {
            expect(err).to.not.exist;
            expect(doc.email).to.equal(dummyUser.email);
            done();
        });
    });

    it('saves the user with hashed password', function(done) {
        testUser.save(function(err) {
            expect(err).to.not.exist;

            User.findOne({ email: dummyUser.email }, function(err, user) {
                expect(err).to.not.exist;
                // check if password is hashed
                expect(user.password).to.not.equal(dummyUser.password);
                user.comparePassword(dummyUser.password, function(err, isMatch) {
                    expect(err).to.not.exist;
                    expect(isMatch).to.be.true;
                });
                user.comparePassword('WrongPassword', function(err, isMatch) {
                    expect(err).to.not.exist;
                    expect(isMatch).to.be.false;
                });
            });

            User.getAuthenticated(dummyUser.email, dummyUser.password, function(err, user, reason) {
                expect(err).to.not.exist;
                expect(reason).to.not.exist;
                expect(user).to.exist;
                done();
            });

        });
    });
});