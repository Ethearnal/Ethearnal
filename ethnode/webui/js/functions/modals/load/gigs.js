function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/my/gigs/',
        dataType: 'text',
        success: function(data) {
            var gigIDS = JSON.parse(data);
            $.each(gigIDS, function(i, gigID) { createGig(gigID); });
        }
    });
}

loadGigs();