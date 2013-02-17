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

var Herald = function Herald(filter) {
  this._state = AWAITING;
  this._thens = [];
  if ( filter ) {
    this._filter = filter;
  }
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
  var thens = this._thens;
 // TODO: error state handling
  this._state = DISPATCHED;
  if ( this._filter ) {
    args = this.args = [ this._filter.apply(null, args) ];
    if ( args[0] instanceof Herald ) {
      args[0].then(function() {
        var args = Array.prototype.slice.call(arguments);
        thens.forEach(function(then) {
          then.apply(null, args);
        });
      });
      return;
    }
  }
  thens.forEach(function(then) {
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
  var next = new Herald(fn);
  var args = this.args;
  this._thens.push(function(){
    var args = Array.prototype.slice.call(arguments);
    next.dispatch.apply( next, args );
  });
  if ( this.dispatched() ) {
    sleep(function() {
      next.dispatch.apply( next, args );
    });
  }
  return next;
};

// utility methods

function immediate() {
  var args = Array.prototype.slice.call(arguments);
  var h = new Herald();
  h.dispatch.apply(h, args);
  return h;
}

function await() {
  var args = Array.prototype.slice.call(arguments);
  var to_go = args.length;
  var results;
  var composite;
  if ( to_go === 1 ) {
    if ( args[0] instanceof Herald ) {
      return args[0];
    }
    else {
      return immediate.apply( null, args );
    }
  }
  else if ( to_go ) {
    composite = new Herald();
    results = [];
    results.length = to_go;
    args.map(function(val) {
      return await( val );
    }).forEach(function(arg, i) {
      arg.then(function(res) {
        results[i] = res;
        if ( --to_go === 0 ) {
          composite.dispatch( results );
        }
      });
    });
    return composite;
  }
  else {
    return new Herald();
  }
}

// exports

var herald = module.exports = function(opts) {
  return new Herald();
};

herald.Herald = Herald;
herald.await = await;
herald.immediate = immediate;
