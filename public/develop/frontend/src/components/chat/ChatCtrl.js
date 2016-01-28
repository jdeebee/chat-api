angular.module('chatjs.controllers').controller('ChatCtrl',
  ['$scope', '$http', '$state',
  function($scope, $http, $state) {
    'use strict';

    $scope.email = '';
    $scope.errorEmail = false;
    $scope.submit = function() {
      var tokenObj = JSON.parse(localStorage.getItem('chatJsonWebToken'));
      console.log('tokenObj = ', tokenObj);

      // Todo: check if token is not expired, otherwise re-login
      $http({
        method  : 'POST',
        url     : '/startchat',
        data    : $.param({
          email: $scope.email,
          token: tokenObj.token
        }),
        headers : { 'Content-Type': 'application/x-www-form-urlencoded' }
      })
      .success(function(response) {
        console.log(response);
        if (response.success)
          $state.go('room');
      });
    };

  }
]);

// TODO: log out
