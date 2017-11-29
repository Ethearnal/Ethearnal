function createGig(data) {
    if (data == undefined) return false;

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