# AngularUI Router Grant

> This module is still in development, but fully functional. Just need some time to shore up the tests, and documentation.

#### Easily protect your ui-router states with this angular module

The UI Router Grant module provides a quick and easy solution for adding test(s) to your ui-router states. For example if you wanted to restrict certain states to authenticated users, ui-router.grant is a quick solve. For more details check out the [demo](http://embed.plnkr.co/YTBm8ZFY9COj8ac9lSOT/preview) or the [getting started](#getting-started) section.

* [Demo](http://embed.plnkr.co/YTBm8ZFY9COj8ac9lSOT/preview)
* [Installation](#installation)
* [Getting Started](#getting-started)
* [API Reference](#api-reference)


// uses ui-router resolve
// easily add single or multiple tests for each one of your states, will also redirect
// assumes that you are familiar with ui-router and resolves



## Installation

- via **[Bower](http://bower.io/)**: by running `$ bower install angular-ui-rotuer-grant` from your console
- or via **[npm](https://www.npmjs.org/)**: by running `$ npm install angular-ui-rotuer-grant` from your console

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



## API Reference

The grant service is in charge of managing and executing all your grant tests.

**grant.addTest(testName, validationFunction)**

**grant.hasTest(testName)**

**grant.only(testName)**



