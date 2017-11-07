var unindent = require('unindent');

function un(argument) {
  return unindent(argument, { tabSize: 2 });
}

function printWelcome() {
  var version = require('../../package').version;
  var message = `
    SequenceViewer ${version}
    This viewer started in folder: ${process.cwd()}`;
    // `To use the viewer, simply visit one of the locations listed below.`;

  message = message.substring(1);
  message = un(un(message));
  console.log(message);
}

// printWelcome();

function printServerWelcome(addresses) {
  // assemble into list
  var addressMsg = addresses.map(function (addr) {
    return "  " + addr;
  }).concat(undefined).join("\n");

  var message = `
    The SequenceViewer server is accessible through:
  `;

  message = message.substring(1);
  message = un(un(message));
  console.log(message);
  console.log(addressMsg)
}

// printServerWelcome(["here", "there"]);

function printConfiguration() {
  printFilesConfiguration();
  printExperimentsConfiguration();
}

function printFilesConfiguration(argument) {
}

function printExperimentsConfiguration(argument) {
}

module.exports = {
  printWelcome, printServerWelcome
};
