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

// Modals symbols input, counts symbols and change the color when the limit is reached.
$("input.title-symbols").keyup(function(){

    $(this).next().children().text(' ' + $(this).val().length + ' ');

    if( $(this).val().length >= 35 ) {
        $(this).next().css('color', '#f8b637');
    }
    if( $(this).val().length >= 45 ) {
        $(this).next().css('color', '#eb2525');
    }
    if( $(this).val().length >= 50 ) {
        $(this).val( $(this).val().substr(0, 50) );
    }
});

// Modals symbols input, counts symbols and change the color when the limit is reached.
$("textarea.description").keyup(function(){

    $(this).next().children().text(' ' + $(this).val().length + ' ');

    if( $(this).parent().parent().parent().parent().parent().attr("id") == "avatarModal" ) {
        if( $(this).val().length >= 70 ) {
            $(this).next().css('color', '#f8b637');
        }
        if( $(this).val().length >= 85 ) {
            $(this).next().css('color', '#eb2525');
        }
        if( $(this).val().length >= 100 ) {
            $(this).val( $(this).val().substr(0, 100) );
        }
    }
    if( $(this).parent().parent().parent().parent().parent().attr("id") == "shoutoutModal" ) {
        if( $(this).val().length >= 325 ) {
            $(this).next().css('color', '#f8b637');
        }
        if( $(this).val().length >= 375 ) {
            $(this).next().css('color', '#eb2525');
        }
        if( $(this).val().length >= 400 ) {
            $(this).val( $(this).val().substr(0, 400) );
        }
    } else {
        if( $(this).val().length >= 150 ) {
            $(this).next().css('color', '#f8b637');
        }
        if( $(this).val().length >= 185 ) {
            $(this).next().css('color', '#eb2525');
        }
        if( $(this).val().length >= 200 ) {
            $(this).val( $(this).val().substr(0, 200) );
        }
    }
});




// MATERIAL DESIGN DATE PICKER
$(function() {
    $datePickers = 3;

    $('#date-to').bootstrapMaterialDatePicker({ weekStart: 0, time: false });
    $('#date-from').bootstrapMaterialDatePicker({ weekStart: 0, time: false }).on('change', function(e, date) {
        $('#date-to').bootstrapMaterialDatePicker('setMinDate', date)
    })
});








$('.modal-box button').click(function() {

    $modalID = $(this).closest('.modal-box').attr('id');

    // If its a CLOSE button it'll close the modal only.
    if($(this).hasClass('close-button')) {
        closeModal($modalID);
        if(!$(this).parent().is('.buttons')) return; // Checks if the button that is clicked is within the Modal > Confirmation page > Button div.
    }


    $content = $(this).closest('.content');
    $modalBody = $content.find('.modal-body');
    $modalFooter = $content.find('.modal-footer');
    $modalHeader = $content.find('.modal-header');
    $form = $content.find('form');

    $succMsgContent = $content.find('.success-message__content');
    $succMsgTitle = $content.find('.success-message__title');
    $iconCheckCircle = $content.find('.icon-checkmark circle');
    $buttons = $content.find('.success-message .buttons');


    // BUTTON.PUBLISH-BUTTON
    if($(this).hasClass('publish-button')) {

        // console.log($form.serialize());

        $data = {
            company: $form.find('input#company-name').val(),
            position: $form.find('input#position').val(),
            description: $form.find('input#description').val(),
            startDate: $form.find('input#date-from').val(),
            endDate: $form.find('input#date-to').val()
        }

        console.log($data);

        // $.ajax({
        //     type: "POST",
        //     url: '/profile.json',
        //     data: $form.serialize(),
        //     success: function() {
        //       console.log('success');
        //     },
        //     contentType: "application/json",
        //     dataType: 'json'
        // });

        $modalBody.fadeOut(300);
        $modalFooter.fadeOut(300);
        $modalHeader.fadeOut(300);

        setTimeout(function() {

            // Resetting the form.
            $form[0].reset();
            $form.find('.is-dirty').removeClass('is-dirty');
            $form.find('.is-focused').removeClass('is-focused');

            $iconCheckCircle.toggleClass('active');
            $succMsgContent.toggleClass('active');
            $succMsgTitle.toggleClass('active');
            $buttons.toggleClass('active');

            // Creates SVG if it's not created yet.
            if($content.find('.success-message svg')) {
                var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="154px" height="154px"> <g fill="none" stroke="#5CAB7D" stroke-width="2"> <circle cx="77" cy="77" r="72" style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"></circle> <circle id="colored" fill="#5CAB7D" cx="77" cy="77" r="72" style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"></circle> <polyline stroke="#FFF" stroke-width="8" points="43.5,77.8 63.7,97.9 112.2,49.4" style="stroke-dasharray:100px, 100px; stroke-dashoffset: 200px;" class="st0"></polyline> </g> </svg>'
                $(svg).insertBefore('.success-message h1');
            }
            $('.success-message').fadeIn(300);
        }, 300);

    // BUTTON.CREATE-NEW
    } else if($(this).parent().is(".buttons")) {
        // closeModal($modalID);

        $content.find('.success-message').fadeOut(300);

        setTimeout(function() {
            $iconCheckCircle.toggleClass('active');
            $succMsgContent.toggleClass('active');
            $succMsgTitle.toggleClass('active');
            $buttons.toggleClass('active');

            $modalBody.fadeIn(300);
            $modalFooter.fadeIn(300);
            $modalHeader.fadeIn(300);

            $content.find('.success-message svg').remove();
        }, 600);
    }
});











