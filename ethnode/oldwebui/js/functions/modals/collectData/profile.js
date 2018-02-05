// Collects PROFILE data.
function collectProfileData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');
    console.log('input.input-file',$imgInputID);
    $profile = $('.profile-information');
    $locationParagraph = $profile.find('.profile-upper p.location');

    $firstname = $form.find('input#first-name').val();
    $lastname = $form.find('input#last-name').val();
    $country = $form.find('#country').dropdown('get text');
    $city = $form.find('input#city').val();
    $countryClass = $form.find('#country').dropdown('get value');
    $description = $form.find('textarea#description').val();
    $title = $form.find('input#title').val();
    $skills = $form.find('.skills-dropdown').dropdown('get value');
    $languages = $form.find('.languages-dropdown').dropdown('get value');

    var objFormData = new FormData();
    var fileObj = document.getElementById($imgInputID).files[0];

    objFormData.append('ufile', fileObj);
    //var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    //var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";

    var api_cdn = api_get_cdn_url();
    var api_cdn_post = api_post_cdn_url();

    if(fileObj != undefined) {
        if(!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: api_cdn_post,
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(avatarHash){
                    $dataName = { first: $firstname, last: $lastname };
                    $dataLocation = { country: $country, city: $city, countryClass: $countryClass }

                    setProfileValue('name', $dataName);
                    setProfileValue('location', $dataLocation);
                    setProfileValue('title', $title);
                    setProfileValue('description', $description);
                    // setProfileValue('reputation', 0);
                    setProfileValue('profilePicture', avatarHash);
                    setProfileValue('skills', $skills);
                    setProfileValue('languages', $languages);


                    // CHANGING PROFILE SETTINGS

                    // PROFILE NAME AND LASTNAME
                    $profile.find('.profile-upper h2').text($firstname + ' ' + $lastname);

                    // Adding name to the header right side.
                    $('ul.navbar-nav.visible-xs li a').text($firstname);
                    $('li.profile span').text($name.first);

                    // Changes profile image alt.
                    $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
                    $('li.profile img.profile-picture').attr('alt', $firstname + ' ' + $lastname);

                    // PROFILE TITLE
                    $profile.find('.profile-upper h5.profile-information-position').text($title);

                    // PROFILE LOCATION (+ adding country flag class)
                    $locationParagraph.text($city + ', ' + $country);
                    $locationParagraph.removeAttr('class').addClass('location ' + $countryClass);

                    // PROFILE DESCRIPTION
                    $profile.find('.profile-description p').text($description);

                    // CHANGING PROFILE PICTURE
                    $('.profile-image img').attr('src', api_cdn + avatarHash);
                    $('li.profile img.profile-picture').attr('src', api_cdn + avatarHash);

                    // PROFILE SKILLS
                    $('.profile-upper .skills p').remove();
                    $($skills).each(function(i, skill) {
                        var appendSkill = '<p>'+ skill +'</p>';
                        $('.profile-upper .skills').append(appendSkill);
                    });

                    // PROFILE LANGUAGES
                    $('.profile-upper .languages p').remove();
                    $($languages).each(function(i, language) {
                        var appendLanguage = '<p>'+ language +'</p>';
                        $('.profile-upper .languages').append(appendLanguage);
                    });
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (fileObj == undefined) {
        $dataName = { first: $firstname, last: $lastname };
        $dataLocation = { country: $country, city: $city, countryClass: $countryClass }

        setProfileValue('name', $dataName);
        setProfileValue('location', $dataLocation);
        setProfileValue('title', $title);
        setProfileValue('description', $description);
        setProfileValue('skills', $skills);
        setProfileValue('languages', $languages);


        // CHANGING PROFILE SETTINGS

        // PROFILE NAME AND LASTNAME
        $profile.find('.profile-upper h2').text($firstname + ' ' + $lastname);

        // Adding name to the header right side.
        $('ul.navbar-nav.visible-xs li a').text($firstname);
        $('li.profile span').text($name.first);

        // Changes profile image alt.
        $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
        $('li.profile img.profile-picture').attr('alt', $firstname + ' ' + $lastname);

        // PROFILE TITLE
        $profile.find('.profile-upper h5.profile-information-position').text($title);

        // PROFILE LOCATION (+ adding country flag class)
        $locationParagraph.text($city + ', ' + $country);
        $locationParagraph.removeAttr('class').addClass('location ' + $countryClass);

        // PROFILE DESCRIPTION
        $profile.find('.profile-description p').text($description);

        // // CHANGING PROFILE PICTURE
        // $('.profile-image img').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=' + avatarHash);
        // $('li.profile img.profile-picture').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=' + avatarHash);

        // PROFILE SKILLS
        $('.profile-upper .skills p').remove();
        $($skills).each(function(i, skill) {
            var appendSkill = '<p>'+ skill +'</p>';
            $('.profile-upper .skills').append(appendSkill);
        });

        // PROFILE LANGUAGES
        $('.profile-upper .languages p').remove();
        $($languages).each(function(i, language) {
            var appendLanguage = '<p>'+ language +'</p>';
            $('.profile-upper .languages').append(appendLanguage);
        });
    }
    return;
}

//
function collectProfileHeadlineData(form) {
// CHANGING PROFILE PICTURE
//    var objFormData = new FormData();
//    var fileObj = document.getElementById("input-image-profile-headline").files[0];
//    console.log('file_obje',fileObj)
//    objFormData.append('ufile', fileObj);
//    var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";

}