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
    function readURL(input) {

        if (input.files && input.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                if( $inputID == "input-image-avatar" ) {
                    addImage(e.target.result);
                }
                $('img#' + $inputID + '').attr('src', e.target.result).show();
            }

            reader.readAsDataURL(input.files[0]);
        }
    }

    $("input.input-file").change(function(){
        readURL(this);
        $inputID = $(this).attr("id");
    });

    // When you upload a file in an accomplishment modal, it would chance the text.
    $("input[type=file]").on("change", function(){

        // Name of file and placeholder
        var file = this.files[0].name;
        var dflt = $(this).attr("placeholder");
        $labelID = $(this).attr("id");
        $imgClass = $(this).parent().find('.file-input-first-image').attr('class');

        if($(this).val()!=""){
            $("label[for=" + $labelID + "]").text(' ' + file + ' ').addClass('active');
            $('img.' + $imgClass).addClass('active');
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

        $('.ui .menu, .panel-body').perfectScrollbar();
        $('section.background-image .items, .post .image .items').owlCarousel({
            singleItem: true
        });
        $('.ui.dropdown').dropdown();

        $('.skills-select, .tools-select').dropdown({
            allowAdditions: true,
            maxSelections: 5
        });

        $('.institution-select, .company-select').dropdown({
            allowAdditions: true,
            hideAdditions: false
        });

        $('.company-selection').dropdown({
            allowAdditions: true,
            hideAdditions: false,
            onChange: function() {
                $(this).find('i.dropdown.icon').css('top', '30%');
                $(this).find('i.remove.icon').fadeIn();
            }
        });

        $('.ui.dropdown .remove.icon').on('click', function(e){
            $(this).parent('.dropdown').dropdown('clear');
            e.stopPropagation();
            $(this).parent('.dropdown').css('top', '0px');
            $(this).fadeOut();
        });

        $('.form-group i.remove.icon').click(function() {
            $(this).parent().find('label').removeClass('has-file').html('Add Photos');
            $(this).fadeOut();
        })

        $('.skills-select, .tools-select').click(function() {
            $(this).find(".menu .item").removeClass('selected');
        })

        // Semantic UI popup functions
        var resizePopup = function(){$('.ui.popup').css('max-height', $(window).height());};

        $(window).resize(function(e){
            resizePopup();
        });

        $('.ui.button').popup({
            on: 'hover'
        });

        $('.timeline-post .post-input textarea.form-control').click(function() {
            $(this).next().fadeIn();
            $(this).parent().next().fadeIn();
            $(this).attr('rows', 3)
        });

        $('.timeline-post .buttons button.btn-cancel').click(function() {
            $(this).parent().prev().find('.appearing-content').fadeOut();
            $(this).parent().fadeOut();
            $(this).parent().prev().find('textarea.form-control').attr('rows', 1);
        });
    });
});


// Require function
function require(script) {
    $.ajax({
      dataType: "jsonp",
      url: script ,
      }).done(function ( data ) {
      // do my stuff
    });
}






// TODO:
// Add ability to add education or job.
// Add ability to change education or job information.




// COLORS
// Blue #1 = #92A8D1
// Blue #2 = #89ABE3

// Rose #1 = #F7CAC9
// Rose #2 = #F2DDDE



// $.getJSON( "/profile.json", function( data ) {
//     // now data is JSON converted to an object / array for you to use.
//     // alert( data[1]. ) // Tim Robbins, Morgan Freeman, Bob Gunton

//     // var newMovie = {cast:'Jack Nicholson', director:...} // a new movie object

//     // $data = [
//     //     {
//     //         company: 'NewCompany',
//     //         position: 'NewPosition',
//     //         description: 'NewDescription',
//     //         time: [
//     //             { from: '11/2017', to: '12/2017' }
//     //         ]
//     //     }
//     // ];




//     // add a new movie to the set
//     data.push({ reputation: 100, description: 'testing' });
// });


