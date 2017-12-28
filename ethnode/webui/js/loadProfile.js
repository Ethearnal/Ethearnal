var profileID = null;
$.ajax({
    url: "/api/v1/dht/node/",
    type: "GET",
    processData: false,
    contentType: 'application/json; charset=utf-8',
    success: function(nodeData) {
        $data = JSON.parse(nodeData);
        profileID = $data.guid;
        updateProfile();
    }
});


// profileKey is for what thing you want to change.
function getProfileValue(profileID, profileKey) {
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=" + profileKey,
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(data) {
            $data = JSON.parse(data);
            return $data;
        }
    });
}

function setProfileValue(profileKey, value) {
    $.ajax({
        url: '/api/v1/dht/profile?profile_key=' + profileKey,
        type: "PUT",
        processData: false,
        data: JSON.stringify(value),
        contentType: 'application/json; charset=utf-8',
        success: function(success) {
            // do nothing
        }
    });
}