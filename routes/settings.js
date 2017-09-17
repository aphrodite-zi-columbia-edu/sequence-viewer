var express = require('express');
var router = express.Router();

var state = require('../lib/state').state;

router.use(function (req, res, next) {
  res.locals.bootstrap = true;
  res.locals.title = 'Sequence Viewer Settings';
  res.locals.styles = ['<link rel="stylesheet" href="/stylesheets/settings.css" />'];
  res.locals.scripts = ['<script src="/javascripts/settings/index.js"></script>'];
  next();
});

function deserialize() {
  var config = state.trySequenceViewerConf();
  delete config.password;
  // console.log("loaded config into deserialize for /settings", config);

  if(!config) return {
    nooptionbackup: true
  };

  /*{ sequenceConfig: { csv: { path: '.', column: 'files', index: true } },
    bigWigConfig: { folder: '.' },
    basetracks: [],
    backup: true }

  { sequenceConfig: 
     { mysql: 
        { host: '127.0.0.1',
          name: 'sequances',
          user: 'user',
          pass: 'root' } },
    bigWigConfig: { folder: 'https://aphrodite.zi.columbia.edu:3005/' },
    basetracks: [],
    backup: 'false' }*/

  // console.log({
  //   bwdir      : (config.bigWigConfig.folder || null),
  //   bwurl      : (config.bigWigConfig.url || null),
  //   csvpath    : (config.sequenceConfig.csv && config.sequenceConfig.csv.path || null),
  //   csvcolumn  : (config.sequenceConfig.csv && config.sequenceConfig.csv.column || null),
  //   csvuseindex: (config.sequenceConfig.csv && config.sequenceConfig.csv.index || null),
  //   dbname     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.name || null),
  //   dbuser     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.user || null),
  //   dbpass     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.pass || null),
  //   dbhost     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.host || null)
  // });
  return {
    bwdir      : (config.bigWigConfig.folder || null),
    bwurl      : (config.bigWigConfig.url || null),
    csvpath    : (config.sequenceConfig.csv && config.sequenceConfig.csv.path || null),
    csvcolumn  : (config.sequenceConfig.csv && config.sequenceConfig.csv.column || null),
    csvuseindex: (config.sequenceConfig.csv && config.sequenceConfig.csv.index || null),
    dbname     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.name || null),
    dbuser     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.user || null),
    dbpass     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.pass || null),
    dbhost     : (config.sequenceConfig.mysql && config.sequenceConfig.mysql.host || null)
  };
}

router.get('/', function (req, res, next) {
  res.render('settings', {
    previous: deserialize()
  });
});

router.post('/', function (req, res, next) {
  var settingsToSave = JSON.parse(req.body.configuration);
  state.overwriteConfig(settingsToSave);
  res.redirect('/settings');
});

module.exports = router;
