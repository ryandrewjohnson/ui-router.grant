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

.config(['$stateProvider', '$urlMatcherFactoryProvider', function($stateProvider, $urlMatcherFactoryProvider) {

  $urlMatcherFactoryProvider.strictMode(false);

  $stateProvider

    .state('home', {
      url: '',
      templateUrl: 'home.html'
    })

    .state('denied', {
      url: '/denied',
      templateUrl: 'denied.html'
    })

    .state('guest-only', {
      url: '/guests',
      templateUrl: 'only-guest.html'
    })

    .state('user-only', {
      url: '/users/:userId',
      templateUrl: 'only-user.html',
      resolve: {
        user: function(grant) {
          return grant.only({test: 'user', state: 'denied'});
        }
      }
    })

    .state('admin-only', {
      url: '/admins',
      templateUrl: 'only-admin.html',
      resolve: {
        admin: function(grant) {
          return grant.only({test: 'admin', state: 'denied'});
        }
      }
    })

    .state('except-guest', {
      url: '/no-guests',
      templateUrl: 'except-guest.html',
      resolve: {
        grant: function(grant) {
          return grant.except({test: 'guest', state: 'denied'});
        }
      }
    })

    .state('except-user', {
      url: '/no-users',
      templateUrl: 'except-user.html',
      resolve: {
        grant: function(grant) {
          return grant.except({test: 'user', state: 'denied'});
        }
      }
    })

    .state('except-admin', {
      url: '/no-admins',
      templateUrl: 'except-admin.html',
      resolve: {
        grant: function(grant) {
          return grant.except({test: 'admin', state: 'denied'});
        }
      }
    })

    .state('combined', {
      url: '/combined',
      templateUrl: 'combined.html',
      resolve: {
        grant: function(grant) {
          return grant.only([
            {test: 'user', state: 'denied'},
            {test: 'admin', state: 'denied'},
          ]);
        }
      }
    })

    .state('parent', {
      abstract: true,
      template: '<div ui-view></div>',
      resolve: {
        user: function(grant) {
          return grant.only({test: 'user', state: 'denied'});
        }
      }
    })

      .state('parent.child1', {
        url: '/child1',
        templateUrl: 'nested.html'
      })

      .state('parent.child2', {
        url: '/child2',
        templateUrl: 'nested.html'
      })

      .state('parent.child3', {
        url: '/child3',
        templateUrl: 'nested.html'
      })

}])

.run(['grant', 'faker', '$q', function(grant, faker, $q) {

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
