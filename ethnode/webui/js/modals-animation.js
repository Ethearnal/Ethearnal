
// THESE TWO FUNCTIONS BELOW ARE FOR AVATAR MODAL AND AVATAR PICTURE IN THAT MODAL.
function nowAddImage(source) {
    $("<div class='show-image'><img src='" + source + "'' /></div>").css({
        float: 'left',
        position: 'relative',
        overflow: 'hidden',
        width: '100px',
        height: '100px',
        borderRadius: '100%',
        marginBottom: '20px',
        boxShadow: 'rgba(0, 0, 0, 0.0980392) 0px 0px 3px 3px'
    })
    .insertBefore("#avatarModal .modal-dialog .modal-content .modal-body .modal-inputs input.title");
}

function addImage(source) {
    if( $(".modal-inputs .show-image").length ) {
        $(".modal-inputs .show-image").remove();
        nowAddImage(source);
    } else {
        nowAddImage(source);
    }

    $('img#input-image-avatar').cropper('destroy');

    $(function () {
        var $previews = $('.show-image');

        $('img#input-image-avatar').cropper({

            crop: function (e) {
                var imageData = $(this).cropper('getImageData');
                var previewAspectRatio = e.width / e.height;

                $('.cropper-container').css({
                    position: 'absolute',
                    top: 0,
                    zIndex: 1000
                });

                $('label[for="input-image-avatar"]').css({
                    paddingTop: $('.cropper-container').height()
                });

                $previews.each(function () {
                    var $preview = $(this);
                    var previewWidth = $preview.width();
                    var previewHeight = previewWidth / previewAspectRatio;
                    var imageScaledRatio = e.width / previewWidth;

                    $preview.find('img').css({
                        width: imageData.naturalWidth / imageScaledRatio,
                        height: imageData.naturalHeight / imageScaledRatio,
                        marginLeft: -e.x / imageScaledRatio,
                        marginTop: -e.y / imageScaledRatio
                    });
                });
            }
        });
    });
}

$category = '';
$jobType = '';
$experienceLevel = '';
$budget = '';

// SEARCH QUERY MAIN FUNCTION
function searchQueryDo() {

    // Function variables
    $filter = $('.filters .filter');

    // Search variables
    $search = $('input#search-header').val().replace(/ /g,"%20").toLowerCase();
    $search == '' ? $search = '' : $search = 'title=' + $search;

    // SEARCH QUERY VARIABLES
    $categoryParent = $filter.parent().find('.filter.category');
    $categoryText = $categoryParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    $jobTypeParent = $filter.parent().find('.filter.job-type');
    $jobTypeText = $jobTypeParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    $experienceLevelParent = $filter.parent().find('.filter.experience-level');
    $experienceLevelText = $experienceLevelParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    $budgetParent = $filter.parent().find('.filter.budget');
    $budgetText = $budgetParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    if ($categoryText !== '') $category = '&category=' + $categoryText;
    if ($jobTypeText !== '') $jobType = '&job_type=' + $jobTypeText;
    if ($experienceLevelText !== '') $experienceLevel = '&experience_level=' + $experienceLevelText;
    if ($budgetText !== '') $budget = '&budget=' + $budgetText;


    // FORMING SEARCH QUERY
    var search = '/api/v1/my/idx/query/objects/?' + $search + $category + $jobType + $experienceLevel + $budget;
    var searchQuery = search.replace('/api/v1/my/idx/query/objects/?&', '/api/v1/my/idx/query/objects/?');
    if (searchQuery == "/api/v1/my/idx/query/objects/?title=" || searchQuery == "/api/v1/my/idx/query/objects/?" || searchQuery == false) {
        return false;
    }

    $.ajax({
        url: searchQuery,
        type: "GET",
        processData: false,
        success: function(result) {
            $result = JSON.parse(result);
            $('.gig').remove();

            for(i = 0; i < $result.length; i++) {
                createGigBox($result[i]);
            }
            $filter.children().stop(true, true).removeClass('is-wrong');
        },
        error: function(error) {
            $('.gig').remove();
            $filter.find('.is-checked').stop(true, true).addClass('is-wrong');
        }
    });

    // null every filter
    $category = ''; $jobType = ''; $experienceLevel = ''; $budget = '';
}





$('label.mdl-checkbox').click(function(e) {
    e.preventDefault();
    $label = $(this);
    $labelParent = $(this).parent();

    // IF USER UNSELECTS THE FILTER, THEN THIS HAPPENS
    if ($(this).hasClass('is-checked')) {
        $(this).stop(true, true).removeClass('is-checked is-wrong');

        searchQueryDo();

        return false;
    }


    // Making sure you can select only one checkbox per filter
    $labelParent.find('.is-checked').not($(this)).stop(true, true).removeClass('is-checked is-wrong');
    $(this).stop(true, true).toggleClass('is-checked');

    searchQueryDo();
});

$('button#search-button').click(function(e) {
    e.preventDefault();
    searchQueryDo();
})

$('input#search-header').keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();

        searchQueryDo();

        return false;
    }
});




