// Collects PROFILE data.
function collectProfileData(form) {
    $form = form;
    $content = $form.closest('.content');
    $profile = $(".profile-headline");
    $firstname = $form.find('input#first-name').val();
    $lastname = $form.find('input#last-name').val();
    $description = $form.find('textarea#description').val();
    $title = $form.find('input#title').val();
    $skills = $form.find('.skills-dropdown').dropdown('get value');
    $languages = $form.find('.languages-dropdown').dropdown('get value');

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
                success: function(avatarHash) {
                    $dataName = { first: $firstname, last: $lastname };
                    // $dataLocation = { country: $country, city: $city, countryClass: $countryClass }
                    setProfileValue('name', $dataName);
                    setProfileValue('title', $title);
                    setProfileValue('description', $description);
                    setProfileValue('profilePicture', avatarHash);
                    setProfileValue('skills', $skills);
                    setProfileValue('languages', $languages);

                    // LIVE UPDATE PROFILE
                    $profile.find(".user-name").text($firstname + " " + $lastname);
                    $profile.find(".user-role").text($title);
                    $profile.find(".user-description").text($description);

                    // CHANGING PROFILE PICTURE
                    $(".user-avatar").css("background-image", 'url('+api_cdn + avatarHash +'&thumb=1)');
                    $('li.profile img.profile-picture').attr('src', api_cdn + avatarHash + '&thumb=1');
                    $(".div-img-wrap").css("background-image", "url(" + api_cdn + avatarHash + "&thumb=1)");
                    
                    // PROFILE SKILLS
                    $('.skills').empty().append('<span class="item-title font-size-14">Skills:</span>');
                    $($skills).each(function(i, skill) {
                        var appendSkill = '<span class="item">'+ skill +'</span>';
                        $('.skills').append(appendSkill);
                    });

                    // PROFILE LANGUAGES
                    $('.languages').empty().append('<span class="item-title font-size-14">Languages:</span>');
                    $($languages).each(function(i, language) {
                        var appendLanguage = '<span class="item">' + language + "</span>";
                        $('.languages').append(appendLanguage);
                    });
                    $.toast({
                      heading: "Profile Edit",
                      text:
                        "Your profile info and photo updated!",
                      showHideTransition: "fade",
                      allowToastClose: true,
                      hideAfter: 2500,
                      bgColor: "rgba(89, 116, 165, 0.91)",
                      textColor: "#fff",
                      position: "top-right",
                      afterShown: function() {
                        $('#edit-profile-close').click();
                      }
                    });
                }
            });
        } else {
            console.log('Not a valid image!');
        }
        // IF YOU EDIT GIG
    } else if (fileObj == undefined) {
        $dataName = { first: $firstname, last: $lastname };
        setProfileValue('name', $dataName);
        setProfileValue('title', $title);
        setProfileValue('description', $description);
        setProfileValue('skills', $skills);
        setProfileValue('languages', $languages);

        // LIVE UPDATE PROFILE
        $profile.find(".user-name").text($firstname + " " + $lastname);
        $profile.find(".user-role").text($title);
        $profile.find(".user-description").text($description);
        
        // PROFILE SKILLS
        $('.skills').empty().append('<span class="item-title font-size-14">Skills:</span>');
        $($skills).each(function(i, skill) {
            var appendSkill = '<span class="item">'+ skill +'</span>';
            $('.skills').append(appendSkill);
        });

        // PROFILE LANGUAGES
        $('.languages').empty().append('<span class="item-title font-size-14">Languages:</span>');
        $($languages).each(function(i, language) {
            var appendLanguage = '<span class="item">' + language + "</span>";
            $('.languages').append(appendLanguage);
        });
        $.toast({
          heading: "Profile Edit",
          text: "Your profile info updated!",
          showHideTransition: "fade",
          allowToastClose: true,
          hideAfter: 2500,
          bgColor: "rgba(89, 116, 165, 0.91)",
          textColor: "#fff",
          position: "top-right",
          afterShown: function() {
            $('#edit-profile-close').click();
          }
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
