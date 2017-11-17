// Collects 'CREATE JOB / EDIT JOB' data.
function collectJobData(form) {
    $form = form; $endDateVal = null;
    if($form.find('input.date-ended').val() == '') {
        $endDateVal = 'Present';
    } else {
        $endDateVal = $form.find('input.date-ended').val();
    }

    $data = {
        company: $form.find('input#company-name').val(),
        position: $form.find('input#position-name').val(),
        description: $form.find('textarea#description').val(),
        time: [
            { from: $form.find('input.date-started').val(), to: $endDateVal }
        ]
    }

    return $data;
}


// Collects 'CREATE EDUCATION / EDIT EDUCATION' data.
function collectEducationData(form) {
    $form = form; $endDateVal = null;
    if($form.find('input.date-ended').val() == '') {
        $endDateVal = 'Present';
    } else {
        $endDateVal = $form.find('input.date-ended').val();
    }

    $data = {
        // image: $imgSource,
        institution: $form.find('input#education-name').val(),
        course: $form.find('input#study-field').val(),
        description: $form.find('textarea#description').val(),
        time: [
            { from: $form.find('input.date-started').val(), to: $endDateVal }
        ]
    }
    return $data;
}


// Collects 'CREATE LANGUAGE / EDIT LANGUAGE' data.
function collectLanguageData(form) {
    $form = form; $endDateVal = null;
    if($form.find('input.date-ended').val() == '') {
        $endDateVal = 'Present';
    } else {
        $endDateVal = $form.find('input.date-ended').val();
    }

    $data = {
        language: $form.find('#language-name').dropdown('get text'),
        level: $form.find('#level').dropdown('get text'),
        levelValue: $form.find('#level').dropdown('get value'),
        iconClass: $form.find('#language-name').dropdown('get value'),
        description: $form.find('textarea#description').val(),
        time: [
            { from: $form.find('input.date-started').val(), to: $endDateVal }
        ]
    }
    return $data;
}



// Collects PROFILE data.
function collectProfileData(form) {
    $form = form;

    $firstname = $form.find('input#first-name').val();
    $lastname = $form.find('input#last-name').val();
    $country = $form.find('#country').dropdown('get text');
    $city = $form.find('input#city').val();
    $countryClass = $form.find('#country').dropdown('get value');
    $description = $form.find('textarea#description').val();
    $hourlyRate = $form.find('input#hourly-rate').val();
    $title = $form.find('input#title').val();

    $data = {
        name: [{ first: $firstname, last: $lastname }],
        location: [{ country: $country, city: $city, countryClass: $countryClass }],
        description: $description,
        hourlyRate: $hourlyRate,
        title: $title
    }
    return $data;
}