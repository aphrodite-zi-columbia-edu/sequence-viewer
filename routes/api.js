var express = require('express');
var router = express.Router();

var validate = require('../lib/util').validate;

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.json({ msg: 'respond with a resource'});
});

router.post('/configvalid', function (req, res, next) {
  var validationErrors = validate(Object.assign({}, req.body));
  if (validationErrors)
    return res.json({ errors: validationErrors });

  res.json({ valid: true });
});

module.exports = router;
