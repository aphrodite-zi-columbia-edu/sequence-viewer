var express = require('express');
var router = express.Router();

var state = require('../lib/state').state;

router.all('/', function (req, res, next) {
  if (req.signedCookies.labUser) return res.redirect('/home'); next();
});

/* GET home page. */
router.get('/', function(req, res, next) {
  if (state.hasAuthSetup()) {
    res.render('login', {
      needsUsername: state.hasRoot(),
      bootstrap: true,
      error: req.query.err ? 'Incorrect credentials' : false
    })
  }

  else {
    res.render('initial-setup', { bootstrap: true });
  }
  // res.render('index', {
  //   title:   'Sequence Viewer',
  //   scripts: [/*'<script src="/javascripts/example"></script>',*/],
  //   styles:  [/*'<link rel="stylesheet" href="/components/example.css">',*/]
  // });
});

router.post('/initialsetup', function (req, res, next) {
  if (!state.hasAuthSetup()) {
    if (req.body.password) {
      state.setSinglePassword(req.body.password);
      res.redirect('/');
    }

    else
      res.render('initial-setup', { bootstrap: true });
  }
  else
    return next(new Error("Can't set up the one time password twice."));
});

router.post('/', function (req, res, next) {
  var authFn = state.getAuthFn();
  if (typeof authFn !== 'function') return res.redirect('/');

  authFn(req.body.username, req.body.password, function (valid) {
    if (valid) {
      // log you in for a week
      res.cookie('labUser', req.body.username || true, {
        domain: req.hostname,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true,
        // secure: true,
        signed: true
      });
      res.redirect('/home');
    }

    else
      res.redirect('/?err=true');
  });
});

router.use(function (req, res, next) {
  return next();
  console.log("middleware check session:", req.signedCookies.labUser)
  if (req.signedCookies.labUser) {
    return next();
  } else {
    return res.redirect('/');
    console.log("someone cant get past middleware");
    res.end();
  }
})

router.get('/home', function (req, res, next) {
  res.render('loggedin', {
    bootstrap: true,
    styles: ['<link rel="stylesheet" href="/stylesheets/home.css" />'],
    user: state.hasRoot() ? req.signedCookies.labUser : false
  });
});

router.use('/settings', require('./settings'));
router.use('/viewer', require('./viewer'));

module.exports = router;
