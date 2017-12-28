function createGig(gigID) {
    if (gigID == undefined) return false;

    $.ajax({
        url: "/api/v1/dht/hkey/?hkey=" + gigID,
        type: "GET",
        processData: false,
        success: function(gigData) {
            $data = JSON.parse(gigData);
            createGigBox($data, gigID);
        },
        error: function(error) {
            return;
        }
    });
}