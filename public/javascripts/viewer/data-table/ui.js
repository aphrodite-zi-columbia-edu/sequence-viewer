/**
 * Setup Table Header:
 * 
 * * Search bars: add a text input to each 'footer' cell
 * 
 * Depends: #example
 */
function addTableHeaderWidgets(argument) {
    $('#example tfoot th').each( function () {
        var title = $(this).text();
        var html = '<input type="text" placeholder="Search ' + title + '" />';

        $(this).html(html);
    } );
}

/**
 * Attach column expand collapse callback
 * 
 * Depends: .expand-collapse-column
 */
function addExpandingColumnButtons() {
    $('.expand-collapse-column').on( 'click', function (e) {
        e.stopPropagation();
        // e.preventDefault();
        if ($(this).parent().css('min-width') == '300px') {
            $(this).css('width', 'auto');
            $(this).parent().css('min-width', '100px');
            $(this).parent().css('max-width', '100px');
        } else {
            $(this).css('width', '22px');
            $(this).parent().css('min-width', '300px');
            $(this).parent().css('max-width', '300px');
        }
    } );
}

function addColumnSearchCallbacks(table) {
    table.columns().every( function () {
        var that = this;
 
        $( 'input', this.footer() ).on( 'keyup change', function () {
            if ( that.search() !== this.value ) {
                that
                    .search( this.value )
                    .draw();
            }
        } );
    } );
}

/**
 * Makes the row at the bottom not overlap while debugging.
 * 
 * It also probably makes it look better on mobile, for what that's worth. It
 * sets classes to md in the info and pagination row, the third row, and the
 * one containing '#example_info'. It replaces col-?? classes with col-md
 * classes.
 * 
 * Depends: '#example_info'
 * 
 * // "col-xs-8".replace(/col-(md|xs)-([0-9]{1,2})/,
 * //     function (oldClass, size, width) {
 * //   var newSize = size === 'md' ? 'xs' : 'md';
 * //   return ['col', newSize, width].join('-');
 * // });
 * 
 * // "className".replace(/col-(md|xs)/, function (oldClass, size) {
 * //   var newSize = size === 'md' ? 'xs' : 'md';
 * //   return ['col', newSize].join('-');
 * // });
 */
function customizePaginationRow() {
    // find row
    var parentparent = $('#example_info').parent().parent();
    parentparent.children('div.row > div').each(function(i, el) {
        var jQEl = $(el);

        // set classes of columns in row
        jQEl.attr('class', 
        jQEl.attr('class')
            .split(/\s+/)
            .map(function (className) {
                return className.replace(/col-(md|xs|sm)/, function (oldClass, size) {
                    var newSize = size === 'md' ? 'xs' : 'md';
                    return ['col', newSize].join('-');
                });
            })
            .join(' ')
        );
    });
}

/**
 * Depends: 'table#example'
 */
function addCheckboxesToTable(experimentLoader) {
    // Find all <th></th> in the 1st column.
    $( 'table#example tbody tr td:first-of-type' ).each(function () {
        // Get the text value from the first TEXT_NODE
        var contents = $(this).contents();
        var value = null;
        for (i in contents) {
            var content = contents[i];
            if (content.nodeType === Node.TEXT_NODE) {
                value = content.data;
                break;
            }
        }

        // Construct and render a checkbox
        $(this).html('<input class="table-row-checkbox" type="checkbox" />');
        $(this).append(document.createTextNode(value));
        
        // Find and set state of checkbox
        if (experimentLoader.has(value))
            $(this).find(':checkbox').prop("checked", true);
    } );

    // Attatch input box listeners
    // $( 'table#example tbody tr th:first-of-type input' ).on( 'click', function (e) {
    // $( '#example > tbody > tr.odd > td.sorting_1 > input' ).on( 'click', function (e) {
    $( '.table-row-checkbox' ).on( 'click', function (e) {
        e.stopPropagation();
        var contents = $(this).parent().contents();
        for (i in contents) {
            var content = contents[i];
            if (content.nodeType === Node.TEXT_NODE) {
                value = content.data;
            }
        }
        // try { console.log("old value", value, "new value", $(this).parent().contents().text()) } catch (e) {}
        experimentLoader.toggle(value);
    } );
} 

var DTUI = {};
DTUI.headerWidgets   = addTableHeaderWidgets;
DTUI.columnButtons   = addExpandingColumnButtons;
DTUI.searchCallbacks = addColumnSearchCallbacks;
DTUI.paginationRow   = customizePaginationRow;
DTUI.table           = addCheckboxesToTable;
