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
        type: 'GET',
        url: '/api/v1/dht/gigs/',
        dataType: 'text',
        success: function(data) {
            $data = JSON.parse(data);
            $profileID = 'c5086e8bbf2fdd3a814e6aef565bb94f233ed14d862774cbccec2f196e347331';

            $($data).each(function(i, gig) {

                $(gig[$profileID]).each(function(x, gigID) {
                    console.log(gigID);
                    createGig(gigID);
                })
            })
        }
    });
}

// Initializing function on website load
loadGigs();
loadGigsToProfile();