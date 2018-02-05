// GETS GIGS ID BASED ON PROFILE ID
function getProfileGigs(profileID, callback) {
    $.ajax({
        type: 'GET',
        url: api_idx_cdn_url() + 'owner_guid=' + profileID,
        //url: '/api/v1/dht/gigs/?owner_guid=' + profileID,
        dataType: 'text',
        success: callback
    });
}