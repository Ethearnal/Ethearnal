// Loads more gigs on scroll down
$(window).scroll(function() {
    if($(window).scrollTop() == $(document).height() - $(window).height()) {
        searchQueryDo();
        // loadGigs();
    }
});