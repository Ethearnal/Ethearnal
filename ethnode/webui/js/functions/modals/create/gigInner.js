// Making sure that #gigModal won't appear if you click on a edit gig dropdown.
$('body').delegate('button.dropdown-gig, li.open-modal, ul.mdl-menu, .mdl-menu__container', 'click', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

// OTHER PROFILE other profile

$('body').delegate('.profile-card', 'click', function(e) {
    //var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn = api_get_cdn_url();
    var owner_guid = $(this).attr('id');
    console.log('PROFILE-CARD clicked for GUID', owner_guid);
    var spinner = '<br><br><br><div class="mdl-spinner mdl-spinner--single-color mdl-js-spinner is-active"></div>';


    $('#gigs-other').html(load_segment_html);

    // grr polus twoita m...
    // documentation background-image
    //$("#my-profile-section").html('');
    //$("#my-profile-headline").html('');
    //
    $('#my-profile-section').removeClass('documentation');
    $('#other-profile-section').removeClass('documentation2');

    $('#my-profile-section').addClass('documentation2');
    $('#other-profile-section').addClass('documentation');


    $('#my-profile-headline').removeClass('background-image');
    $('#other-profile-headline').removeClass('background-image2');

    $('#my-profile-headline').addClass('background-image2');
    $('#other-profile-headline').addClass('background-image');


    // show other profile
    // $('section.gigs-page-content').hide();
    // profile image
    // other-profile-headline-img
    // other-profile-description
    // other-profile-languages
    // other-profile-skills
    getProfileValue(owner_guid, 'profilePicture', function(profile_picture_url) {
        if (profile_picture_url == 'null') {
            //console.log('P NULL', profile_picture_url);

        } else {
            profile_image = JSON.parse(profile_picture_url);
            img_url = api_cdn + profile_image + '&thumb=1'
            $('#other-profile-picture').attr('src', img_url)

            //            $('#new-modal-owner-avatar').css(
            //                    'background-image',
            //                    'url("'+ api_cdn + profile_image +'")'
            //                    );
        }
    });

    // headline image
    getProfileValue(owner_guid, 'headlinePicture', function(headline_hash) {

        if (headline_hash == 'null') {
            console.log('P headline_hash NULL', headline_hash);
        } else {
            //console.log('P headline_hash', headline_hash);
            //
            var headline_url = api_cdn + JSON.parse(headline_hash) + '&thumb=1';
            //var style_str = 'background: lightblue ;';
            var style_str = 'background-image: url("' + headline_url + '");'
                // + 'background-size: auto 106px;'
                //+ 'background-position: '
                +
                '';
            var e1 = $("#other-profile-headline-img");
            console.log('HEADLINE', headline_url);
            e1.attr('style', style_str);

        }
    });



    // profile name
    getProfileValue(owner_guid, 'name', function(names_js) {
        if (names_js == 'null') {
            //console.log('P NULL', profile_picture_url);

        } else {
            name_o = JSON.parse(names_js);
            //console.log('names', name_o);
            $('#other-profile-names').html(name_o.first + ' <b>' + name_o.last + '</b');
        }
    });

    // profile title
    getProfileValue(owner_guid, 'title', function(title_js) {
        if (title_js == 'null') {
            //console.log('P NULL', profile_picture_url);

        } else {
            title = JSON.parse(title_js);
            $('#other-profile-title').html('<i>' + title + '</i>');
            //$('#new-modal-owner-title').html('<i>'+title+'</i>');
            //console.log('title', title);
        }
    });

    // profile description
    getProfileValue(owner_guid, 'description', function(description_js) {
        if (description_js == 'null') {
            //console.log('P NULL', profile_picture_url);

        } else {
            description = JSON.parse(description_js);
            $('#other-profile-description').html(description);
            //$('#new-modal-owner-title').html('<i>'+title+'</i>');
            //console.log('title', title);
        }
    });

    // skills
    getProfileValue(owner_guid, 'skills', function(skills_js) {
        if (skills_js == 'null') {
            //console.log('P NULL', profile_picture_url);

        } else {
            skills_list = JSON.parse(skills_js);
            var skills_html = '';
            for (var i = 0; i < skills_list.length; i++) {
                skills_html += '<p>' + skills_list[i] + '</p>';
            }
            $('#other-profile-skills').html(skills_html);
        }
    });

    // languages
    getProfileValue(owner_guid, 'languages', function(languages_js) {
        if (languages_js == 'null') {;
        } else {
            languages_list = JSON.parse(languages_js);
            var languages_html = '';
            for (var i = 0; i < languages_list.length; i++) {
                languages_html += '<p>' + languages_list[i] + '</p>';
            }
            $('#other-profile-languages').html(languages_html);
        }
    });

    $('#other-profile-section').show();
    // gigs for
    //getNodeData(function(node_data){
    //  node = $.parseJSON(node_data);
    //  console.log('GUID:' + node.guid);

    //
    getProfileGigs(owner_guid, function(data) {
        console.log('GUID:' + data);
        profile_gigs = JSON.parse(data);
        $('#gigs-other').html('');
        for (var i = 0; i < profile_gigs.length; i++) {
            $.ajax({
                url: "/api/v1/dht/hkey/?hkey=" + profile_gigs[i],
                hk: profile_gigs[i],
                type: "GET",
                processData: false,
                success: function(js_data) {

                    //console.log('hkey',this.hk);
                    //console.log('data:',js_data);
                    gig_o = JSON.parse(js_data);
                    //console.log('data:',gig_o);
                    var gig_html = createGigToOtherProfile(this.hk, gig_o);
                    $("#gigs-other").append(gig_html);
                    componentHandler.upgradeDom();

                },

                error: function(error) {
                    console.log('ERR', error);

                    return;
                }
            });

            //var gig_hk = profile_gigs[i];
            //console.log('GIG HK:',gig_hk);

            /**/
        }
    });
    // });


    //show content



    $('section.profiles-page-content').hide();
    $('#other-profile-headline').show();

    $('body').addClass('up');

});


$('body').delegate('.gig', 'click', function(e) {

    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn = api_get_cdn_url();
    var gig_hkey = $(this).attr('id');
    $modal = $(".modal#gigModal .modal-dialog");
    //
    $modal.html('');
    $modal.html($('#redesigned-modal').html());

    $.ajax({
        url: "/api/v1/dht/hkey/?hkey=" + gig_hkey,
        type: "GET",
        processData: false,
        success: function(gig_data_json) {
            gig_o = JSON.parse(gig_data_json);

            console.log('--->', this.url);
            $e = $('#redesigned-modal-gig-image')
            $e.css(
                'background', 'url("' + api_cdn + gig_o.image_hash + '")' +
                'center center no-repeat'
            );
            $e.css('background-size', '100% auto');

            owner_guid = gig_o.owner_guid;

            $('#redesigned-modal-gig-title').html(gig_o.title);
            $('#redesigned-modal-description').html(gig_o.description);

            var _tagsString = '';
            gig_o.tags.forEach(function(item) {
                _tagsString += '<span class="simple-gig-tag">' + item + '</span>';
            });
            $('#redesigned-modal-gig-tags').html(_tagsString);

            /* TEMPORATY COMMIT */
            var lock = +gig_o.price * ( +gig_o.required_ert / 100 );

            $('#redesigned-modal-gig-price-req').html(lock);
            $('#redesigned-modal-gig-price').html(gig_o.price);

            // profile image
            getProfileValue(owner_guid, 'profilePicture', function(profile_picture_url) {
                if (profile_picture_url == 'null') {
                    //console.log('P NULL', profile_picture_url);
                } else {
                    profile_image = JSON.parse(profile_picture_url);
                    $('#new-modal-owner-avatar').css(
                        'background-image',
                        'url("' + api_cdn + profile_image + '")'
                    );
                }
            });

            // profile name
            getProfileValue(owner_guid, 'name', function(names_js) {
                if (names_js == 'null') {
                    //console.log('P NULL', profile_picture_url);

                } else {
                    name_o = JSON.parse(names_js);
                    //console.log('names', name_o);
                    $('#new-modal-owner-name').html(name_o.first + ' <b>' + name_o.last + '</b');
                }
            });

            // profile title
            getProfileValue(owner_guid, 'title', function(title_js) {
                if (title_js == 'null') {
                    //console.log('P NULL', profile_picture_url);

                } else {
                    title = JSON.parse(title_js);
                    $('#new-modal-owner-title').html('<i>' + title + '</i>');
                    //console.log('title', title);
                }
            });
        }
    });
});
