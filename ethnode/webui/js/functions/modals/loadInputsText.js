// Load #EDIT modal's inputs with values.
function loadInputsText(form, div) {

    $form = form;
    $divToLoad = div;

    // Languages modal variables
    $imageFlagClass = $divToLoad.find('.image span').attr('class').split(' ')[2];
    $languageLevel = $divToLoad.find('.image span').attr('level');

    // Dates
    $date = $divToLoad.find('p.date-name').text();
    $dateSplit = $date.split('-');
    $dateSplitPresent = $dateSplit[1].split('(');
    $dateFrom = $dateSplit[0];
    $dateTo = $dateSplitPresent[0];
    $dateTo = $dateTo.replace(/\s/g, '');

    $inputDateFrom = $form.find('.date-started');
    $inputDateTo = $form.find('.date-ended');

    // Resetting the form
    clearForm($form);

    if($divToLoad.hasClass('language')) {
        $form.find('#language-name').dropdown('set selected', $imageFlagClass);
        $form.find('#level').dropdown('set selected', $languageLevel);
    }

    // Going thru each INPUT field, and adding value to them.
    var findings = $form.find('input, textarea');
    $.each(findings, function(i, field) {
        $id = $(field).attr('id');
        $text = $divToLoad.find('.' + $id).text();
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