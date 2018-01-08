function loadGigsOnAjaxSuccess(data, remove) {
    var gigIDS = JSON.parse(data); var gigsToLoad = 10;
    if (data == '' || data == null || gigIDS.length == null) return false;

    // SEARCHING...
    remove ? $('.gig').remove() : console.log('do nothing');

    $gigsLoaded = $('.gig').length;


    if (gigIDS.length > $gigsLoaded) {
        gigsToLoad = $gigsLoaded + gigsToLoad;

        // LOADING MORE GIGS
        for(i = $gigsLoaded; i < gigsToLoad; i++) {
            createGig(gigIDS[i]);
        }
    }
}