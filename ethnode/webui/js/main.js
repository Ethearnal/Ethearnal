// TODO less require more secure, and do the fucking sanita on hundred places now
console.log('BEGIN INIT');
var $other_section = $('#other-profile-section');
var $other_headline = $('#other-profile-headline');
var $my_section = $('#my-profile-section');
var $my_headline = $('#my-profile-headline');
var load_segment_html = $('#gigs-other').html()

var CDN_HOST_PORT = '';

// get CDN host from node

$.ajax({
    type: 'GET',
    url: '/api/v1/dht/node/',

    success: function(data) {
        data = JSON.parse(data);
        console.log(' - - - data.cdn', data.cdn[0]);
        CDN_HOST_PORT = data.cdn[0];
    }
});

var api_post_cdn_url = function() {
    console.log('using post cdn: ', CDN_HOST_PORT);
    c = 'http://' + CDN_HOST_PORT + '/api/cdn/v1/resource';
    console.log('using post cdn: ', c);
    return c;
};

var api_get_cdn_url = function() {
    console.log('using _get cdn', CDN_HOST_PORT);
    c = 'http://' + CDN_HOST_PORT + '/api/cdn/v1/resource?hkey=';
    console.log('using _get cdn', c);
    return c;
};

var api_idx_cdn_url = function() {
    console.log('using _search cdn', CDN_HOST_PORT);
    c = 'http://' + CDN_HOST_PORT + '/api/cdn/v1/idx?';
    console.log('using _search cdn', c);
    return c;
};

// event handlers

var event_on_gig_profile_key_data = function(guid, profile_key, data) {
    console.log('guid:' + guid);
    console.log('profile_key:' + profile_key, data);
};

var event_on_dht_data = function(hkey, data) {

    data = JSON.parse(data);
    console.log('dht_data:', hkey, data);
    owner = null;
    owner = data.owner_guid;
    if (owner != null) {
        //ajax_get_guid_profile_key(owner, 'skills');
        //
        // createGigToFound(hkey, data);
        generateGigsFromData(hkey, data);
    }
};


var event_on_search_gig_data = function(qry, data_js) {
    console.log('search qry:', qry);

    data = null;
    data = JSON.parse(data_js);
    console.log('search result:', c);
    if (data != null) {
        // todo spinner html;
        $(".gigs-container").html('');
        console.log(data.result);
        if (data.result != undefined) {
            $(".gigs-container").html(data.result);
        } else {
            for (var i = 0; i < data.length; i++) {
                ajax_get_gig_data(data[i]);
            }
        }

    }
};

// end event handlers


var ajax_get_gig_data = function(hkey) {

    qry_hk = '/api/v1/dht/hkey/?hkey=' + hkey;
    $.ajax({
        type: 'GET',
        url: qry_hk,
        hkey: hkey,
        success: function(data) {
            //data = JSON.parse(data);
            event_on_dht_data(this.hkey, data);

        }
    });
};


var ajax_get_guid_profile_key = function(guid, profile_key) {
    qry_url = "/api/v1/dht/profile?owner_guid=" + guid + "&profile_key=" + profile_key,
        $.ajax({
            type: 'GET',
            url: qry_url,
            guid: guid,
            profile_key: profile_key,
            success: function(data) {
                event_on_gig_profile_key_data(this.guid, this.profile_key, data);

            }
        });
};



// searching


var TIMEOUT_ON_SEARCH_QUERY = null

//

var ajax_get_cdn_search = function(q) {

    var qry_url = api_idx_cdn_url() + q;
    console.log('searching query', qry_url);
    $.ajax({
        type: 'GET',
        url: qry_url,
        qry: q,
        success: function(data) {
            event_on_search_gig_data(this.qry, data);
        }
    });

};


var do_search_query = function() {
    var search_text = $('input#search-header').val();
    var search_tags = $('#search-tags').val();

    console.log('DO SEARCH TEXT', search_text);
    console.log('DO SEARCH TAGS', search_tags);
    // and domain expertise
    // price range
    qry = "";
    if (search_text) {
        qry += "text=" + search_text
    }
    //todo add another fields
    if (qry != "") {
        // ajax_get_cdn_search(encodeURI(qry));
    } else {

        qry = "all"
    }

    ajax_get_cdn_search(encodeURI(qry));

};


