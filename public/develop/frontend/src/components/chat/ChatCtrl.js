angular.module('chatjs.controllers').controller('ChatCtrl',
  ['$scope', '$http', '$log', '$state', 'loginService',
  function($scope, $http, $log, $state, loginService) {
    'use strict';

    $scope.email = '';
    $scope.submit = function() {
      var tokenObj = JSON.parse(localStorage.getItem('chatJsonWebToken'));
      console.log('tokenObj = ', tokenObj);


      // check if token is not expired, otherwise re-login
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

        if (response.success) {
          console.log('Happy chatting!');
          var client = io('https://localhost:3000/', {
            'query': 'token=' + tokenObj.token
          });

          client.on('connect', function(socket) {
            console.log('connected to server.');
            client.emit('otherevent', { my: 'data' });
            client.on('news', function (data) {
              console.log(data);
            });
          });

          // $state.go('room');
        }
      });
    };


  }
]);

// TODO: log out