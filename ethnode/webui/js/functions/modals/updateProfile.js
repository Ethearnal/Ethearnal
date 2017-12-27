function updateProfile(data) {
    $data = data;
    $profile = $('.profile-information');
    $location = $profile.find('.profile-upper p.location');

    // GETS NAME VARIABLES
    var name = $data.name;
    $.each(name, function(i, names) {
        $firstname = names.first;
        $lastname = names.last;
    });

    // GETS LOCATION VARIABLES
    var location = $data.location;
    $.each(location, function(i, locations) {
        $city = locations.city;
        $country = locations.country;
        $countryClass = locations.countryClass;
    });

    // PROFILE NAME AND LASTNAME
    $profile.find('.profile-upper h2').text($firstname + ' ' + $lastname);

    // PROFILE TITLE
    $profile.find('.profile-upper h5.profile-information-position').text($data.title);

    // PROFILE LOCATION (+ adding country flag class)
    $location.text($city + ', ' + $country);
    $location.removeAttr('class').addClass('location ' + $countryClass);

    // PROFILE PICTURE
    $('.profile-image img').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=' + $data.profilePicture);
    $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
    $('li.profile img.profile-picture').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=' + $data.profilePicture);
    $('li.profile img.profile-picture').attr('alt', $firstname + ' ' + $lastname);

    // PROFILE DESCRIPTION
    $profile.find('.profile-description p').text($data.description);

    // Adding name to the header right side.
    $('ul.navbar-nav.visible-xs li a').text($firstname);
    $('li.profile span').text($firstname);
}