// // When you click on Modal Footer button, that modal content would slide out and text would slide in, also, buttons text would change.
// $(".modal-footer buttonnnn").click(function() {

//     // Variables and functions.
//     var $modal = $(this).parent().parent().parent().parent();
//     var $modalsID = $modal.attr("id");
//     var $animationSpeed = 500;
//     var $lastword = "none";
//     var $animationName = "fade";
//     var $successPost = "none";
//     var $modalHeader = "none";


//     function fadeOut(divs) {
//         $(divs).hide($animationName, $animationSpeed, function() {
//             $successPost.show($animationName, $animationSpeed);
//         });

//         if( divs.parent().parent().parent().parent().attr("id") != "accomplishmentModal" ) {
//             $modalHeader.css({borderBottom: 'none'});
//         }
//     }

//     function fadeIn(divs) {
//         $successPost.hide($animationName, $animationSpeed, function() {
//             $(divs).show($animationName, $animationSpeed);
//             if( divs.parent().parent().parent().parent().attr("id") != "accomplishmentModal" ) {
//                 $modalHeader.css({borderBottom: '1px solid #e6e7e9'});
//             }
//         });
//     }

//     if( $(this).hasClass("new-post") ) {

//         // If modal ID == accomplishment modal, then it would slide every input differently. If not, then it would apply other slides effect.
//         if( $modalsID == "accomplishmentModal" ) {

//             // Variables
//             var $modalContent = $("#accomplishmentModal").children().children()
//             var $contentToFadeIn = $modalContent.find(".modal-header .modal-image, .modal-header .modal-inputs, .modal-header .form-group, .modal-body .selector");
//             $successPost = $modalContent.find(".modal-body h3.publish-modal-heading, .modal-body h4.publish-modal-description");

//             // Fades in content.
//             fadeIn($contentToFadeIn);

//             // Sets value to zero
//             $modalContent.find(".modal-header .modal-inputs input, .modal-header .modal-inputs textarea, .modal-header .form-group input, .modal-body .selector input, .modal-body .add-team-members .ui .menu .ui input, .modal-body .add-team-members .ui input").val('');
//             $modalContent.find(".modal-body .add-team-members .ui .label, .modal-body .select-something .ui.label").css("display", "none", "!important").removeClass("visible");
//             $modalContent.find(".modal-body .add-team-members .ui .default, .modal-body .select-something .default").css("display", "initial");
//             $modalContent.find(".modal-header .form-group label").text("Add image or video");

//         } else {

//             // Variables.
//             var $otherModalsContent = $(this).parent().parent().parent().parent(".modal:not(#accomplishmentModal)").children().children();
//             var $contentToFadeIn = $otherModalsContent.find(".modal-header h3, .modal-body .form-group, .modal-body .modal-inputs, .modal-header .avatar-message");
//             $successPost = $otherModalsContent.find(".modal-body h3.publish-modal-heading, .modal-body h4.publish-modal-description");
//             $modalHeader = $otherModalsContent.find(".modal-header");

//             // Fades in content.
//             fadeIn($contentToFadeIn);

//             // Sets value to zero
//             $otherModalsContent.find(".modal-body .modal-group input, .modal-body .modal-inputs input, .modal-body .modal-inputs textarea").val('');
//             $otherModalsContent.find(".modal-body .modal-inputs .ui .text").empty();
//             $otherModalsContent.find(".modal-body .modal-inputs .ui .menu .item").removeClass("selected").removeClass("active");

