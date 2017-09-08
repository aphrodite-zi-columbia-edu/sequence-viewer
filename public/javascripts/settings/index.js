var which = "csv";
function upload(callback) {
  // alert($('#configuration-preview').val());
  callback();
}

$(function() { //shorthand document.ready function 
  $('#csv-nav-tab').on('click', function() { which = "csv" });
  $('#mysql-nav-tab').on('click', function() { which = "mysql" });
  $('#save').on('click', upload.bind(null, function(err, resp) {
    alert("Returned to callback");
  }));

  preview();
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
 */
function preview() {
  var data = $("#settings-form :input").serializeArray();

  var stringified = JSON.stringify(formatFields(data), function (key, value) {
    // if (!value) return null; return value;
    // if (!value) return console.log(value), null; return value;
    if (typeof value === 'undefined') return "undefined";
    if (!value && typeof value === 'boolean') return "false";
    if (!value) return null;
    return value;
  }, 2);

  $('#configuration-preview').val(stringified);
}

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

  switch (which) {
    case 'csv':
      config.sequenceConfig.csv = {
        'path': config.csvpath,
        'column': config.csvcolumn,
        'index': config.csvuseindex === "on" || false
      };
      break;
    case 'mysql':
      config.sequenceConfig.mysql = {
        host: config.dbhost,
        name: config.dbname,
        user: config.dbuser,
        pass: config.dbpass        
      };
      break;
  }

  return config;
}
