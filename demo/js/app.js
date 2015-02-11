'use strict';

angular.module('demo', ['ui.router.grant'])

.controller('DemoController', ['$scope', 'faker', function($scope, faker) {
  var scope = this;

  scope.roles = {
    user: false,
    admin: false
  };

  scope.toggleRole = function(role) {
    scope.roles[role] = !scope.roles[role];

    faker[role](scope.roles[role]);
  };

}])

.factory('faker', function() {
  var isUser = false,
      isAdmin = false;

  return {
    getGuest: function() {

    },
    user: function(flag) {
      if (!angular.isUndefined(flag)) { isUser = flag; }
      return isUser;
    },
    admin: function(flag) {
      if (!angular.isUndefined(flag)) { isAdmin = flag; }
      return isAdmin;
    }
  };
})

.config(['$stateProvider', function($stateProvider) {

  $stateProvider

    .state('home', {
      url: '',
      templateUrl: 'partials/home.html'
    })

    .state('denied', {
      url: '/denied',
      templateUrl: 'partials/denied.html'
    })

    .state('guest-only', {
      url: '/guests',
      templateUrl: 'partials/only-guest.html'
    })

    .state('user-only', {
      url: '/users',
      templateUrl: 'partials/only-user.html',
      resolve: {
        user: function(grant) {
          return grant.only({test: 'user', state: 'denied'});
        }
      }
    })

    .state('admin-only', {
      url: '/admins',
      templateUrl: 'partials/only-admin.html',
      resolve: {
        admin: function(grant) {
          return grant.only({test: 'admin', state: 'home'});
        }
      }
    })

    .state('except-guest', {
      url: '/no-guests',
      templateUrl: 'partials/except-guest.html',
      resolve: {
        grant: function(grant) {
          return grant.except({test: 'guest', state: 'home'});
        }
      }
    })

    .state('except-user', {
      url: '/no-users',
      templateUrl: 'partials/except-user.html',
      resolve: {
        grant: function(grant) {
          return grant.except({test: 'user', state: 'home'});
        }
      }
    })

    .state('except-admin', {
      url: '/no-admins',
      templateUrl: 'partials/except-admin.html',
      resolve: {
        grant: function(grant) {
          return grant.except({test: 'admin', state: 'home'});
        }
      }
    })

    .state('combined', {
      url: '/combined',
      templateUrl: 'partials/combined.html',
      resolve: {
        grant: function(grant) {
          return grant.only([
            {test: 'user', state: 'home'},
            {test: 'admin', state: 'home'},
          ]);
        }
      }
    })

}])

.run(['grant', 'faker', function(grant, faker) {

  grant.addTest('guest', function() {
    return (!faker.admin() && !faker.user());
  });

  grant.addTest('user', function() {
    return faker.user();
  });

  grant.addTest('admin', function() {
    return faker.admin();
  });

}]);