// GETTING DATA FROM profile.json
$(function () {

    $.ajax({
        type: 'GET',
        url: 'profile.json',
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

            // Appends profile's JOB (position & company)
            var job = profile.job;
            $.each(job, function(i, jobs) {
                $position = jobs.position;
                $company = jobs.company;
            });

            // Appends profile's LOCATION (city & country)
            var location = profile.location;
            $.each(location, function(i, locations) {
                $city = locations.city;
                $country = locations.country;
            });

            // Appends a Job Experience on your profile page.
            var workExperience = profile.workExperience;
            var iExperience = 0;
            $.each(workExperience, function(i, experience) {

                $dropdownID = 'job' + iExperience;
                $timeFrom = null; $timeTo = null; $dateDifference = null;
                $positionInfo = positionInformation(experience.time, experience.company, experience.position, 'work');

                // Creates two letters, so if there's no Image it'd put first two letters as logo.
                var twoLetters = experience.company.substring(0, 3);

                // Creating whole 'default-job.jade' file. Two divs with many divs inside. This will show the job experience.
                var imageDiv = '<div class="image"><img src="' + experience.image + '" alt="' + experience.company + '"><div class="dont-have-logo">' + twoLetters + '</div></div>';

                var dropdownButton = '<button id="dropdown' + $dropdownID + '" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

                var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdown' + $dropdownID + '"><li class="mdl-menu__item open-modal" open-modal="#edit-job">Edit</li><li class="mdl-menu__item" disabled>Delete</li></ul>';

                var jobDescriptionDiv = '<div class="job-description col-lg-8 col-md-7 col-sm-8 col-xs-12">' + dropdownButton + dropdownUL + '<p class="description">' + experience.description + '</p></div>';

                var mainInformationDiv = '<div class="main-information col-lg-4 col-md-5 col-sm-4 col-xs-12">' + imageDiv + $positionInfo + '</div>';

                $job = $('<div class="job life-experience col-xs-12">' + mainInformationDiv + jobDescriptionDiv + '</div>');
                var jobDiv = $job.get(0).outerHTML;


                // Creates Job Div.
                $(jobDiv).insertBefore('.jobs-container .see-more');

                // Adds +1 everytime it loads a new job. It's used only for dropdowns.
                iExperience++;
            });


            // Appends a Education on your profile page.
            var educations = profile.education;
            var iEducation = 0;
            $.each(educations, function(i, education) {

                $dropdownID = 'edu' + iEducation;

                $timeFrom = null; $timeTo = null; $dateDifference = null;

                $positionInfo = positionInformation(education.time, education.course, education.institution, 'education');

                // Creates two letters, so if there's no Image it'd put first two letters as logo.
                var twoLetters = education.institution.substring(0, 3);

                // Creating whole 'default-job.jade' file. Two divs with many divs inside. This will show the job experience.
                var imageDiv = '<div class="image"><img src="' + education.image + '" alt="' + education.institution + '"><div class="dont-have-logo">' + twoLetters + '</div></div>';

                var dropdownButton = '<button id="dropdown' + $dropdownID + '" class="mdl-button mdl-js-button mdl-button--icon dropdown-button"><i class="material-icons">more_vert</i></button>';

                var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdown' + $dropdownID + '"><li class="mdl-menu__item open-modal" open-modal="#edit-education">Edit</li><li class="mdl-menu__item" disabled>Delete</li></ul>';

                var educationDescriptionDiv = '<div class="education-description col-lg-8 col-md-7 col-sm-8 col-xs-12">' + dropdownButton + dropdownUL + '<p class="education-paragraph description">' + education.description + '</p></div>';

                var mainInformationDiv = '<div class="main-information col-lg-4 col-md-5 col-sm-4 col-xs-12">' + imageDiv + $positionInfo + '</div>';

                $education = $('<div class="education life-experience col-xs-12">' + mainInformationDiv + educationDescriptionDiv + '</div>');
                var educationDiv = $education.get(0).outerHTML;


                // Creates Job Div.
                $(educationDiv).insertBefore('.education-container .see-more');

                // Adds +1 everytime it loads a new job. It's used only for dropdowns.
                iEducation++;
            });

            seeButtons();


            // Variables for texts. Just to make it easy to read & understand.
            var $h2 = $('<h2>' + $firstname + ' ' + $lastname + '</h2>');
            var $h5 = $('<h5 class="profile-information-position">' + $position + ' at <strong>' + $company + '</strong></h5>');
            var $p = $('<p>' + $city + ', ' + $country + '</p>');

            // This variable combines everything together.
            var textProfile = $h2.get(0).outerHTML + $h5.get(0).outerHTML + $p.get(0).outerHTML;



            // And this inserts all the text to the .profile-upper div
            $(textProfile).insertAfter(".profile-upper .profile-image");

            // Adding profile description .profile-description
            $('.profile-description').append('<p>' + profile.description + '</p>');

            // Adding profile reputation .navbar-collapse #alert-navbar
            $('li.asset#alert-navbar a .round-number span').text(profile.reputation);

            // Adding name to the header right side.
            $('ul.navbar-nav.visible-xs li a').text($firstname);
            $('li.profile span').text($firstname);

            // Adding profile pictures to the page.
            $('.profile-image img').attr('src', profile.profilePicture);
            $('.profile-image img').attr('alt', $firstname + ' ' + $lastname);
            $('li.profile img.profile-picture').attr('src', profile.profilePicture);
            $('li.profile img.profile-picture').attr('alt', $firstname + ' ' + $lastname);

            // Appends each SKILL.
            var skill = profile.skills;
            $.each(skill, function(i, skills) {
                $('.profile-bottom .skills').append("<p>" + skills.name + "<span> " + skills.experience + "</span></p>")
            });
        }
    })
})



// Include all functions
require('js/functions.js');

// Include modals animation JS file.
require("js/modals-animation.js");