var iGig = 0;
function createGig(data) {
    var image = null;

    $.ajax({
        url: "/api/v1/my/gig/" + data,
        type: "GET",
        processData: false,
        success: function(gigData) {
            $data = JSON.parse(gigData);

            console.log($data.imageHash);

            image = '<img src="/api/v1/my/img/?q='+$data.imageHash+'" alt="Gig Image" />';

            // dropdown button
            var dropdownButton = '<button id="dropdowngig'+ iGig +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

            // dropdown UL
            var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdowngig'+ iGig +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

            // Other gig variables
            var ownerGig = '<h5>by ' + $data.ownerName + '</h5>';
            var gigTitle = '<p>' + $data.title + '</p>';
            var gigFooter = '<div class="footer"><h4>Starting at <span>$' + $data.price + '</span></h4></div>';

            // Creating div based on variables
            $gig = $('<div class="gig content-block">' + dropdownButton + dropdownUL + image + ownerGig + gigTitle + gigFooter + '</div>');

            // Rendering div
            var divToRender = $gig.get(0).outerHTML;

            // Appending GIG
            $(".gigs-container").append(divToRender);

            // Upgrading the DOM so you can use the dropdown, edit and delete the div.
            componentHandler.upgradeDom();

            // Incrementing iGig when the function is done.
            iGig++;
        }
    });

    // image = '<img id="gigImage'+iGig+'" src="/api/v1/my/img/'+'" alt="Gig Image" />';

    // // Image's div rendering
    // if( $data.imageHash == null ) {
    //     image = '<div class="image"><h2>GIG</h2></div>';
    // } else {
    //     image = '<img src="' +$data.imageHash + '" alt="Gig Image" />';
    // }

    // // dropdown button
    // var dropdownButton = '<button id="dropdowngig'+ iGig +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

    // // dropdown UL
    // var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdowngig'+ iGig +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

    // // Other gig variables
    // var ownerGig = '<h5>by ' + $data.ownerName + '</h5>';
    // var gigTitle = '<p>' + $data.title + '</p>';
    // var gigFooter = '<div class="footer"><h4>Starting at <span>$' + $data.price + '</span></h4></div>';

    // // Creating div based on variables
    // $gig = $('<div class="gig content-block">' + dropdownButton + dropdownUL + image + ownerGig + gigTitle + gigFooter + '</div>');

    // // Rendering div
    // var divToRender = $gig.get(0).outerHTML;

    // // Appending GIG
    // $(".gigs-container").append(divToRender);

    // // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    // componentHandler.upgradeDom();

    // console.log($('img#gigImage' + iGig));

    // Changing image source

    // $.ajax({
    //     url: "/api/v1/my/img/?q=" + $data.imageHash,
    //     type: "GET",
    //     contentType: 'image/jpeg',
    //     processData: false,
    //     success: function(data){
    //         // $('.gig').find('img#gigImage' + iGig).attr('src', "data:image/png;base64," + data);
    //         // image = '<img src="data:image/png;base64,' + data + '" alt="Gig Image" />';
    //     }
    // });

    // Incrementing iEP when the function is done.
    // iGig++;
}