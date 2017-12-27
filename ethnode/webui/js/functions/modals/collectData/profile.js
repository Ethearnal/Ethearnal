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
    $hourlyRate = $form.find('input#hourly-rate').val();
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

                    $data = {
                        name: [
                            { first: $firstname, last: $lastname }
                        ],
                        location: [
                            { country: $country, city: $city, countryClass: $countryClass }
                        ],
                        title: $title,
                        description: $description,
                        skills: [],
                        reputation: 0,
                        profilePicture: avatarHash,
                        languages: []
                    }

                    $dataStringify = JSON.stringify($data);

                    updateProfile(JSON.parse($dataStringify));

                    $.ajax({
                        url: "/api/v1/dht/profile?profile_key=" + $profileID,
                        type: "PUT",
                        processData: false,
                        data: JSON.stringify($data),
                        contentType: 'application/json; charset=utf-8',
                        success: function(profileID) {
                            console.log('success!, profileID: ' + profileID);
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