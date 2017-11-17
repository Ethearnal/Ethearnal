// Generates a positionInformation div for JOB.
function positionInformationJob(varTime, h4Text, h5Text) {
    $dateDifferenceText = getTimeFirst(varTime);
    return '<div class="position-information"><h4 class="company-name">' + h4Text + '</h4><h5 class="position-name">' + h5Text + '</h5><p class="date-name">' + $dateDifferenceText + '</p></div>';
}

// Generates a positionInformation div for EDUCATION.
function positionInformationEdu(varTime, h4Text, h5Text) {
    $dateDifferenceText = getTimeFirst(varTime);
    return '<div class="position-information"><h4 class="study-field">' + h4Text + '</h4><h5 class="education-name">' + h5Text + '</h5><p class="date-name">' + $dateDifferenceText + '</p></div>';
}

// Generates a positionInformation div for LANGUAGE.
function positionInformationLanguage(varTime, h4Text, h5Text) {
    $dateDifferenceText = getTimeFirst(varTime);
    return '<div class="position-information"><h4 class="language-name">' + h4Text + '</h4><h5 class="level">' + h5Text + '</h5><p class="date-name">' + $dateDifferenceText + '</p></div>';
}