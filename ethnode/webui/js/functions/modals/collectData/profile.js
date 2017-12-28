// Collects PROFILE data.
function collectProfileData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $firstname = $form.find('input#first-name').val();
    $lastname = $form.find('input#last-name').val();
    $country = $form.find('#country').dropdown('get text');
    $city = $form.find('input#city').val();
    $countryClass = $form.find('#country').dropdown('get value');
    $description = $form.find('textarea#description').val();
    // $hourlyRate = $form.find('input#hourly-rate').val();
    $title = $form.find('input#title').val();

    var objFormData = new FormData();
    var fileObj = document.getElementById($imgInputID).files[0];

    objFormData.append('ufile', fileObj);

    if(fileObj != undefined) {
        if(!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: "http://localhost:5678/api/cdn/v1/resource",
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(avatarHash){

                    $dataName = { first: $firstname, last: $lastname };
                    $dataLocation = { country: $country, city: $city, countryClass: $countryClass }
                    $skills = [];
                    $languages = [];

                    setProfileValue('name', $dataName);
                    setProfileValue('location', $dataLocation);
                    setProfileValue('title', $title);
                    setProfileValue('description', $description);
                    setProfileValue('skills', $skills);
                    setProfileValue('reputation', 0);
                    setProfileValue('profilePicture', avatarHash);

                    $.ajax({
                        url: '/api/v1/dht/profile?profile_key=languages',
                        type: "PUT",
                        processData: false,
                        data: JSON.stringify($languages),
                        contentType: 'application/json; charset=utf-8',
                        success: function(success) {
                            updateProfile();
                        }
                    });
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (fileObj == undefined) {
        // do nothing
    }
    return;
}