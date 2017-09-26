/**
 * 
 * 
 * @depends gvUtil
 * 
 * Questions:
 * 
 * * what is the state of this?
 * * Im pretty sure this is a data duplicate of the DOM data, filtered for
 * columnId from ExperimentDataContainer#setData.
 * 
 * Edit (Sun Sep 17 13:07:13 EDT 2017):
 * This takes the rows returned from the csv, keeps, and turns them into
 * configuration options as recognized as the tier viewer object from biod...
 * 
 */
function ExperimentDataContainer() {
  this.list = [];
  // from nodejs route
  // TODO mysql column
  this.filesColumn = SEQUENCE_VIEWER_CONFIGURATION.csv.column;
}

ExperimentDataContainer.prototype.setData = function(columnId, rows) {
  this.empty();
  rows.forEach(function (row) {
    this.list[parseInt(row['_id'], 10)] = (row[columnId]);
  }.bind(this));
};

ExperimentDataContainer.prototype.getExperiment = function(_id) {
  return this.list[_id];
};

ExperimentDataContainer.prototype.addExperimentsToBrowser = function(browser, _ids) {
  if (!browser) return;

  // first empty the browser
  this.emptyBrowser(function () {

    // for all ids given as input
    for (var expIndex = 0; expIndex < _ids.length; expIndex++) {

      // get individual id
      var expId = _ids[expIndex];

      // get experiment from data from #setData
      var exp = list[expId];

      // mark experiment in data as showing
      //exp.__shown = true;

      // look at filesColumn from configuration, and split by ","
      exp[this.filesColumn].split(",").forEach(function (fileName) {

        // preserved from prev ver: ability to have multiple per file.
        gvUtil.tierConfigs(fileName, first3KeyVals(exp)).forEach(function (tierConfig) {
          browser.addTier(tierConfig);
        });

      }.bind(this));  // end forEach row's files.
    }  // endfor
  }.bind(this));
};

ExperimentDataContainer.prototype.emptyBrowser = function(browser, done) {
  this.list = [];
  browser.removeAllTiers();
  gvUtil.addBaseTracks(browser, done);
};

var fileNameMapper = new ExperimentDataContainer();

function first3KeyVals(object) {
  return Object.keys(object).slice(0,3)
    .map(function (key) { return object['key']; })
    .join("-");
}
