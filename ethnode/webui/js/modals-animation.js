
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




// MATERIAL DESIGN DATE PICKER
$(function() {
    $datePickers = 3;
});


$('body').delegate('li.open-modal', 'click', function(e) {
    e.preventDefault();
    $modalID = $(this).attr('open-modal');
    $content = $($modalID).find('.modal-box-content .content');
    $form = $content.find('form');
    $lifeExperienceDiv = $(this).closest('.life-experience');

    // Dates inputs
    $inputDateFrom = $form.find('input.date-started');
    $inputDateTo = $form.find('input.date-ended');

    // Removing .success-message SVG
    $content.find('.success-message svg').remove();

    // Open modal
    openModal($modalID);

    // Functions for particular modals.
    if($modalID == "#edit-job" || $modalID == "#edit-education") loadInputsText($form, $lifeExperienceDiv);
    if($modalID == "#add-job") datePickerInit($inputDateFrom, $inputDateTo);
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

        if(!validateForm($form)) return; // Return if form isn't filled.

        // Collects data and turns it into a JSON.
        $data = collectJobData($form);
        console.log($data);

        // Fading out the initial modal and fading in success message.
        $modalContent.fadeOut(300);

        setTimeout(function() {
            if($modalID == 'add-job') clearForm($form);
            appearSuccessMessage($content);
        }, 300);

    // BUTTON.CREATE-NEW
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
        $(this).next().text('Great! Go ahead!').css({ display: 'initial' });
    } else {
        $(this).next().text('Ya need to fill the form!').css({ display: 'initial' });
    }
});











// $('li.open-modal[open-modal="#edit-job"]').click(function() {
//     $modalID = $(this).attr('open-modal');
//     $content = $($modalID).find('.modal-box-content .content');
//     $form = $content.find('form');
//     $job = $(this).closest('.life-experience');
//     $date = $job.find('p.date-name').text();
//     $dateSplit = $date.split('-');
//     $dateSplitPresent = $dateSplit[1].split('(');
//     $dateFrom = $dateSplit[0];
//     $dateTo = $dateSplitPresent[0];

//     // Removing SVG.
//     $content.find('.success-message svg').remove();

//     // Going thru each INPUT field, and adding value to them.
//     var findings = $form.find('input, textarea');
//     $.each(findings, function(i, field) {
//         $id = $(field).attr('id');
//         $inputDateFrom = $content.find('.date-started');
//         $inputDateTo = $content.find('.date-ended');
//         $text = $job.find('.' + $id).text();
//         $form.find('input#' + $id + ':not(.date-ended), textarea#' + $id).val($text).parent().addClass('is-dirty');

//         if( $(field).hasClass('date-started') || $(field).hasClass('date-ended') ) {

//             if(!wordInString($date, 'Present')) {
//                 $inputDateTo.bootstrapMaterialDatePicker({format: "MM/YYYY", weekStart: 0, time: false, currentDate: $dateTo }).parent().addClass('is-dirty');
//             } else {
//                 $inputDateTo.bootstrapMaterialDatePicker({weekStart: 0, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
//                     $inputDateTo.parent().addClass('is-dirty');
//                 });
//             }

//             $inputDateFrom.bootstrapMaterialDatePicker({weekStart: 0, currentDate: $dateFrom, time: false, format: "MM/YYYY"}).on('change', function(e, date) {
//                 $inputDateTo.bootstrapMaterialDatePicker('setMinDate', date);
//             });
//         }
//     })
// });

// $('li.open-modal[open-modal="#add-job"]').click(function() {
//     $modalID = $(this).attr('open-modal');
//     $content = $($modalID).find('.modal-box-content .content');
//     $modalBody = $content.find('.modal-body');
//     $form = $modalBody.find('.modal-inputs form');

//     $content.find('.success-message svg').remove();

//     $inputDateFrom = $form.find('input.date-started');
//     $inputDateTo = $form.find('input.date-ended');

//     datePickerInit($inputDateFrom, $inputDateTo);
// });



















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