var load_tags_per_domain = function(nm) {
    var fn = "tags/" + nm + ".json";

    $.ajax({
        type: 'GET',
        url: fn,
        success: function(tags) {
            //console$('#skills-tags').html('');
            var $e = $('#skills-tags');
            $e.html('');
            $e.dropdown('restore defaults');
            $e.removeClass('disabled');
            console.log('**', $('#skills-tags > search'));
            for (var i = 0; i < tags.length; i++) {
                $('#skills-tags').append('<option value="' + tags[i] + '">' + tags[i] + '</option>');
            }
        }
    });
}

var search_event = function() {
    console.log('SEARCH EVENT');
    clearTimeout(TIMEOUT_ON_SEARCH_QUERY);
    TIMEOUT_ON_SEARCH_QUERY = setTimeout(function() {
        do_search_query();
    }, 100);
}

$(document).ready(function() {
    $('#domain-expertise-select').dropdown();
    $('#skills-tags').dropdown();
    do_search_query();

});

$("#skills-tags").on("change", function() {
    var v = $('#search-by-gig-tags').dropdown('get value');
    console.log("search tag selected", v);
    search_event();
});

$('#domain-expertise-select').on('change', function() {
    var v = $('#domain-expertise-select').dropdown('get value');
    console.log("domain selected", v);
    load_tags_per_domain(v);
    search_event();
});

// end searching



// profile cards begin
var main_profile_cards = function() {
    $('.profiles-container').empty();
    console.log('main_profile_cards()');
    $.ajax({
        url: '/api/v1/dht/guids',
        type: 'GET',
        processData: false,
        success: function(data) {
            known_guids = JSON.parse(data);
            known_guids.forEach(function(element) {
                //
                createProfileCard(element);
                console.log(element);
            });
        }
    });

};
// profile cards end

// TODO
// grrr


// JS DATA BUFFERS

var V_GIGS_BUFFER = {};


do_search_query();



$("i.skills-down").click(function() {
    $(".profile-upper .skills").toggleClass('hidden');
    $(this).toggleClass('open');

    if ($(this).hasClass('open')) {
        $(this).css({ transition: "transform 0.3s", transform: "rotate(180deg)" })
    } else {
        $(this).css({ transition: "transform 0.3s", transform: "rotate(0deg)" })
    }
});

$("i.languages-down").click(function() {
    $(".profile-upper .languages").toggleClass('hidden');
    $(this).toggleClass('open');

    if ($(this).hasClass('open')) {
        $(this).css({ transition: "transform 0.3s", transform: "rotate(180deg)" })
    } else {
        $(this).css({ transition: "transform 0.3s", transform: "rotate(0deg)" })
    }
});


// Changes .plusIcon based on what tab user opens
$('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
    var target = $(e.target).attr("href"); // activated tab
    target = target.replace("#", "");

    $('.plusIcon').removeClass('active');
    $('.plusIcon.' + target).addClass('active');

    if (target == "gigs" || target == "orders") {
        $('.profile-documentation').css({ backgroundColor: 'transparent', boxShadow: 'none' });
    } else {
        $('.profile-documentation').css({ backgroundColor: 'white', boxShadow: '1px 2px 3px 0 rgba(0, 0, 0, 0.1)' });
    }
});


// PREVENTING DEFAULT (redirecting) WHEN YOU CLICK ON a(href="")
// $('a').click(function(e) {
//     e.preventDefault();
// });


// WHEN YOU CLICK ON ETHEARNAL LOGO IT WILL REDIRECT YOU TO GIGS PAGE
$('a.navbar-brand').click(function() {

    // Removing all set classes and nulling everything.
    $('section.background-image, section.documentation, section.gigs-page-content, section.jobs-page-content, section.profiles-page-content').hide();
    $('body').removeClass('up');

    $('section.gigs-page-content').show();
    $('input#search-header').attr('placeholder', 'Search gigs...');


    $filter = $('.filters .filter');
    $filter.find('.is-checked').stop(true, true).removeClass('is-wrong is-checked');
    $('input#search-header, button#search-button').removeClass('wrong');
    $('input#search-header').val('');

    // $('.gig').remove();

    $.ajax({
        type: 'GET',
        url: '/api/v1/my/gigs/',
        dataType: 'text',
        success: function(data) {
            loadGigsOnAjaxSuccess(data, true);
        }
    });

    return false;
})


