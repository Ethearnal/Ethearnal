var iGig = 0;
function createGigBox(gigData, gigID) {
    //var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn = api_get_cdn_url();
    var api_cdn_post = api_post_cdn_url();



    // if ($('.gig').attr('gigID') == gigID) return false;

    // if (gigID == undefined) {
    //     console.log('undefined id');
    // }

    // $('.gigs-container .gig').each(function(i, gig) {
    //     console.log(gig);
    // })

    $data = gigData;
    $expiresIn = null;
    gigData = gigData || '';

    $($data.date).each(function(i, dates) {
        if (dates.expiresIn == undefined || dates.expiresIn == null) {
            $expiresIn = ''
        } else {
           $expiresIn = 'expires ' + dates.expiresIn;
        }
    });


    // image = '<div class="image"><img src="/api/v1/my/img/?q='+$data.imageHash+'" alt="Gig Image" /></div>';
    image = '<div class="ui fluid image"><div class="ui black ribbon label">'+ $data.categoryName +'</div><div class="image-block"><img src="'+api_cdn+"'"+$data.image_hash+'" /></div></div>';

    // dropdown button
    var dropdownButton = '<button id="dropdowngig'+ iGig +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';

    // dropdown UL
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdowngig'+ iGig +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

    // Other gig variables [owner-info div]
    var ownerAvatar = '<img src="'+$data.ownerAvatar+'" alt="Avatar" />';
    var ownerName = '<h5>' + $data.ownerName + '</h5>';
    var ownerReputation = '<h4><i class="material-icons">polymer</i> '+$data.ownerReputation+'</h4>'
    var ownerInfo = '<div class="owner-info">' + ownerAvatar + ownerName + ownerReputation + '</div>';

    var gigTitle = '<p>' + $data.title + '</p>';

    // Lower Info Div
    var lowerInfo = '<div class="lower-info"><h6 class="expire">'+ $expiresIn +'</h6></div>';


    var gigFooter = '<div class="footer"><h4>Starting at <span><i class="material-icons">polymer</i>' + $data.price + '</span></h4></div>';

    // Creating div based on variables AND
    // Adding gigID attribute to the GIG.
    if (gigID !== '') {
        $gig = $('<div gigID="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">' + dropdownButton + dropdownUL + image + ownerInfo + lowerInfo + gigTitle + gigFooter + '</div>');
    } else {
        $gig = $('<div class="gig content-block">' + dropdownButton + dropdownUL + image + ownerInfo + lowerInfo + gigTitle + gigFooter + '</div>');
    }

    // Rendering div
    var divToRender = $gig.get(0).outerHTML;

    // Appending GIG
    $(".gigs-container").append(divToRender);

    // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    componentHandler.upgradeDom();

    // Incrementing iGig when the function is done.
    iGig++;
}