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

  $('#settings-form').on('submit', function(e) { //use on if jQuery 1.7+
    e.preventDefault();  //prevent form from submitting
    var data = $("#settings-form :input").serializeArray();

    $('#configuration-preview').val(JSON.stringify(formatFields(data), null, 2));
    // console.log(JSON.stringify(formatFields(data), null, 2));
  });
});

function formatFields(data) {
  var config = data.reduce(function(obj, el) {
    obj[el.name] = el.value;
    return obj;
  }, {});

  var typesOfConfigs = {
    'csv': {
      'sequenceConfig': {
        'csv': {
          'path': config.csvpath, 'index': config.csvuseindex
        }
      },
      'bigWigConfig': {
        'config': config.bwsource, 'folder': config.bwusehost
      },
      'basetracks': config.basetracks,
      'backup': config.optionbackup
    },
    'mysql': {
      'sequenceConfig': {
        'mysql': {
          host: config.dbhost,
          name: config.dbname,
          user: config.dbuser,
          pass: config.dbpass
        }
      },
      'bigWigConfig': {
        'config': config.bwsource, 'folder': config.bwusehost
      },
      'basetracks': config.basetracks,
      'backup': config.optionbackup
    }
  }

  return typesOfConfigs[which];
}
