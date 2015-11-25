angular.module('chatjs.controllers').controller('LoginCtrl',
  ['$scope', '$http', '$log', '$state', 'loginService',
  function($scope, $http, $log, $state, loginService) {
  'use strict';

  // $log.debug('hello from login controller');

  $scope.formData = {};
  $scope.submit = function(isValid) {
    if (isValid) {
      // TODO: ADD CLIENT SIDE EMAIL VALIDATION & HANDLE SERVER RETURNED ERRORS
      loginService.login($scope.formData.email, $scope.formData.password)
      .then(function(){
        $state.go('chat');
      });

        // if (!response.success) {
        //   // in case of errors, bind errors to scope properties
        //   $scope.errorEmail = response.errors.email;
        //   $scope.errorPassword = response.errors.password;
        // } else {
        //   success case
        // }
    } else {
      console.log('form data is invalid');
    }

  };

}]);