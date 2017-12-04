function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/my/gigs/',
        dataType: 'text',
        success: function(data) {
            loadGigsOnAjaxSuccess(data, false);
        }
    });
}

// Initializing function on website load
loadGigs();