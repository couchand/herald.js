/*
 * herald.js
 *
 * A promise-like API aiming to produce natural language-like code.
 *
 * Andrew Couch
 * 2013
 */

'use strict';

// Herald base class

var Herald = function Herald() {
  this._state = true;
};

Herald.prototype.awaiting = function() {
  return this._state;
};

Herald.prototype.dispatch = function() {
  this._state = false;
};

// exports

var herald = module.exports = function(opts) {
  return new Herald();
};

herald.Herald = Herald;
