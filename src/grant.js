'use strict';

angular.module('ui.router.grant', ['ui.router'])



.constant('GRANT_ERROR', 'grant.rejected')



.factory('grant', ['$q', function($q) {
  var service,
      roles;

  /**
   * Public
   */
  service = {
    only:     _only,
    except:   _except,
    addRole:  _addRole,
    hasRole:  _hasRole
  };
  return service;


  /**
   * Private
   */
  function _addRole(role) {
    if (_hasRole(role.name)) {
      throw new Error('GrantService: Unable to add role because "' + role.name + '" role already exists!');
    }

    _roles.push(role);
  }

  function _hasRole(roleName) {
    var hasRole = _roles.some(function(role) {
      return (role.name === roleName);
    });

    return hasRole;
  }

  function _only(roles, states, stateParams) {
    return authorize(roles, states, true, stateParams);
  }

  function _except(roles, states, stateParams) {
    return authorize(roles, states, false, stateParams);
  }

  function authorize(whichRoles, states, resolveIfMatch, stateParams) {
    var matches = [],
        stateTo,
        deferred;

    states = parseStateParam(states);

    // if a single value was given wrap in array
    if (!angular.isArray(whichRoles)) {
      whichRoles = [whichRoles];
    }

    // find the roles we are trying to authorize
    _roles.forEach(function(role, index) {
      whichRoles.forEach(function(roleName) {
        if (roleName === role.name) {
          // if state params from the state were passed
          // make sure the role has access to them
          role.setStateParams(stateParams);

          // attempt to match this role with an accompanying
          // stateTo from the states array, if a match can not
          // be found default to the first stateTo in states
          stateTo = states[index - 1] || states[0];

          matches.push(role.validate(stateTo, resolveIfMatch));
        }
      });
    });

    deferred = $q.defer();

    $q.all(matches)
      .then(function(results) {
        deferred.resolve(results);
      })
      .catch(function(err) {
        deferred.reject(err);
      });

    return deferred.promise;
  }

  function parseStateParam(states) {
    var parsedStates;

    parsedStates = angular.isArray(states) ? states : [states];

    return parsedStates;
  }

}])



.factory('grantTest', ['$q', 'grant', function($q, grant, GRANT_ERROR) {

  function Role(roleName, validationFunction) {
    validateRoleParams(roleName, validationFunction);

    this.name = roleName;
    this.validateFunction = validationFunction;
    this.stateParams = undefined;

    grant.addRole(this);
  }

  Role.prototype.setStateParams = function(stateParams) {
    this.stateParams = stateParams;
  };

  Role.prototype.validate = function(stateTo, resolveIfMatch) {

    // add the stateTo property to the grant fail object
    // upon failed validation the user will be redirected
    // to the stateTo state
    this.grantFail = {
      type: GRANT_ERROR,
      role: this.name,
      stateTo: stateTo
    };

    return promisify(this.validateFunction(), this, resolveIfMatch);
  };

  return Role;

  /**
   * Converts a value into a promise, if the value is truthy it resolves it,
   * otherwise it rejects it. Also provides the grantFail object to both resolve
   * and reject methods.
   * @param  {mixed} value
   * @return {promise}
   */
  function promisify(value, role, resolveIfMatch) {
    var deferred = $q.defer();

    if (value && angular.isFunction(value.then)) {

      value
        .then(function(response) {
          onRolePass(role, resolveIfMatch, deferred, response);
        })
        .catch(function() {
          onRoleFail(role, resolveIfMatch, deferred);
        });

      return deferred.promise;
    }

    if (value) {
      onRolePass(role, resolveIfMatch, deferred, value);
    }
    else {
      onRoleFail(role, resolveIfMatch, deferred);
    }

    return deferred.promise;
  }

  function onRolePass(role, resolveIfMatch, deferred, resolvedValue) {
    if (resolveIfMatch) {
      deferred.resolve(resolvedValue);
    }
    else {
      deferred.reject(role.grantFail);
    }
  }

  function onRoleFail(role, resolveIfMatch, deferred) {
    if (resolveIfMatch) {
      deferred.reject(role.grantFail);
    }
    else {
      deferred.resolve();
    }
  }

  function validateRoleParams(roleName, validationFunction) {
    if (!angular.isString(roleName)) {
      throw new Error('Role name must be a string');
    }
    if (!angular.isFunction(validationFunction)) {
      throw new Error('Validation function not a valid function');
    }
  }

}])



.run(['$rootScope', '$state', 'GRANT_ERROR', function($rootScope, $state, GRANT_ERROR) {

  $rootScope.$on('$stateChangeError', onStateChangeError);

  function onStateChangeError(evt, toState, toParams, fromState, fromParams, error) {

    if (error && error.type === ERROR.grantRejected) {
      console.log('YOU SHALL NOT PASS!!!', error);

      if (error.stateTo === fromState) {
        evt.preventDefault();
      }

      /*
      if (!$state.get(stateTo)) {
      throw new Error('StateTo must be a valid ui-router state name');
      }
      */

     // TODO: Should I protect against endless loops here? e.g. Some role keeps trying to redirect ot the current state.
     // THis would be due to user error but might be helpful to warn
     // SHould also catch errors for invalid stateTo

      $state.go(error.stateTo);
    }
  }

}]);

