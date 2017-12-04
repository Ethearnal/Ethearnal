// Loads more gigs on scroll down
$(window).scroll(function() {
    if($(window).scrollTop() == $(document).height() - $(window).height()) {

        // FORMATING SEARCH QUERY
        formatSearchQuery();

        if (searchQuery == "/api/v1/my/idx/query/guids/?") {
            loadGigs();
            return false;
        }

        $.ajax({
            url: searchQuery,
            type: "GET",
            processData: false,
            success: function(data) {
                loadGigsOnAjaxSuccess(data, false);
            },
            error: function(error) {
                console.log('error! Search Query has not succeeded and has not been executed. Please contact support!')
            }
        });
    }
});