function createPortfolio(data) {
    $data = data;
    var imageDiv = null;
    $timeFrom = null; $timeTo = null; $dateDifference = null; $dropdownID = null; $finalDiv = null; var twoLetters = null;
    $dropdownID = iGig;
    $tags = '';

    $($data.tags).each(function(i, tag) {
        $tags += tag + ' ';
    });

    // HERE WE ARE STARTING TO RENDER THE WHOLE CONTENT BLOCK DIV

    // Image's div rendering
    imageDiv = '<div class="image"><img class="portfolio-image" src="/api/v1/my/img/?q='+$data.imageHash+'" alt="Logo Image"></div>';

    // Dropdown button rendering
    var dropdownButton = '<button id="dropdown' + $dropdownID + '" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

    // Rendering dropdown UL, and adding the right word for dropdown's edit method.
    var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdown' + $dropdownID + '"><li class="mdl-menu__item open-modal" open-modal="#edit-portfolio">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

    // Description DIV rendering
    var descriptionDiv = '<div class="main-description col-lg-8 col-md-7 col-sm-8 col-xs-12">' + dropdownButton + dropdownUL + '<h3 class="portfolio-heading">' + $data.title + '</h3><p class="description portfolio-description">' + $data.description + '</p><h6 class="port-tags"><strong>tags:</strong> <i>' + $tags + '</i></h6></div>';

    // Main information div rendering
    var mainInformationDiv = '<div class="main-information col-lg-4 col-md-5 col-sm-4 col-xs-12">' + imageDiv + '</div>';


    // Creating a LIFE EXPERIENCE div variable so I can use it for HTML code creation.
    $finalDiv = $('<div class="portfolio content-block col-xs-12">' + mainInformationDiv + descriptionDiv + '</div>');

    // Creating a variable to store HTML code for LIFE EXPERIENCE div.
    var divToRender = $finalDiv.get(0).outerHTML;

    // Checking if its a JOB or EDUCATION and inserting it differently in the page's HTML code.
    $('.portfolio-container').append(divToRender);

    // Upgrading the DOM so you can use the dropdown, edit and delete the div.
    componentHandler.upgradeDom();

    // Incrementing iEP when the function is done.
    iGig++;
}