function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/guids',
        dataType: 'text',
        success: function(guids) {
            $profileIDS = JSON.parse(guids);

            $($profileIDS).each(function(i, profileID) {

                // console.log(profileID);

                // GETS GIGS ID BY OWNER PROFILE ID
                $.ajax({
                    type: 'GET',
                    url: '/api/v1/dht/gigs/?owner_guid=' + profileID,
                    dataType: 'text',
                    success: function(gigs) {
                        $gigs = JSON.parse(gigs);

                        console.log(gigs);

                        // GETS GIG DATA BY GIG ID
                        $($gigs).each(function(i, gigID) {
                            createGig(gigID);
                        });
                    }
                });
            });
        }
    });
}

function loadGigsToProfile() {

    $.ajax({
        url: "/api/v1/dht/node/",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(nodeData) {
            $data = JSON.parse(nodeData);
            $profileID = $data.guid;

            $.ajax({
                type: 'GET',
                url: '/api/v1/dht/gigs/?owner_guid=' + $profileID,
                dataType: 'text',
                success: function(data) {
                    $data = JSON.parse(data);

                    $($data).each(function(i, gigID) {

                        $.ajax({
                            url: "/api/v1/dht/hkey/?hkey=" + gigID,
                            type: "GET",
                            processData: false,
                            success: function(gigData) {
                                $data = JSON.parse(gigData);
                                createGigToProfile($data, gigID);
                            },
                            error: function(error) {
                                return;
                            }
                        });
                    })
                }
            });
        }
    });
}

// Initializing function on website load
loadGigs();
loadGigsToProfile();