$('.modal-box button').click(function() {
    $modalID = $(this).closest('.modal-box').attr('id');
    $content = $(this).closest('.content');
    $form = $content.find('form');

    $modalContent = $content.find('.modal-footer, .modal-header, .modal-body');
    $successMessage = $content.find('.success-message');
    $successMessageThings = $successMessage.find('h1.title, .success-content, .buttons');

    // If its a CLOSE button it'll close the modal only.
    if($(this).hasClass('close-button')) {
        closeModal($modalID);
        if(!$(this).parent().is('.buttons')) return; // Checks if the button that is clicked is within the Modal > Confirmation page > Button div.
    }

    // BUTTON.PUBLISH-BUTTON
    if($(this).hasClass('finish-button')) {
        if(!validateForm($form) && $modalID !== "edit-profile") return; // Return if form isn't filled.

        // Resetting images and collecting data for JOB
        if($modalID == 'add-job' || $modalID == 'edit-job') {
            $data = collectJobData($form);
            resetImage($content, "job");
        }

        // Resetting images and collecting data for EDUCATION
        if($modalID == 'add-education' || $modalID == 'edit-education') {
            $data = collectEducationData($form);
            resetImage($content, "education");
        }

        // Collecting data for other things.
        if($modalID == 'add-language' || $modalID == 'edit-language') $data = collectLanguageData($form);
        if($modalID == 'add-skill' || $modalID == 'edit-skill') $data = collectSkillData($form);
        if($modalID == "edit-profile") $data = collectProfileData($form);
        if($modalID == "add-gig" || $modalID == "edit-gig") collectGigData($form);


        // Fading out the initial modal and fading in success message.
        $modalContent.fadeOut(300);

        // DO SOMETHING MORE AFTER CLICKING THAT BUTTON AND WAITING FOR A TIMEOUT TO END
        setTimeout(function() {
            appearSuccessMessage($content);
            clearForm($form);

            if($modalID == 'add-job') createLE($data, 'job');
            if($modalID == 'add-education') createLE($data, 'education');
            if($modalID == 'add-language') createLE($data, 'language', true);
            if($modalID == 'edit-profile') updateProfile($data);
            // if($modalID == 'add-gig') createGig($data);
            // if($modalID == 'add-skill') createLE($data, 'language', true);


            if ($modalID == 'edit-education') {

                $modalID = $currentlyOpenModalID;
                $contentBlock = $currentlyClosestLEdiv;

                $dateDifferenceText = getTimeFirst($data.time);

                $contentBlock.find('.image img').attr('src', $data.image);
                $contentBlock.find('.study-field').text($data.course);
                $contentBlock.find('.education-name').text($data.institution);
                $contentBlock.find('.date-name').text($dateDifferenceText);
                $contentBlock.find('.description').text($data.description);


            } else if ($modalID == 'edit-job') {

                $modalID = $currentlyOpenModalID;
                $contentBlock = $currentlyClosestLEdiv;

                $dateDifferenceText = getTimeFirst($data.time);

                $contentBlock.find('.image img').attr('src', $data.image);
                $contentBlock.find('.company-name').text($data.company);
                $contentBlock.find('.position-name').text($data.position);
                $contentBlock.find('.date-name').text($dateDifferenceText);
                $contentBlock.find('.description').text($data.description);
            }

        }, 300);



    // If button.create-new parent is .buttons (the div that shows up after clicking "publish") then it'll fade out content and clear form.
    } else if($(this).parent().is(".buttons")) {
        $successMessage.fadeOut(300);

        setTimeout(function() {
            $successMessageThings.toggleClass('active');
            $modalContent.fadeIn(300);

            $content.find('.success-message svg').remove();
        }, 600);
    }
});




// Check tooltip text when you hover over finish button.
$('.finish-button').hover(function() {
    $(this).next().css({ display: 'none' });
    $content = $(this).closest('.content');
    $form = $content.find('form');

    if( validateForm($form) ) {
        $(this).next().text('Great! Go ahead').css({ display: 'initial' });
    } else {
        $(this).next().text('Please fill the form').css({ display: 'initial' });
    }
});
















// // Modals symbols input, counts symbols and change the color when the limit is reached.
// $("input.title-symbols").keyup(function(){

//     $(this).next().children().text(' ' + $(this).val().length + ' ');

//     if( $(this).val().length >= 35 ) {
//         $(this).next().css('color', '#f8b637');
//     }
//     if( $(this).val().length >= 45 ) {
//         $(this).next().css('color', '#eb2525');
//     }
//     if( $(this).val().length >= 50 ) {
//         $(this).val( $(this).val().substr(0, 50) );
//     }
// });

// // Modals symbols input, counts symbols and change the color when the limit is reached.
// $("textarea.description").keyup(function(){

//     $(this).next().children().text(' ' + $(this).val().length + ' ');

//     if( $(this).parent().parent().parent().parent().parent().attr("id") == "avatarModal" ) {
//         if( $(this).val().length >= 70 ) {
//             $(this).next().css('color', '#f8b637');
//         }
//         if( $(this).val().length >= 85 ) {
//             $(this).next().css('color', '#eb2525');
//         }
//         if( $(this).val().length >= 100 ) {
//             $(this).val( $(this).val().substr(0, 100) );
//         }
//     }
//     if( $(this).parent().parent().parent().parent().parent().attr("id") == "shoutoutModal" ) {
//         if( $(this).val().length >= 325 ) {
//             $(this).next().css('color', '#f8b637');
//         }
//         if( $(this).val().length >= 375 ) {
//             $(this).next().css('color', '#eb2525');
//         }
//         if( $(this).val().length >= 400 ) {
//             $(this).val( $(this).val().substr(0, 400) );
//         }
//     } else {
//         if( $(this).val().length >= 150 ) {
//             $(this).next().css('color', '#f8b637');
//         }
//         if( $(this).val().length >= 185 ) {
//             $(this).next().css('color', '#eb2525');
//         }
//         if( $(this).val().length >= 200 ) {
//             $(this).val( $(this).val().substr(0, 200) );
//         }
//     }
// });