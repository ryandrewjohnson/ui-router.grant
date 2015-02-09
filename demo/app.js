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
      templateUrl: 'home.html'
    })

    .state('guest-only', {
      url: '/guests',
      templateUrl: 'only-guest.html'
    })

    .state('user-only', {
      url: '/users',
      templateUrl: 'only-user.html'
    })

    .state('admin-only', {
      url: '/admins',
      templateUrl: 'only-admin.html'
    })

    .state('except-guest', {
      url: '/no-guests',
      templateUrl: 'except-guest.html'
    })

    .state('except-user', {
      url: '/no-users',
      templateUrl: 'except-user.html'
    })

    .state('except-admin', {
      url: '/no-admins',
      templateUrl: 'except-admin.html'
    })

    .state('combined', {
      url: '/combined',
      templateUrl: 'combined.html'
    })

}])

.run([function() {

}]);
