
// This is a seeMoreJobs function where if you click a "SEE MORE" button in your profile's work or education fields it'll load more jobs or educations.
function seeButtons() {
    // Show jobs and education divs on the page when it's loaded.
    $("#jobs .job:lt("+$showJobs+")").show();
    $("#jobs .education:lt("+$showJobs+")").show();

    $countJobs = $("#jobs .jobs-container .job").length;
    $countEdu = $("#jobs .education-container .education").length;

    if( $countJobs <= 2 && $countEdu <= 2 ) {
        $(".see-less, .see-more").hide();
        return;
    } else if ( $countEdu <= 2 && $countJobs > 2 ) {
        $(".educations-see").hide();
    } else if ( $countJobs <= 2 && $countEdu > 2 ) {
        $(".jobs-see").hide();
    }

    // When you click on .see-less button, it will disappear 3 tabs out of the tablist every time, until reaching the minimum limit of 3 tabs that needs to show all the time.
    $(".see-less").click(function() {

        // Checks if the X is smaller than 3, if true, it would stop disappearing tabs.
        $showJobs = ($showJobs - $appearOnClick <= 0 ) ? $appearOnClick : $showJobs - $appearOnClick;
        $(this).parent().find(".life-experience").not(":lt("+$showJobs+")").stop(true, true).slideUp();

        // Hides .see-less and adds .see-more button.
        if( $showJobs <= 2 ) {

            $(this).parent().find(".see-more").stop(true, true).show();
            $(this).stop(true, true).hide();
        }
    });

    // When you click on .see-more button, it will appear 3 tabs in the tablist every time, until reaching the maximum limit, which is defined by how many tabs is created, so if you have experience in 10 jobs, it will appear 3 tabs until reaching the limit of 10.
    $(".see-more").click(function() {

        // Defines the size limit of the tabs and checks if it's bigger, then it would not show anymore tabs and process a function below. If it's smaller, it would add 3 additional tabs.
        $sizePanels = $(this).parent().find(".life-experience").length;
        $showJobs = ($showJobs <= $sizePanels) ? $showJobs+$appearOnClick : $sizePanels;
        $(this).parent().find(".life-experience:lt("+$showJobs+")").stop(true, true).slideDown();

        // Checks if X is bigger or equal to the size of tabs, if it's true, it would hide the .see-more button and appear .see-less button.
        if( $showJobs >= $sizePanels ) {

            $(this).parent().find(".see-less").stop(true, true).show();
            $(this).stop(true, true).hide();
        }
    });
}



// This function counts time difference between two dates and returns a string such as (3y 2m) = 3 years 2 months.
function getTimeDifference(timeFrom, timeTo) {

    if( timeTo == "Present" ) return '';

    // We need to change variables cause of momentJS's algorithm. So this way it won't return -1 instead of 1.
    $timeFrom = moment(timeTo, "MM/YYYY");
    $timeTo = moment(timeFrom, "MM/YYYY");
    $differenceText = null;

    var years = $timeFrom.diff($timeTo, 'year');
    $timeTo.add(years, 'years');

    var months = $timeFrom.diff($timeTo, 'months');
    $timeTo.add(months, 'months');

    if( years >= 1 && months >= 1 ) {
        $differenceText = '(' + years + 'y ' + months + 'm)';
    } else if ( years >= 1 && months == 0 ) {
        $differenceText = '(' + years + 'y)';
    } else if ( years == 0 && months >= 1 ) {
        $differenceText = '(' + months + 'm)';
    }

    return $differenceText;
}


// Generates a positionInformation div for both Education and Work fields.
function positionInformation(varTime, h4Text, h5Text, type) {

    // Gets time.
    $.each(varTime, function(i, times) {

        // Counts time difference and returns a string (3y 1m)
        $dateDifference = getTimeDifference(times.from, times.to);

        // Creates a text for date differences.
        $dateDifferenceText = times.from + ' - ' + times.to + ' ' + $dateDifference;
    });

    if(type == "work") {
        return '<div class="position-information"><h4 class="company-name">' + h4Text + '</h4><h5 class="position-name">' + h5Text + '</h5><p class="date-name">' + $dateDifferenceText + '</p></div>';

    } else if(type == "education") {
        return '<div class="position-information"><h4 class="study-field">' + h4Text + '</h4><h5 class="education-name">' + h5Text + '</h5><p class="date-name">' + $dateDifferenceText + '</p></div>';
    } else {
        return;
    }
}


