var iGig = 0;
function createGigToProfile(gigData, gigID) {
    $data = gigData;
    $expiresIn = null;
    gigData = gigData || '';
    var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";

    $($data.date).each(function(i, dates) {
        if (dates.expiresIn == undefined || dates.expiresIn == null) {
            $expiresIn = ''
        } else {
           $expiresIn = 'expires ' + dates.expiresIn;
        }
    });


    // image = '<div class="image"><img src="/api/v1/my/img/?q='+$data.imageHash+'" alt="Gig Image" /></div>';
    image = '<div class="ui fluid image"><div class="ui black ribbon label">'+ $data.categoryName +'</div><div class="image-block"><img src="'+api_cdn+'"'+$data.image_hash+'" /></div></div>';

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
    $(".gigs-container-profile").append(divToRender);

    // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    componentHandler.upgradeDom();

    // Incrementing iGig when the function is done.
    iGig++;
}

function createGigToProfile2(hk, gig_o) {

    var image ='';
    var gigID = hk;
    var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";

    image += '<div class="ui fluid image"><div class="ui black ribbon label">';
    image += gig_o.general_domain_of_expertise +'</div><div class="image-block"><img src="'+api_cdn+'';
    image += gig_o.image_hash+'" /></div></div>';
    var title = '<p>' + gig_o.title + '</p>';
    var desc = '<p>' + gig_o.description + '</p>';
    var dropdownButton = '<button id="DDB'+ hk +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB'+ hk +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';
    var footer = '<div class="footer"><h4>Starting at <span><i class="material-icons">polymer</i>' + gig_o.price + '</span></h4></div>';

    //console.log('GIG TO PROFILE', gig_o);
    // $gig = $('<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">' + dropdownButton + dropdownUL + image +  title + desc + footer + '</div>');
    //gig_ctx = 0 | $("#"+hk);
    //gig_ctx = document.getElementById(hk);
    gig_html = '<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">' + dropdownButton + dropdownUL + image +  title + desc + footer + '</div>';
    //
    // console.log('RENDER GIG', gigID);
    $(".gigs-container-profile").append(gig_html);
    componentHandler.upgradeDom();

}

