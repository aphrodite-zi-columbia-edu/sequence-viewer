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

module.exports = {
  isDataWriteable
};
