var fs = require('fs');
var path = require('path');

var parse = require('csv-parse');

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

function validate(config) {
  console.log(config);
  var errors = [];

  var requiredKeys = ['sequenceConfig', 'bigWigConfig'];
  for (var i = 0; i < requiredKeys.length; i++)
    if (!(config.hasOwnProperty(requiredKeys[i])))
      errors.push("Does not have property " + requiredKeys[i]);

  var sequenceConfigs = ['csv', 'mysql'];
  var configs = Object.keys(config.sequenceConfig || {})
    .map((key) => key.toLowerCase())
    .filter((key) => sequenceConfigs.indexOf(key) > -1);

  if (configs.length !== 1)
    errors.push("Exactly one Sequence Configuration allowed");

  // console.log("checking two files: ",
  //   (config && config.sequenceConfig && config.sequenceConfig.csv && config.sequenceConfig.csv.path),
  //   path.join(
  //     (
  //       config && config.sequenceConfig && config.sequenceConfig.csv && config.sequenceConfig.csv.path
  //     ),
  //     '.sv.csv'
  //   )
  // );

  if (config.sequenceConfig && config.sequenceConfig.csv)
    if (!fs.existsSync(config.sequenceConfig.csv.path)
      && !fs.existsSync(path.join(config.sequenceConfig.csv.path, '.sv.csv')))
      errors.push("csv file doesnt exist");

  if (config.basetracks && !Array.isArray(config.basetracks))
    errors.push("basetracks must be an Array");

  return errors.length ? errors : false;
}

function tryReadLocationOrWithSuffix(location, suffix, done) {
  fs.readFile(location, 'utf8', function (err, contents) {
    if (err)
      fs.readFile(path.join(location, suffix), function (err, contents) {
        if (err) return done(err); return done(null, contents);
      });
    else
      return done(null, contents);
  });
}

/**
 * 
 * 
 * @param location can be folder with .sequence-viewer.csv, or csv file itself
 */
function parseCSV(location, hasHeaders, callback) {
  tryReadLocationOrWithSuffix(location, '.sequence-viewer.csv', function (err, contents) {
    if (err) return callback(err);
    parse(contents, {
      columns: hasHeaders || null,
      auto_parse: true
    }, callback);
  });
}

// parseCSV('./', true, function (err, data) {
//   console.log(data);
// });

module.exports = {
  isDataWriteable, validate, parseCSV
};