// Initializing the date picker everytime we use this function.
function datePickerInit(dateFrom, dateTo) {
    dateTo.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
        $(this).parent().addClass('is-dirty');
    });
    dateFrom.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
        dateTo.bootstrapMaterialDatePicker('setMinDate', date);
        $(this).parent().addClass('is-dirty');
    });
}


// Checks if there's a word in a string.
function wordInString(s, word){
  return new RegExp( '\\b' + word + '\\b', 'i').test(s);
}


// Function to open modal. var modal = $modalID
function openModal(modal) {
    $(modal).css({ display: 'flex' });
    $(modal).find('.modal-box-content .inner-modal').animate({ width: '200vw', height: '200vw' }, 400, "easeInSine");
    $(modal).find('.modal-box-content .inner-modal .content').css({ opacity: 1, transitionDelay: '.5s' });
}


// Function to close modal
function closeModal(modalID) {
    $modalBox = $('#' + modalID);
    $modalBox.find('.modal-box-content .inner-modal .content').css({ transitionDelay: '0s' });

    $modalBox.find('.modal-box-content .inner-modal .content').animate({ opacity: 0 }, 400, "easeOutCubic", function() {
        $modalBox.find('.modal-box-content .inner-modal').animate({ width: 0, height: 0 }, 400, "easeOutSine", function() {
            $modalBox.css({ display: 'none' });
        });
    });
}


// Validate FORM function
function validateForm(form) {
  var isValid = true;
  $(form).each(function() {
    if ( $(this).find('input:not(.date-ended), textarea').filter(function() {
        return $.trim($(this).val()).length == 0
    }).length == 0 ) {
        isValid = true;
    } else {
        isValid = false;
    }
  });
  return isValid;
}


// Clears the form.
function clearForm(form) {
    $form = form;
    $form[0].reset();
    $form.find('.is-dirty').removeClass('is-dirty');
    $form.find('.is-focused').removeClass('is-focused');
}



function appearSuccessMessage(content) {
    $content = content;
    $successMessage = $content.find('.success-message');
    $successMessageThings = $successMessage.find('h1.title, .success-content, .buttons');

    $successMessageThings.toggleClass('active');
    // Creates SVG if it's not created yet.
    if($content.find('.success-message svg')) {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="154px" height="154px"> <g fill="none" stroke="#5CAB7D" stroke-width="2"> <circle cx="77" cy="77" r="72" style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"></circle> <circle id="colored" fill="#5CAB7D" cx="77" cy="77" r="72" style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"></circle> <polyline stroke="#FFF" stroke-width="8" points="43.5,77.8 63.7,97.9 112.2,49.4" style="stroke-dasharray:100px, 100px; stroke-dashoffset: 200px;" class="st0"></polyline> </g> </svg>'
        $(svg).insertBefore('.success-message h1');
    }
    $successMessage.fadeIn(300);
}


// Load #EDIT modal's inputs with values.
function loadInputsText(form, div) {

    $form = form;
    $lifeExperienceDiv = div;

    // Dates
    $date = $lifeExperienceDiv.find('p.date-name').text();
    $dateSplit = $date.split('-');
    $dateSplitPresent = $dateSplit[1].split('(');
    $dateFrom = $dateSplit[0];
    $dateTo = $dateSplitPresent[0];
    $dateTo = $dateTo.replace(/\s/g, '');

    $inputDateFrom = $form.find('.date-started');
    $inputDateTo = $form.find('.date-ended');

    // Resetting the form
    clearForm($form);

    // Going thru each INPUT field, and adding value to them.
    var findings = $form.find('input, textarea');
    $.each(findings, function(i, field) {
        $id = $(field).attr('id');
        $text = $lifeExperienceDiv.find('.' + $id).text();
        $form.find('input#' + $id + ':not(.date-ended):not(.date-started), textarea#' + $id).val($text).parent().addClass('is-dirty');

        $inputDateFrom.bootstrapMaterialDatePicker({weekStart: 0, currentDate: $dateFrom, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
            $inputDateTo.bootstrapMaterialDatePicker('setMinDate', date);
        });
        $inputDateFrom.val($dateFrom).parent().addClass('is-dirty');

        if(wordInString($date, 'Present')) {
            $inputDateTo.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
                $(this).parent().addClass('is-dirty');
            });
        } else {
            $inputDateTo.bootstrapMaterialDatePicker({format: "MM/YYYY", weekStart: 0, time: false, currentDate: $dateTo });
            $inputDateTo.val($dateTo).parent().addClass('is-dirty');
        }
    })
}




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
        startDate: $form.find('input.date-started').val(),
        endDate: $endDateVal
    }
    return $data;
}