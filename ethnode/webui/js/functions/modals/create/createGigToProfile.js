var iGig = 0;
function createGigToProfile(gigData, gigID) {
    $data = gigData;
    $expiresIn = null;
    gigData = gigData || '';
    // var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn_post = api_post_cdn_url();
    var api_cdn = api_get_cdn_url();

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

function check_gig_marked_deleted(gig_o){
        if(gig_o.hasOwnProperty('meta_gig_deleted')){
            if(gig_o.meta_gig_deleted){
                console.log('gig marked as deleted not showing it');
                 return true;
            }
        }
        return false;
}


function createGigToProfile2(hk, gig_o) {
    console.log("createGigToProfile2(hk,gig_o)",hk,gig_o);

    if( check_gig_marked_deleted(gig_o)){ return }


    var image ='';
    var gigID = hk;
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    api_cdn = api_get_cdn_url();


    image += '<div class="ui fluid image"><div class="ui black ribbon label">';
    image += gig_o.general_domain_of_expertise +'</div><div class="image-block"><img src="'+api_cdn+'';
    image += gig_o.image_hash+'" /></div></div>';
    var title = '<p style="color: #92a8d1; font-size: 18px; border-bottom: solid 1px; margin: 4px; border-color: #e6eeff;">' + gig_o.title + '</p>';
    var desc = '<p>' + gig_o.description + '</p>';
    var dropdownButton = '<button id="DDB'+ hk +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB'+ hk +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';
    var footer = '<div class="footer" style="margin: 4px;"><h4>Starting at <span><i class="material-icons">polymer</i>' + gig_o.price + '</span></h4></div>';

    //console.log('GIG TO PROFILE', gig_o);
    // $gig = $('<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">' + dropdownButton + dropdownUL + image +  title + desc + footer + '</div>');
    //gig_ctx = 0 | $("#"+hk);
    //gig_ctx = document.getElementById(hk);
    gig_html = '<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">' + dropdownButton + dropdownUL + image +  title + desc + footer + '</div>';
    //
    // console.log('RENDER GIG', gigID);
    $(".gigs-container-profile").append(gig_html);
    //background-color: rgb(255, 255, 255);
    //box-shadow: rgba(0, 0, 0, 0.1) 1px 2px 3px 0px;

    componentHandler.upgradeDom();

}

function createGigToOtherProfile(hk, gig_o) {
    console.log("createGigToOtherProfile(hk,gig_o)",hk,gig_o);

    if( check_gig_marked_deleted(gig_o)){ return }

    var image ='';
    var gigID = hk;
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn = api_get_cdn_url();

    image += '<div class="ui fluid image"><div class="ui black ribbon label">';
    image += gig_o.general_domain_of_expertise +'</div><div class="image-block"><img src="'+api_cdn+'';
    image += gig_o.image_hash+'" /></div></div>';

    var round_price = Math.round(gig_o.price * 1000) / 1000;

    var title = '<p style="color: #92a8d1; font-size: 18px; border-bottom: solid 1px; margin: 4px; border-color: #e6eeff;">' + gig_o.title + '</p>';
    var desc = '<p>' + gig_o.description + '</p>';
    var dropdownButton = '<button id="DDB'+ hk +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB'+ hk +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';
    var footer = '<div class="footer"><h4>Starting at <span><i class="material-icons">polymer</i>' + round_price+ '</span></h4></div>';

    gig_html = '<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">' + dropdownButton + dropdownUL + image +  title + desc + footer + '</div>';
    return gig_html;


}



//function createGigToFound2(hk, gig_o) {
//    console.log("createGigToFound(hk,gig_o)",hk, gig_o);
//
//    if( check_gig_marked_deleted(gig_o)){ return }
//
//    var image ='';
//    var gigID = hk;
//    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
//    var api_cdn = api_get_cdn_url();
//
//    var api_cdn = api_get_cdn_url();
//
//    var default_profile_image = '1540b3c47ada5fd9a4798d3cc780d6a6bd05baf94cc2fdaa53e90accb4162383';
//    var profile_image = null;
//    var owner_guid = null;
//
//    console.log('gig_o',gig_o);
//    if(gig_o.hasOwnProperty('owner_guid')) {
//       owner_guid = gig_o.owner_guid;
//    }
//
//    var img_txt = '<br><div class="owner-info">'
//                + '<img id="imgav' + gigID + '" src="' + img_src + '" alt="Avatar">'
//                + '<h4 id="nmown' + gigID + '" ></h4>'
//                + '</div>' ;
//
//    image += '<div class="ui fluid image"><div class="ui black ribbon label">';
//    image += gig_o.general_domain_of_expertise +'</div><div class="image-block"><img src="'+api_cdn+'';
//    image += gig_o.image_hash+'" /></div></div>';
//    var desc = '<p>' + gig_o.description + '</p>';
//    var title =   '<span class="gig-title">' + gig_o.title + "</span>";
//    var dropdownButton = '<button id="DDB'+ hk +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';
//    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB'+ hk +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';
//    var footer = '<div class="footer"><h4>Starting at <span><i class="material-icons">polymer</i>' + gig_o.price + '</span></h4></div>';
//
//    var img_src = api_cdn + default_profile_image ;
//
//    gig_html = '<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">'
//               + dropdownButton + dropdownUL + image + img_txt  + title  + footer + '</div>';
//
//   $(".gigs-container").append(gig_html);
//    componentHandler.upgradeDom();
//
//    if(gig_o.hasOwnProperty('owner_guid')) {
//       //
//       owner_guid = gig_o.owner_guid;
//       //
//       getProfileValue(owner_guid, 'profilePicture', function(profilePictureURL) {
//            //
//            p_src = api_cdn + JSON.parse(profilePictureURL);
//             console.log('ELEMENT', p_src);
//            $('#imgav' + gigID).attr('src', p_src);
//            //
//            getProfileValue(owner_guid, 'name', function(name_jstr){
//                names_o = JSON.parse(name_jstr)
//                $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
//            });
//            //
//        });
//
//    }
//
//}


function createGigToFound(hk, gig_o) {
    console.log("createGigToFound(hk,gig_o)",hk, gig_o);

    if( check_gig_marked_deleted(gig_o)){ return }

    var image ='';
    var gigID = hk;

    var api_cdn = api_get_cdn_url();

    var default_profile_image = '1540b3c47ada5fd9a4798d3cc780d6a6bd05baf94cc2fdaa53e90accb4162383';
    var profile_image = null;
    var owner_guid = null;

    console.log('gig_o',gig_o);
    if(gig_o.hasOwnProperty('owner_guid')) {
       owner_guid = gig_o.owner_guid;
    }

    var img_txt = '<br><div class="owner-info">'
                + '<img id="imgav' + gigID + '" src="' + img_src + '" alt="Avatar">'
                + '<h4 id="nmown' + gigID + '" ></h4>'
                + '</div>' ;
    var round_price = Math.round(gig_o.price * 1000) / 1000;


    image += '<div class="ui fluid image"><div class="ui black ribbon label">';
    image += gig_o.general_domain_of_expertise +'</div><div class="image-block"><img src="'+api_cdn+'';
    image += gig_o.image_hash+'" /></div></div>';
    var desc = '<p>' + gig_o.description + '</p>';
    var title =   '<span class="gig-title">' + gig_o.title + "</span>";
    var dropdownButton = '<button id="DDB'+ hk +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB'+ hk +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';
    var footer = '<div class="footer"><h4>Starting at <span><i class="material-icons">polymer</i>' + round_price + '</span></h4></div>';

    var img_src = api_cdn + default_profile_image ;

    gig_html = '<div id="'+gigID+'" class="gig content-block" data-toggle="modal" data-target="#gigModal">'
               + dropdownButton + dropdownUL + image + img_txt  + title  + footer + '</div>';

   $(".gigs-container").append(gig_html);
    componentHandler.upgradeDom();

    console.log('GIGGGGG IDDDD', gigID);

    if(gig_o.hasOwnProperty('owner_guid')) {
       //
       owner_guid = gig_o.owner_guid;
       //
       getProfileValue(owner_guid, 'profilePicture', function(profilePictureURL) {
            //
            p_src = api_cdn + JSON.parse(profilePictureURL);
             console.log('ELEMENT', p_src);
            $('#imgav' + gigID).attr('src', p_src);
            //
            getProfileValue(owner_guid, 'name', function(name_jstr){
                names_o = JSON.parse(name_jstr)
                $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
            });
            //
        });

    }

}





function createProfileCard(owner_guid){

    var api_cdn = api_get_cdn_url();
    img_src = "";

    var ribbon = '<div id="protitle' + owner_guid + '" '
              + 'class="ui ribbon medium label" style="left: -15px; top: 8px; opacity:0.9;">'
              + 'TITLE'
              + '</div>';


    var img_txt = '<div id="proowner' + owner_guid + '" class="owner-info">'
           // + '<!--div class="pro-title-class" id="protitle'+ owner_guid +'"></div-->'
           // + ''
            + '  <img id="proimgav' + owner_guid + '" src="' + img_src + '" alt="Avatar">'
            + '<div class="pro-name-class" id="proname'+ owner_guid +'"></div>'
            + '</div>' ;

    var gig_html = '<div id="'+owner_guid+'" class="profile-card" data-toggle="modal" data-target="#profileModal">'
             + ribbon
             + img_txt
             + '</div>';



    // profile images
    getProfileValue(owner_guid, 'profilePicture', function(profile_picture_url) {
        // profile images
        if(profile_picture_url == 'null') {
            return;
        }
        if(profile_picture_url == 'null') {
            console.log('P NULL', profile_picture_url);
        }
        else{
            var p_src = api_cdn + JSON.parse(profile_picture_url);
            console.log('P OKKK', profile_picture_url);
            console.log('PARSED', p_src);
            $(".profiles-container").append(gig_html);


            //p_src = api_cdn + JSON.parse(profile_picture_url);
            var e = $('#proimgav' + owner_guid);
            e.attr('src', p_src) ;

             // name
            getProfileValue(owner_guid, 'name', function(name_js) {
                //
                if(name_js == 'null') {
                    console.log('P NULL', name_js);
                }
                else {
                    var names_o = JSON.parse(name_js);
                    console.log('name_o',names_o);
                    var e0 = $('#proname' + owner_guid);
                    // inner_html = '<i class="material-icons">perm_identity</i>'
                    inner_html = '';
                    e0.html( inner_html + names_o.first +" "+ names_o.last);
                    console.log('EEE',e0);

                }
            });
            // title
            getProfileValue(owner_guid, 'title', function(title_js) {
                //
                if(title_js == 'null') {
                    console.log('P NULL', title_js);
                }
                else {
                    var title = JSON.parse(title_js);
                    console.log('title',title);
                    var e0 = $('#protitle' + owner_guid);
                    // inner_html = '<i class="material-icons">code</i>'
                    inner_html = '';
                    e0.html(inner_html + title);
                    console.log('EEE',e0);

                }
            });
            // headline image
            getProfileValue(owner_guid, 'headlinePicture', function(headline_hash){

                if(headline_hash == 'null') {
                    console.log('P headline_hash NULL', headline_hash);
                } else {
                    //console.log('P headline_hash', headline_hash);
                    //
                    var headline_url = api_cdn + JSON.parse(headline_hash);
                    //var style_str = 'background: lightblue ;';
                    var style_str = 'background: url("'+headline_url + '") no-repeat;'
                                  + 'background-size: auto 106px;'
                                  + 'background-position: center;'
                                  + '';
                    var e1 = $('#proowner' + owner_guid);
                    console.log(headline_url);
                    e1.attr('style', style_str);

                }
            });
            //
        }
    });
}