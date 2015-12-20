(function() {
  'use strict';

  angular.module('chatjs', ['ui.router', 'chatjs.controllers', 'chatjs.services'])
  .run(['$rootScope', '$log', '$state',
   function($rootScope, $log, $state) {
    $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, error) {
        $log.debug(error);
        $state.go('/');
      });
    }
  ])
  .config(['$stateProvider', '$locationProvider',
    function($stateProvider, $locationProvider) {
      $stateProvider
        .state('login', {
          url: '/',
          views: {
            'singleView': {
              templateUrl: '/develop/frontend/src/components/login/login.html',
              controller: 'LoginCtrl'
            }
          }
        })
        .state('chat', {
          url: '/chat',
          views: {
            'singleView': {
              templateUrl: '/develop/frontend/src/components/chat/chat.html',
              controller: 'ChatCtrl'
            }
          }
        })
        .state('room', {
          url: '/room',
          views: {
            'singleView': {
              templateUrl: '/develop/frontend/src/components/room/room.html',
              controller: 'RoomCtrl'
            }
          }
        });

        // use the HTML5 History API
        $locationProvider.html5Mode(true);
    }
  ]);

  angular.module('chatjs.services', []);
  angular.module('chatjs.controllers', []);

})();