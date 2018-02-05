// GETS ALL GUIDS (NODES) DATA
function getGuidsData(callback) {
    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/guids',
        dataType: 'text',
        success: callback
    });
}