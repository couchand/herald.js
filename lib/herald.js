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
};

// exports

var herald = module.exports = function(opts) {
  return new Herald();
};

herald.Herald = Herald;
