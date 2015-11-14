var chai   = require('chai');
var expect = chai.expect;
var should = chai.should();
var config = require('../../config');

var randomPort    = 4000;
var request       = require('supertest')('https://localhost:' + randomPort);
var apiPath       = config.restNamespace;

var app = require('../../app');
// var testSetup = require('../setup.js');
// var mongoose = require('mongoose');

describe('API', function apiTest() {
  // run this before all tests in this block
  before(function startServer(done) {
    // disable NODE checking for https certs, allows us to make requests to localhost
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    app.startServer(randomPort, function callback() {
          console.log('server was started for testing');
          // always invoke the done() callback (mocha function) after completion
          // and always return from the callback, otherwise node process will be running
          // in the background and will skyrocket the CPU usage
          return done();
        });

    // testSetup.seedDb();
  });

  // run this after all tests in this block
  after(function dropTestDb() {
      // here we are using the same (mongoose) connection that is created in app.startServer
      // mongoose exports/exposes a singleton object (with a connection property), we don't need to re-connect to our db

      // if (mongoose.connection.db.databaseName === testDB.name) {
      //   mongoose.connection.db.dropDatabase();
      //   mongoose.disconnect();
      // }
  });

  it('returns a json response when hitting the API root path', function(done) {
    request
    .get(apiPath)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200, {
      message: 'You are running dangerously low on beer!'
    }, done);
  });

  it('validates posted user object', function(done) {
    request
      .post(apiPath + '/user')
      .type('form')
      .send({ email: 'javad@test.de', password: 'dasHR5_x]tQ2_LQPZsadasd' })
      .expect(200, done);
  });
});