
function makeWhichTab(tabs) {
  var current = tabs[Object.keys(tabs).slice(0, 1)].value;  // first key

  function get() { return current; }
  function set(t) { return current = t; }

  // on ready attach listeners to tabs
  $(function () {
    for (var tabid in tabs) {
      $(tabid).on('click', function () {
        // console.log
        set(tabs[tabid].value);
        return true;
      })
    }
  })

  return {
    get, set
  };
}

var whichBwSource = makeWhichTab({
  '#folder-nav-tab': { value: 'folder' },
  '#url-nav-tab':    { value: 'url' }
});
var whichSequenceSource = makeWhichTab({
  '#csv-nav-tab':   { value: 'csv' },
  '#mysql-nav-tab': { value: 'mysql' }
});


function upload(callback) {
  console.log(formatFields($("#settings-form :input").serializeArray()));
  var data = formatFields($("#settings-form :input").serializeArray());
  // $.post('/api/configvalid', data, function (data, status, jQXHR) {
    
  //   callback();
  // })
  callback();
}

$(function() { //shorthand document.ready function 
  $('#save').on('click', upload.bind(null, function(err, resp) {
    console.log("Returned to callback");
  }));

  preview(true);
  $('#settings-form').on('submit', function(e) { //use on if jQuery 1.7+
    e.preventDefault();  //prevent form from submitting
    preview();
  });
});

/**
 * Takes the fields on the left and puts them in the box on the right
 * 
 * Depends on the form being #settings-form
 * Depends on the text being #configuration-preview
 * 
 * Validates and reports with modal
 */
function preview(novalidate) {
  var data = $("#settings-form :input").serializeArray();
  var configuration = formatFields(data);

  var stringified = JSON.stringify(configuration, function (key, value) {
    // if (!value) return null; return value;
    // if (!value) return console.log(value), null; return value;
    if (typeof value === 'undefined') return "undefined";
    if (!value && typeof value === 'boolean') return "false";
    if (!value) return null;
    return value;
  }, 2);

  $('#configuration-preview').val(stringified);

  // if (!novalidate) validate(configuration);
}

/**
 * Performs validation on configuration and calls report with errors
 * 
 * @param configuration object  the configuration object being checked
 * @param doModal       boolean whether or not to display errors in a modal
 */
function validate(configuration, doModal, callback) {
  callback = typeof callback === 'function' ? callback : function() {};

  $.post('/api/configvalid', configuration, function (data, status, jQXHR) {
    reportValidity(data);
  });
}

function reportValidity(data) {
  if (!data.valid) {
    $("#validation-errors .modal-body").empty();
    $("#validation-errors .modal-body").append(
      $('<p>The following errors appear in the configuration:</p>')
    );

    (data.errors || []).forEach(function (error) {
      $("#validation-errors .modal-body").append($('<p>' + error + '</p>'));
    });

    var warning = '<p class="text-warning"><small>You can\'t save an'
      + 'incorrect configuration.</small></p>';
    $("#validation-errors .modal-body").append($(warning));
    $('#validation-errors').modal('show');
  }

  else {
    $('#success-disappear').fadeIn();
    setTimeout(function() {
      $('#success-disappear').fadeOut();
    }, 1500);
  }
}

/**
 * Formats the fields into a valid configuration schema
 * 
 * depends on whichSequenceSource closure, et al makeWhichTab closures.
 */
function formatFields(data) {
  var formOptions = data.reduce(function(obj, el) {
    obj[el.name] = el.value;
    return obj;
  }, {});

  // console.log(formOptions);

  var config = {
    sequenceConfig: {},
    bigWigConfig: {},
    basetracks: [],
    backup: formOptions.optionbackup === "on" || false
  };

  switch (whichBwSource.get()) {
    case 'url':
      config.bigWigConfig.folder = formOptions.bwurl;
      break;
    case 'folder':
      config.bigWigConfig.folder = formOptions.bwdir;
      break;
  }

  switch (whichSequenceSource.get()) {
    case 'csv':
      config.sequenceConfig.csv = {
        'path': formOptions.csvpath,
        'column': formOptions.csvcolumn,
        'index': formOptions.csvuseindex === "on" || false
      };
      break;
    case 'mysql':
      config.sequenceConfig.mysql = {
        host: formOptions.dbhost,
        name: formOptions.dbname,
        user: formOptions.dbuser,
        pass: formOptions.dbpass        
      };
      break;
  }

  return config;
}
