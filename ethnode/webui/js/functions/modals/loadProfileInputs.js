// Load Profile Inputs based on Profile.
function loadProfileInputs() {
    $form = $('#edit-profile.modal-box').find('form');
    $profile = $('.profile-information');

    // Variables for splitting things.
    $fullname = $profile.find('.profile-upper h2').text();
    $buttonHire = $profile.find('.profile-upper button.hire').text();
    $location = $profile.find('.profile-upper p.location').text();

    // Main variables
    $firstname = $fullname.split(' ')[0]; // FIRST NAME
    $lastname = $fullname.split(' ')[1]; // LAST NAME
    $hourlyRate = $buttonHire.match(/\d+/); // HOURLY RATE
    $country = $location.split(', ')[1]; // COUNTRY
    $city = $location.split(', ')[0]; // CITY
    $title = $profile.find('.profile-upper h5.profile-information-position').text(); // TITLE
    $summary = $profile.find('.profile-description p').text(); // SUMMARY / DESCRIPTION

    // FIRST NAME
    $form.find('input#first-name').val($firstname).parent().addClass('is-dirty');

    // LAST NAME
    $form.find('input#last-name').val($lastname).parent().addClass('is-dirty');

    // HOURLY RATE
    $form.find('input#hourly-rate').val($hourlyRate).parent().addClass('is-dirty');

    // TITLE
    $form.find('input#title').val($title).parent().addClass('is-dirty');

    // CITY
    $form.find('input#city').val($city).parent().addClass('is-dirty');

    // SUMMARY
    $form.find('textarea#description').val($summary).parent().addClass('is-dirty');

    // COUNTRY DROPDOWN
    $form.find('#country').dropdown('set selected', $countryClass);
}