/*globals describe: true, it: true */
"use strict";

var herald = require('../lib/herald.js');

describe('Herald', function(){
  describe('herald()', function(){
    it('is a function', function(){
      herald.should.be.a('function');
    });
  });
});
