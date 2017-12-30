// LOADS ALL GIGS TO MAIN PAGE
function loadGigs() {
    getGuidsData(function(guids) {
        $profileIDS = JSON.parse(guids);

        $($profileIDS).each(function(i, profileID) {

            getProfileGigs(profileID, function(gigs) {
                $gigs = JSON.parse(gigs);

                // GETS GIG DATA BY GIG ID
                $($gigs).each(function(i, gigID) {

                    // Creates gig box
                    getDHTData(gigID, function(gigData) {
                        $data = JSON.parse(gigData);
                        createGigBox($data, gigID);
                    });
                });
            });
        });
    });
}

// LOADS ALL GIGS TO PROFILE PAGE
function loadGigsToProfile() {

    getNodeData(function(nodeData) {
        $data = JSON.parse(nodeData);
        $profileID = $data.guid;

        getProfileGigs($profileID, function(data) {
            $data = JSON.parse(data);

            $($data).each(function(i, gigID) {

                getDHTData(gigID, function(gigData) {
                    $data = JSON.parse(gigData);
                    createGigToProfile($data, gigID);
                });
            })
        })
    });
}

// Initializing function on website load
loadGigs();
loadGigsToProfile();