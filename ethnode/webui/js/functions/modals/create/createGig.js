var iGig = 0;
function createGig(data) {
    var image = null;

    $.ajax({
        url: "/api/v1/my/gig/" + data,
        type: "GET",
        processData: false,
        success: function(gigData) {
            $data = JSON.parse(gigData);
            createGigBox($data, data);
        }
    });
}