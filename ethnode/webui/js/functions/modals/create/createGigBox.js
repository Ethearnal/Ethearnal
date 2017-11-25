function createGigBox(gigData) {
    $data = gigData;
    $expiresIn = null;

    $($data.date).each(function(i, dates) {
        $expiresIn = dates.expiresIn;
    });

    image = '<div class="image"><img src="/api/v1/my/img/?q='+$data.imageHash+'" alt="Gig Image" /></div>';

    // dropdown button
    var dropdownButton = '<button id="dropdowngig'+ iGig +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

    // dropdown UL
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdowngig'+ iGig +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

    // Other gig variables [owner-info div]
    var ownerAvatar = '<img src="data:image/png;base64,'+$data.ownerAvatar+'" alt="Avatar" />';
    var ownerName = '<h5>' + $data.ownerName + '</h5>';
    var experienceName = '<h4>' + $data.experienceName + '</h4>';
    var ownerInfo = '<div class="owner-info">' + ownerAvatar + ownerName + experienceName + '</div>';

    var gigTitle = '<p>' + $data.title + '</p>';

    // Lower Info Div
    var reputationDiv = '<div class="reputation"><i class="material-icons">polymer</i><span>' + $data.ownerReputation + '</span></div>';
    var lowerInfo = '<div class="lower-info">' + reputationDiv + '<h6 class="expire">expires '+ $expiresIn +'</h6></div>';


    var gigFooter = '<div class="footer"><h4>Starting at <span>$' + $data.price + '</span></h4></div>';

    // Creating div based on variables
    $gig = $('<div class="gig content-block">' + dropdownButton + dropdownUL + image + ownerInfo + lowerInfo + gigTitle + gigFooter + '</div>');

    // Rendering div
    var divToRender = $gig.get(0).outerHTML;

    // Appending GIG
    $(".gigs-container").append(divToRender);

    // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    componentHandler.upgradeDom();

    // Incrementing iGig when the function is done.
    iGig++;
}