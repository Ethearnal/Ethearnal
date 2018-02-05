// GETS PORTFOLIOS ID BASED ON PROFILE ID
function getProfilePortfolios(profileID, callback) {
    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/portfolios/?owner_guid=' + profileID,
        dataType: 'text',
        success: callback
    });
}