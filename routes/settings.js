var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
  res.render('settings', {
    title: 'Sequence Viewer Settings',
    bootstrap: true,
    styles: [
      '<link rel="stylesheet" href="/stylesheets/settings.css" />'
    ],
    scripts: [
      '<script src="/javascripts/settings/index.js"></script>'
    ]
  });
});

module.exports = router;
