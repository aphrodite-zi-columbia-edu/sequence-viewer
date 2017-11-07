var _ = require('lodash');
var logger = require('log4js').getLogger('\t');

var configuration = require('./configuration');
var messages = require('./messages');
var util = require('../util');
var startServer = require('./startServer');

/**
 * command comes from commander command action option callback in bin/www
 */
function runBootFunctions() {
  var args = Array.prototype.slice.call(arguments);
  var command = args[args.length - 1];

  messages.printWelcome();

  logger.level = 'error';
  logger.level = 'trace';  // FIXME this line disappears in production

  var verbosity = command.parent.verbosity;
  if (verbosity) {
    logger.debug("Specified option: custom verbosity level:", command.parent.verbosity);

    // TODO: consider commenting first two (or even 3)
    var level = [
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
    ][verbosity - 1] || 'trace';

    logger.level = level;
  }

  if (command.port)
    logger.debug("Specified option: port", command.port);
  if (command.defaultConfig) {
    logger.debug("Specified option: custom default configuration file:", command.defaultConfig);
    util.throwIfNotFile(command.defaultConfig);
  }

  var c = configuration.compileDefaultConfiguration();
  var config = new configuration.Configuration(c, null, true);

  console.log(config);
  process.exit();

  startServer(command.port, function (err, addresses) {
    messages.printServerWelcome(addresses);
  });
}

module.exports = runBootFunctions;
