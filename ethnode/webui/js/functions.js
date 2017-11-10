
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
function positionInformation(varTime, h4Text, h5Text) {

    // Gets time.
    $.each(varTime, function(i, times) {

        // Counts time difference and returns a string (3y 1m)
        $dateDifference = getTimeDifference(times.from, times.to);

        // Creates a text for date differences.
        $dateDifferenceText = times.from + ' - ' + times.to + ' ' + $dateDifference;
    });

    return '<div class="position-information"><h4>' + h4Text + '</h4><h5>' + h5Text + '</h5><p>' + $dateDifferenceText + '</p></div>';
}