/*jshint expr: true */
/*globals describe: true, it: true, before: true */
"use strict";

var herald = require('../lib/herald.js');

describe('Herald', function() {
  describe('herald()', function() {
    it('is a function', function() {
      herald.should.be.a('function');
    });

    it('creates new Heralds', function() {
      herald().should.be.true;
    });

    it('creates them `awaiting`', function() {
      var myHerald = herald();
      myHerald.awaiting().should.be.true;
    });
  });

  describe('#', function() {
    var myHerald;

    before(function() {
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
  });
});
