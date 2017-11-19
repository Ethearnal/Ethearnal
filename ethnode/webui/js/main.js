$( document ).ready(function() {

    // Global variables, defining how many tabs should appear on click and showing them.
    $showJobs = 2;
    $appearOnClick = 3;
    $inputID = 0;

    $(function() {
        var imagesUploaded = 0;
        var imageLimit = 10;
        var photoNumber = 0;
        var imageUploading = false;

        var imageItems = 0;

        function appearUploadedPhoto(photoID, uploadTo, imageSource) {
            $divToAppear = $('<div class="photo-element photo-uploaded'+photoID+'"><a href="#" class="remove" title="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a><img src="'+imageSource+'"></div>')
            $divToAppear.appendTo(uploadTo);
        }

        function appearPhoto(photoID, uploadTo) {
            $divToAppear = $('<div class="photo-element photo'+photoID+'"><a href="#" class="remove" title="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a><div class="progress active"><div class="progress-bar" style="width:0%"></div></div></div>')
            $divToAppear.appendTo(uploadTo);
        }

        $('.timeline .modal-dialog .modal-content .modal-body i.icon-more').click(function() {
            var modalClicked = $(this).attr('data-target');
            var $modalOpened = $(this).closest('.timeline').attr('id');

            $(modalClicked).on('shown.bs.modal', function() {
                if ( $(modalClicked).find('.appearing-content .file-upload .photo-element').length != 0 ) return false;

                var imageNumber = 50;

                $container = $(this).find('.appearing-content .file-upload')
                $container.show();

                $('#' + $modalOpened + ' .modal-dialog .modal-content .modal-body .post .image .items .item').each(function() {
                    $imageSource = $(this).children().attr('src');

                    appearUploadedPhoto(imageNumber, $container, $imageSource);
                    $photoUploadedElement = $(modalClicked + " .appearing-content .file-upload .photo-uploaded" + imageNumber );
                    imageNumber++;
                    $photoUploadedElement.find("a.remove").toggle();

                    $photoUploadedElement.hover(function() {
                        $(this).has('img').css({"background-color": "#000", "border-color": "#f6f7f8"});
                        $(this).has('img').find('img').css("opacity", ".7");
                        $(this).find('a.remove').toggle();
                    }, function() {
                        $(this).has('img').css({"background-color": "#f6f7f8", "border-color": "rgba(0, 0, 0, 0.1)"});
                        $(this).has('img').find('img').css("opacity", "1");
                        $(this).find('a.remove').toggle();
                    });

                    $photoUploadedElement.find('a.remove').click(function(e) {
                        e.preventDefault();
                        $(this).parent().css("background-color", "#f6f7f8");
                        $(this).parent().find(".progress-bar").stop(false, true);
                        $(this).parent().remove();
                        imageNumber--;
                    });
                })
            })
        })

        $(".add-photos-video-btn").on('click touchend', function(e) {
            e.preventDefault();
            if( imagesUploaded >= imageLimit ) return false;
            if( imageUploading ) return false;
            var fileHolder  = $(this).parent().find(".file-upload");
            var fileInput   = $(this).parent().find(".file-upload-input");
            var postBtn     = $(this).parent().parent().find('.buttons button.btn.btn-post');
            var cameraBtn   = $(this).find('a');
            var videoIcon   = '<span class="glyphicon glyphicon-film file-icon" aria-hidden="true"></span>';
            var audioIcon   = '<span class="glyphicon glyphicon-headphones file-icon" aria-hidden="true"></span>';
            var fileIcon    = '<span class="glyphicon glyphicon-file file-icon" aria-hidden="true"></span>';
            var statusAlert = $(this).parent().find('.status-alert');

            $(this).parent().find("input.file-upload-input").trigger('click');
            $(this).parent().find("input.file-upload-input").unbind('change');
            imageUploading = false;
            $(this).parent().find("input.file-upload-input:hidden").on('change', function() {
                var isImage         = $(this).val().match(/(?:jpg|jpeg|bmp|png|gif|tiff)$/igm);
                var isVideo         = $(this).val().match(/(?:3g2|3gp|3gpp|asf|avi|dat|divx|dv|f4v|flv|m2ts|m4v|mkv|mod|mov|mp4|mpe|mpeg|mpeg4|mpg|mts|nsv|ogm|ogv|qt|tod|ts|vob|wmv)$/igm);
                var isAudio         = $(this).val().match(/(?:aif|iff|m3u|m4a|mid|mp3|mpa|ra|wav|wma)$/igm);
                var isFile          = $(this).val().match(/(?:txt|doc|docx|pdf|csv|pps|ppt|pptx|ps|ai|svg|indd|psd|eps)$/igm);
                var fileName        = $(this).val().split('\\').pop().replace(/.jpg|.jpeg|.bmp|.png|.gif|.tiff/i, '');

                postBtn.prop('disabled', true);
                $(':focus').blur();
                fileHolder.show();

                appearPhoto(photoNumber, $(this).parent().find('.file-upload'));
                $photoElement = $(this).parent().find(".file-upload .photo" + photoNumber);
                imagesUploaded++;
                photoNumber++;
                $photoElement.find("a.remove").toggle();
                cameraBtn.css("color", "#5b7fd1");
                imageUploading = true;

                $photoElement.hover(function() {
                    $(this).has('img').css({"background-color": "#000", "border-color": "#f6f7f8"});
                    $(this).has('img').find('img').css("opacity", ".7");
                    $(this).find('a.remove').toggle();
                }, function() {
                    $(this).has('img').css({"background-color": "#f6f7f8", "border-color": "rgba(0, 0, 0, 0.1)"});
                    $(this).has('img').find('img').css("opacity", "1");
                    $(this).find('a.remove').toggle();
                });

                if (isImage) {
                    $photoElement.find(".progress-bar").stop().animate({
                        width: "100%"
                    }, 1500, function() {
                        setTimeout(function() {
                            $photoElement.find('.progress').remove();
                                var reader = new FileReader();
                                reader.onload = function(e) {
                                    if ($photoElement.find('img').length) {
                                        $photoElement.find('img').attr("src", e.target.result);
                                    } else {
                                        $photoElement.append(
                                            $("<img />", {
                                                "src": e.target.result,
                                                "alt": fileName,
                                                "class": "",
                                            })
                                        );
                                    }

                                    var imageUpload = $photoElement.find('img');
                                    var img = new Image();
                                    img.src = imageUpload[0].src;
                                    img.onload = function() {
                                        $photoElement.find(".loading-blocks").remove();
                                        cameraBtn.css("color", "#B3B7BD");
                                        imageUploading = false;
                                        postBtn.prop('disabled', false);
                                        $photoElement.find("a.remove").css({"-webkit-text-fill-color": "#dcdcdc", "-webkit-text-stroke-color": "#565a5e"});
                                        $photoElement.find("a.remove").hover(function(){
                                            $photoElement.css("-webkit-text-fill-color", "#fff");
                                            }, function(){
                                            $photoElement.css("-webkit-text-fill-color", "#dcdcdc");
                                        });
                                        if (img.width < $photoElement.width() || img.width < img.height) {
                                            $photoElement.find("img").addClass('portrait');
                                        } else {
                                            $photoElement.find("img").removeClass('portrait');
                                        }
                                    }
                                }
                                reader.readAsDataURL(fileInput[0].files[0]);

                        }, 300);
                    });
                } else if (isVideo) {
                    $photoElement.find('.progress').remove();
                    postBtn.prop('disabled', false);
                    imageUploading = false;
                    $photoElement.append(videoIcon);
                    cameraBtn.css("color", "#B3B7BD");

                } else if (isAudio) {
                    $photoElement.find('.progress').remove();
                    postBtn.prop('disabled', false);
                    imageUploading = false;
                    $photoElement.append(audioIcon);
                    cameraBtn.css("color", "#B3B7BD");

                } else if (isFile) {
                    $photoElement.find('.progress').remove();
                    postBtn.prop('disabled', false);
                    imageUploading = false;
                    $photoElement.append(fileIcon);
                    cameraBtn.css("color", "#B3B7BD");

                } else {
                    $(".progress-bar").stop().animate({
                        width: "100%"
                    }, 1500, function() {
                        setTimeout(function() {
                            statusAlert.show();
                            $('.btn-close').click(function() {
                                statusAlert.hide();
                                $photoElement.find('.progress').remove();
                                postBtn.prop('disabled', false);
                                $photoElement.remove();
                                cameraBtn.css("color", "#B3B7BD");
                                imageUploading = false;
                            });

                        }, 1000);
                    });
                }
                $photoElement.find('a.remove').click(function(e) {
                    e.preventDefault();
                    $(this).parent().css("background-color", "#f6f7f8");
                    $(this).parent().find(".progress-bar").stop(false, true);
                    $(this).parent().remove();
                    imagesUploaded--;
                });
            });
        });
    });

    // Checks if input.file has changed, if so, checks his ID and stores it into a global variable, then uses that variable to add an ID near the img. You need to create input and image with the same ID and you will have live load image when you will upload it.
    function readURL(input, content) {
        $content = content;

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                if( $inputID == "input-image-avatar" ) {
                    addImage(e.target.result);
                }
                $content.find('img#' + $inputID + '').attr('src', e.target.result).show();
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("input.input-file").change(function(){
        $content = $(this).closest('.content');
        readURL(this, $content);
        $inputID = $(this).attr("id");
    });

    // When you upload a file in an accomplishment modal, it would chance the text.
    $("input[type=file]").on("change", function(){
        $content = $(this).closest('.content');

        // Name of file and placeholder
        var file = this.files[0].name;
        var dflt = $(this).attr("placeholder");
        $labelID = $(this).attr("id");
        $imgClass = $(this).parent().find('.file-input-first-image').attr('class');

        if($(this).val()!=""){
            $content.find("label[for=" + $labelID + "]").text(' ' + file + ' ').addClass('active');
            $content.find('img.' + $imgClass).addClass('active');
        } else {
            $(this).next().text(dflt);
        }
    });



    // Panel heading would have hover effect.
    $('.panel-heading, .timeline-post').hover(
        function() {
            $(this).stop(true, true).animate({ backgroundColor: '#f7f7f7' }, 300);
        }, function() {
            $(this).stop(true, true).animate({ backgroundColor: 'white' }, 300);
        }
    )

    // Owl Graphic Hero UI buttons and hover effect.
    $(".button-prev").click(function () {
        $(this).parent().find('.items').trigger('owl.prev');
    });
    $(".button-next").click(function () {
        $(this).parent().find('.items').trigger('owl.next');
    });
    $( "section.background-image, .post .image" ).hover(function() {
        $(this).find(".button-prev, .button-next").stop(true).fadeIn(300);
    });
    $( "section.background-image, .post .image" ).mouseleave(function() {
        $(this).find(".button-prev, .button-next").stop(true).fadeOut(300);
    });

    // When you click on Top skills and tools down icon, the skills will slide up or slide down.
    $( ".profile-bottom i" ).click(function() {
        $( ".profile-bottom .skills p.more" ).toggleClass('hidden');
        $(this).toggleClass('open');

        if( $(this).hasClass('open') ) {
            $(this).css( { transition: "transform 0.3s", transform: "rotate(180deg)" } )
        } else {
            $(this).css( { transition: "transform 0.3s", transform: "rotate(0deg)" } )
        }
    });

    // When you hover on a profile image, the half-black background would appear with the text of "Change".
    $( ".profile-image" ).hover(function() {
        $(this).find(".text-on-image").stop(true, true).fadeToggle(150);
    });



    // Semantic UI, Perfect Scrollbar plugins initializations and many others functions related to dropdowns.
    $(function() {
        if( $(window).width() < 768 ) {
            var myApp = new Framework7();
            var $$ = Dom7;

            $$('.swipeout').on('open', function (e) {
                e.preventDefault();
                $(this).fadeOut();
            });
        }

        // $('.ui .menu, .panel-body').perfectScrollbar();
        $('section.background-image .items, .post .image .items').owlCarousel({
            singleItem: true
        });
        $('.ui.dropdown').dropdown();


        $('.form-group i.remove.icon').click(function() {
            $(this).parent().find('label').removeClass('has-file').html('Add Photos');
            $(this).fadeOut();
        })

        $('.skills-select, .tools-select').click(function() {
            $(this).find(".menu .item").removeClass('selected');
        })
    });
});


// Require function
function require(script) {
    $.ajax({
      dataType: "jsonp",
      url: script,
      }).done(function ( data ) {
      // do my stuff
    });
}








// COLORS
// Blue #1 = #92A8D1
// Blue #2 = #89ABE3

// Rose #1 = #F7CAC9
// Rose #2 = #F2DDDE




// GETTING DATA FROM profile.json
$(function () {

    $.ajax({
        type: 'GET',
        url: 'profile_clean.json',
        dataType: 'text',
        success: function(data) {
            var profile = JSON.parse(data);

            $firstname = null; $lastname = null; $position = null; $company = null; $city = null; $country = null; $positionInfo = null; $i = 0;


            // Appends profile's FULL NAME.
            var name = profile.name;
            $.each(name, function(i, names) {
                $firstname = names.first;
                $lastname = names.last;
            });

            // Appends a Job Experience on your profile page.
            var workExperience = profile.workExperience;
            $.each(workExperience, function(i, experience) {
                createLE(experience, 'job');
            });

            // Appends a Education on your profile page.
            var educations = profile.education;
            $.each(educations, function(i, education) {
                createLE(education, 'education');
            });

            // Appends a Education on your profile page.
            var languages = profile.languages;
            $.each(languages, function(i, language) {
                createLE(language, 'language');
            });

            seeButtons();

            updateProfile(profile);

            // Adding profile reputation .navbar-collapse #alert-navbar
            $('li.asset#alert-navbar a .round-number span').text(profile.reputation);


            // Adding profile pictures to the page.
            $('.profile-image img').attr('src', '/api/v1/profile/?q=avatar');
            $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
            $('li.profile img.profile-picture').attr('src', '/api/v1/profile/?q=avatar');
            $('li.profile img.profile-picture').attr('alt', $firstname + ' ' + $lastname);

            // Appends each SKILL.
            var skill = profile.skills;
            var iSkill = 0;
            $.each(skill, function(i, skills) {
                $('.profile-bottom .skills').append("<p id='skill-dropdown" + iSkill + "'>" + skills.name + "<span> " + skills.experience + "</span></p><ul for='skill-dropdown" + iSkill + "' class='mdl-menu mdl-menu--bottom-left mdl-js-menu mdl-js-ripple-effect'><li class='mdl-menu__item open-modal' open-modal='#edit-skill'>Edit</li></ul>");
                iSkill++;
            });
        }
    })
})




// FUNCTIONS

// MODALS

// Create Life Experience div based on input values.
require("js/functions/modals/createLE.js");

// Appears .success-message everytime you update or create a LE
require("js/functions/modals/appearSuccessMessage.js");

// Loads inputs text when you click on "EDIT" button and the edit modal appears
require("js/functions/modals/loadInputsText.js");

// openModal() and closeModal() functions
require("js/functions/modals/openClose.js");

// This is a function to generate a position information div
require("js/functions/modals/positionInformationDiv.js");

// All the functions related to time. Such as GetTimeDifference, etc.
require("js/functions/modals/timesFunctions.js");

// Initializes the Date Picker.
require("js/functions/modals/datePickerInit.js");

// Loads profile modal inputs based on profile
require("js/functions/modals/loadProfileInputs.js");

// Updates the Profile.
require("js/functions/modals/updateProfile.js");

// Resets images inputs in modals
require("js/functions/modals/resetImages.js");

// Collects the data
require("js/functions/modals/collectData.js");




// OTHER FUNCTION

// Include all functions
require('js/functions.js');

// Include modals animation JS file.
require("js/modals-animation.js");