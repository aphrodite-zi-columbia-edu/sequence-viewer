var logger = require('log4js').getLogger('\t');
logger.level = 'debug';

function init() {
  var args = Array.prototype.slice.call(arguments);
  logger.info("Init program command selected");

  console.log("default configuration file is either options.data or ../data/.sequenceviewerrc");
  
  var command = args[args.length - 1];

  if (command.defaultConfig)
    logger.debug("Specified option: custom default configuration file:", command.defaultConfig);
  if (command.parent.verbosity)
    logger.debug("Specified option: custom verbosity level:", command.parent.verbosity);

}

module.exports = init;
