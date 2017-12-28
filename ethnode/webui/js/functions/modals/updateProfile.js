function updateProfile() {
    // $data = data;
    $profile = $('.profile-information');
    $firstname = null; $lastname = null; $city = null; $country = null; $countryClass = null;
    $locationParagraph = $profile.find('.profile-upper p.location');

    // GETS NAME VARIABLES
    // var name = getProfileValue(profileID, 'name');
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=name",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(name) {
            $name = JSON.parse(name);

            // PROFILE NAME AND LASTNAME
            $profile.find('.profile-upper h2').text($name.first + ' ' + $name.last);

            // Adding name to the header right side.
            $('ul.navbar-nav.visible-xs li a').text($name.first);
            $('li.profile span').text($name.first);

            // Changes profile image alt.
            $('.profile-image img').attr('alt', $name.first + ' ' + $name.last);
            $('li.profile img.profile-picture').attr('alt', $name.first + ' ' + $name.last);
        }
    });

    // GETS PROFILE TITLE
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=title",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(title) {

            // PROFILE TITLE
            $profile.find('.profile-upper h5.profile-information-position').text(JSON.parse(title));
        }
    });

    // GETS LOCATION VARIABLES
    // var location = getProfileValue(profileID, 'location');
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=location",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(location) {
            $location = JSON.parse(location);

            // PROFILE LOCATION (+ adding country flag class)
            $locationParagraph.text($location.city + ', ' + $location.country);
            $locationParagraph.removeAttr('class').addClass('location ' + $location.countryClass);
        }
    });

    // GETS PROFILE DESCRIPTION
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=description",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(description) {

            // PROFILE DESCRIPTION
            $profile.find('.profile-description p').text(JSON.parse(description));
        }
    });

    // GETS PROFILE REPUTATION
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=reputation",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(reputation) {

            // Adding profile reputation .navbar-collapse #alert-navbar
            $('li.asset#alert-navbar a .round-number span').text(reputation);
        }
    });

    // GETS PROFILE PICTURE
    $.ajax({
        url: "/api/v1/dht/profile?owner_guid=" + profileID + "&profile_key=profilePicture",
        type: "GET",
        processData: false,
        contentType: 'application/json; charset=utf-8',
        success: function(profilePictureURL) {

            // CHANGING PROFILE PICTURE
            $('.profile-image img').attr('src', JSON.parse(profilePictureURL));
            $('li.profile img.profile-picture').attr('src', JSON.parse(profilePictureURL));
        }
    });
}