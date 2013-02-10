/*
 * herald.js
 * https://github.com/couchand/herald.js
 *
 * Copyright (c) 2013 Andrew Couch
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'lib/*.js',
        'test/*.js'
      ],
      options: {
        jshintrc: '.jshintrc'
      }
    },
    test: {
      all: ['test/*.js']
    }
  });

  grunt.registerMultiTask('test', 'Run mocha tests', function() {
    var Mocha = require('mocha');
    var chai = require('chai');
    var sinonChai = require('sinon-chai');
    var mocha = new Mocha();
    var done = this.async();
    var options = this.options();

    chai.should();
    chai.use( sinonChai );

    var flag = require('./node_modules/chai/lib/chai/utils/flag.js');

    chai.Assertion.addProperty('thenable', function() {
      this.assert(
        flag(this, 'object') && flag(this, 'object').then,
        'expected #{this} to be a thenable',
        'expected #{this} not to be a thenable',
        this.negate ? false : true
      );
    });

    this.files.forEach(function(fileObj) {
      var files = grunt.file.expand({nonull: true}, fileObj.src);

      files.forEach(function(file) {
        mocha.addFile( file );
      });
    });

    mocha.run(function(failures) {
      done(failures?false:true);
    });
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint', 'test']);

};
