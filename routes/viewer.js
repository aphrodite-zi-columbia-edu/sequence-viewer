var express = require('express');
var router = express.Router();

var state = require('../lib/state').state;

router.use(function (req, res, next) {
  res.locals.bootstrap = true;
  res.locals.title = 'Sequence Viewer | Viewer';
  res.locals.styles = [
    '<link rel="stylesheet" href="/components/datatables.net-bs/css/dataTables.bootstrap.css">',
    '<link rel="stylesheet" href="/components/datatables.net-dt/css/jquery.dataTables.css">'
  ];
  res.locals.scripts = [
    '<script src="/components/datatables.net/js/jquery.dataTables.js"></script>',
    '<script src="https://cdn.datatables.net/select/1.2.2/js/dataTables.select.min.js"></script>',
    '<script src="https://cdn.datatables.net/buttons/1.3.1/js/dataTables.buttons.min.js"></script>',
    '<script src="//www.biodalliance.org/release-0.13/dalliance-compiled.js"></script>',
    '<script src="/javascripts/viewer/data-table/ui.js"></script>',
    '<script src="/javascripts/viewer/data-table/init-data-table.js"></script>',
    '<script src="/javascripts/viewer/init-genome-browser.js"></script>',
    '<script src="/javascripts/viewer/genome-viewer.js"></script>',
    '<script src="/javascripts/viewer/experiment-loader.js"></script>',
    '<script src="/javascripts/viewer/init.js"></script>',
  ];
  next();
});

/**
 * Render viewer.
 */
router.get('/', function(req, res, next) {
  var currentConfig = state.trySequenceViewerConf();
  res.locals.scripts.unshift(`<script>
    var SEQUENCE_VIEWER_CONFIGURATION = ${JSON.stringify(currentConfig, null, 2)};
  </script>`);

  state.getFieldsRows(function (err, fields, rows) {
    // console.log(err, fields, rows);
    res.locals.fields = fields;
    res.locals.rows = rows;

    res.locals.scripts.unshift(`<script>
      var EXPERIMENTS_TABLE = ${JSON.stringify(rows, null, 2)};
    </script>`);

    res.render('viewer');
  });
});

/**
 * This location is referenced in initialization logic for the frontend in
 * determineURLBase().
 */
router.use('/files', function (req, res, next) {
  var currentConfig = state.trySequenceViewerConf();
  var folder = currentConfig.bigWigConfig && currentConfig.bigWigConfig.folder;
  express.static(folder)(req, res, next);
});

module.exports = router;
