function createGig(data) {
    if (data == undefined) return false;

    $.ajax({
        url: "api/v1/dht/hkey/?hkey=" + data,
        type: "GET",
        processData: false,
        success: function(gigData) {
            $data = JSON.parse(gigData);
            createGigBox($data, data);
            createGigToProfile($data, data);
        }
    });
}