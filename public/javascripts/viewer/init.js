/**
 * This file contains all the main initialization logic for the viewer page of
 * this script.
 * 
 */
$(function initViewerPage() {
  var browser = new Browser(gvUtil.getConfiguration());
  var experimentLoader = new ExperimentLoader(browser);

  var hasColumnNames = !Array.isArray(EXPERIMENTS_TABLE[0]);

  // data must be array
  var data = hasColumnNames ? EXPERIMENTS_TABLE.map(function(row) { return Object.keys(row).map(function(field) { return row[field]; }); }) : EXPERIMENTS_TABLE;
  // console.info('data', data);
  var columns = Object.keys(EXPERIMENTS_TABLE[0]).map(function(field) { return { title: field }; });
  // console.info('columns', columns);

  initDataTable({
    data: data,
    columns: columns,
  }, experimentLoader);

  initGenomeBrowser(browser);
});
