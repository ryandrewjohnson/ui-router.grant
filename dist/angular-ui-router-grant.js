/**
 * ui-router.grant - v0.1.1 (2015-03-16)
 * https://github.com/ryandrewjohnson/ui-router.grant
 * Copyright (c) 2015 ; Licensed MIT 
 */
(function (root, factory) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['angular', 'angular-ui-router'], function (angular) {
      return factory(angular);
    });
  }
  // Node.js
  else if (typeof exports === 'object') {
    module.exports = factory(require('angular'), require('angular-ui-router'));
  }
  // Angular
  else if (angular) {
    factory(root.angular);
  }
}(this, function (angular, Intercom) {
  'use strict';

  angular.module('ui.router.grant', ['ui.router'])

  .constant('GRANT_ERROR', 'grant.rejected')

  .provider('grant', function() {
    // set up as a provider to allow for config options later
    return {
      $get: ['$q', 'GrantTest', function($q, GrantTest) {
        var service,
            testCollection;

        testCollection = [];

        /**
         * Public
         */
        service = {
          only:     _only,
          except:   _except,
          addTest:  _addTest,
          hasTest:  _hasTest
        };
        return service;


        /**
         * Private
         */
        function _addTest(testName, validationFunction) {
          var newTest;

          if (_hasTest(testName)) {
            throw new Error('grant: Unable to add test because "' + testName + '" already exists!');
          }

          newTest = new GrantTest(testName, validationFunction);

          testCollection.push(newTest);

          return newTest;
        }

        function _hasTest(testName) {
          var testExists = testCollection.some(function(test) {
            return (test.name === testName);
          });

          return testExists;
        }

        function _only(tests, stateParams) {
          tests = parseTests(tests);
          return authorize(tests, stateParams, true);
        }

        function _except(tests, stateParams) {
          tests = parseTests(tests);
          return authorize(tests, stateParams, false);
        }

        function authorize(tests, stateParams, resolveIfMatch) {
          var matches = [],
              deferred;

          // find the tests we are trying to authorize
          testCollection.forEach(function(test, index) {
            tests.forEach(function(testObj) {
              if (testObj.test === test.name) {
                // if state params from the state were passed
                // make sure the test has access to them
                test.setStateParams(stateParams);

                matches.push(test.validate(testObj.state, resolveIfMatch));
              }
            });
          });

          deferred = $q.defer();

          $q.all(matches)
            .then(function(results) {
              // If only one result is returned then just return that
              // instead of having it in an array
              if (results.length === 1) { results = results[0]; }

              deferred.resolve(results);
            })
            .catch(function(err) {
              deferred.reject(err);
            });

          return deferred.promise;
        }

        function parseTests(tests) {
          var myTests;

          if (!angular.isArray(tests) && !angular.isObject(tests)) {
            throw new Error('grant: invalid value provided for tests. Must be of type Array or Object.');
          }

          myTests = !angular.isArray(tests) ? [tests] : tests;

          // maybe provide more validation here at soem point??

          return myTests;
        }

        function parseStateParam(states) {
          var parsedStates;

          parsedStates = angular.isArray(states) ? states : [states];

          return parsedStates;
        }
      }]
    };

  })



  .factory('GrantTest', ['$q', 'GRANT_ERROR', function($q, GRANT_ERROR) {

    function GrantTest(testName, validationFunction) {
      validateRoleParams(testName, validationFunction);

      this.name = testName;
      this.validateFunction = validationFunction;
      this.stateParams = undefined;
    }

    GrantTest.prototype.setStateParams = function(stateParams) {
      this.stateParams = stateParams;
    };

    GrantTest.prototype.validate = function(stateTo, resolveIfMatch) {

      // add the stateTo property to the grant fail object
      // upon failed validation the user will be redirected
      // to the stateTo state
      this.grantFail = {
        type: GRANT_ERROR,
        test: this.name,
        stateTo: stateTo
      };

      return promisify(this.validateFunction(), this, resolveIfMatch);
    };

    return GrantTest;

    /**
     * Converts a value into a promise, if the value is truthy it resolves it,
     * otherwise it rejects it. Also provides the grantFail object to both resolve
     * and reject methods.
     * @param  {mixed} value
     * @return {promise}
     */
    function promisify(value, test, resolveIfMatch) {
      var deferred = $q.defer();

      if (value && angular.isFunction(value.then)) {

        value
          .then(function(response) {
            onTestPass(test, resolveIfMatch, deferred, response);
          })
          .catch(function() {
            onTestFail(test, resolveIfMatch, deferred);
          });

        return deferred.promise;
      }

      if (value) {
        onTestPass(test, resolveIfMatch, deferred, value);
      }
      else {
        onTestFail(test, resolveIfMatch, deferred);
      }

      return deferred.promise;
    }

    function onTestPass(test, resolveIfMatch, deferred, resolvedValue) {
      if (resolveIfMatch) {
        deferred.resolve(resolvedValue);
      }
      else {
        deferred.reject(test.grantFail);
      }
    }

    function onTestFail(test, resolveIfMatch, deferred) {
      if (resolveIfMatch) {
        deferred.reject(test.grantFail);
      }
      else {
        deferred.resolve();
      }
    }

    function validateRoleParams(testName, validationFunction) {
      if (!angular.isString(testName)) {
        throw new Error('Test name must be a string');
      }
      if (!angular.isFunction(validationFunction)) {
        throw new Error('validationFunction must be a function');
      }
    }

  }])



  .run(['$rootScope', '$state', 'GRANT_ERROR', function($rootScope, $state, GRANT_ERROR) {

    $rootScope.$on('$stateChangeError', onStateChangeError);

    function onStateChangeError(evt, toState, toParams, fromState, fromParams, error) {

      if (error && error.type === GRANT_ERROR) {

        // prevent infinite loop of redirects if user has selected
        // a to state that is equal to current state
        if (error.stateTo === fromState) {
          evt.preventDefault();
          console.log('grant: test "'+error.test+'" stateTo redirect prevented. State "'+error.stateTo+'" is the current state');
          return;
        }

        if (!$state.get(error.stateTo)) {
          evt.preventDefault();
          console.log('grant: test "'+error.test+'" stateTo redirect prevented. State name "'+error.stateTo+'" does not exist in ui-router $stateProvider');
          return;
        }

        // redirect to test's fail state
        $state.go(error.stateTo);
      }
    }

  }]);

}));

