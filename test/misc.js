var fs = require('fs');
var path = require('path');

var expect = require('chai').expect;
var tmp = require('tmp');

var util = require('../lib/util');

describe('test various utility functions in ../lib/util', function () {
  describe('throwIfNotFile tests', function () {
    it('should throw if file does not exist', function (done) {
      expect(function () {
        util.throwIfNotFile("blah");
      }).to.throw();

      done();
    });

    it('should throw if file exists as a directory', function (done) {
      // make the directory
      var directoryFile = tmp.dirSync({ unsafeCleanup: true });

      expect(function () {
        util.throwIfNotFile(directoryFile.name);
      }).to.throw();

      directoryFile.removeCallback();
      done();
    });

    it('should not throw if file exists', function (done) {
      var file = tmp.fileSync();

      expect(function () {
        util.throwIfNotFile(file.name);
      }).to.not.throw();

      file.removeCallback();
      done();
    });
  });
});
