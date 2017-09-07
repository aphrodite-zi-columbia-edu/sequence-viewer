var fs = require('fs');
var path = require('path');

function isDataWriteable() {
  var dataDir = path.join(__dirname, '..', 'data');
  var testFile = path.join(dataDir, 'test');

  try {
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return true;
  } catch (e) {
    return false;
  }
}

// console.log(isDataWriteable());

/*var options = {};
options["bigwigdir"]    = config.
options["csvpath"]      = config.
options["csvpath"]      = config.
options["csvuseindex"]  = config.
options["dbname"]       = config.
options["dbuser"]       = config.
options["dbpass"]       = config.
options["dbhost"]       = config.
options["optionbackup"] = config.*/

module.exports = {
  isDataWriteable
};
