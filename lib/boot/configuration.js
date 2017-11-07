/**
 * This module deals with constructing a configuration for a running instance
 * of the application. It tackles this task by discovering a rc file in either
 * the data folder of this application or by searching for a file in the users
 * home directory.
 * 
 * It will definitely find the configuration in .., .., data, it will
 * optionally find a user one.
 * 
 * Having done so, a configuration will be formed overriding defaults in data
 * with user settings found in the home folder. If the folder where the app is
 * started.
 * 
 * If that configuration is savable into the current folder it is saved, other
 * wise it is kept in memory and warnings will show up everywhere.
 */
var fs = require('fs');
var path = require('path');

var logger = require('log4js').getLogger('\t');
var homedir = require('homedir');
var request = require('request');
var yaml = require('js-yaml');

var util = require('../util');

/**
 * This function reads key value pairs from two yaml files overlaying them
 * with Object#assign.
 */
function _compileDefaultConfiguration(defaultLocation, userLocation) {
  var defaults;
  try {
    defaults = yaml.load(fs.readFileSync(defaultLocation, 'utf8'));
    logger.debug("Loaded default configuration from data folder");
    logger.trace("Default Configuration:", JSON.stringify(defaults, null, 2));
  } catch (e) {
    logger.fatal("Failed to load default configuration from data folder");
    console.log(e);
    throw e;
  }

  var user;
  try {
    user = yaml.load(fs.readFileSync(userLocation, 'utf8'));
    logger.debug("Loaded users' configuration from home folder");
    logger.trace("User's Configuration:", JSON.stringify(user, null, 2));
  } catch (e) {
    logger.debug("Failed to load users' configuration from home folder");
  }

  var config = Object.assign(defaults, user);

  if (defaults && user) {
    logger.debug("Compiled a configuration from defaults and user config");
  } else if (defaults && !user) {
    logger.debug("Compiled a configuration from defaults config");
  } else if (!defaults && user) {
    logger.debug("Compiled a configuration from user config");
  }
  return config;
}

/**
 * This assigns arguments to the previous function.
 * 
 * This distinction made for testing purposes.
 */
var compileDefaultConfiguration = _compileDefaultConfiguration.bind(
  null,
  path.join(__dirname, '..', '..', 'data', '.sequence-viewerrc'),
  path.join(homedir(), '.sequence-viewerrc')
)

/**
 * Represents a configuration object
 * 
 * Using getters and setters on this object will auto-attempt to sync to disc
 * 
 * Throws on compound properties missing.
 * 
 * Serialization/deserialization happening here is converting a json to yaml &
 * saving that yaml dump to .sv.conf in the cwd.
 */
function Configuration(configuration, fileName, inMemory) {
  this.inMemory = inMemory;
  // this.lastSync = new Boolean(inMemory).valueOf();
  this.syncTo = fileName;

  configuration.name = configuration.name || '';
  configuration.description = configuration.description || '';
  configuration.baseTracks = Array.isArray(configuration.baseTracks)
    ? configuration.baseTracks
    : [];
  configuration.filesField = configuration.filesField || '';
  this.configuration = configuration;
}

/**
 * Try to sync on save.
 */
Configuration.prototype.sync = function() {
  if (this.inMemory) return logger.trace("#sync on inMemory configuration");
  try {
    fs.writeFileSync(this.syncTo, yaml.dump(this.configuration));
    this.lastSync = true;
    logger.info("Configuration Sync'd");
  } catch (e) {
    logger.warn("Configuration cannot Sync");
    this.lastSync = false;
  }
};

Configuration.prototype.set = function(key, value) {
  var isNew = false;
  if (!Object.hasOwnProperty(key)) {
    isNew = true;
    logger.warn('Attempting to set new key', key);
  }

  this.configuration[key] = value;
  logger.info("Set", (isNew ? 'new' : ''), 'key', key, 'value', value);
  this.sync();
};

Configuration.prototype.complete = function() {
  var missingStuff = false;
  if (this.configuration.filesSource === undefined) {
    logger.trace("Constructed Configuration has no filesSource");
    missingStuff = true;
  }
  if (this.configuration.experimentsSource === undefined) {
    logger.trace("Constructed Configuration has no experimentsSource");
    missingStuff = true;
  }
  if (missingStuff) return false;
  return true;
};

/**
 * Returns boolean complete or incomplete, to determine whether or not
 * the user can click on viewer or only settings.
 * 
 * This function will make sure that we can either connect to the database or
 * read the file.
 */
Configuration.prototype.usable = function(done) {
  if (!this.complete()) {
    logger.trace("Constructed Configuration incomplete, not checking usability");
    return done(false);
  } else {
    logger.trace("Constructed Configuration is complete, checking usability");
  }

  var expType = this.configuration.experimentsSource.experimentsSourceType;
  var expConnector = experimentConnectors[expType];
  if (expConnector == undefined) {
    logger.info("Configuration not usable, unable to lookup experimentsSourceType");
    return done(false);
  }

  var c = this.configuration;

  // check experiments configuration
  var expUsable = expConnector(c.filesField, c.experimentsSource);
  if (!expUsable) {
    logger.debug("Configuration experimentsSource not usable, bailing");
    return done(false);
  }
  logger.debug("Configuration experimentsSource usable");

  // check files configuration
  var filesType = this.configuration.filesSource.filesSourceType;
  var filesConnector = fileConnectors[filesType];
  if (filesConnector == undefined) {
    logger.info("Configuration not usable, unable to lookup filesSourceType");
    return done(false);
  }

  filesConnector(c.filesSource, function (filesUsable) {
    logger.debug("Configuration filesSource " + (filesUsable ? "" : "not ") +
      "usable" + (filesUsable ? "" : ", bailing"));
    return done(filesUsable);
  });
};


/**
 * Map to look up the various connectability for experiment data
 */
var experimentConnectors = {
  csv: function (filesField, eS) {  // experimentsSource
    try {
      logger.trace("CSV experiment connector looking for data in:", eS.fileName);
      logger.trace(fs.readdirSync(eS.fileName));

      var data = util.parseCSVSync(eS.fileName, eS.hasHeaders);
      logger.trace("CSV experiment connector found data:", data);
      if (!data) {
        logger.trace("CSV experiment connector has falsy data, bailing");
        return false;
      }

      // De-morgans this line for clarity
      // if (!(Array.isArray(data) || data[0] || data[0].indexOf(filesField))) {
      if (!(Array.isArray(data) || data[0] || data[0][filesField])) {
        logger.trace("data is either not array, no first element, or first" +
          "element has no filesField");
        return false;
      }

      // logger.trace("CSV experiment connector found files in col #:", data[0].indexOf(filesField));
      logger.trace("CSV experiment connector found files in col:", filesField);
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
};

/**
 * Map to look up the various connectability for experiment data
 * 
 * These are async.
 */
var fileConnectors = {
  folder: function(fS, done) {
    fs.exists(fS.folder, function (exists) {
      logger.trace("Folder fileConnector did " + (exists ? "" : "not ") + "find folder");
      return done(exists);
    });
  },
  url: function (fS, done) {
    /**
     * untested
     */
    request(fS.url, function (err, response, body) {
      if (err) return done(err);
      return done(null, response.statusCode !== 404);
    });
  }
};

module.exports = {
  compileDefaultConfiguration, _compileDefaultConfiguration,
  Configuration
};
