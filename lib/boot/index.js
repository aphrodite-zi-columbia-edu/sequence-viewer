var messages = require('./messages');
var startServer = require('./startServer');
var _ = require('lodash');

var logger = require('log4js').getLogger('\t');

/**
 * options come from commander command action options callback in bin/www
 */
function runBootFunctions(options) {
  messages.printWelcome();

  logger.level = 'error';  // TODO change to error
  if (options.verbosity !== undefined) {
    var level = [
      'fatal',
      'error',
      'warn',
      'info',
      'debug',
      'trace',
    ][options.verbosity - 1] || 'trace';

    logger.level = level;
    logger.level = 'trace';  // TODO FIXME

    console.log("Logging Level:", logger.level.levelStr);

    // console.log("start options", _.pick(options, ['port', 'defaultConfig', 'verbosity']));
  }

  discoverDefaultConfiguration

  startServer(function (err, addresses) {
    messages.printServerWelcome(addresses);
  });
}

module.exports = runBootFunctions;
