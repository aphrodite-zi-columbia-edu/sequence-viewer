var fs = require('fs');
var path = require('path');

var yaml = require('js-yaml');
var pam = require('authenticate-pam');
var homedir = require('homedir');

var util = require('./util');

function State() {
  this.conf = this.trySequenceViewerConf() || null;
  this.singlePassword = this.hasArgvPassword()
    || (this.conf && this.conf.password)
    || null;
  this.singlePassword = 'var';
}

State.prototype.hasRoot = function() {
  return process.getuid() === 0;
}

State.prototype.setSinglePassword = function(pwd) {
  this.singlePassword = pwd;
}

State.prototype.hasSinglePassword = function() {
  return this.singlePassword !== null;
}

State.prototype.hasAuthSetup = function() {
  return (
    this.hasRoot() ||
    this.hasSinglePassword()
  )
};

State.prototype.getAuthFn = function() {
  if (this.hasRoot()) {
    return function authenticate(uname, pwd, done) {
      pam.authenticate(uname, pwd, function (err) {
        if (err) return done(false); return done(true);
      });
    };
  }

  else if (this.hasSinglePassword()) {
    var singlePassword = this.singlePassword;
    return function authenticate(uname, pwd, done) {
      process.nextTick(function () {
        return done(pwd === singlePassword);
      });
    };
  }

  return false;
};

var locations = [
  process.cwd(),
  homedir(),
  path.join(__dirname, '..', 'data'),
];

State.prototype.trySequenceViewerConf = function() {
  for (var i = 0; i < locations.length; i++) {
    var filename = path.join(locations[i], '.sequence-viewer.conf');
    try {
      return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
    } catch (e) { continue; }
  }

  return false;
};

function folderHasConf(location) {
  return fs.existsSync(path.join(location, '.sequence-viewer.conf'));
}

function isWritable(location) {
  try {
    fs.accessSync(location, fs.W_OK); return true;
  } catch (e) { return false; }
}

function folderHasWritableConf(location) {
  return (folderHasConf(location) && isWritable(location));
}

/**
 * Try finding a writable one, then use the first writable location
 */
State.prototype.writableSequenceViewerConf = function() {
  for (var index = 0; index < locations.length; index++) {
    if (folderHasWritableConf(locations[index])) {
      return path.join(locations[index], '.sequence-viewer.conf');
    }
  }
  for (var index = 0; index < locations.length; index++) {
    var confPath = path.join(locations[index], '.sequence-viewer.conf');
    try {
      fs.appendFileSync(confPath, ''); return confPath;
    } catch (e) { continue; }
  }
};

State.prototype.overwriteConfig = function(data) {
  data.password = this.singlePassword;

  var configpath = this.writableSequenceViewerConf();
  fs.writeFileSync(configpath, yaml.dump(data));
};

State.prototype.hasArgvPassword = function() {
  var longPasswords  = process.argv.filter((arg) => (
    arg.match(/^--password=(.*)/)
  ));
  longPasswords = longPasswords.map((pwd) => pwd.match(/^--password=(.*)/)[1]);

  if (!longPasswords.length) {
    var shortPasswords = process.argv.filter((arg) => (
      arg.match(/^-p(.*)/)
    ));
    shortPasswords = shortPasswords.map((pwd) => pwd.match(/^-p(.*)/)[1]);
    return shortPasswords.pop();
  }

  else return longPasswords.pop();  // [].pop() == undefined
}

// setTimeout(function() { new State().getFieldsRows((err, f, r) => console.log(f, r)); }, 10);
setTimeout(function() { console.log(new State().trySequenceViewerConf()); }, 10);
State.prototype.getFieldsRows = function(callback) {
  var config = this.trySequenceViewerConf();
  if (!config) return callback(null, ['No fields']);

  var iscsv = config.sequenceConfig.csv || false;
  var isdb = config.sequenceConfig.mysql || false;

  if (iscsv) {
    var csvSettings = config.sequenceConfig.csv;
    console.log("csvSettings.index", csvSettings.index, !csvSettings.index);
    return util.parseCSV(csvSettings.path, csvSettings.index, function (err, csvRows) {
      if (err) return callback(err);

      var fields = !csvSettings.index
        ? csvRows[0].map(function(el, index) { return index; })
        : Object.keys(csvRows[0]);

      callback(null, fields, csvRows.slice(csvSettings.index ? 0 : 1));
    });
  }

  else if (isdb) {
    return callback(new Error("Feature not supported yet."));
  }
};

module.exports = {
  state: new State()
};
