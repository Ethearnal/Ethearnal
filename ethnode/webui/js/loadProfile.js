$.ajax({
    url: "/api/v1/dht/node/",
    type: "GET",
    processData: false,
    contentType: 'application/json; charset=utf-8',
    success: function(nodeData) {
        $data = JSON.parse(nodeData);
        loadDefaultSettingsToProfile($data.guid);
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
        "hourlyRate": 0,
        "profilePicture": "",
        "workExperience": [],
        "education": [],
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

function loadProfile(profileID) {

    $.ajax({
        type: 'GET',
        url: '/api/v1/dht/profile?profile_key=' + profileID,
        dataType: 'text',
        success: function(data) {
            var profile = JSON.parse(data);

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

            updateProfile(profile);

            // Adding profile reputation .navbar-collapse #alert-navbar
            $('li.asset#alert-navbar a .round-number span').text(profile.reputation);


            // Adding profile pictures to the page.
            $('.profile-image img').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=be1c7fdd0d8603e787ca989b563741fac11334bbd76bc74c6576dd6e71f79d9c');
            $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
            // $('li.profile img.profile-picture').attr('src', '/api/v1/profile/?q=avatar');
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