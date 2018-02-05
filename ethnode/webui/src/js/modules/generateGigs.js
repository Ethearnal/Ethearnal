// Smart Search Declarating
window.generateGigsModule = (function() {

    function generateGigsFromData(gigID, gigObject) {
        if (check_gig_marked_deleted(gigObject)) { return }

        var api_cdn = api_get_cdn_url();
        var profile_image = null;
        var owner_guid = null;
        var img_src = '';


        var round_price = Math.round(gigObject.price * 1000) / 1000;
        var dropdownButton = '<button id="DDB' + gigID + '" class="dropdown-gig mdl-button mdl-js-button mdl-button--icon dropdown-button btn-info-edit"><i class="material-icons">more_vert</i></button>';
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB' + gigID + '"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

        var gigLayout = `<div class="user-card gig"  id="${gigID}" data-toggle="modal" data-target="#gigModal">
                        <div class="img-card">
                            ${dropdownButton}
                            ${dropdownUL}
                            <img src="${api_cdn + gigObject.image_hash}">
                            <div class="card-label">${gigObject.general_domain_of_expertise}</div>
                        </div>
                        <div class="user-profile-img">
                            <img id="imgav${gigID}" src="${img_src}" alt="Avatar">
                        </div>
                        <p class="user-name" id="nmown${gigID}"></p>
                        <p class="user-role">${gigObject.general_domain_of_expertise}</p>
                        <div class="user-info">
                            <p class="info">${gigObject.title}</p>
                        </div>
                        <div class="user-price">STARTING AT: <span><i class="material-icons">polymer</i>${round_price}</span></div>
                    </div>`;

        var preloader = `<div class="preloader-card"><img src="./dist/img/preloader.gif" alt=""></div>`;
        if ($(".gigs-container").children().length == 0) {
            $(".gigs-container").append(preloader);
        }
        $(".gigs-container").prepend(gigLayout);
        componentHandler.upgradeDom();

        if (gigObject.hasOwnProperty('owner_guid')) {
            owner_guid = gigObject.owner_guid;
            getProfileValue(owner_guid, 'profilePicture', function(profilePictureURL) {
                var p_src = api_cdn + JSON.parse(profilePictureURL);
                $('#imgav' + gigID).attr('src', p_src);
                getProfileValue(owner_guid, 'name', function(name_jstr) {
                    var names_o = JSON.parse(name_jstr)
                    $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
                });
            });

        }
    }

    return {
        generate: function(id, obj) {
            return generateGigsFromData(id, obj);
        }
    }

})();