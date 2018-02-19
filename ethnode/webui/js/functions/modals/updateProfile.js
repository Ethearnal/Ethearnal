function updateProfile() {
    $profile = $('.profile-page');
    $firstname = null;
    $lastname = null;
    $city = null;
    $country = null;
    $countryClass = null;
    $locationParagraph = $profile.find('.profile-upper p.location');

    console.log('UPDATE PROFILE');
    $('#other-profile-headline').removeClass('background-image');
    $('#other-profile-headline').addClass('background-image2');
    $('#my-profile-headline').removeClass('background-image2');
    $('#my-profile-headline').addClass('background-image');

    $('#my-profile-section').removeClass('documentation2');
    $('#other-profile-section').removeClass('documentation');
    $('#other-profile-section').addClass('documentation2');
    $('#my-profile-section').addClass('documentation');


    // CHANGES WITH FIRSTNAME AND LASTNAME
    getProfileValue(profileID, 'name', function(name) {
        $name = JSON.parse(name);
        if (!$name) { return; }
        $profile.find('.user-name').text($name.first + ' ' + $name.last);
        $profile
          .find("#first-name")
          .val($name.first);
        $profile.find("#last-name").val($name.last);
    });

    // CHANGING PROFILE TITLE
    getProfileValue(profileID, 'title', function(title) {
        $profile.find('.user-role').text(JSON.parse(title));
        $profile.find("#title").val(JSON.parse(title));
    });

    // CHANGING LOCATION
    getProfileValue(profileID, 'location', function(location) {
        $location = JSON.parse(location);
        if (!$location) {
            console.log('PROFILE LOCATION MISS');
            return;
        }
        // PROFILE LOCATION (+ adding country flag class)
        $locationParagraph.text($location.city + ', ' + $location.country);
        $locationParagraph.removeAttr('class').addClass('location ' + $location.countryClass);
    });

    // CHANGING PROFILE DESCRIPTION
    getProfileValue(profileID, 'description', function(description) {
        $profile.find('.user-description').text(JSON.parse(description));
        $profile
          .find("#description")
          .text(JSON.parse(description));
    });

    // CHANGING PROFILE REPUTATION
    getProfileValue(profileID, 'reputation', function(reputation) {

        // Adding profile reputation .navbar-collapse #alert-navbar
        $('li.asset#alert-navbar a .round-number span').text(reputation);
    });

    // CHANGING PROFILE PICTURE
    getProfileValue(profileID, 'profilePicture', function(profilePictureURL) {
        //var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
        var api_cdn = api_get_cdn_url();
        if (profilePictureURL.indexOf('//') >= 0) {
            // CHANGING PROFILE PICTURE
            $('.profile-image img').attr('src', JSON.parse(profilePictureURL) + '&thumb=1');
            $('li.profile img.profile-picture').attr('src', JSON.parse(profilePictureURL) + '&thumb=1');
        } else {
            // CHANGING PROFILE PICTURE
            $('.user-avatar').css('background-image', 'url(' + api_cdn + JSON.parse(profilePictureURL) + '&thumb=1)');
            $('.user-avatar').attr('data-image-url', api_cdn + JSON.parse(profilePictureURL) + '&thumb=1');
        }
    });

    // headline
    getProfileValue(profileID, 'headlinePicture', function(headline_hash) {
        //var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
        var api_cdn = api_get_cdn_url();


        //setProfileValue('headlinePicture', headline_hash);
        //               console.log('headline_hash',headline_hash);
        //              $('#profile-headline').attr('src', api_cdn + headline_hash);

        headline_hash = JSON.parse(headline_hash);
        if (!headline_hash) { return; }

        if (headline_hash.indexOf('//') >= 0) {
            $('.profile-headline').css(
                'background-image',
                'url("' + api_cdn + headline_hash + '")'
            );
        } else {
            $('.profile-headline').css(
                'background-image',
                'url("' + api_cdn + headline_hash + '")'
            );

        }

    });

    // CHANGING PROFILE SKILLS
    getProfileValue(profileID, 'skills', function(skills) {

        // Append skills to profile
        $(JSON.parse(skills)).each(function(i, skill) {
            var appendSkill = '<span class="item">' + skill + '</span>';
            $profile.find('.skills').append(appendSkill);
        });

        $(JSON.parse(skills)).each(function(i, skill) {
            var appendSkill = "<option value='"+ skill +"'>" + skill + "</option>";
            $profile.find("#categories-edit").append(appendSkill);
            $profile
              .find(".skills-dropdown")
              .dropdown("set selected", skill);
        });
    });

    // CHANGING PROFILE LANGUAGES
    getProfileValue(profileID, 'languages', function(languages) {
        $(JSON.parse(languages)).each(function(i, language) {
            var appendLanguage = '<span class="item">' + language + '</span>';
            $profile.find('.languages').append(appendLanguage);
        });
        $(JSON.parse(languages)).each(function(i, language) {
            var appendLanguage = '<option value="'+ language +'">' + language + "</option>";
            $profile.find("#languages-edit").append(appendLanguage);
            $profile
              .find(".languages-dropdown")
              .dropdown("set selected", language);
        });
    });
}

function updateProfileHeadline($form) {
    console.log($form);
    $imgInputID = $content.find("input.input-file").attr("id");
    var fileObj;
    if ($imgInputID == "input-image-profile") {
      if (window.$uploadCropBlobProfile) {
        fileObj = window.$uploadCropBlobProfile;
      }
    } else {
      fileObj = document.getElementById($imgInputID).files[0];
    }

    var objFormData = new FormData();
    
    objFormData.append('ufile', fileObj);
    // var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn = api_get_cdn_url();
    var api_cdn_post = api_post_cdn_url();

    if (fileObj != undefined) {
        if (!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: api_cdn_post,
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(headline_hash) {
                    $('.profile-headline').css(
                        'background-image',
                        'url("' + api_cdn + headline_hash + '&thumb=1")'
                    );
                    $data = { 
                      general_domain_of_expertise: $profile.find("#categories-edit").dropdown("get value"),
                      skills: $profile.find("#skills-edit").dropdown("get value"),
                      title: $profile.find("#title").val(),
                      name: {first: $profile.find("#first-name").val(), last:$profile.find("#last-name").val()},
                      description: $profile.find("#description").val()
                    };

                    $.ajax({
                      url: "/api/v1/dht/profile/dht/profile",
                      type: "POST",
                      data: JSON.stringify($data),
                      contentType: "application/json; charset=utf-8",
                      processData: false,
                      success: function() {
                        $("#add-gig").modal("hide");
                        $("body").removeClass("modal-open");
                        $("body").find(".modal-backdrop").remove();
                      }
                    });
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    }
}
