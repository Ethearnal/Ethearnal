var profileID = null;
getNodeData(function(nodeData) {
    $data = JSON.parse(nodeData);
    profileID = $data.guid;
    updateProfile();
});

function defaultProfileSettings() {
    $dataName = { first: 'FirstName', last: 'LastName' };
    $dataLocation = { country: 'country', city: 'city', countryClass: 'ax' }
    $skills = ["angular", "css", "UX"];
    $languages = ["bulgarian", "programian"];
    $description = "This is my description";
    $title = "This is my title";

    setProfileValue('name', $dataName);
    setProfileValue('location', $dataLocation);
    setProfileValue('title', $title);
    setProfileValue('description', $description);
    setProfileValue('reputation', 0);
    setProfileValue('profilePicture', 'https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png');
    setProfileValue('skills', $skills);
    setProfileValue('languages', $languages);
}

defaultProfileSettings();


// profileKey is for what thing you want to change.
function getProfileValue(profileID, profileKey, callback) {
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=" + profileKey,
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: callback
    });
}

function setProfileValue(profileKey, value) {
    // callback == callback || function(success) { /* do nothing */ }

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