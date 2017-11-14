var iEP = 0;
function createLE(data, purpose, newDiv) {
    newDiv = newDiv || false;
    $data = data;
    var imageDiv = null;
    $timeFrom = null; $timeTo = null; $dateDifference = null; $dropdownID = null; $finalDiv = null; var twoLetters = null;

    function creatingNew(){purpose == "job" ? $dropdownID = 'newjob' + iEP : $dropdownID = 'newedu' + iEP};
    function creatingOld(){purpose == "job" ? $dropdownID = 'job' + iEP : $dropdownID = 'edu' + iEP};

    // Checking if we've asked to create a new div or not.
    newDiv == true ? creatingNew() : creatingOld();

    // creating TwoLetters variable
    purpose == "job" ? twoLetters = $data.company.substring(0, 2).toUpperCase() : twoLetters = $data.institution.substring(0, 2).toUpperCase();

    // Creating a $positionInfo variable and then adding different value to it if its a JOB or EDUCATION div.
    purpose == "job" ? $positionInfo = positionInformationJob($data.time, $data.company, $data.position) : $positionInfo = positionInformationEdu($data.time, $data.institution, $data.course);


    // HERE WE ARE STARTING TO RENDER THE WHOLE LIFE EXPERIENCE DIV

    // Image's div rendering
    if( $data.image == null ) {
        imageDiv = '<div class="image"><div class="dont-have-logo" style="display: block">' + twoLetters + '</div></div>';
    } else {
        imageDiv = '<div class="image"><img src="' + $data.image + '" alt="Logo Image"></div>';
    }

    // Dropdown button rendering
    var dropdownButton = '<button id="dropdown' + $dropdownID + '" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

    // Rendering dropdown UL, and adding the right word for dropdown's edit method.
    purpose == "job" ? $dropdownULWhichEdit = "job" : $dropdownULWhichEdit = "education"
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdown' + $dropdownID + '"><li class="mdl-menu__item open-modal" open-modal="#edit-' + $dropdownULWhichEdit + '">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

    // Description DIV rendering
    var descriptionDiv = '<div class="main-description col-lg-8 col-md-7 col-sm-8 col-xs-12">' + dropdownButton + dropdownUL + '<p class="description">' + $data.description + '</p></div>';

    // Main information div rendering
    var mainInformationDiv = '<div class="main-information col-lg-4 col-md-5 col-sm-4 col-xs-12">' + imageDiv + $positionInfo + '</div>';


    // Creating a LIFE EXPERIENCE div variable so I can use it for HTML code creation.
    if(purpose == 'job') {
        $finalDiv = $('<div class="job life-experience col-xs-12">' + mainInformationDiv + descriptionDiv + '</div>');
    } else if(purpose == "education") {
        $finalDiv = $('<div class="education life-experience col-xs-12">' + mainInformationDiv + descriptionDiv + '</div>');
    }

    // Creating a variable to store HTML code for LIFE EXPERIENCE div.
    var divToRender = $finalDiv.get(0).outerHTML;

    // Checking if its a JOB or EDUCATION and inserting it differently in the page's HTML code.
    purpose == "job" ? $(divToRender).insertBefore('.jobs-container .see-more') : $(divToRender).insertBefore('.education-container .see-more');

    // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    componentHandler.upgradeDom();

    // Incrementing iEP when the function is done.
    iEP++;
}