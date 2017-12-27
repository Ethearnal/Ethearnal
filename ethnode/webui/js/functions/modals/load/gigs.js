function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/gigs/',
        dataType: 'text',
        success: function(data) {
            $data = JSON.parse(data);

            // $(data).each(function(key, value) {
            //     console.log(key);
            // })

            // $data2 = JSON.stringify($data[0]);

            // $data2Parsed = JSON.parse($data2);


            // $data3 = JSON.stringify($data2Parsed);

            // console.log($data3)



            // for (var key in $data) {
            //     console.log("key " + key + " has value " + $data[key]);
            // }

            // console.log($data.toString());

            // loadGigsOnAjaxSuccess($data[i], false);
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
            console.log($profileID);

            $.ajax({
                type: 'GET',
                url: '/api/v1/dht/gigs/',
                dataType: 'text',
                success: function(data) {
                    $data = JSON.parse(data);

                    $($data).each(function(i, gig) {

                        $stringGig = JSON.stringify(gig).toString();
                        console.log($stringGig);
                        $stringGig.replace('"' $profileID + '"', '');
                        console.log($stringGig)

                        // console.log($stringGig.search($profileID));

                        // console.log(JSON.stringify(gig));

                        // console.log(data[$profileID]);



                        $(gig).each(function(x, gigID) {
                            console.log(gigID);
                            $.ajax({
                                url: "/api/v1/dht/hkey/?hkey=" + gigID,
                                type: "GET",
                                processData: false,
                                success: function(gigData) {
                                    $data = JSON.parse(gigData);
                                    createGigToProfile($data, gigID);
                                }
                            });
                        })
                    })
                }
            });
        }
    });
}

// Initializing function on website load
loadGigs();
loadGigsToProfile();