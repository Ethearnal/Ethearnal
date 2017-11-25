
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


//
$('.mdl-checkbox').click(function() {
    $(this).parent().find('.is-checked').removeClass('is-checked');
    $(this).addClass('is-checked');
});



$('input#search-header').keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();

        // Filters and other semi-global variables
        $filters = $('.gigs-page-content .filters');
        $checkedLabel = $filters.find('label.is-checked');

        // Search Engine Variables
        $category = '';
        $jobType = '';
        $experienceLevel = '';
        $budget = '';

        // Search Input Value
        $search = $(this).val().replace(/ /g,"%20").toLowerCase();
        $search = 'title=' + $search;


        $checkedLabel.each(function() {

            if ($(this).parent().hasClass('category')) {
                $checkValue = $(this).find('span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

                if ($checkValue !== '') $category += '&category=' + $checkValue;
            }

            if ($(this).parent().hasClass('job-type')) {
                $checkValue = $(this).find('span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

                if ($checkValue !== '') $jobType += '&job_type=' + $checkValue;
            }

            if ($(this).parent().hasClass('experience-level')) {
                $checkValue = $(this).find('span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

                if ($checkValue !== '') $experienceLevel += '&experience_level=' + $checkValue;
            }

            if ($(this).parent().hasClass('budget')) {
                $checkValue = $(this).find('span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

                if ($checkValue !== '') $budget += '&budget=' + $checkValue;
            }

        });

        $searchQuery = '/api/v1/my/idx/query/objects/?' + $search + $category + $jobType + $experienceLevel + $budget;


        $.ajax({
            url: $searchQuery,
            type: "GET",
            processData: false,
            success: function(result) {
                console.log('works');
            }
        });

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