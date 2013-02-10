/*
 * herald.js
 *
 * A promise-like API aiming to produce natural language-like code.
 *
 * Andrew Couch
 * 2013
 */

'use strict';

// Defer to next turn of event loop

var sleep = function(fn) {
  if ( process && process.nextTick ) {
    process.nextTick(fn);
  }
  else if ( setTimeout ) {
    setTimeout(fn, 0);
  }
};

var defer_apply = function(fn, args) {
  sleep(function() {
    fn.apply(null, args);
  });
};

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
  var args = this.args = Array.prototype.slice.call(arguments);
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
  var args = this.args;
  if ( this.dispatched() ) {
    defer_apply(fn, args);
  }
};

// utility methods

function immediate() {
  var args = Array.prototype.slice.call(arguments);
  var h = new Herald();
  h.dispatch.apply(h, args);
  return h;
}

function await() {
  return new Herald();
}

// exports

var herald = module.exports = function(opts) {
  return new Herald();
};

herald.Herald = Herald;
herald.await = await;
herald.immediate = immediate;
