angular.module('chatjs.controllers').controller('LoginCtrl',
  ['$scope', '$http', '$log', '$state', 'loginService',
    function($scope, $http, $log, $state, loginService) {
      'use strict';
      // Todo: handle server returned errors

      $scope.submit = function(isValid) {
        if (isValid) {
          loginService.login($scope.email, $scope.password)
          .then(function(){
            $state.go('chat');
          });

        } else {
          console.log('form data is invalid');
        }
      };
    }]);

// if (!response.success) {
//   // in case of errors, bind errors to scope properties
//   $scope.errorEmail = response.errors.email;
//   $scope.errorPassword = response.errors.password;
// } else {
//   success case
// }