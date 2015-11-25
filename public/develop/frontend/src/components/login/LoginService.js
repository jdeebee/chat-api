angular.module('chatjs.services').factory('loginService',
['$http', function($http) {
  'use strict';
  var self = this;

  self.login = function doLogin(email, password) {
    return $http({
        method  : 'POST',
        url     : '/signin',
        data    : $.param({ 'email': email, 'password': password }),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' } // set the headers so that angular passes data as form data (not request payload)
      })
      .success(function(response) {
        console.log(response);
        var tokenToStore = {
          'token' : response.token,
          'expires': response.tokenExpiresInSecond
        };
        localStorage.setItem('chatJsonWebToken', JSON.stringify(tokenToStore));
      });
  };

  return self;
}]);