// func
function getProfileGigsF(guid_id) {
    console.log(guid_id);


    $.ajax({
        url: "/api/v1/dht/hkey/?hkey=" + guid_id,
        hk: guid_id,
        type: "GET",
        processData: true,
        success: function(gigs_dta) {

            console.log(gigs_dta);

            //console.log('hkey',this.hk);
            //console.log('data:',js_data);
            // gig_o = JSON.parse(js_data);
            //console.log('data:',gig_o);
            //createGigToProfile2(this.hk, gig_o);

        },

        error: function(error) {
            console.log('ERR', error);

            return;
        }
    });

    //var gig_hk = profile_gigs[i];
    //console.log('GIG HK:',gig_hk);
    /**/

};


$(document).ready(function() {

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
            $divToAppear = $('<div class="photo-element photo-uploaded' + photoID + '"><a href="#" class="remove" title="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a><img src="' + imageSource + '"></div>')
            $divToAppear.appendTo(uploadTo);
        }

        function appearPhoto(photoID, uploadTo) {
            $divToAppear = $('<div class="photo-element photo' + photoID + '"><a href="#" class="remove" title="Remove"><span class="glyphicon glyphicon-remove" aria-hidden="true"></span></a><div class="progress active"><div class="progress-bar" style="width:0%"></div></div></div>')
            $divToAppear.appendTo(uploadTo);
        }

        $('.timeline .modal-dialog .modal-content .modal-body i.icon-more').click(function() {
            var modalClicked = $(this).attr('data-target');
            var $modalOpened = $(this).closest('.timeline').attr('id');

            $(modalClicked).on('shown.bs.modal', function() {
                if ($(modalClicked).find('.appearing-content .file-upload .photo-element').length != 0) return false;

                var imageNumber = 50;

                $container = $(this).find('.appearing-content .file-upload')
                $container.show();

                $('#' + $modalOpened + ' .modal-dialog .modal-content .modal-body .post .image .items .item').each(function() {
                    $imageSource = $(this).children().attr('src');

                    appearUploadedPhoto(imageNumber, $container, $imageSource);
                    $photoUploadedElement = $(modalClicked + " .appearing-content .file-upload .photo-uploaded" + imageNumber);
                    imageNumber++;
                    $photoUploadedElement.find("a.remove").toggle();

                    $photoUploadedElement.hover(function() {
                        $(this).has('img').css({ "background-color": "#000", "border-color": "#f6f7f8" });
                        $(this).has('img').find('img').css("opacity", ".7");
                        $(this).find('a.remove').toggle();
                    }, function() {
                        $(this).has('img').css({ "background-color": "#f6f7f8", "border-color": "rgba(0, 0, 0, 0.1)" });
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
            if (imagesUploaded >= imageLimit) return false;
            if (imageUploading) return false;
            var fileHolder = $(this).parent().find(".file-upload");
            var fileInput = $(this).parent().find(".file-upload-input");
            var postBtn = $(this).parent().parent().find('.buttons button.btn.btn-post');
            var cameraBtn = $(this).find('a');
            var videoIcon = '<span class="glyphicon glyphicon-film file-icon" aria-hidden="true"></span>';
            var audioIcon = '<span class="glyphicon glyphicon-headphones file-icon" aria-hidden="true"></span>';
            var fileIcon = '<span class="glyphicon glyphicon-file file-icon" aria-hidden="true"></span>';
            var statusAlert = $(this).parent().find('.status-alert');

            $(this).parent().find("input.file-upload-input").trigger('click');
            $(this).parent().find("input.file-upload-input").unbind('change');
            imageUploading = false;
            $(this).parent().find("input.file-upload-input:hidden").on('change', function() {
                var isImage = $(this).val().match(/(?:jpg|jpeg|bmp|png|gif|tiff)$/igm);
                var isVideo = $(this).val().match(/(?:3g2|3gp|3gpp|asf|avi|dat|divx|dv|f4v|flv|m2ts|m4v|mkv|mod|mov|mp4|mpe|mpeg|mpeg4|mpg|mts|nsv|ogm|ogv|qt|tod|ts|vob|wmv)$/igm);
                var isAudio = $(this).val().match(/(?:aif|iff|m3u|m4a|mid|mp3|mpa|ra|wav|wma)$/igm);
                var isFile = $(this).val().match(/(?:txt|doc|docx|pdf|csv|pps|ppt|pptx|ps|ai|svg|indd|psd|eps)$/igm);
                var fileName = $(this).val().split('\\').pop().replace(/.jpg|.jpeg|.bmp|.png|.gif|.tiff/i, '');

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
                    $(this).has('img').css({ "background-color": "#000", "border-color": "#f6f7f8" });
                    $(this).has('img').find('img').css("opacity", ".7");
                    $(this).find('a.remove').toggle();
                }, function() {
                    $(this).has('img').css({ "background-color": "#f6f7f8", "border-color": "rgba(0, 0, 0, 0.1)" });
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
                                    $photoElement.find("a.remove").css({ "-webkit-text-fill-color": "#dcdcdc", "-webkit-text-stroke-color": "#565a5e" });
                                    $photoElement.find("a.remove").hover(function() {
                                        $photoElement.css("-webkit-text-fill-color", "#fff");
                                    }, function() {
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

            reader.onload = function(e) {
                if ($inputID == "input-image-avatar") {
                    addImage(e.target.result);
                }
                $content.find('img#' + $inputID + '').attr('src', e.target.result).show();
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    $("input.input-file").change(function() {
        $content = $(this).closest('.content');
        readURL(this, $content);
        $inputID = $(this).attr("id");
    });

    // When you upload a file in an accomplishment modal, it would chance the text.
    $("input[type=file]").on("change", function() {
        $content = $(this).closest('.content');

        // Name of file and placeholder
        var file = this.files[0].name;
        var dflt = $(this).attr("placeholder");
        $labelID = $(this).attr("id");
        // $imgClass = $(this).parent().find('.file-input-first-image').attr('class');

        if ($(this).val() != "") {
            $content.find("label[for=" + $labelID + "]").text(' ' + file + ' ').addClass('active');
            $content.find('img.file-input-first-image').addClass('active');
            $content.find('img.show-image').removeClass('empty');
        } else {
            $(this).next().text(dflt);
        }
    });



    // Panel heading would have hover effect.
    $('.panel-heading, .timeline-post').hover(
        function() {
            $(this).stop(true, true).animate({ backgroundColor: '#f7f7f7' }, 300);
        },
        function() {
            $(this).stop(true, true).animate({ backgroundColor: 'white' }, 300);
        }
    )

    // Owl Graphic Hero UI buttons and hover effect.
    $(".button-prev").click(function() {
        $(this).parent().find('.items').trigger('owl.prev');
    });
    $(".button-next").click(function() {
        $(this).parent().find('.items').trigger('owl.next');
    });
    $("section.background-image, .modal-body .image").hover(function() {
        $(this).find(".button-prev, .button-next").stop(true).fadeIn(300);
    });
    $("section.background-image, .modal-body .image").mouseleave(function() {
        $(this).find(".button-prev, .button-next").stop(true).fadeOut(300);
    });

    // When you click on Top skills and tools down icon, the skills will slide up or slide down.
    $(".profile-bottom i").click(function() {
        $(".profile-bottom .skills p.more").toggleClass('hidden');
        $(this).toggleClass('open');

        if ($(this).hasClass('open')) {
            $(this).css({ transition: "transform 0.3s", transform: "rotate(180deg)" })
        } else {
            $(this).css({ transition: "transform 0.3s", transform: "rotate(0deg)" })
        }
    });

    // When you hover on a profile image, the half-black background would appear with the text of "Change".
    $(".profile-image").hover(function() {
        $(this).find(".text-on-image").stop(true, true).fadeToggle(150);
    });



    // Semantic UI, Perfect Scrollbar plugins initializations and many others functions related to dropdowns.
    $(function() {
        if ($(window).width() < 768) {
            var myApp = new Framework7();
            var $$ = Dom7;

            $$('.swipeout').on('open', function(e) {
                e.preventDefault();
                $(this).fadeOut();
            });
        }

        // $('.ui .menu, .panel-body').perfectScrollbar();
        $('section.background-image .items, .modal-body .image .items').owlCarousel({
            singleItem: true
        });
        $('.ui.dropdown').dropdown();

        $('.skills-dropdown, .languages-dropdown, .gig-tags, .portfolio-tags').dropdown({
            allowAdditions: true,
            maxSelections: 10
        });


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
    }).done(function(data) {
        // do my stuff
    });
}


// COLORS
// Blue #1 = #92A8D1
// Blue #2 = #89ABE3

// Rose #1 = #F7CAC9
// Rose #2 = #F2DDDE




// FUNCTIONS

// SMART SEARCH
require("js/modules/generateGigs.js"); // MODULE FOR SEARCHING
require("js/modules/smartSearch.js"); // MODULE FOR SEARCHING
require("js/modules/globalEvents.js"); // MODULE with GLOBAL EVENTS 
require("js/modules/imageCrop.js"); // MODULE with GLOBAL EVENTS 
// GET DATA
require("js/functions/getData/gigData.js"); // GETS GIG DATA BY GIG ID
require("js/functions/getData/guidsData.js"); // GETS ALL GUIDS (NODES) DATA
require("js/functions/getData/profileGigs.js"); // GETS ALL GIGS RELATED TO PROFILE BY PROFILE ID
require("js/functions/getData/profilePortfolios.js"); // GETS ALL PORTFOLIOS RELATED TO PROFILE BY PROFILE ID
require("js/functions/getData/nodeData.js"); // GETS NODE DATA

// GIGS -- OTHER THINGS

// CREATE
// require("js/functions/modals/create/createLE.js"); // CREATES CONTENT BLOCK - NOT GIG
// require("js/functions/modals/create/createGig.js"); // GETS GIG DATA
require("js/functions/modals/create/createGigBox.js"); // CREATES GIG BOX
require("js/functions/modals/create/createGigToProfile.js"); // CREATES GIG BOX
require("js/functions/modals/create/createPortfolio.js"); // CREATES GIG BOX
require("js/functions/modals/create/gigInner.js"); // CREATES GIG INNER MODAL

// DELETE
require("js/functions/modals/delete/function.js"); // DELETE FUNCTION
require("js/functions/modals/delete/gig.js"); // DELETES GIG

// LOAD
require("js/functions/modals/load/gigs.js"); // LOADS ALL GIGS
require("js/functions/modals/load/portfolios.js"); // LOAD ALL PORTFOLIOS
require("js/functions/modals/load/searchGigs.js"); // LOADS ALL GIGS BASED ON YOUR SEARCH
require("js/functions/modals/load/moreGigsScrollDown.js"); // LOADS MORE GIGS ON SCROLL DOWN
require("js/functions/modals/load/loadGigsOnAjaxSuccess.js"); // LOADS GIGS ON AJAX SUCCESS

// COLLECT DATA
require("js/functions/modals/collectData/gig.js"); // COLLECTS GIG DATA
require("js/functions/modals/collectData/portfolio.js"); // COLLECTS PORTFOLIO ELEMENT DATA
require("js/functions/modals/collectData/profile.js"); // COLLECTS PROFILE DATA

// MODALS

// OPEN
require("js/functions/modals/open/function.js"); // OPEN MODAL MAIN FUNCTION
require("js/functions/modals/open/modal.js"); // OPEN --- CLOSE MODAL FUNCTIONS

// INITIALIZING
require("js/functions/modals/initializing/successMessage.js"); // SHOWING SUCCESS MESSAGE FUNCTION
require("js/functions/modals/initializing/datePickers.js"); // INITIALIZING DATE PICKERS

//TODO check this
//require("js/functions/modals/initializing/modalInputs.js"); // ADDING TEXT TO INPUTS IN #EDIT MODALS

require("js/functions/modals/initializing/profileModalInputs.js"); // ADDING TEXT TO #EDIT PROFILE MODAL INPUTS




// This is a function to generate a position information div
require("js/functions/modals/positionInformationDiv.js");

// All the functions related to time. Such as GetTimeDifference, etc.
require("js/functions/modals/timesFunctions.js");


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

// Include sliders JS file.
require("js/sliders.js");

// Includes Load Profile function with AJAX GET.
require("js/loadProfile.js");