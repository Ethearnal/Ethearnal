$('body').delegate('li.delete', 'click', function(e) {
    console.log('TRY TO DELETE GIG');
    //return;

    e.preventDefault();
    $contentBlock = $(this).closest('.content-block');
    $gig = $(this).closest('.gig');

    if( $contentBlock ) $contentBlock.fadeOut(300);

    if( $gig ) {
        console.log('gig')
        $gigID = $gig.attr('id');
        console.log('gigID',$gigID)
        deleteGig($gigID, $gig);
    }
});
