$('body').delegate('li.delete', 'click', function(e) {
    e.preventDefault();
    $contentBlock = $(this).closest('.content-block');


    if ($contentBlock.hasClass('gig')) {
        $gigID = $contentBlock.attr('gigID');
        deleteGig($gigID);

    } else if ($contentBlock.hasClass('portfolio')) {
        $portfolioID = $contentBlock.attr('portfolioID');
        deletePortfolio($portfolioID);
    }

    if( $contentBlock ) $contentBlock.fadeOut(300);
});