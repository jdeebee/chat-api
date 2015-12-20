angular.module('chatjs.controllers').controller('RoomCtrl',
  ['$scope', '$http', '$state', 'loginService',
    function($scope, $http, $state, loginService) {
      'use strict';

      // var tokenObj = JSON.parse(localStorage.getItem('chatJsonWebToken'));

      console.log('Happy chatting!');
      // var socketClient = io('https://localhost:3000/', {
      //   'query': 'token=' + tokenObj.token
      // });

      // socketClient.on('connect', function (socket) {
      //   console.log('connected to server.');
      //   socketClient.emit('otherevent', {my: 'data'});
      //   socketClient.on('news', function (data) {
      //     console.log(data);
      //   });
      // });
    }]);