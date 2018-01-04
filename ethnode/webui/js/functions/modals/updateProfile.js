function updateProfile() {
    $profile = $('.profile-information');
    $firstname = null; $lastname = null; $city = null; $country = null; $countryClass = null;
    $locationParagraph = $profile.find('.profile-upper p.location');

console.log('UPDATE PROFILE')

    // CHANGES WITH FIRSTNAME AND LASTNAME
    getProfileValue(profileID, 'name', function(name) {
        $name = JSON.parse(name);

        // PROFILE NAME AND LASTNAME
        $profile.find('.profile-upper h2').text($name.first + ' ' + $name.last);

        // Adding name to the header right side.
        $('ul.navbar-nav.visible-xs li a').text($name.first);
        $('li.profile span').text($name.first);

        // Changes profile image alt.
        $('.profile-image img').attr('alt', $name.first + ' ' + $name.last);
        $('li.profile img.profile-picture').attr('alt', $name.first + ' ' + $name.last);
    });

    // CHANGING PROFILE TITLE
    getProfileValue(profileID, 'title', function(title) {

        // PROFILE TITLE
        $profile.find('.profile-upper h5.profile-information-position').text(JSON.parse(title));
    });

    // CHANGING LOCATION
    getProfileValue(profileID, 'location', function(location) {
        $location = JSON.parse(location);

        // PROFILE LOCATION (+ adding country flag class)
        $locationParagraph.text($location.city + ', ' + $location.country);
        $locationParagraph.removeAttr('class').addClass('location ' + $location.countryClass);
    });

    // CHANGING PROFILE DESCRIPTION
    getProfileValue(profileID, 'description', function(description) {

        // PROFILE DESCRIPTION
        $profile.find('.profile-description p').text(JSON.parse(description));
    });

    // CHANGING PROFILE REPUTATION
    getProfileValue(profileID, 'reputation', function(reputation) {

        // Adding profile reputation .navbar-collapse #alert-navbar
        $('li.asset#alert-navbar a .round-number span').text(reputation);
    });

    // CHANGING PROFILE PICTURE
    getProfileValue(profileID, 'profilePicture', function(profilePictureURL) {
        var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";

        if (profilePictureURL.indexOf('//') >= 0) {

            // CHANGING PROFILE PICTURE
            $('.profile-image img').attr('src', JSON.parse(profilePictureURL));
            $('li.profile img.profile-picture').attr('src', JSON.parse(profilePictureURL));
        } else {

            // CHANGING PROFILE PICTURE
            $('.profile-image img').attr('src', api_cdn + JSON.parse(profilePictureURL));
            $('li.profile img.profile-picture').attr('src', api_cdn + JSON.parse(profilePictureURL));
        }
    });

    // headline
     getProfileValue(profileID, 'headlinePicture', function(profilePictureURL) {
        var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
        //setProfileValue('headlinePicture', headline_hash);
         //               console.log('headline_hash',headline_hash);
          //              $('#profile-headline').attr('src', api_cdn + headline_hash);

        if (profilePictureURL.indexOf('//') >= 0) {
            $('#profile-headline').attr('src', api_cdn + JSON.parse(profilePictureURL));
        } else {
            $('#profile-headline').attr('src', api_cdn + JSON.parse(profilePictureURL));

        }
    });

    // CHANGING PROFILE SKILLS
    getProfileValue(profileID, 'skills', function(skills) {

        // Append skills to profile
        $(JSON.parse(skills)).each(function(i, skill) {
            var appendSkill = '<p>'+ skill +'</p>';
            $('.profile-upper .skills').append(appendSkill);
        });
    });

    // CHANGING PROFILE LANGUAGES
    getProfileValue(profileID, 'languages', function(languages) {

        // Append languages to profile
        $(JSON.parse(languages)).each(function(i, language) {
            var appendLanguage = '<p>'+ language +'</p>';
            $('.profile-upper .languages').append(appendLanguage);
        });
    });
}

function updateProfileHeadline() {

    console.log('updateProfileHeadline');
    var headline_form = document.getElementById('image-headline-form');
    fd= $('#image-headline-form','#input-image-profile-he').prevObject;



    console.log('upload HEADLINE image', fd);
    var objFormData = new FormData();


    var fileObj = fd[0].files[0];
    objFormData.append('ufile', fileObj);
    var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";


    if(fileObj != undefined) {
            if(!!fileObj.type.match(/image.*/)) {
                $.ajax({
                    url: api_cdn_post,
                    type: "POST",
                    data: objFormData,
                    processData: false,
                    contentType: false,
                    success: function(headline_hash){
                        setProfileValue('headlinePicture', headline_hash);
                        console.log('headline_hash',headline_hash);
                        $('#profile-headline').attr('src', api_cdn + headline_hash);
                    }
                });
            } else {
                console.log('Not a valid image!');
            }

        }
 }