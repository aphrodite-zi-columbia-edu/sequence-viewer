var fs = require('fs');
var path = require('path');

var yaml = require('js-yaml');
var pam = require('authenticate-pam');
var homedir = require('homedir');

var util = require('./util');

/**
 * For Shits.
 * 
 * Everything about configuration lives here.
 * 
 * This is a singleton that lives throughout the life of the application.
 * 
 */
function State() {
  this.conf = this.trySequenceViewerConf() || null;
  this.singlePassword = this.hasArgvPassword()
    || (this.conf && this.conf.password)
    || null;
}

/**
 * Are we root/have root access.
 */
State.prototype.hasRoot = function() {
  return process.getuid() === 0;
}

/**
 * Set the password if single password protection is being used
 */
State.prototype.setSinglePassword = function(pwd) {
  this.singlePassword = pwd;
}

/**
 * Is single password being used?
 */
State.prototype.hasSinglePassword = function() {
  return this.singlePassword !== null;
}

/**
 * Is an authenication scheme present
 */
State.prototype.hasAuthSetup = function() {
  return (
    this.hasRoot() ||
    this.hasSinglePassword()
  )
};

/**
 * returns function of (username, password, done(boolean))
 */
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
      process.nextTick(function checkPassword() {
        return done(pwd === singlePassword);
      });
    };
  }

  return false;
};

/**
 * Potential locations for configuration file defaults' searching.
 */
var locations = [
  process.cwd(),
  homedir(),
  path.join(__dirname, '..', 'data'),
];

/**
 * try and load first present configuration file in locations
 */
State.prototype.trySequenceViewerConf = function() {
  for (var i = 0; i < locations.length; i++) {
    var filename = path.join(locations[i], '.sequence-viewer.conf');
    try {
      return yaml.safeLoad(fs.readFileSync(filename, 'utf8'));
    } catch (e) { continue; }
  }

  return false;
};

/**
 * Does the current directory contain a configuration file
 */
function folderHasConf(location) {
  return fs.existsSync(path.join(location, '.sequence-viewer.conf'));
}

/**
 * Is a location writable?
 */
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

/**
 * Did we get a password in argv
 */
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

/**
 * This gets the fields and rows from the experiment data. It is a method of
 * on the State singleton because the information of where it is lives here
 * and it doesnt make sense to decouple this code.
 * 
 * Here is also the encoded the default filename of the csv, database name and
 * table, etc.
 */
State.prototype.getFieldsRows = function(callback) {
  var config = this.trySequenceViewerConf();
  if (!config) return callback(null, ['No fields']);

  var iscsv = config.sequenceConfig.csv || false;
  var isdb = config.sequenceConfig.mysql || false;

  if (iscsv) {
    var csvSettings = config.sequenceConfig.csv;
    var csvPath = csvSettings.path || '.sv.csv';

    // console.log("csvSettings.index", csvSettings.index, !csvSettings.index);
    return util.parseCSV(csvPath, csvSettings.index, function (err, csvRows) {
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
