'use strict';

angular.module('demo', ['ui.router.grant'])

.controller('DemoController', ['$scope', function($scope) {
  var scope = this;

  scope.roles = {
    user: false,
    admin: false,
    editor: false
  };

  scope.toggleRole = function(role) {
    scope.roles[role] = !scope.roles[role];
  };

}])

.config(['$stateProvider', function($stateProvider) {

  $stateProvider

    .state('home', {
      url: '',
      templateUrl: 'partials/home.html'
    })

    .state('guest-only', {
      url: '/guests',
      templateUrl: 'partials/only-guest.html'
    })

    .state('user-only', {
      url: '/users',
      templateUrl: 'partials/only-user.html'
    })

    .state('admin-only', {
      url: '/admins',
      templateUrl: 'partials/only-admin.html'
    })

    .state('except-guest', {
      url: '/no-guests',
      templateUrl: 'partials/except-guest.html'
    })

    .state('except-user', {
      url: '/no-users',
      templateUrl: 'partials/except-user.html'
    })

    .state('except-admin', {
      url: '/no-admins',
      templateUrl: 'partials/except-admin.html'
    })

    .state('combined', {
      url: '/combined',
      templateUrl: 'partials/combined.html'
    })

}])

.run([function() {

}]);
