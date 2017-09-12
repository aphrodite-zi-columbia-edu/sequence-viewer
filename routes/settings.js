var express = require('express');
var router = express.Router();

router.use(function (req, res, next) {
  res.locals.bootstrap = true;
  res.locals.title = 'Sequence Viewer Settings';
  res.locals.styles = ['<link rel="stylesheet" href="/stylesheets/settings.css" />'];
  res.locals.scripts = ['<script src="/javascripts/settings/index.js"></script>'];
  next();
});

router.get('/', function (req, res, next) {
  console.log(req.body);
  res.render('settings', {
    previous: { bwdir: "ok go",
                bwurl: "ok great", }
  });
});

router.post('/', function (req, res, next) {
  res.redirect('/settings');
})

module.exports = router;
