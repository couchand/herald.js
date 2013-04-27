/*
 * herald.js
 *
 * A promise-like API aiming to produce natural language-like code.
 *
 * Andrew Couch
 * 2013
 */

'use strict';

// TODO: wrap in closure

// forward-declaration for jshint

var Herald;

// Defer to next turn of event loop

var sleep = function() {};
if ( process && process.nextTick ) {
  sleep = process.nextTick;
}
else if ( setTimeout ) {
  sleep = function(fn) {
    setTimeout(fn, 0);
  };
}

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

// Filter handler to enable null object

var Filter = function Filter(fn) {
  this.fn = fn;
};

Filter.prototype.go = function(args, cb) {
  var res;
  if ( this.fn ) {
    res = this.fn.apply(null, args);
    if ( res instanceof Herald ) {
      res.then(function() {
        cb(arguments);
      });
    }
    else {
      cb( [res] );
    }
  }
  else {
    cb( args );
  }
};

// Herald base class

Herald = function Herald(filter) {
  this._state = AWAITING;
  this._thens = [];
  this._rescues = [];
  this._filter = new Filter( filter );
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
  // TODO: already dispatched?
  var thens = this._thens;
  var args = this.args = Array.prototype.slice.call(arguments);
  this._state = DISPATCHED;
  this._filter.go(args, function(args) {
  // TODO: error state handling
    thens.forEach(function(then) {
      then.apply(null, args);
    });
  });
};

Herald.prototype.dismiss = function() {
// TODO: dismiss
  var args = Array.prototype.slice.call(arguments);
  this._state = DISMISSED;
  this._rescues.forEach(function(rescue) {
    rescue.apply(null, args);
  });
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

Herald.prototype.rescue = function(fn) {
  this._rescues.push(fn);
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

var herald = module.exports = await;

herald.Herald = Herald;
herald.await = await;
herald.immediate = immediate;
