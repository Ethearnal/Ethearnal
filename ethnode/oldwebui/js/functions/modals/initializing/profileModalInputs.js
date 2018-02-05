// Load Profile Inputs based on Profile.
function loadProfileInputs() {
    $form = $('#edit-profile.modal-box').find('form');
    $content = $form.closest('.content');
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
    $countryClass = $profile.find('.profile-upper p.location').attr('class');
    $countryClass = $countryClass.split(' ')[1];
    $skills = [];
    $languages = [];
    $city = $location.split(', ')[0]; // CITY
    $title = $profile.find('.profile-upper h5.profile-information-position').text(); // TITLE
    $summary = $profile.find('.profile-description p').text(); // SUMMARY / DESCRIPTION
    $profilePictureURL = $profile.find('.profile-image img').attr('src');


    // GETTING SKILLS
    $($profile.find('.profile-upper .skills p')).each(function(i, skill) {
        $skills.push($(skill).text());
    });

    // GETTING LANGUAGES
    $($profile.find('.profile-upper .languages p')).each(function(i, language) {
        $languages.push($(language).text());
    });

    // IMAGE
    $content.find('img#input-image-profile').attr('src', $profilePictureURL);
    $content.find('img.img-profile').removeClass('active');
    $content.find('label[for="input-image-profile"]').text('Click here to change image').removeClass('active');

    // FIRST NAME
    $form.find('input#first-name').val($firstname).parent().addClass('is-dirty');

    // LAST NAME
    $form.find('input#last-name').val($lastname).parent().addClass('is-dirty');

    // TITLE
    $form.find('input#title').val($title).parent().addClass('is-dirty');

    // CITY
    $form.find('input#city').val($city).parent().addClass('is-dirty');

    // COUNTRY
    $form.find('#country').dropdown('set value', $countryClass);

    // SKILLS
    // $form.find('.skills-dropdown').dropdown('set selected', $skills);

    // LANGUAGES
    $form.find('.languages-dropdown').dropdown('set selected', $languages);

    // SUMMARY
    $form.find('textarea#description').val($summary).parent().addClass('is-dirty');

    // COUNTRY DROPDOWN
    $form.find('#country').dropdown('set selected', $countryClass);
}