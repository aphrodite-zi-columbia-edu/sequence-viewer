function initGenomeBrowser(browser) {
    setTimeout(function() { gvUtil.addBaseTracks(browser); }, 200);

    $('#empty-genome-browser').on( 'click', function (e) {
        browser.removeAllTiers();
        setTimeout(function() { gvUtil.addBaseTracks(browser); }, 200);
    } );
}
