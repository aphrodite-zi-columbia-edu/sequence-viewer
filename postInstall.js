#!/usr/bin/env node
var path = require('path');

var mv = require('mv');
var rimraf = require('rimraf');
var async = require('async');

function pathInModules(packageName) {
  return path.join(__dirname, 'node_modules', packageName);
}

var componentsLocation = path.join(__dirname, 'public', 'components');

var packagesFromBower = [
  'jquery',
  'bootstrap',
  'datatables.net',
  'datatables.net-bs',
  'datatables.net-dt'
];

var filesToMove = packagesFromBower.map(function (package) {
  return {
    source: pathInModules(package),
    dest:   path.join(componentsLocation, package),
    name:   package
  };
});

async.map(filesToMove, function (pair, done) {
  var source = pair.source;
  var dest   = pair.dest;

  (function movePackage() {
    mv(source, dest, { mkdirp: true, clobber: true }, function (err) {
      if (err) {
        if (err.code === 'ENOENT') {
          console.log("Package not found", pair.name, "but cont anyway.");
          return done(null, pair);
        }
        if (err.code === 'ENOTEMPTY') {
          return rimraf(dest, function (err) {
            if (err) return done(err);

            movePackage();
          });
        }
        return done(err);
      }

      console.log("Package found", pair.name);
      return done(null, pair);
    });
  })();
}, function (err, results) {
  if (err) throw err;
  console.log("done");
});
