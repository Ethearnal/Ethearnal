// GETS GIG DATA BASED ON GIG ID
function getDHTData(gigID, callback) {
    $.ajax({
        url: "/api/v1/dht/hkey/?hkey=" + gigID,
        type: "GET",
        processData: false,
        success: callback,
        error: function(error) {
            return;
        }
    });
}