//             if( $otherModalsContent.parent().parent().attr("id") == "educationModal" ) {
//                 $otherModalsContent.find(".modal-body .modal-inputs .ui .text").text("School / University");
//             }
//             if( $otherModalsContent.parent().parent().attr("id") == "jobModal" ) {
//                 $otherModalsContent.find(".modal-body .modal-inputs .ui .text").text("Company");
//             }

//             if( $otherModalsContent.parent().parent().attr("id") == "avatarModal" ) {
//                 $otherModalsContent.find(".modal-body .modal-inputs .avatar-company .text").text("Company");
//                 $otherModalsContent.find(".modal-body .modal-inputs .avatar-country .text").text("Select Country");
//                 $otherModalsContent.find(".modal-body .modal-inputs .avatar-skills .text").text("Select Skills");
//                 $otherModalsContent.find(".modal-body .modal-inputs .avatar-skills a.label").remove();
//                 $otherModalsContent.find(".modal-body .modal-inputs .avatar-skills .menu .item").removeClass("active").removeClass("filtered");
//                 $otherModalsContent.find(".modal-body .modal-inputs .show-image").remove();
//                 $otherModalsContent.find('.modal-body .form-group img#input-image-avatar').cropper('destroy');
//             }

//             $otherModalsContent.find(".modal-body .form-group label").text("Add image or video");
//             $otherModalsContent.find(".modal-body .form-group img:last-child").attr("src", "").hide();
//             $otherModalsContent.find(".modal-body .form-group input").val("");
//             $otherModalsContent.find(".modal-body .modal-inputs p.symbols span").text("0");
//         }

//         if( $modalsID == "inviteModal" ) {

//             $(this).removeClass("new-post").addClass("publish").text('Send!');
//         } else {

//             $(this).removeClass("new-post").addClass("publish").text('Publish');
//             $(this).parent().find("button.close-modal").hide();
//             $(this).parent().find("button.close-avatar-modal").show();
//             $(this).parent().find("button.save-draft").show();
//         }
//         return false;
//     }

//     // Checks if this button has class of "publish".
//     if( $(this).hasClass("publish") ) {

//         // If modal ID == accomplishment modal, then it would slide every input differently. If not, then it would apply other slides effect.
//         if( $modalsID == "accomplishmentModal" ) {

//             // Variables
//             var $contentToFadeOut = $("#accomplishmentModal").children().children().find(".modal-header .modal-image, .modal-header .modal-inputs, .modal-header .form-group, .modal-body .selector");
//             $successPost = $("#accomplishmentModal").children().children().find(".modal-body h3.publish-modal-heading, .modal-body h4.publish-modal-description");

//             // Fades out content.
//             fadeOut($contentToFadeOut);

//             $lastword = "post";
//             $successPost.find("span").text("accomplishment");
//         } else {

//             // Variables.
//             var $otherModalsContent = $(this).parent().parent().parent().parent(".modal:not(#accomplishmentModal)").children().children();
//             var $contentToFadeOut = $otherModalsContent.find(".modal-header h3, .modal-body .form-group, .modal-body .modal-inputs, .modal-header .avatar-message");
//             $successPost = $otherModalsContent.find(".modal-body h3.publish-modal-heading, .modal-body h4.publish-modal-description");
//             $modalHeader = $otherModalsContent.find(".modal-header");

//             // Fades out/fades in content.
//             fadeOut($contentToFadeOut);

//             // Gets last word of the modal heading and changes it.
//             $lastword = $otherModalsContent.find(".modal-header h3").text().match(/\w+$/)[0];
//             $successPost.find("span").text($lastword);

//         }

//         if( $modalsID == "inviteModal" ) {

//             $(this).addClass("new-post").removeClass("publish").text('New ' + $lastword + '');
//         }
//         if( $modalsID == "shoutoutModal" ) {

//             $(this).addClass("new-post").removeClass("publish").text('New shout-out');
//         } else {

//             $(this).addClass("new-post").removeClass("publish").text('New ' + $lastword + '');
//             $(this).parent().find("button.close-modal").show();
//             $(this).parent().find("button.save-draft").hide();
//             $(this).parent().find("button.close-avatar-modal").hide();
//         }
//         return false;

//     }
//     if( $(this).hasClass("save-draft") ) {
//         alert("Currently 'Save as Draft' feature is turned off, try again later.");
//     }
// });