function ExperimentLoader(browser) {
  this.browser = browser;
  this.experiments = [];
}

/**
 * This method looks up the key, given by the first column, of the experiment
 * in the array of experiments given by the global constant generated by the
 * script. Then, by keeping a list of those keys internally executes logic to
 * add or remove the tiers of that experiment.
 */
ExperimentLoader.prototype.toggle = function(firstColumnKey) {
  var expIndex = this.searchFirstColKey(firstColumnKey);
  
  var fieldName =
    SEQUENCE_VIEWER_CONFIGURATION.sequenceConfig.csv
      ? SEQUENCE_VIEWER_CONFIGURATION.sequenceConfig.csv.column
      :
    SEQUENCE_VIEWER_CONFIGURATION.sequenceConfig.mysql
      ? SEQUENCE_VIEWER_CONFIGURATION.sequenceConfig.mysql.column
      :
    (function() { throw new Error("no fieldName found"); })();

  function getFileNames() {
    return EXPERIMENTS_TABLE[expIndex][fieldName].split(",")
      .map(function trimFileNames(fileName) {
        return fileName;
        return fileName.trim();
      });
  }

  var toggleFn = function() {};
  var index;
  if ((index = this.experiments.indexOf(firstColumnKey)) === -1) {
    this.experiments.push(firstColumnKey);
    toggleFn = this.browser.addTier.bind(this.browser);
  }
  else {
    this.experiments.splice(index, 1);
    toggleFn = this.browser.removeTier.bind(this.browser);
  }

  getFileNames().forEach(function toggleFile(fileName) {
    try {
      toggleFn(gvUtil.tierConfig(fileName));
    } catch (e) {
      console.log("Tried to remove tier not present", e);
    }
  }.bind(this));
};

ExperimentLoader.prototype.add = function(_id) {
  if (this.experiments.indexOf(_id) === -1)
    this.experiments.push(_id);
};

ExperimentLoader.prototype.remove = function(_id) {
  while (this.experiments.indexOf(_id) !== -1)
    this.experiments.splice(this.experiments.indexOf(_id), 1);
};

ExperimentLoader.prototype.has = function(_id) {
  return this.experiments.indexOf(_id) !== -1;
};

/**
 * this returns the index of the original experiment in the global array
 * by searching through it linearly and comparing to the first column as a
 * unique key.
 */
ExperimentLoader.prototype.searchFirstColKey = function(fck) {
  for (var index = 0; index < EXPERIMENTS_TABLE.length; index++) {
    if (EXPERIMENTS_TABLE[index][Object.keys(EXPERIMENTS_TABLE[index])[0]] === fck) {
      return index;
    }
  }
  return -1;
};

ExperimentLoader.prototype.get = function() {
  var value = null;
  return this.experiments.map(function (_id) {
    return Number.isNaN(value = parseInt(_id)) ? null : value;
  }).filter(function(_id) { return _id; });
};
