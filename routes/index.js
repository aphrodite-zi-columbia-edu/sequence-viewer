var express = require('express');
var router = express.Router();

var state = require('../lib/state').state;

/* GET home page. */
router.get('/', function(req, res, next) {
  if (state.hasAuthSetup()) {
    res.render('login', {
      needsUsername: state.hasRoot(),
      scripts: [/*'<script src="/javascripts/example"></script>',*/
        '<script src="/components/jquery/dist/jquery.js"></script>',
        '<script src="/components/bootstrap/dist/js/bootstrap.js"></script>',
      ],
      styles:  [/*'<link rel="stylesheet" href="/components/example.css">',*/,
        '<link rel="stylesheet" href="/components/bootstrap/dist/css/bootstrap.css">',
      ]
    })
  }

  else {
    res.render('initial-setup', {
      scripts: [
        '<script src="/components/jquery/dist/jquery.js"></script>',
        '<script src="/components/bootstrap/dist/js/bootstrap.js"></script>',
      ],
      styles: ['<link rel="stylesheet" href="/components/bootstrap/dist/css/bootstrap.css">']
    });
  }
  // res.render('index', {
  //   title:   'Sequence Viewer',
  //   scripts: [/*'<script src="/javascripts/example"></script>',*/
  //     '<script src="/components/jquery/dist/jquery.js"></script>',
  //     '<script src="/components/bootstrap/dist/js/bootstrap.js"></script>',
  //   ],
  //   styles:  [/*'<link rel="stylesheet" href="/components/example.css">',*/,
  //     '<link rel="stylesheet" href="/components/bootstrap/dist/css/bootstrap.css">',
  //   ]
  // });
});

router.post('/initialsetup', function (req, res, next) {
  if (!state.hasAuthSetup()) {
    if (req.body.password) {
      state.setSinglePassword(req.body.password);
      res.redirect('/');
    }

    else
      res.render('initial-setup', {
        scripts: [
          '<script src="/components/jquery/dist/jquery.js"></script>',
          '<script src="/components/bootstrap/dist/js/bootstrap.js"></script>',
        ],
        styles: ['<link rel="stylesheet" href="/components/bootstrap/dist/css/bootstrap.css">']
      });
  }
  else
    return next(new Error("Can't set up the one time password twice."));
})

router.post('/', function (req, res, next) {
  var authFn = state.getAuthFn();
  if (typeof authFn !== 'function') return res.redirect('/');
  authFn(req.body.username, req.body.password, function (valid) {
    if (valid)
      res.render('loggedin', {
        scripts: [
          '<script src="/components/jquery/dist/jquery.js"></script>',
          '<script src="/components/bootstrap/dist/js/bootstrap.js"></script>',
        ],
        styles:  [
          '<link rel="stylesheet" href="/components/bootstrap/dist/css/bootstrap.css">',
        ]
      });

    else
      res.redirect('/');
  })
})

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
      '<link rel="stylesheet" href="/stylesheets/settings.css">'
    ]
  });
});

module.exports = router;
