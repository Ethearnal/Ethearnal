/* SETUP USER AVATAR IN HEADER */
$(document).ready(function() {
  getNodeData(function(nodeData) {
      $data = JSON.parse(nodeData);
      getProfileValue($data.guid, 'profilePicture', function(profilePictureURL) {
          var api_cdn = api_get_cdn_url();
          $('li.profile img.profile-picture').attr('src', api_cdn + JSON.parse(profilePictureURL) + '&thumb=1');
      });
  });
})

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
