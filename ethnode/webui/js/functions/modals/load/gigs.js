var timesLoaded = 0;

function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/my/gigs/',
        dataType: 'text',
        success: function(data) {
            var gigIDS = JSON.parse(data);
            var gigsToLoad = 10;
            $gigsLoaded = $('.gig').length;

            var timesLoadAfter = (timesLoaded * gigsToLoad) + gigsToLoad;

            // THIS IS TO CREATE 20 GIGS ON LOAD
            for(i = $gigsLoaded; i < timesLoadAfter; i++) {
                createGig(gigIDS[i]);
            }

            timesLoaded++;

            // // THIS IS FOR DELETE IF NEEDED
            // for(i = 0; i < gigIDS.length; i++) {
            //     deleteGig(gigIDS[i]);
            // }

            // // THIS IS FOR LOAD ALL THE GIGS
            // for(i = 0; i < gigIDS.length; i++) {
            //     createGig(gigIDS[i]);
            // }
        }
    });
}

loadGigs();