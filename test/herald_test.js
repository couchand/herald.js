/*jshint expr: true */
/*globals describe: true, it: true, beforeEach: true */
"use strict";

var herald = require('../lib/herald.js');

describe('Herald', function() {
  describe('herald()', function() {
    it('is a function', function() {
      herald.should.be.a('function');
    });

    it('creates new Heralds', function() {
      herald().should.be.a.thenable;
    });

    it('creates them `awaiting`', function() {
      var myHerald = herald();
      myHerald.awaiting().should.be.true;
    });
  });

  describe('immediate()', function() {
    it('is a function', function() {
      herald.immediate.should.be.a('function');
    });

    it('returns a Herald', function() {
      herald.immediate().should.be.a.thenable;
    });

    it('is dispatched immediately', function() {
      herald.immediate().dispatched().should.be.true;
    });

    it('is dispatched with the value', function(done) {
      var thing = {};
      herald.immediate( thing ).then(function(res) {
        res.should.equal( thing );
        done();
      });
    });
  });

  describe('await()', function() {
    it('is a function', function() {
      herald.await.should.be.a('function');
    });

    it('returns a Herald', function() {
      herald.await().should.be.a.thenable;
    });

    it('returns an immediate when passed a value', function(done) {
      herald.await(42).then(function(res) {
        res.should.equal(42);
        done();
      });
    });

    it('returns the original herald when passed a single herald', function() {
      var myHerald = herald();
      herald.await( myHerald ).should.equal( myHerald );
    });

    it('returns a composition of heralds when passed several', function(done) {
      var itemA = {},
          itemB = {},
          itemC = {},
          heraldA = herald(),
          heraldB = herald(),
          heraldC = herald();

      herald.await( heraldA, heraldB, heraldC ).then(function(results) {
        results[0].should.equal( itemA );
        results[1].should.equal( itemB );
        results[2].should.equal( itemC );
        done();
      });

      heraldA.dispatch( itemA );
      heraldB.dispatch( itemB );
      heraldC.dispatch( itemC );
    });
  });

  describe('#', function() {
    var myHerald;

    beforeEach(function() {
      myHerald = herald();
    });

    describe('awaiting()', function() {
      it('is a function', function() {
        myHerald.awaiting.should.be.a('function');
      });

      it('returns true initially', function() {
        myHerald.awaiting().should.be.true;
      });

      it('returns false after dispatching', function() {
        myHerald.dispatch();
        myHerald.awaiting().should.be.false;
      });

      it('returns false after dismissing', function() {
        myHerald.dismiss();
        myHerald.awaiting().should.be.false;
      });

      it('returns true after notifying', function() {
        myHerald.notify();
        myHerald.awaiting().should.be.true;
      });
    });

    describe('dispatched()', function() {
      it('is a function', function() {
        myHerald.dispatched.should.be.a('function');
      });

      it('returns false initially', function() {
        myHerald.dispatched().should.be.false;
      });

      it('returns true after dispatching', function() {
        myHerald.dispatch();
        myHerald.dispatched().should.be.true;
      });

      it('returns false after dismissing', function() {
        myHerald.dismiss();
        myHerald.dispatched().should.be.false;
      });

      it('returns false after notifying', function() {
        myHerald.notify();
        myHerald.dispatched().should.be.false;
      });
    });

    describe('dismissed()', function() {
      it('is a function', function() {
        myHerald.dismissed.should.be.a('function');
      });

      it('returns false initially', function() {
        myHerald.dismissed().should.be.false;
      });

      it('returns false after dispatching', function() {
        myHerald.dispatch();
        myHerald.dismissed().should.be.false;
      });

      it('returns true after dismissing', function() {
        myHerald.dismiss();
        myHerald.dismissed().should.be.true;
      });

      it('returns false after notifying', function() {
        myHerald.notify();
        myHerald.dismissed().should.be.false;
      });
    });

    describe('dispatch()', function() {
      it('is a function', function() {
        myHerald.dispatch.should.be.a('function');
      });

      it('stops waiting after dispatch', function() {
        myHerald.dispatch();
        myHerald.awaiting().should.be.false;
      });

      it('is dispatched after dispatch', function() {
        myHerald.dispatch();
        myHerald.dispatched().should.be.true;
      });

      it('is not dismissed after dispatch', function() {
        myHerald.dispatch();
        myHerald.dismissed().should.be.false;
      });
    });

    describe('dismiss()', function() {
      it('is a function', function() {
        myHerald.dismiss.should.be.a('function');
      });

      it('stops waiting after dismiss', function() {
        myHerald.dismiss();
        myHerald.awaiting().should.be.false;
      });

      it('is not dispatched after dismiss', function() {
        myHerald.dismiss();
        myHerald.dispatched().should.be.false;
      });

      it('is dismissed after dismiss', function() {
        myHerald.dismiss();
        myHerald.dismissed().should.be.true;
      });
    });

    describe('then()', function() {
      it('is a function', function() {
        myHerald.then.should.be.a('function');
      });

      it('registers dispatch callback', function(done) {
        var thing = {};
        myHerald.then(function(res) {
          res.should.equal( thing );
          done();
        });
        myHerald.dispatch( thing );
      });

      it('returns a thenable', function() {
        myHerald.then(function() {}).should.be.a.thenable;
      });

      it('chains the results', function(done) {
        var thing = {};
        myHerald.then(function() {
          return thing;
        }).then(function(res) {
          res.should.equal( thing );
          done();
        });
        myHerald.dispatch();
      });

      it('chains dependent heralds', function(done) {
        var thing = {},
            dependentHerald = herald();
        myHerald.then(function(res) {
          return dependentHerald;
        }).then(function(res) {
          res.should.equal( thing );
          done();
        });
        myHerald.dispatch();
        dependentHerald.dispatch( thing );
      });

      it('fans out', function(done) {
        var num_to_go = 3;
        var thing = {};
        var not_thing = {};
        var check_finish = function(res) {
          res.should.equal( thing );
          if ( 0 === --num_to_go ) {
            done();
          }
        };
        myHerald.then(function(res) {
          check_finish( res );
          return not_thing;
        });
        myHerald.then(function(res) {
          check_finish( res );
          return not_thing;
        });
        myHerald.then(function(res) {
          check_finish( res );
          return not_thing;
        });
        myHerald.dispatch( thing );
      });

      it('immediately calls callbacks when already dispatched', function(done) {
        var thing = {};
        myHerald.dispatch( thing );
        myHerald.then(function(res) {
          res.should.equal( thing );
          done();
        });
      });

      it('calls immediate callbacks asynchronously', function(done) {
        var str = '';
        myHerald.dispatch('3');
        str += '1';
        myHerald.then(function(digit) {
          str += digit;
          str.should.equal('123');
          done();
        });
        str += '2';
      });
    });
  });
});
