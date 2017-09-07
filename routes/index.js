var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title:   'Sequence Viewer',
    scripts: [/*'<script src="javascripts/example"></script>',*/],
    styles:  [/*'<link rel="stylesheet" href="/components/example.css">',*/]
  });
});

router.get('/settings', function(req, res, next) {
  res.render('settings', {
    title: 'Sequence Viewer Settings',
    scripts: [
      '<script src="/components/jquery/dist/jquery.js"></script>',
      '<script src="/components/bootstrap/dist/js/bootstrap.js"></script>',
      '<script src="/javascripts/settings/index.js"></script>'
    ],
    styles: [
      '<link rel="stylesheet" href="/components/bootstrap/dist/css/bootstrap.css">',
      `<style>
        .margins { margin: 30px; } .padding { padding: 20px; }
        #type-selector { margin: 15px auto 35px auto; }
      </style>`
    ]
  });
});

module.exports = router;
