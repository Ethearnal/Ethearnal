// GETS GIGS ID BASED ON PROFILE ID
function getProfileGigs(profileID, callback) {
    var c = api_idx_cdn_url();
    $.ajax({
        type: 'GET',
        url: c + 'owner_guid=' + profileID,
        dataType: 'text',
        success: callback
    });
}
