// Smart Search Declarating
window.generateGigsModule = (function() {

    function generateGigsFromData(gigID, gigObject, isOwn) {
        if (check_gig_marked_deleted(gigObject)) { return }

        var api_cdn = api_get_cdn_url();
        var profile_image = null;
        var owner_guid = null;
        var img_src = '';
        var fullname = '';
        var categoryObj = {
            "sd": "Software Development",
            "fa": "Finance & Accounting",
            "ma": "Music & Audio",
            "gd": "Graphic & Design",
            "va": "Video & Animation",
            "tw": "Text & Writing",
            "cs": "Consulting Services",
            "os": "Other Services"
        }

        var round_price = Math.round(gigObject.price * 1000) / 1000;
        var gigDeleteString = '';
        if (isOwn) {
            var gigDeleteString = '<li class="mdl-menu__item delete">Delete</li>'
        }
        var dropdownButton = '<button id="DDB' + gigID + '" class="dropdown-gig mdl-button mdl-js-button mdl-button--icon dropdown-button btn-info-edit"><i class="material-icons">more_vert</i></button>';
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB' + gigID + '"><li class="mdl-menu__item js-open-gig-modal">Open</li>' + gigDeleteString + '</ul>';

        if (gigObject.hasOwnProperty('owner_guid')) {
            owner_guid = gigObject.owner_guid;

            getProfileValue(owner_guid, 'profilePicture', function(profilePictureURL) {
                img_src = api_cdn + JSON.parse(profilePictureURL) + '&thumb=1';
                // $('#imgav' + gigID).attr('src', p_src);
                getProfileValue(owner_guid, 'name', function(name_jstr) {
                    var names_o = JSON.parse(name_jstr);
                    fullname = names_o.first + " " + names_o.last;
                    // $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
                    var gigLayout = `<div class="user-card gig"  id="${gigID}" data-toggle="modal" data-target="#gigModal">
                        <div class="img-card" style="background: url(${api_cdn + gigObject.image_hash}&thumb=1) center no-repeat; background-size: cover;" >
                            ${dropdownButton}
                            ${dropdownUL}
                            <div class="card-label">${categoryObj[gigObject.category]}</div>
                        </div>
                        <div class="user-profile-img">
                            <div class="div-img-wrap" style="background: url('${img_src}')"></div>
                        </div>
                        <p class="user-name" id="nmown${gigID}">${fullname}</p>
                        <p class="user-role">${categoryObj[gigObject.category]}</p>
                        <div class="user-info">
                            <p class="info">${gigObject.title}</p>
                        </div>
                        <div class="user-price">STARTING AT: <span><i class="material-icons">polymer</i>${round_price}</span></div>
                    </div>`;
                    $('.preloader-card').remove();
                    $(".gigs-container").append(gigLayout);
                    componentHandler.upgradeDom();
                });
            });
        }
    }

    return {
        generate: function(id, obj, isOwn) {
            return generateGigsFromData(id, obj, isOwn);
        }
    }

})();
