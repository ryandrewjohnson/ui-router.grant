'use strict';

describe('Grant Service', function () {

  var grant,
      GrantTest,
      callbacks,
      resolve,
      reject,
      $rootScope;


  beforeEach(function() {
    module('ui.router.grant');

    inject(function(_$rootScope_, _grant_, _GrantTest_) {
      GrantTest = _GrantTest_;
      grant = _grant_;
      $rootScope = _$rootScope_;
    });

    callbacks = {reject: function () {}, resolve: function () {}};
    resolve = sinon.spy(callbacks, 'resolve');
    reject = sinon.spy(callbacks, 'reject');
  });

  describe('#addTest', function() {
    it('should add new test', function() {
      grant.addTest('guest', function() { return true; });
      expect(grant.hasTest('guest')).to.be.ok;
    });

    it('should throw error test already exists', function() {
      expect(function() {
        grant.addTest('guest', function() { return true; });
        grant.addTest('guest', function() { return true; });
      })
      .to.throw(Error);
    });
  });

  describe('#hasTest', function() {
    it('should find existing test', function() {
      grant.addTest('guest', function() { return true; });
      expect(grant.hasTest('guest')).to.be.ok;
    });

    it('should not find test', function() {
      expect(grant.hasTest('notest')).not.be.ok;
    });
  });

  describe('#only', function() {

    it('should throw error on invalid tests object', function() {
      expect(function() {
        grant.only('guest');
      })
      .to.throw(Error);
    });

    it('should resolve single test', function() {
      grant.addTest('guest', function() { return true; });

      grant.only({test: 'guest', state: 'test.state'}).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(resolve).to.have.been.called;
      expect(reject).to.not.be.called;
    });

    it('should reject single test', function() {
      grant.addTest('guest', function() { return false; });

      grant.only({test: 'guest', state: 'test.state'}).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(reject).to.have.been.called;
      expect(resolve).to.not.be.called;
    });

    it('should return single value for single test', function() {
      grant.addTest('guest', function() { return 1; });

      var promise = grant.only({test: 'guest', state: 'test.state'});

      promise.should.eventually.eql(1);

      $rootScope.$digest();
    });

    it('should resolve multiple tests', function() {
      grant.addTest('guest', function() { return true; });
      grant.addTest('admin', function() { return true; });

      var options = [
        {test: 'guest', state: 'test.state'},
        {test: 'admin', state: 'test.state'},
      ];

      grant.only(options).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(resolve).to.have.been.called;
      expect(reject).to.not.be.called;
    });

    it('should reject multiple tests', function() {
      grant.addTest('guest', function() { return true; });
      grant.addTest('admin', function() { return false; });

      var options = [
        {test: 'guest', state: 'test.state'},
        {test: 'admin', state: 'test.state'},
      ];

      grant.only(options).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(reject).to.have.been.called;
      expect(resolve).to.not.be.called;
    });

    it('should return array of values for multiple tests', function() {
      grant.addTest('guest', function() { return 1; });
      grant.addTest('admin', function() { return 2; });

      var options = [
        {test: 'guest', state: 'test.state'},
        {test: 'admin', state: 'test.state'},
      ];

      var promise = grant.only(options);

      promise.should.eventually.eql([1,2]);

      $rootScope.$digest();
    });
  });

  describe('#expect', function() {

    it('should throw error on invalid tests object', function() {
      expect(function() {
        grant.except('guest');
      })
      .to.throw(Error);
    });

    it('should resolve single test', function() {
      grant.addTest('guest', function() { return false; });

      grant.except({test: 'guest', state: 'test.state'}).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(resolve).to.have.been.called;
      expect(reject).to.not.be.called;
    });

    it('should reject single test', function() {
      grant.addTest('guest', function() { return true; });

      grant.except({test: 'guest', state: 'test.state'}).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(reject).to.have.been.called;
      expect(resolve).to.not.be.called;
    });

    it('should resolve multiple tests', function() {
      grant.addTest('guest', function() { return false; });
      grant.addTest('admin', function() { return false; });

      var options = [
        {test: 'guest', state: 'test.state'},
        {test: 'admin', state: 'test.state'},
      ];

      grant.except(options).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(resolve).to.have.been.called;
      expect(reject).to.not.be.called;
    });

    it('should reject multiple tests', function() {
      grant.addTest('guest', function() { return false; });
      grant.addTest('admin', function() { return true; });

      var options = [
        {test: 'guest', state: 'test.state'},
        {test: 'admin', state: 'test.state'},
      ];

      grant.except(options).then(callbacks.resolve, callbacks.reject);

      $rootScope.$digest();

      expect(reject).to.have.been.called;
      expect(resolve).to.not.be.called;
    });
  });
});


describe('Grant Test', function () {
  var grant,
      GrantTest,
      $rootScope;

  beforeEach(function() {
    module('ui.router.grant');

    inject(function(_$rootScope_, _grant_, _GrantTest_) {
      GrantTest = _GrantTest_;
      grant = _grant_;
      $rootScope = _$rootScope_;
    });
  });

  describe('#constructor', function() {
    it('should throw an error on invalid params', function() {
      expect(function() {
        new GrantTest(123, 123);
      }).to.throw(Error);
    });

    it('should create new GrantTest', function() {
      expect(function() {
        new GrantTest('validRole', function() {});
      })
      .to.not.throw(Error);
    });
  });

  describe('#setStateParams', function() {
    it('should add stateParams to GrantTest instance', function() {
      var test = new GrantTest('validRole', function() {});
      test.setStateParams({page: 1});
      expect(test.stateParams).to.deep.equal({page: 1});
    });
  });

  describe('#validate', function() {
    it('should return a promise', function() {
      var test = new GrantTest('validRole', function() { return true; });
      expect(test.validate().then).to.not.be.an('undefined');
    });
  });

});
