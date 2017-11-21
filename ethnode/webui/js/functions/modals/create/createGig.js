var iGig = 0;
function createGig(data) {
    $data = data;
    var image = null;

    // Image's div rendering
    if( $data.image == null ) {
        image = '<div class="image"><h2>GIG</h2></div>';
    } else {
        image = '<img src="' +$data.image + '" alt="Gig Image" />';
    }

    // dropdown button
    var dropdownButton = '<button id="dropdowngig'+ iGig +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

    // dropdown UL
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdowngig'+ iGig +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

    // Other gig variables
    var ownerGig = '<h5>by ' + $data.ownerName + '</h5>';
    var gigTitle = '<p>' + $data.title + '</p>';
    var gigFooter = '<div class="footer"><h4>Starting at <span>$' + $data.price + '</span></h4></div>';

    // Creating div based on variables
    $gig = $('<div class="gig content-block" data='+JSON.stringify($data)+'>' + dropdownButton + dropdownUL + image + ownerGig + gigTitle + gigFooter + '</div>');

    // Rendering div
    var divToRender = $gig.get(0).outerHTML;

    // Appending GIG
    $(".gigs-container").append(divToRender);

    // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    componentHandler.upgradeDom();

    // Incrementing iEP when the function is done.
    iGig++;
}