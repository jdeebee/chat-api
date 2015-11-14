var owasp = require('owasp-password-strength-test');

module.exports = {
  check: function(password) {
    return owasp.test(password).strong;
  }
};