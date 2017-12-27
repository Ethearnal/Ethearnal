$profileID = null;
$.ajax({
    url: "/api/v1/dht/node/",
    type: "GET",
    processData: false,
    contentType: 'application/json; charset=utf-8',
    success: function(nodeData) {
        $data = JSON.parse(nodeData);
        loadDefaultSettingsToProfile($data.guid);
        $profileID = $data.guid;
    }
});

function loadDefaultSettingsToProfile(profileID) {

    $data = {
        "name": [
            { "first": "FirstName", "last": "LastName" }
        ],
        "location": [
            { "country": "Country", "city": "City", "countryClass": "" }
        ],
        "title": "This is my title",
        "description": "This is my description",
        "skills": [],
        "reputation": 0,
        "profilePicture": "https://cdn.pixabay.com/photo/2016/08/20/05/38/avatar-1606916_960_720.png",
        "languages": []
    }

    $.ajax({
        url: '/api/v1/dht/profile?profile_key=' + profileID,
        type: "PUT",
        processData: false,
        data: JSON.stringify($data),
        contentType: 'application/json; charset=utf-8',
        success: function(nodeData) {
            loadProfile(profileID);
        }
    });
}

$profilePictureURL = null;
function loadProfile(profileID) {

    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/profile?profile_key=' + profileID,
        dataType: 'text',
        success: function(data) {
            var profile = JSON.parse(data);
            updateProfile(profile);

            $firstname = null; $lastname = null; $position = null; $company = null; $city = null; $country = null; $positionInfo = null; $i = 0;

            // Appends profile's FULL NAME.
            var name = profile.name;
            $.each(name, function(i, names) {
                $firstname = names.first;
                $lastname = names.last;
            });

            // Appends a Job Experience on your profile page.
            var workExperience = profile.workExperience;
            $.each(workExperience, function(i, experience) {
                createLE(experience, 'job');
            });

            // Appends a Education on your profile page.
            var educations = profile.education;
            $.each(educations, function(i, education) {
                createLE(education, 'education');
            });

            // Appends a Education on your profile page.
            var languages = profile.languages;
            $.each(languages, function(i, language) {
                createLE(language, 'language');
            });

            // Adding profile reputation .navbar-collapse #alert-navbar
            $('li.asset#alert-navbar a .round-number span').text(profile.reputation);


            // Adding profile pictures to the page.
            $profilePictureURL = profile.profilePicture;
            $('.profile-image img').attr('src', profile.profilePicture);
            $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
            $('li.profile img.profile-picture').attr('src', profile.profilePicture);
            $('li.profile img.profile-picture').attr('alt', $firstname + ' ' + $lastname);

            // Appends each SKILL.
            var skill = profile.skills;
            var iSkill = 0;
            $.each(skill, function(i, skills) {
                $('.profile-bottom .skills').append("<p id='skill-dropdown" + iSkill + "'>" + skills.name + "<span> " + skills.experience + "</span></p><ul for='skill-dropdown" + iSkill + "' class='mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect'><li class='mdl-menu__item open-modal' open-modal='#edit-skill'>Edit</li></ul>");
                iSkill++;
            });
        }
    })
}