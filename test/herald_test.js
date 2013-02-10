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
      herald().should.be.ok;
    });

    it('creates them `awaiting`', function() {
      var myHerald = herald();
      myHerald.awaiting().should.be.ok;
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
    });

    describe('dispatch()', function() {
      it('is a function', function() {
        myHerald.dispatch.should.be.a('function');
      });

      it('stops waiting after dispatch', function() {
        myHerald.dispatch();
        myHerald.awaiting().should.not.be.ok;
      });
    });
  });
});
