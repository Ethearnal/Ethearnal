// GETS NODE DATA
function getNodeData(callback) {
    $.ajax({
        url: "/api/v1/dht/node/",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: callback
    });
}