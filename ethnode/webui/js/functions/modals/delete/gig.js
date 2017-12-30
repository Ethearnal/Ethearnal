function deleteGig(gigID) {
    $.ajax({
        url: '/api/v1/dht/gigs/?hkey=' + gigID,
        type: 'DELETE',
        success: function(result) {
            $('.gig[gigID="'+ gigID +'"]').fadeOut(300);
        }
    });
}