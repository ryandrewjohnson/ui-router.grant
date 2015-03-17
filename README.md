# AngularUI Router Grant

#### Protect your ui-router routes with the easy to use grant module.

The UI Router Grant module provides a quick and easy solution for adding test(s) to your ui-router states. For example if you wanted to restrict certain states to authenticated users, ui-router.grant is a quick solve. For more details check out the [demo](http://embed.plnkr.co/YTBm8ZFY9COj8ac9lSOT/preview) or the [getting started](#getting-started) section.

* [Demo](http://embed.plnkr.co/YTBm8ZFY9COj8ac9lSOT/preview)
* [Installation](#installation)
* [Getting Started](#getting-started)
* [API Reference](#api-reference)

> This documentation assumes you are comfortable working with [angular-ui-router](https://github.com/angular-ui/ui-router). The grant module was built specifically to work with ui-router's [resolve](https://github.com/angular-ui/ui-router/wiki#resolve) functionality.



## Installation

- via **[Bower](http://bower.io/)**: by running `$ bower install angular-ui-router-grant` from your console
- via **[npm](https://www.npmjs.org/)**: by running `$ npm install ui-router.grant` from your console

#### Using < IE9
The module takes advantage of [Array.prototype.forEach()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) and [Array.prototype.some()](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some) which are unavailable in older browsers. The good news is both these methods can be easily [polyfilled](https://github.com/es-shims/es5-shim).


Once you have successfully installed the module your setup should look similar to this:

```html
<!doctype html>
<html ng-app="myApp">
<head>
  <script src="//cdnjs.cloudflare.com/ajax/libs/angular.js/1.3.12/angular.min.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/angular-ui-router/0.2.13/angular-ui-router.min.js"></script>
  <script src="js/angular-ui-rotuer-grant.js"></script>
    <script>
        var app = angular.module('app', ['ui.router.grant']);
    </script>
    ...
</head>
<body>
    ...
</body>
</html>
```



## Getting Started

The ui.router.grant module is primarily made up off two core angular services `grant` and `GrantTest`. To better explain how the grant module works I'll demo an example. Let's assume that we have an app with the following ui-router states:

```javascript
$stateProvider

    .state('member-only', {
      url: '/members',
      templateUrl: 'partials/only-member.html'
    })

    .state('admin-only', {
      url: '/admins',
      templateUrl: 'partials/only-admin.html'
    })

    .state('except-member', {
      url: '/no-members',
      templateUrl: 'partials/except-member.html'
    })

    .state('combined', {
      url: '/combined',
      templateUrl: 'partials/combined.html'
    })

    .state('denied', {
      url: '/denied',
      templateUrl: 'partials/denied.html'
    })
```

The following states are currently accessible by any user, but we would like to enforce the following rules:

* `member-only` can only be accessed by **members**
* `admin-only` can only be accessed by **admins**
* `except-member` can be accessed by anyone except **members**
* `combined` can only be accessed by someone who is both a **member** and **admin**
* `denied` will be where users are redirected when failing a grant test

Creating tests with the grant module is easy. In order to enforce the above rules we need to create tests that will determine if someone is a **member** or **admin**.

```javascript
app.module('app', ['ui.router.grant'])

.run(function(grant, memberService, adminService) {

  /**
   * A test is very simple and takes two params.
   * @param  {String}     testName - A unique id for the test.
   * @param  {Function}   validate - A function that will validate whether your test passes or fails.
   */
  grant.addTest('member', function() {
    // getUser is an async request to a RESTful API that returns a promise.
    // If the member exists promise will resolve and test will pass.
    // If the member doesn't exist promise will reject and test will fail.
    return memberService.getUser();
  });

  grant.addTest('admin', function() {
    // You can also return a synchronous value.
    // If the returned value evaluates to true test will pass.
    // If the returned value evaluates to false test will fail.
    return isAdmin;
  });

});

```



#### Allow ONLY user's that are admins

Use the `grant.only(options)` method to allow state access to only those user's that pass the provided grant tests.

>
The options param can either be a single test object, or an array of test objects if there are [multiple tests](#allow-only-users-that-are-both-members-and-admins). A valid test object requires two properties **test** (test name) and **state** (ui-router state the user will be redirected to if the test fails) properties.

```javascript
.state('admin-only', {
  url: '/admins',
  templateUrl: 'partials/only-admin.html',
  resolve: {
    admin: function(grant) {
      return grant.only({test: 'admin', state: 'denied'});
    }
  }
})
```


#### Allow all user's EXCEPT members

Use the `grant.except(options)` method to restrict state access to all user's that pass the provided grant tests. Essentially this does the oppisite of `grant.only`.

```javascript
.state('except-member', {
  url: '/no-members',
  templateUrl: 'partials/except-member.html',
  resolve: {
    admin: function(grant) {
      return grant.except({test: 'member', state: 'denied'});
    }
  }
})
```


#### Allow ONLY user's that are both members and admins

Both `grant.only` and `grant.except` allow you to provide multiple grant tests when needed. In the example's `combined` state we want only user's that pass both the **member** and **admin** grant tests to have access. Before a state with multiple grant tests can resolve both tests will need to pass - It is all or nothing.

>
It's important to note that grant's with multiple asynchronous tests may not resolve/reject in the order they are listed. For example if a user fails both the **member** and **admin** tests, but the admin test rejects before the member test. The user will actually be redirected to the admin fail state even though it is listed second.

```javascript
.state('combined', {
  url: '/combined',
  templateUrl: 'partials/combined.html'
  controller: function(combined) {
    // combined will be an array of the values returned from grant.only
    // combined[0] - value returned from member test
    // combined[1] - value returned from admin test
    var newUser = combined[0];
    var newAdmin = combined[1];
  },
  resolve: {
    combined: function(grant) {
      return grant.only([
        {test: 'member', state: 'denied'},
        {test: 'admin', state: 'home'}
      ]);
    }
  }
})
```


#### Working with nested states

Instead of protecting individual states you can also protect parent states, which means that protection will propagate down to all child states. In the below example by applying the grant member test to the `parent` state, we have also protected `parent.child1` and `parent.child2` states with the same test.

```javascript
.state('parent', {
  abstract: true,
  template: '<div ui-view></div>',
  resolve: {
    member: function(grant) {
      return grant.only({test: 'member', state: 'denied'});
    }
  }
})

  .state('parent.child1', {
    url: '/nested',
    templateUrl: 'partials/nested.html'
  })

  .state('parent.child2', {
    url: '/nested',
    templateUrl: 'partials/nested.html'
  })
```

You can also still apply separate grant tests to child states as well. Using the above example again we will now apply an admin grant test to the `parent.child1` state.

```javascript
.state('parent', {
  abstract: true,
  template: '<div ui-view></div>',
  resolve: {
    member: function(grant) {
      return grant.only({test: 'member', state: 'denied'});
    }
  }
})

  .state('parent.child1', {
    url: '/nested',
    templateUrl: 'partials/nested.html',
    resolve: {
      admin: function(grant, member) {
        // by injecting the member resolve key from the 'parent' state
        // we ensure that the member grant test will be completed before
        // the admin test executes in the 'parent.child1' state.
        return grant.only({test: 'admin', state: 'denied'});
      }
    }
  })
```


#### Passing stateParams to grant tests

There may be instances where your grant tests need acces to the state's ui-router [$stateParams](https://github.com/angular-ui/ui-router/wiki/URL-Routing) object. This can be done by passing the stateParams object to your `grant.only` or `grant.except` method. This will ensure that any of the included tests have access to the $stateParams object.

```javascript
.state('member-only', {
  url: '/members/:memberId',
  templateUrl: 'partials/only-member.html',
  resolve: {
    member: function(grant, $stateParams) {
      return grant.only({test: 'member', state: 'denied'}, $stateParams);
    }
  }
})

grant.addTest('member', function() {
  // You now have access to $stateParams through
  // the GrantTest instance stateParams property
  var memberId = this.stateParams.memberId;

  return memberService.getUser(memberId);
});
```


## API Reference

#### grant.addTest( testName, validateFunction )

Add a new test to the grant service that can be used by `grant.only` and `grant.except`

| Param            | Type     | Details                                                                                                                                                                                 |
|------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| testName         | String   | A unique identifier for your test.                                                                                                                                                      |
| validateFunction | Function | A function that should return a promise or value. If the test has passed the promise should resolve, and if value it should return truthy. The opposite should occur if the test fails. |




#### grant.hasTest( testName )

Check to see if the test already exists in grant service.

| Param    | Type   | Details                            |
|----------|--------|------------------------------------|
| testName | String | A unique identifier for your test. |

**Returns** Boolean
Will return true if test exists, and false if it does not.



#### grant.only( tests, stateParams )

Ensure that ONLY those user's that pass the provided tests gain access to the ui-router state.

| Param                  | Type         | Details                                                   |
|------------------------|--------------|-----------------------------------------------------------|
| tests                  | Object/Array | A single test object or an array of multiple test objects |
| stateParams (optional) | Object       | A reference to ui-router's $stateParams object            |



#### grant.only( tests, stateParams )

Ensure that all user's EXCEPT those that pass the provided tests gain access to the ui-router state.

| Param                  | Type         | Details                                                   |
|------------------------|--------------|-----------------------------------------------------------|
| tests                  | Object/Array | A single test object or an array of multiple test objects |
| stateParams (optional) | Object       | A reference to ui-router's $stateParams object            |


#### Test Object

The test object(s) `grant.only` and `grant.except` require should be in the following format.

> single test: `{test: 'testName', state: 'stateName'}`<br/>
> multiple tests: `[{test: 'testName', state: 'stateName'}, {test: 'testName2', state: 'stateName2'}]`

* **test** the test name for the grant test you want to add
* **state** the ui-router state the user will be redirected to if they fail the test


## Notes
* This module was inspired by [Narzerus'](https://github.com/Narzerus/angular-permission) angular-permission module.



## Author
* Ryan Johnson
* @ryandrewjohnson




