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

    // Require function
    function require(script) {
        $.ajax({
          dataType: "jsonp",
          url: script ,
          }).done(function ( data ) {
          // do my stuff
        });
    }

    // Checks if input.file has changed, if so, checks his ID and stores it into a global variable, then uses that variable to add an ID near the img. You need to create input and image with the same ID and you will have live load image when you will upload it. I know, I'm genius.
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

    // Removing auto zoom function for mobile phones when font size is lower than 16px
    $("input[type=text], textarea").on({ 'touchstart' : function() {
        zoomDisable();
    }});
    $("input[type=text], textarea").on({ 'touchend' : function() {
        setTimeout(zoomEnable, 500);
    }});

    function zoomDisable() {
        $('head meta[name=viewport]').remove();
        $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0" />');
    }

    function zoomEnable() {
        $('head meta[name=viewport]').remove();
        $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=1" />');
    }


    // MATERIAL DESIGN DATE PICKER
    $(function() {
        $datePickers = 3;

        $('#date-end0').bootstrapMaterialDatePicker({ weekStart: 0, time: false });
        $('#date-start0').bootstrapMaterialDatePicker({ weekStart: 0, time: false }).on('change', function(e, date) {
            $('#date-end0').bootstrapMaterialDatePicker('setMinDate', date)
        })

        $('#date-end1').bootstrapMaterialDatePicker({ weekStart: 0, time: false });
        $('#date-start1').bootstrapMaterialDatePicker({ weekStart: 0, time: false }).on('change', function(e, date) {
            $('#date-end1').bootstrapMaterialDatePicker('setMinDate', date)
        })

        $('#date-end2').bootstrapMaterialDatePicker({ weekStart: 0, time: false });
        $('#date-start2').bootstrapMaterialDatePicker({ weekStart: 0, time: false }).on('change', function(e, date) {
            $('#date-end2').bootstrapMaterialDatePicker('setMinDate', date)
        })
    });

    var $profileFixTop = $('.profile-information-before-fixed').offset().top - 260;

    // Make the profile documentation fixed as page scrolls.
    $(window).scroll(function() {

        if( $(window).width() >= 1200 ) {
            var currentScroll = $(window).scrollTop();

            if (currentScroll >= $profileFixTop) {
                $('.profile-information-fixed').removeClass('hidden');
                $('.profile-information-before-fixed').addClass('hidden');
                $('.profile-information-after-fixed').removeClass('hidden');
            }

            if (currentScroll < $profileFixTop ) {
                $('.profile-information-fixed').addClass('hidden');
                $('.profile-information-before-fixed').removeClass('hidden');
                $('.profile-information-after-fixed').addClass('hidden');
            }
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

    // Change the color of the assets in the header on hover
    $("ul.nav.navbar-right li.asset i").hover(function() {
        if( $(this).parent().attr("id") == "comment-navbar" ) {
            $(this).toggleClass("icon-comment-filled").toggleClass("icon-filled");
        }
        if( $(this).parent().attr("id") == "alert-navbar" ) {
            $(this).toggleClass("icon-bell-filled").toggleClass("icon-bell");
        }
    })

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

    $(".avatar-message i").click(function() {
        $(this).parent().fadeOut();
    })

    // Include modals animation JS file.
    require("js/modals-animation.js");

    // When you click on the item in Modal dropdown selector, it would set margin-top to 25 pixels to make it look good.
    $( ".item" ).click(function() {
        $(this).parent().parent().not("#accomplishment-ui").not(".post-input-dropdowns").animate({ "margin-top": "25px"}, "fast");
    });

    $("input.input-file").change(function(){
        readURL(this);
        $inputID = $(this).attr("id");
    });

    // If you click on navigation tabs, it checks if its a shout-out tab, if so, appears blue shoutout button and disappears yellow plus button.
    $(".profile-documentation ul.nav li").click(function() {
        if( $(this).hasClass("jobs-li") ) {
            $(".plusIcon").stop(true, true).fadeIn(300);
            // $(".shoutoutIcon").stop(true, true).fadeIn(300);
        } else {
            $(".plusIcon").stop(true, true).fadeOut(300);
            // $(".shoutoutIcon").stop(true, true).fadeOut(300);
        }
    });

    // When you upload a file in an accomplishment modal, it would chance the text.
    $("input[type=file]").on("change", function(){

        // Name of file and placeholder
        var file = this.files[0].name;
        var dflt = $(this).attr("placeholder");

        if($(this).val()!=""){
            $("label[for=" + $(this).attr("id") + "]").text(' ' + file + ' ');
        } else {
            $(this).next().text(dflt);
        }
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

    // When you hover on a tab, the bullet points would fade in.
    $( ".job, .story, .shoutout, .education" ).hover(function() {
        if( $(window).width() > 992 ) {
            $(this).find(".dropdown.more i").stop(true).fadeToggle("fast");
        }
    });

    // When you hover on a profile image, the half-black background would appear with the text of "Change".
    $( ".profile-image" ).hover(function() {
        $(this).find(".text-on-image").stop(true, true).fadeToggle(150);
    });

    // -- FUNCTION of {JOBS} SEE MORE START
    $(function () {

        // Show jobs and education divs on the page when it's loaded.
        $("#jobs .job:lt("+$showJobs+")").show();
        $("#jobs .education:lt("+$showJobs+")").show();

        // When you click on .see-less button, it will disappear 3 tabs out of the tablist every time, until reaching the minimum limit of 3 tabs that needs to show all the time.
        $(".see-less").click(function() {

            // Checks if the X is smaller than 3, if true, it would stop disappearing tabs.
            $showJobs = ($showJobs - $appearOnClick <= 0 ) ? $appearOnClick : $showJobs - $appearOnClick;
            $(this).parent().find(".life-experience").not(":lt("+$showJobs+")").stop(true, true).slideUp();

            // Hides .see-less and adds .see-more button.
            if( $showJobs <= 2 ) {

                $(this).parent().find(".see-more").stop(true, true).show();
                $(this).stop(true, true).hide();
            }
        });

        // When you click on .see-more button, it will appear 3 tabs in the tablist every time, until reaching the maximum limit, which is defined by how many tabs is created, so if you have experience in 10 jobs, it will appear 3 tabs until reaching the limit of 10.
        $(".see-more").click(function() {

            // Defines the size limit of the tabs and checks if it's bigger, then it would not show anymore tabs and process a function below. If it's smaller, it would add 3 additional tabs.
            $sizePanels = $(this).parent().find(".life-experience").length;
            $showJobs = ($showJobs <= $sizePanels) ? $showJobs+$appearOnClick : $sizePanels;
            $(this).parent().find(".life-experience:lt("+$showJobs+")").stop(true, true).slideDown();

            // Checks if X is bigger or equal to the size of tabs, if it's true, it would hide the .see-more button and appear .see-less button.
            if( $showJobs >= $sizePanels ) {

                $(this).parent().find(".see-less").stop(true, true).show();
                $(this).stop(true, true).hide();
            }
        });
        // FUNCTION of {JOBS} SEE MORE FINISH --
    });
});