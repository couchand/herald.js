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
  this._thens = [];
};

Herald.prototype.awaiting = function() {
  return this._state.awaiting();
};

Herald.prototype.dispatched = function() {
  return this._state.dispatched();
};

Herald.prototype.dismissed = function() {
  return this._state.dismissed();
};

Herald.prototype.dispatch = function() {
  var args = Array.prototype.slice.call(arguments);
  // TODO: error state handling
  this._state = DISPATCHED;
  this._thens.forEach(function(then) {
    then.apply(null, args);
  });
};

Herald.prototype.dismiss = function() {
  this._state = DISMISSED;
};

Herald.prototype.notify = function() {
  // TODO: something
};

Herald.prototype.then = function(fn) {
  this._thens.push(fn);
};

// utility methods

function await() {
  return new Herald();
}

// exports

var herald = module.exports = function(opts) {
  return new Herald();
};

herald.Herald = Herald;
herald.await = await;
