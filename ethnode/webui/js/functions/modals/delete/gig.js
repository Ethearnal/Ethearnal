function deleteGig(gigID) {
    $.ajax({
        url: '/api/v1/my/gig/' + gigID,
        type: 'DELETE',
        success: function(result) {
            $('.gig[gigID="'+ gigID +'"]').fadeOut(300);
        }
    });
}