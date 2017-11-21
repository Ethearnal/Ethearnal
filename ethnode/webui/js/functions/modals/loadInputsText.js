// Load #EDIT modal's inputs with values.
function loadInputsText(form, div) {

    $form = form;
    $divToLoad = div;
    $content = $form.closest('.content');

    // Dates
    if(!$divToLoad.hasClass('gig')) {
        $date = $divToLoad.find('p.date-name').text();
        $dateSplit = $date.split('-');
        $dateSplitPresent = $dateSplit[1].split('(');
        $dateFrom = $dateSplit[0];
        $dateTo = $dateSplitPresent[0];
        $dateTo = $dateTo.replace(/\s/g, '');
    }

    $inputDateFrom = $form.find('.date-started');
    $inputDateTo = $form.find('.date-ended');

    // Resetting the form
    clearForm($form);

    // // Resetting images in modals
    // if($divToLoad.hasClass('education')) resetImage($content, 'education');
    // if($divToLoad.hasClass('job')) resetImage($content, 'job');

    if($divToLoad.hasClass('gig')) {
        $gigData = $divToLoad.attr('data'); $gigExpireDate = null;
        var gig = JSON.parse($gigData);

        // Gets GIG Expire Date
        var dates = gig.date;
        $.each(dates, function(i, date) {
            $gigExpireDate = date.expire;
        });

        $content.find('input#gig-title').val(gig.title).parent().addClass('is-dirty');
        $form.find('#category').dropdown('set selected', gig.category);
        $form.find('#experience-level').dropdown('set selected', gig.experienceLevel);
        $content.find('textarea#description').val(gig.description).parent().addClass('is-dirty');
        $content.find('input#price').val(gig.price).parent().addClass('is-dirty');

        $inputDateFrom.bootstrapMaterialDatePicker({format: "MM/YYYY", weekStart: 0, time: false, currentDate: $gigExpireDate });
        $inputDateFrom.parent().addClass('is-dirty');
    }

    if($divToLoad.hasClass('education')) {
        $imageSrc = $divToLoad.find('.image img').attr('src');

        $content.find('input#input-image-education').attr('value', $imageSrc);
        $content.find('img#input-image-education').attr('src', $imageSrc);
        $content.find('img.img-education').removeClass('active');
        $content.find('label[for="input-image-education"]').text('Click here to change image').removeClass('active');
    }


    // Adding value to dropdowns in language modals.
    if($divToLoad.hasClass('language')) {
        $imageFlagClass = $divToLoad.find('.image span').attr('class').split(' ')[2];
        $languageLevel = $divToLoad.find('.image span').attr('level');

        $form.find('#language-name').dropdown('set selected', $imageFlagClass);
        $form.find('#level').dropdown('set selected', $languageLevel);
    }


    if(!$divToLoad.hasClass('gig')) {
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
}