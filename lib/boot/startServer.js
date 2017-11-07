var app = require('../../app');
var http = require('http');
var os = require('os');

var logger = require('log4js').getLogger('\t');

function getInterfaceAddresses(port) {
  var addresses = [];

  var ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(function (dev) {
    ifaces[dev].forEach(function (details) {
      if (details.family === 'IPv4') {
        addresses.push(`http://${details.address}:${port.toString()}`);
      }
    });
  });

  return addresses;
}


function startServer(startPort, done) {
  var port = normalizePort(process.env.PORT || startPort);
  // app.set('port', port);
  logger.trace('Normalzed app port is set to', port);

  var server;
  (function listenNextPort(cb) {
    server = app.listen(port);

    server.once('error', () => {
      port++;
      logger.debug('Server error, port increased', port);
    });
    server.once('error', listenNextPort.bind(null, cb));
    server.once('listening', cb);
  })(function listeningCallback() {
    var addresses = getInterfaceAddresses(port);
    addresses.map((addr) => logger.info("Server listening on", addr));

    logger.trace("Server address", server.address());
    done(null, addresses);
  });

}

/**
 * Normalize a port into a positive number with default value 3000.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port) || port < 0 || port > 65535) {
    return 3000;
  }

  return port;
}

// startServer(function (err, addresses) {
// });

module.exports = startServer;