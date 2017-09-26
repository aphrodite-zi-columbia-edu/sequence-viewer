/**
 * initialization logic for the jQuery DataTables library.
 * 
 */
function initDataTable(dataTableOpts, experimentLoader) {
  dataTableOpts = dataTableOpts || {};
  var table = $('#example').DataTable(dataTableOpts);

  DTUI.headerWidgets();         // Add per-column Search
  DTUI.searchCallbacks(table);  // Attach search callback
  DTUI.columnButtons();         // Attach column expand collapse callback

  // Attach listeners for selection on table redraw, checkboxes
  $('#example').on( 'draw.dt', DTUI.table.bind(DTUI, experimentLoader) );
  DTUI.table(experimentLoader);

  DTUI.paginationRow();         // set classes to md in the info/pg row
  console.log("this runs");
}
