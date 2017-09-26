#!/usr/bin/env node
var path = require('path');

var mv = require('mv');
var async = require('async');

function pathInModules(packageName) {
  return path.join(__dirname, 'node_modules', packageName);
}

var componentsLocation = path.join(__dirname, 'public', 'components');

var packagesFromBower = [
  'bootstrap',
  'datatables.net',
  'datatables.net-bs',
  'datatables.net-dt'
];

var filesToMove = packagesFromBower.map(function (package) {
  return {
    from: pathInModules(package),
    to: componentsLocation
  };
});

async.map(filesToMove, function (pair, done) {
  var source = pair.source;
  var dest   = pair.dest;

  mv(source, dest, { mkdirp: true }, function (err) {
    if (err) return done(err); return done();
  });
}, function (err, results) {
  if (err) throw err;
  console.log("done", results);
});
