function loadGigs() {
    $.ajax({
        type: 'GET',
        url: '/api/v1/my/gigs/',
        dataType: 'text',
        success: function(data) {
            var gigIDS = JSON.parse(data);
            var gigsToLoad = 10;
            $gigsLoaded = $('.gig').length;

            if (gigIDS.length > $gigsLoaded) {
                gigsToLoad = $gigsLoaded + gigsToLoad;

                // LOADING MORE GIGS
                for(i = $gigsLoaded; i < gigsToLoad; i++) {
                    createGig(gigIDS[i]);
                }
            }


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