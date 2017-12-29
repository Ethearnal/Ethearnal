// Load #EDIT modal's inputs with values.
function loadInputsText(form, div) {

    $form = form;
    $divToLoad = div;
    $content = $form.closest('.content');

    // // Dates
    // if(!$divToLoad.hasClass('gig') && !$divToLoad.hasClass('portfolio')) {
    //     $date = $divToLoad.find('p.date-name').text();
    //     $dateSplit = $date.split('-');
    //     $dateSplitPresent = $dateSplit[1].split('(');
    //     $dateFrom = $dateSplit[0];
    //     $dateTo = $dateSplitPresent[0];
    //     $dateTo = $dateTo.replace(/\s/g, '');
    // }

    // $inputDateFrom = $form.find('.date-started');
    // $inputDateTo = $form.find('.date-ended');

    // Resetting the form
    clearForm($form);

    if($divToLoad.hasClass('portfolio')) {
        $portfolioID = $divToLoad.attr('portfolioID');

        getDHTData($portfolioID, function(portfolioData) {
            $portfolio = JSON.parse(portfolioData);

            // IMAGE
            $content.find('img#input-image-portfolio').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=' + $portfolio.imageHash);
            $content.find('img.img-portfolio').removeClass('active');
            $content.find('label[for="input-image-portfolio"]').text('Click here to change image').removeClass('active');

            // INPUT FIELDS
            $content.find('input#portfolio-title').val($portfolio.title).parent().addClass('is-dirty');
            $content.find('textarea#description').val($portfolio.description).parent().addClass('is-dirty');
            $form.find('.portfolio-tags').dropdown('set selected', $portfolio.tags);
        });
    }

    if($divToLoad.hasClass('gig')) {
        $gigID = $divToLoad.attr('gigID');

        // $('#gigModal').modal('hide');

        getDHTData($gigID, function(gigData) {
            $gigExpireDate = null;
            $gig = JSON.parse(gigData);

            // Gets GIG Expire Date
            var dates = $gig.date;
            $.each(dates, function(i, date) {
                $gigExpireDate = date.expire;
            });

            // IMAGE
            $content.find('img#input-image-gig-edit').attr('src', 'http://localhost:5678/api/cdn/v1/resource?hkey=' + $gig.imageHash);
            $content.find('img.img-gig-edit').removeClass('active');
            $content.find('label[for="input-image-gig-edit"]').text('Click here to change image').removeClass('active');

            // INPUT FIELDS
            $content.find('input#gig-title').val($gig.title).parent().addClass('is-dirty');
            $form.find('#category').dropdown('set selected', $gig.category);
            $content.find('textarea#description').val($gig.description).parent().addClass('is-dirty');
            $content.find('input#amount').val($gig.price);
            $content.find('input#reputationCost').val($gig.reputationCost);
            $form.find('.gig-tags').dropdown('set selected', $gig.tags);

            // DATE PICKER
            $inputDateFrom.bootstrapMaterialDatePicker({format: "DD/MM/YYYY", weekStart: 0, time: false, currentDate: $gigExpireDate });
            $inputDateFrom.val($gigExpireDate).parent().addClass('is-dirty');
        });
    }


    // if(!$divToLoad.hasClass('gig')) {
    //     // Going thru each INPUT field, and adding value to them.
    //     var findings = $form.find('input, textarea');
    //     $.each(findings, function(i, field) {
    //         $id = $(field).attr('id');
    //         $text = $divToLoad.find('.' + $id).text();
    //         $form.find('input#' + $id + ':not(.date-ended):not(.date-started), textarea#' + $id).val($text).parent().addClass('is-dirty');

    //         $inputDateFrom.bootstrapMaterialDatePicker({weekStart: 0, currentDate: $dateFrom, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
    //             $inputDateTo.bootstrapMaterialDatePicker('setMinDate', date);
    //         });
    //         $inputDateFrom.val($dateFrom).parent().addClass('is-dirty');

    //         if(wordInString($date, 'Present')) {
    //             $inputDateTo.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
    //                 $(this).parent().addClass('is-dirty');
    //             });
    //         } else {
    //             $inputDateTo.bootstrapMaterialDatePicker({format: "MM/YYYY", weekStart: 0, time: false, currentDate: $dateTo });
    //             $inputDateTo.val($dateTo).parent().addClass('is-dirty');
    //         }
    //     })
    // }
}