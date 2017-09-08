var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({ msg: 'respond with a resource'});
});

router.post('/configvalid', function (req, res, next) {
  console.log(req.body);
  var validationErrors = validate(Object.assign({}, req.body));
  if (validationErrors)
    return res.json({ errors: validationErrors });

  res.json({ valid: true });
});

module.exports = router;

function validate(config) {
  console.log(config);
  var errors = [];

  var requiredKeys = ['sequenceConfig', 'bigWigConfig', 'basetracks'];
  for (var i = 0; i < requiredKeys.length; i++)
    if (!(config.hasOwnProperty(requiredKeys[i])))
      errors.push("Does not have property " + requiredKeys[i]);

  var sequenceConfigs = ['csv', 'mysql'];
  var configs = Object.keys(config.sequenceConfig || {})
    .map((key) => key.toLowerCase())
    .filter((key) => sequenceConfigs.indexOf(key) > -1);

  if (configs.length !== 1)
    errors.push("Exactly one Sequence Configuration allowed");

  if (config.sequenceConfig && config.sequenceConfig.csv)
    if (!fs.existsSync(config.sequenceConfig.csv.file))
      errors.push("csv file doesnt exist");

  if (!Array.isArray(config.basetracks))
    errors.push("basetracks must be an Array");

  return errors.length ? errors : false;
}
