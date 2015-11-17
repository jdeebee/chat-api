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
  // .config(['$stateProvider', '$urlRouterProvider',
    // function($stateProvider, $urlRouterProvider) {
      // $urlRouterProvider.otherwise('/');

      $stateProvider
        .state('login', {
          url: '/',
          views: {
            'singleView': {
              templateUrl: '/develop/frontend/src/components/login/login.html',
              controller: 'LoginCtrl'
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