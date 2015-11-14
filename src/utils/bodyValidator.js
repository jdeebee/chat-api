const paperwork = require('paperwork');
const validator = require('validator');
const passChecker = require('./passChecker');

const userTemplate = {
  email: validator.isEmail,
  firstname: paperwork.optional(String),
  lastname: paperwork.optional(String),
  password: passChecker.check
};

module.exports = {
  acceptUser: paperwork.accept,
  userTemplate: userTemplate
};