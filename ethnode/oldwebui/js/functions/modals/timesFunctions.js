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

// Gets time at first. Then counts the difference and turns it into a text.
function getTimeFirst(varTime) {
    $.each(varTime, function(i, times) {

        // Counts time difference and returns a string (3y 1m)
        $dateDifference = getTimeDifference(times.from, times.to);

        if($dateDifference == null) $dateDifference = '(1m)';

        // Creates a text for date differences.
        $dateDifferenceText = times.from + ' - ' + times.to + ' ' + $dateDifference;
    });
    return $dateDifferenceText;
}