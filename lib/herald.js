/*
 * herald.js
 *
 * A promise-like API aiming to produce natural language-like code.
 *
 * Andrew Couch
 * 2013
 */

'use strict';

// Herald state

var State = function State(name) {
  this.name = name;
};

State.prototype.awaiting = function() {
  return 'awaiting' === this.name;
};

State.prototype.dispatched = function() {
  return 'dispatched' === this.name;
};

State.prototype.dismissed = function() {
  return 'dismissed' === this.name;
};

var AWAITING = new State('awaiting');
var DISPATCHED = new State('dispatched');
var DISMISSED = new State('dismissed');

// Herald base class

var Herald = function Herald() {
  this._state = AWAITING;
};

Herald.prototype.awaiting = function() {
  return this._state.awaiting();
};

Herald.prototype.dispatch = function() {
  this._state = DISPATCHED;
};

// exports

var herald = module.exports = function(opts) {
  return new Herald();
};

herald.Herald = Herald;
