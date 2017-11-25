$('body').delegate('li.delete', 'click', function(e) {
    e.preventDefault();
    $contentBlock = $(this).closest('.content-block');
    $gig = $(this).closest('.gig');

    if( $contentBlock ) $contentBlock.fadeOut(300);

    if( $gig ) {
        $gigID = $gig.attr('gigID');
        deleteGig($gigID);
    }
});