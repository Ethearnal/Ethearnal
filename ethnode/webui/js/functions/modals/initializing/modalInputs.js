// Load #EDIT modal's inputs with values.
function loadInputsText(form, div) {
    console.log('LOAD INPUTS',form)
    $form = form;
    $divToLoad = div;
    $content = $form.closest('.content');

    // Resetting the form
    clearForm($form);
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    // var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    var api_cdn = api_get_cdn_url();
    var api_cdn_post = api_post_cdn_url();


    if($divToLoad.hasClass('portfolio')) {
        $portfolioID = $divToLoad.attr('portfolioID');

        getDHTData($portfolioID, function(portfolioData) {
            $portfolio = JSON.parse(portfolioData);

            // IMAGE
            $content.find('img#input-image-portfolio').attr('src', api_cdn' + $portfolio.image_hash);
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
            $content.find('img#input-image-gig-edit').attr('src', api_cdn + $gig.image_hash);
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
}