(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

require("./modules/smartSearch.js"); // MODULE FOR SEARCHING
require("./modules/globalEvents.js"); // MODULE with GLOBAL EVENTS
require("./modules/imageCrop.js"); // MODULE with IMAGE CROPPER
require("./modules/onInitProfile.js"); // MODULE with INIT PROFILE PAGE
require("./modules/onInitProfiles.js"); // MODULE with INIT PROFILE PAGE
require("./modules/generateGigs.js"); // MODULE with Gigs generator
require("./modules/onInitGigs.js"); // MODULE with GIGS PAGE INIT
require("./modules/range-slider.js"); // MODULE with RANGE SLIDER
require("./modules/newGigModal.js"); // MODULE with CREATE NEW GIG

},{"./modules/generateGigs.js":2,"./modules/globalEvents.js":3,"./modules/imageCrop.js":4,"./modules/newGigModal.js":5,"./modules/onInitGigs.js":6,"./modules/onInitProfile.js":7,"./modules/onInitProfiles.js":8,"./modules/range-slider.js":9,"./modules/smartSearch.js":10}],2:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.generateGigsModule = function () {

    function generateGigsFromData(gigID, gigObject, isOwn) {
        if (check_gig_marked_deleted(gigObject)) {
            return;
        }

        var api_cdn = api_get_cdn_url();
        var profile_image = null;
        var owner_guid = null;
        var img_src = '';
        var fullname = '';
        var categoryObj = {
            "sd": "Software Development",
            "fa": "Finance & Accounting",
            "ma": "Music & Audio",
            "gd": "Graphic & Design",
            "va": "Video & Animation",
            "tw": "Text & Writing",
            "cs": "Consulting Services",
            "os": "Other Services"
        };

        var round_price = Math.round(gigObject.price * 1000) / 1000;
        var gigDeleteString = '';
        if (isOwn) {
            var gigDeleteString = '<li class="mdl-menu__item delete">Delete</li>';
        }
        var dropdownButton = '<button id="DDB' + gigID + '" class="dropdown-gig mdl-button mdl-js-button mdl-button--icon dropdown-button btn-info-edit"><i class="material-icons">more_vert</i></button>';
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB' + gigID + '"><li class="mdl-menu__item js-open-gig-modal">Open</li>' + gigDeleteString + '</ul>';

        if (gigObject.hasOwnProperty('owner_guid')) {
            owner_guid = gigObject.owner_guid;

            getProfileValue(owner_guid, 'profilePicture', function (profilePictureURL) {
                img_src = api_cdn + JSON.parse(profilePictureURL) + '&thumb=1';
                // $('#imgav' + gigID).attr('src', p_src);
                getProfileValue(owner_guid, 'name', function (name_jstr) {
                    var names_o = JSON.parse(name_jstr);
                    fullname = names_o.first + " " + names_o.last;
                    // $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
                    var gigLayout = '<div class="user-card gig"  id="' + gigID + '" data-toggle="modal" data-target="#gigModal">\n                        <div class="img-card" style="background: url(' + (api_cdn + gigObject.image_hash) + '&thumb=1) center no-repeat; background-size: cover;" >\n                            ' + dropdownButton + '\n                            ' + dropdownUL + '\n                            <div class="card-label">' + categoryObj[gigObject.category] + '</div>\n                        </div>\n                        <div class="user-profile-img">\n                            <div class="div-img-wrap" style="background: url(\'' + img_src + '\')"></div>\n                        </div>\n                        <p class="user-name" id="nmown' + gigID + '">' + fullname + '</p>\n                        <p class="user-role">' + categoryObj[gigObject.category] + '</p>\n                        <div class="user-info">\n                            <p class="info">' + gigObject.title + '</p>\n                        </div>\n                        <div class="user-price">STARTING AT: <span><i class="material-icons">polymer</i>' + round_price + '</span></div>\n                    </div>';
                    $('.preloader-card').remove();
                    $(".gigs-container").append(gigLayout);
                    componentHandler.upgradeDom();
                });
            });
        }
    }

    return {
        generate: function generate(id, obj, isOwn) {
            return generateGigsFromData(id, obj, isOwn);
        }
    };
}();

},{}],3:[function(require,module,exports){
'use strict';

function filterProfileCards(query, $input) {
  /* CHECK FOR QUERY MATCH WITH NAME */
  $('.profile-user-card').each(function (i, item) {
    var name = $(item).find('.user-name').text().toLowerCase();
    name.match(query.toLowerCase()) ? $(item).removeClass('hidden') : $(item).addClass('hidden');
  });
  /* ADD RED BORDER TO INPUT IF NO SEARCH MATCHED */
  $('.profile-user-card').length == $('.profile-user-card.hidden').length ? $input.addClass('error') : $input.removeClass('error');
}

$(document).ready(function () {
  // Global Events
  $(document).click(function (e) {
    if (!$(e.target).closest('.dropdown').length) {
      $('#settings-dropdown').parents('.dropdown').removeClass('show');
    }
  });
  // Dropdown show in header
  $(document).on('click', '#settings-dropdown', function (e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).parents('.dropdown').toggleClass('show');
    // .siblings('[data-labelledby=settings-dropdown]').
  });

  // OPEN GIG BIG MODAL ON MENU click
  $('body').delegate('li.js-open-gig-modal', 'click', function (e) {
    $(this).closest('.gig').trigger('click');
  });

  /* FILTER PROFILE CARDS */
  if ($('body').hasClass('profiles-page')) {
    /* FILTER PROFILE CARDS */
    $(document).on('input', '.profiles-page #search-header', function () {
      filterProfileCards($(this).val(), $(this));
    });

    /* OPEN INTERNAL PROFILE PAGE */
    $(document).on('click', '.profile-user-card', function () {
      window.location.href = '/ui/profile/#' + $(this).attr('id');
    });
  }

  // REDIRECT TO PROFILE PAGE ON CLICK ON USERS PROFILE
  $(document).on('click', '.jsOpenGigOwnerProfile', function () {
    window.location.href = '/ui/profile/#' + $(this).attr('data-id');
  });
});

},{}],4:[function(require,module,exports){
'use strict';

window.$uploadCrop = $('#cropper-wrap-gig').croppie({
  viewport: {
    width: 450,
    height: 150
  },
  enableZoom: true
});

$(document).ready(function () {
  /* BUTTON INIT CLICK ON INPUT TYPE FILE */
  $(document).on('click', '.jsCropUpload', function () {
    var $content = $(this).closest('.content');
    $content.find('input#input-image-gig').click();
  });

  /* BUTTON FOR GETTING CROP RESUlt */
  $(document).on('click', '.jsCropResult', function (e) {
    e.preventDefault();
    var $content = $(this).closest('.content');
    window.$uploadCrop.croppie('result', 'base64').then(function (base64) {
      $content.find('img#input-image-gig').attr('src', base64).show(500).removeClass('empty');
      $content.find($("#cropper-wrap-gig")).show(500);
      $content.find($(".btns-wrap").find(".btn-success")).show();
    });
    window.$uploadCrop.croppie('result', 'blob').then(function (blob) {
      window.$uploadCropBlob = blob;
      $content.find($("#cropper-wrap-gig")).hide(400);
      $content.find($(".btns-wrap").find(".btn-success")).hide();
    });
  });
});

},{}],5:[function(require,module,exports){
"use strict";

window.createNewGig = function () {
    $("#add-gig").find("#newGigexpire").datepicker();
    $("#add-gig").on("hidden.bs.modal", function (e) {
        $(this).find(".gig-tags").find(".delete").click();
        $(this).find("img#input-image-gig").hide().addClass("empty").end().find(".img-label").show().removeClass("active").text('').end().find("#cropper-wrap-gig").hide().end().find($(".btns-wrap").find(".btn-success")).hide();
        $(this).find("input,textarea,select").val("").end().find(".range-slider").find("input").val("0").end().find(".range-slider__value").text("0");
        $(this).find("#new-gig-category").parent().find(".text").text("All Categories");
    });
}();

},{}],6:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.gigsPageModule = function () {

    var gig_ctx = $("[data-target='#gigModal'");
    var el = gig_ctx.remove(0);

    function initGigs() {
        $('.nav-tabs .nav-link').removeClass('active');
        $('.nav-tabs .gigs').addClass('active');
        getListOfGigs();
    }

    return {
        oninitGigs: function oninitGigs() {
            return initGigs();
        }
    };
}();

$(document).ready(function () {
    if ($('body').hasClass('gigs-page')) {
        gigsPageModule.oninitGigs();
    }
});

},{}],7:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.profilePageModule = function () {

    var gig_ctx = $("[data-target='#gigModal'");
    var el = gig_ctx.remove(0);

    function initProfile() {
        $('.nav-tabs .nav-link').removeClass('active');

        /* RESET AND GET NEW PROFILE ID HASH */
        window.profileID = null;

        if (window.location.hash) {
            window.profileID = window.location.hash.slice(1);
            updateProfile();
            getGigs(window.profileID);
        } else {
            $('.redesigned-gig-modal').addClass('no-button-order');
            $('.editBtnProfile').removeClass('hidden');
            getNodeData(function (nodeData) {
                var data = JSON.parse(nodeData);
                window.profileID = data.guid;
                $('.preloader-card').remove();
                updateProfile();
                getGigs(data.guid);
            });
        }
    };

    function getGigs(guid) {
        console.log(guid);
        getProfileGigs(guid, function (data) {
            var profile_gigs = JSON.parse(data);
            $('.gigs-profile-container').empty();
            for (var i = 0; i < profile_gigs.length; i++) {
                $.ajax({
                    url: "/api/v1/dht/hkey/?hkey=" + profile_gigs[i],
                    hk: profile_gigs[i],
                    type: "GET",
                    processData: false,
                    success: function success(js_data) {
                        if (js_data != 'null') {
                            var gig_o = JSON.parse(js_data);
                            generateGigsModule.generate(this.hk, gig_o, true);
                        } else {
                            $('.preloader-card').remove();
                        }
                    },
                    error: function error(_error) {
                        console.log('ERR', _error);
                        return;
                    }
                });
            }
        });
    }

    return {
        oninit: initProfile,
        getAllGigs: getGigs
    };
}();

$(document).ready(function () {
    if ($('body').hasClass('profile-page')) {
        profilePageModule.oninit();
    }
});

},{}],8:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.profilesPageModule = function () {

    var gig_ctx = $("[data-target='#gigModal'");
    var el = gig_ctx.remove(0);

    function initProfiles() {
        $('.nav-tabs .nav-link').removeClass('active');
        $('.nav-tabs .profiles').addClass('active');
        main_profile_cards();
    }

    return {
        oninitprofiles: function oninitprofiles() {
            return initProfiles();
        }
    };
}();

$(document).ready(function () {
    if ($('body').hasClass('profiles-page')) {
        profilesPageModule.oninitprofiles();
    }
});

},{}],9:[function(require,module,exports){
"use strict";

window.newGigRangeSlider = function () {
  var rangeSlider = function rangeSlider() {
    var slider = $(".range-slider"),
        range = $(".range-slider__range"),
        value = $(".range-slider__value");

    slider.each(function () {
      value.each(function () {
        var value = $(this).prev().attr("value");
        $(this).html(value);
      });

      range.on("input", function () {
        $(this).next(value).html(this.value);
      });
    });
  };

  rangeSlider();
}();

},{}],10:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.smartSearchModule = function () {
    // Global variables for Smart Search

    var searchArray = new Array();
    var keyupTimeout = null;
    var dataLength = 0;

    var searchA = '';

    function smartSearch() {
        var url = api_idx_cdn_url();
        // build url for searching
        if (searchArray.length) {
            $.each(searchArray, function (i, item) {
                var searchQ = '';
                if (item.type == 'text' && item.value == '' && searchArray.length == 1) {
                    searchQ += 'all';
                    url += 'all';
                } else if (item.type == 'text' && item.value == '' && searchArray.length != 1) {
                    url += '';
                } else if (item.type == 'tags' && item.value == 'select') {
                    url += '';
                } else if (item.type == 'tags' && item.value == '') {
                    url += '';
                } else if (item.type == 'category' && item.value == 'all') {
                    url += 'all';
                } else if (item.type == 'q1range' && searchArray.length == 1) {
                    searchQ += 'all&' + item.type + '=' + item.value;
                    url += searchQ;
                } else {
                    searchQ += '&' + item.type + '=' + item.value;
                    url += searchQ;
                }
            });
        } else {
            url += 'all';
        }

        $.ajax({
            type: 'GET',
            url: url + '&limit=1000',
            qry: searchA,
            success: function success(data) {
                dataLength = data.length;
                if (data == 'null') {
                    data = JSON.stringify({ result: 'No results for this search' });
                }
                event_on_search_gig_data(data);
            }
        });
    }

    // Search Events

    // Submit search for text field
    $(document).on('keyup', 'input#search-header', function (e) {
        if (this.value.length < 2 && this.value.length > 0) return;
        limit = 9;
        $('.gigs-container').empty();
        delay(function () {
            var outputString = $(e.target).val().split(" ").join("%20");
            if (searchArray.length) {
                var text = false;
                searchArray.filter(function (item) {
                    if (item.type == 'text') {
                        text = true;
                        searchArray.splice(searchArray.indexOf(item), 1);
                        searchArray.push({ type: 'text', value: outputString });
                    }
                });
                if (text == false) {
                    searchArray.push({ type: 'text', value: outputString });
                }
            } else {
                searchArray.push({ type: 'text', value: outputString });
            }
            console.log(searchArray);
            smartSearchModule.search();
        }, 500);
    });

    // Submit search for dropdown expertise
    $(document).on('change', '#domain-expertise-select', function () {
        var el = $(this).dropdown('get value');
        limit = 9;
        $('.gigs-container').empty();
        delay(function () {
            if (searchArray.length) {
                searchArray.filter(function (item) {
                    if (item.type == 'tags') {
                        searchArray.splice(searchArray.indexOf(item), 1);
                    }
                });

                var category = false;
                searchArray.filter(function (item) {
                    if (item.type == 'category') {
                        category = true;
                        searchArray.splice(searchArray.indexOf(item), 1);
                        searchArray.push({ type: 'category', value: el });
                    }
                });
                if (category == false) {
                    searchArray.push({ type: 'category', value: el });
                }
            } else {
                searchArray.push({ type: 'category', value: el });
            }
            smartSearchModule.search();
            if (el != 'all') load_tags_per_domain(el);
        }, 200);
    });

    $(document).on('change', '#skills-tags', function () {
        var el = $(this).dropdown('get value');
        console.log(el);
        if (el == null) return;
        limit = 9;
        $('.gigs-container').empty();
        delay(function () {
            $('.gigs-container').empty();
            var outputString = el.join("%20");
            console.log(outputString);
            if (searchArray.length) {
                var tags = false;
                searchArray.filter(function (item) {
                    if (item.type == 'tags') {
                        tags = true;
                        searchArray.splice(searchArray.indexOf(item), 1);
                        searchArray.push({ type: 'tags', value: outputString });
                    }
                });
                if (tags == false) {
                    searchArray.push({ type: 'tags', value: outputString });
                }
            } else {
                searchArray.push({ type: 'tags', value: outputString });
            }
            smartSearchModule.search();
        }, 200);
    });

    $(document).on('mouseup', '#slider-range', function () {
        var values = $(this).slider("values");
        if (values[0] == 0 && values[1] == 2000) {
            searchArray.filter(function (item) {
                if (item.type == 'q1range') {
                    searchArray.splice(searchArray.indexOf(item), 1);
                }
            });
            return;
        }
        limit = 9;
        $('.gigs-container').empty();
        delay(function () {
            if (searchArray.length) {
                var q1range = false;
                searchArray.filter(function (item) {
                    if (item.type == 'q1range') {
                        q1range = true;
                        searchArray.splice(searchArray.indexOf(item), 1);
                        searchArray.push({ type: 'q1range', value: values[0] + '%20' + values[1] });
                    }
                });
                if (q1range == false) {
                    searchArray.push({ type: 'q1range', value: values[0] + '%20' + values[1] });
                }
            } else {
                searchArray.push({ type: 'q1range', value: values[0] + '%20' + values[1] });
            }
            smartSearchModule.search();
        }, 200);
    });

    $(document).on('click', '.load-more', function () {
        limit = limit + 9;
        smartSearchModule.search();
    });

    return {
        search: function search() {
            return smartSearch();
        }
    };
}();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdFByb2ZpbGUuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlcy5qcyIsInNyYy9qcy9tb2R1bGVzL3JhbmdlLXNsaWRlci5qcyIsInNyYy9qcy9tb2R1bGVzL3NtYXJ0U2VhcmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSwyQkFBUixFLENBQXNDO0FBQ3RDLFFBQVEsd0JBQVIsRSxDQUFtQztBQUNuQyxRQUFRLDRCQUFSLEUsQ0FBdUM7QUFDdkMsUUFBUSw2QkFBUixFLENBQXdDO0FBQ3hDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHlCQUFSLEUsQ0FBb0M7QUFDcEMsUUFBUSwyQkFBUixFLENBQXNDO0FBQ3RDLFFBQVEsMEJBQVIsRSxDQUFxQzs7Ozs7QUNSckM7QUFDQSxPQUFPLGtCQUFQLEdBQTZCLFlBQVc7O0FBRXBDLGFBQVMsb0JBQVQsQ0FBOEIsS0FBOUIsRUFBcUMsU0FBckMsRUFBZ0QsS0FBaEQsRUFBdUQ7QUFDbkQsWUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUFFO0FBQVE7O0FBRW5ELFlBQUksVUFBVSxpQkFBZDtBQUNBLFlBQUksZ0JBQWdCLElBQXBCO0FBQ0EsWUFBSSxhQUFhLElBQWpCO0FBQ0EsWUFBSSxVQUFVLEVBQWQ7QUFDQSxZQUFJLFdBQVcsRUFBZjtBQUNBLFlBQUksY0FBYztBQUNkLGtC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IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsInJlcXVpcmUoXCIuL21vZHVsZXMvc21hcnRTZWFyY2guanNcIik7IC8vIE1PRFVMRSBGT1IgU0VBUkNISU5HXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR0xPQkFMIEVWRU5UU1xucmVxdWlyZShcIi4vbW9kdWxlcy9pbWFnZUNyb3AuanNcIik7IC8vIE1PRFVMRSB3aXRoIElNQUdFIENST1BQRVJcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0UHJvZmlsZS5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBQUk9GSUxFIFBBR0VcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanNcIik7IC8vIE1PRFVMRSB3aXRoIElOSVQgUFJPRklMRSBQQUdFXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2dlbmVyYXRlR2lncy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR2lncyBnZW5lcmF0b3JcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0R2lncy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR0lHUyBQQUdFIElOSVRcbnJlcXVpcmUoXCIuL21vZHVsZXMvcmFuZ2Utc2xpZGVyLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBSQU5HRSBTTElERVJcbnJlcXVpcmUoXCIuL21vZHVsZXMvbmV3R2lnTW9kYWwuanNcIik7IC8vIE1PRFVMRSB3aXRoIENSRUFURSBORVcgR0lHIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuZ2VuZXJhdGVHaWdzTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVHaWdzRnJvbURhdGEoZ2lnSUQsIGdpZ09iamVjdCwgaXNPd24pIHtcbiAgICAgICAgaWYgKGNoZWNrX2dpZ19tYXJrZWRfZGVsZXRlZChnaWdPYmplY3QpKSB7IHJldHVybiB9XG5cbiAgICAgICAgdmFyIGFwaV9jZG4gPSBhcGlfZ2V0X2Nkbl91cmwoKTtcbiAgICAgICAgdmFyIHByb2ZpbGVfaW1hZ2UgPSBudWxsO1xuICAgICAgICB2YXIgb3duZXJfZ3VpZCA9IG51bGw7XG4gICAgICAgIHZhciBpbWdfc3JjID0gJyc7XG4gICAgICAgIHZhciBmdWxsbmFtZSA9ICcnO1xuICAgICAgICB2YXIgY2F0ZWdvcnlPYmogPSB7XG4gICAgICAgICAgICBcInNkXCI6IFwiU29mdHdhcmUgRGV2ZWxvcG1lbnRcIixcbiAgICAgICAgICAgIFwiZmFcIjogXCJGaW5hbmNlICYgQWNjb3VudGluZ1wiLFxuICAgICAgICAgICAgXCJtYVwiOiBcIk11c2ljICYgQXVkaW9cIixcbiAgICAgICAgICAgIFwiZ2RcIjogXCJHcmFwaGljICYgRGVzaWduXCIsXG4gICAgICAgICAgICBcInZhXCI6IFwiVmlkZW8gJiBBbmltYXRpb25cIixcbiAgICAgICAgICAgIFwidHdcIjogXCJUZXh0ICYgV3JpdGluZ1wiLFxuICAgICAgICAgICAgXCJjc1wiOiBcIkNvbnN1bHRpbmcgU2VydmljZXNcIixcbiAgICAgICAgICAgIFwib3NcIjogXCJPdGhlciBTZXJ2aWNlc1wiXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcm91bmRfcHJpY2UgPSBNYXRoLnJvdW5kKGdpZ09iamVjdC5wcmljZSAqIDEwMDApIC8gMTAwMDtcbiAgICAgICAgdmFyIGdpZ0RlbGV0ZVN0cmluZyA9ICcnO1xuICAgICAgICBpZiAoaXNPd24pIHtcbiAgICAgICAgICAgIHZhciBnaWdEZWxldGVTdHJpbmcgPSAnPGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0gZGVsZXRlXCI+RGVsZXRlPC9saT4nXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRyb3Bkb3duQnV0dG9uID0gJzxidXR0b24gaWQ9XCJEREInICsgZ2lnSUQgKyAnXCIgY2xhc3M9XCJkcm9wZG93bi1naWcgbWRsLWJ1dHRvbiBtZGwtanMtYnV0dG9uIG1kbC1idXR0b24tLWljb24gZHJvcGRvd24tYnV0dG9uIGJ0bi1pbmZvLWVkaXRcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+bW9yZV92ZXJ0PC9pPjwvYnV0dG9uPic7XG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT4nICsgZ2lnRGVsZXRlU3RyaW5nICsgJzwvdWw+JztcblxuICAgICAgICBpZiAoZ2lnT2JqZWN0Lmhhc093blByb3BlcnR5KCdvd25lcl9ndWlkJykpIHtcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcblxuICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICdwcm9maWxlUGljdHVyZScsIGZ1bmN0aW9uKHByb2ZpbGVQaWN0dXJlVVJMKSB7XG4gICAgICAgICAgICAgICAgaW1nX3NyYyA9IGFwaV9jZG4gKyBKU09OLnBhcnNlKHByb2ZpbGVQaWN0dXJlVVJMKSArICcmdGh1bWI9MSc7XG4gICAgICAgICAgICAgICAgLy8gJCgnI2ltZ2F2JyArIGdpZ0lEKS5hdHRyKCdzcmMnLCBwX3NyYyk7XG4gICAgICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICduYW1lJywgZnVuY3Rpb24obmFtZV9qc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc19vID0gSlNPTi5wYXJzZShuYW1lX2pzdHIpO1xuICAgICAgICAgICAgICAgICAgICBmdWxsbmFtZSA9IG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gJCgnI25tb3duJyArIGdpZ0lEKS50ZXh0KG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdMYXlvdXQgPSBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImltZy1jYXJkXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB1cmwoJHthcGlfY2RuICsgZ2lnT2JqZWN0LmltYWdlX2hhc2h9JnRodW1iPTEpIGNlbnRlciBuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogY292ZXI7XCIgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25CdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93blVMfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWxhYmVsXCI+JHtjYXRlZ29yeU9ialtnaWdPYmplY3QuY2F0ZWdvcnldfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWltZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXYtaW1nLXdyYXBcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgnJHtpbWdfc3JjfScpXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1uYW1lXCIgaWQ9XCJubW93biR7Z2lnSUR9XCI+JHtmdWxsbmFtZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInVzZXItcm9sZVwiPiR7Y2F0ZWdvcnlPYmpbZ2lnT2JqZWN0LmNhdGVnb3J5XX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcmljZVwiPlNUQVJUSU5HIEFUOiA8c3Bhbj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cG9seW1lcjwvaT4ke3JvdW5kX3ByaWNlfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICQoXCIuZ2lncy1jb250YWluZXJcIikuYXBwZW5kKGdpZ0xheW91dCk7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaWQsIG9iaiwgaXNPd24pIHtcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZUdpZ3NGcm9tRGF0YShpZCwgb2JqLCBpc093bik7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG4iLCJmdW5jdGlvbiBmaWx0ZXJQcm9maWxlQ2FyZHMocXVlcnksICRpbnB1dCkge1xuICAvKiBDSEVDSyBGT1IgUVVFUlkgTUFUQ0ggV0lUSCBOQU1FICovXG4gICQoJy5wcm9maWxlLXVzZXItY2FyZCcpLmVhY2goZnVuY3Rpb24oaSxpdGVtKSB7XG4gICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmZpbmQoJy51c2VyLW5hbWUnKS50ZXh0KCkudG9Mb3dlckNhc2UoKTtcbiAgICBuYW1lLm1hdGNoKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID8gJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgOiAkKGl0ZW0pLmFkZENsYXNzKCdoaWRkZW4nKVxuICB9KTtcbiAgLyogQUREIFJFRCBCT1JERVIgVE8gSU5QVVQgSUYgTk8gU0VBUkNIIE1BVENIRUQgKi9cbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykubGVuZ3RoID09ICQoJy5wcm9maWxlLXVzZXItY2FyZC5oaWRkZW4nKS5sZW5ndGggPyAkaW5wdXQuYWRkQ2xhc3MoJ2Vycm9yJykgOiAkaW5wdXQucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gIC8vIEdsb2JhbCBFdmVudHNcbiAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZHJvcGRvd24nKS5sZW5ndGgpIHtcbiAgICAgICAgICAkKCcjc2V0dGluZ3MtZHJvcGRvd24nKS5wYXJlbnRzKCcuZHJvcGRvd24nKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuICAgICAgfVxuICB9KTtcbiAgLy8gRHJvcGRvd24gc2hvdyBpbiBoZWFkZXJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzZXR0aW5ncy1kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAkKHRoaXMpLnBhcmVudHMoJy5kcm9wZG93bicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XG4gICAgICAvLyAuc2libGluZ3MoJ1tkYXRhLWxhYmVsbGVkYnk9c2V0dGluZ3MtZHJvcGRvd25dJykuXG4gIH0pO1xuXG4gIC8vIE9QRU4gR0lHIEJJRyBNT0RBTCBPTiBNRU5VIGNsaWNrXG4gICQoJ2JvZHknKS5kZWxlZ2F0ZSgnbGkuanMtb3Blbi1naWctbW9kYWwnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuZ2lnJykudHJpZ2dlcignY2xpY2snKTtcbiAgfSk7XG5cbiAgLyogRklMVEVSIFBST0ZJTEUgQ0FSRFMgKi9cbiAgaWYgKCAkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSApIHtcbiAgICAvKiBGSUxURVIgUFJPRklMRSBDQVJEUyAqL1xuICAgICQoZG9jdW1lbnQpLm9uKCdpbnB1dCcsICcucHJvZmlsZXMtcGFnZSAjc2VhcmNoLWhlYWRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgZmlsdGVyUHJvZmlsZUNhcmRzKCAkKHRoaXMpLnZhbCgpLCAkKHRoaXMpICk7XG4gICAgfSk7XG5cbiAgICAvKiBPUEVOIElOVEVSTkFMIFBST0ZJTEUgUEFHRSAqL1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5wcm9maWxlLXVzZXItY2FyZCcsZnVuY3Rpb24oKXtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUkVESVJFQ1QgVE8gUFJPRklMRSBQQUdFIE9OIENMSUNLIE9OIFVTRVJTIFBST0ZJTEVcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzT3BlbkdpZ093bmVyUHJvZmlsZScsZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3VpL3Byb2ZpbGUvIycgKyAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgfSk7XG59KVxuIiwid2luZG93LiR1cGxvYWRDcm9wID0gJCgnI2Nyb3BwZXItd3JhcC1naWcnKS5jcm9wcGllKHtcbiAgICB2aWV3cG9ydDoge1xuICAgICAgICB3aWR0aDogNDUwLFxuICAgICAgICBoZWlnaHQ6IDE1MFxuICAgIH0sXG4gICAgZW5hYmxlWm9vbTogdHJ1ZVxufSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgLyogQlVUVE9OIElOSVQgQ0xJQ0sgT04gSU5QVVQgVFlQRSBGSUxFICovXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFVwbG9hZCcsZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcbiAgICAgICRjb250ZW50LmZpbmQoJ2lucHV0I2lucHV0LWltYWdlLWdpZycpLmNsaWNrKCk7XG4gICAgfSk7XG5cbiAgICAvKiBCVVRUT04gRk9SIEdFVFRJTkcgQ1JPUCBSRVNVbHQgKi9cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuanNDcm9wUmVzdWx0JyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcC5jcm9wcGllKCdyZXN1bHQnLCdiYXNlNjQnKS50aGVuKCBmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgnaW1nI2lucHV0LWltYWdlLWdpZycpLmF0dHIoJ3NyYycsIGJhc2U2NCkuc2hvdyg1MDApLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuc2hvdyg1MDApO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLnNob3coKTtcbiAgICAgIH0pO1xuICAgICAgd2luZG93LiR1cGxvYWRDcm9wLmNyb3BwaWUoJ3Jlc3VsdCcsJ2Jsb2InKS50aGVuKCBmdW5jdGlvbihibG9iKSB7XG4gICAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcEJsb2IgPSBibG9iO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuaGlkZSg0MDApO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgIH0pXG59KTtcbiIsIndpbmRvdy5jcmVhdGVOZXdHaWcgPSAoZnVuY3Rpb24oKSB7XG4gICAgJChcIiNhZGQtZ2lnXCIpLmZpbmQoXCIjbmV3R2lnZXhwaXJlXCIpLmRhdGVwaWNrZXIoKTtcbiAgICAkKFwiI2FkZC1naWdcIikub24oXCJoaWRkZW4uYnMubW9kYWxcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCIuZ2lnLXRhZ3NcIikuZmluZChcIi5kZWxldGVcIikuY2xpY2soKTtcbiAgICAgICAgJCh0aGlzKVxuICAgICAgICAgICAgLmZpbmQoXCJpbWcjaW5wdXQtaW1hZ2UtZ2lnXCIpLmhpZGUoKS5hZGRDbGFzcyhcImVtcHR5XCIpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIi5pbWctbGFiZWxcIikuc2hvdygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLnRleHQoJycpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmhpZGUoKS5lbmQoKVxuICAgICAgICAgICAgLmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuaGlkZSgpO1xuICAgICAgICAkKHRoaXMpXG4gICAgICAgICAgICAuZmluZChcImlucHV0LHRleHRhcmVhLHNlbGVjdFwiKS52YWwoXCJcIikuZW5kKClcbiAgICAgICAgICAgIC5maW5kKFwiLnJhbmdlLXNsaWRlclwiKVxuICAgICAgICAgICAgLmZpbmQoXCJpbnB1dFwiKS52YWwoXCIwXCIpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIi5yYW5nZS1zbGlkZXJfX3ZhbHVlXCIpLnRleHQoXCIwXCIpO1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCIjbmV3LWdpZy1jYXRlZ29yeVwiKS5wYXJlbnQoKS5maW5kKFwiLnRleHRcIikudGV4dChcIkFsbCBDYXRlZ29yaWVzXCIpO1xuICAgIH0pO1xufSkoKTsiLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcbndpbmRvdy5naWdzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xuXG4gICAgZnVuY3Rpb24gaW5pdEdpZ3MoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5uYXYtdGFicyAuZ2lncycpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgZ2V0TGlzdE9mR2lncygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uaW5pdEdpZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRHaWdzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygnZ2lncy1wYWdlJykpIHtcbiAgICAgICAgZ2lnc1BhZ2VNb2R1bGUub25pbml0R2lncygpO1xuICAgIH1cbn0pOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LnByb2ZpbGVQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZSgpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblxuICAgICAgICAvKiBSRVNFVCBBTkQgR0VUIE5FVyBQUk9GSUxFIElEIEhBU0ggKi9cbiAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IG51bGw7XG5cbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gd2luZG93LmxvY2F0aW9uLmhhc2guc2xpY2UoMSk7XG4gICAgICAgICAgICB1cGRhdGVQcm9maWxlKCk7XG4gICAgICAgICAgICBnZXRHaWdzKHdpbmRvdy5wcm9maWxlSUQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJCgnLnJlZGVzaWduZWQtZ2lnLW1vZGFsJykuYWRkQ2xhc3MoJ25vLWJ1dHRvbi1vcmRlcicpO1xuICAgICAgICAgICAgJCgnLmVkaXRCdG5Qcm9maWxlJykucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgZ2V0Tm9kZURhdGEoZnVuY3Rpb24obm9kZURhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2Uobm9kZURhdGEpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSBkYXRhLmd1aWQ7XG4gICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgdXBkYXRlUHJvZmlsZSgpO1xuICAgICAgICAgICAgICAgIGdldEdpZ3MoZGF0YS5ndWlkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIGdldEdpZ3MoZ3VpZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhndWlkKTtcbiAgICAgICAgZ2V0UHJvZmlsZUdpZ3MoZ3VpZCwgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICAgICAgdmFyIHByb2ZpbGVfZ2lncyA9IEpTT04ucGFyc2UoZGF0YSk7XG4gICAgICAgICAgICAkKCcuZ2lncy1wcm9maWxlLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2ZpbGVfZ2lncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL3YxL2RodC9oa2V5Lz9oa2V5PVwiICsgcHJvZmlsZV9naWdzW2ldLFxuICAgICAgICAgICAgICAgICAgICBoazogcHJvZmlsZV9naWdzW2ldLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaWdfbyA9IEpTT04ucGFyc2UoanNfZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VSUicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbmluaXQ6IGluaXRQcm9maWxlLFxuICAgICAgICBnZXRBbGxHaWdzOiBnZXRHaWdzXG4gICAgfVxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlLXBhZ2UnKSkge1xuICAgICAgICBwcm9maWxlUGFnZU1vZHVsZS5vbmluaXQoKTtcbiAgICB9XG59KTsiLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcbndpbmRvdy5wcm9maWxlc1BhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcblxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlcygpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5wcm9maWxlcycpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgbWFpbl9wcm9maWxlX2NhcmRzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0cHJvZmlsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSkge1xuICAgICAgICBwcm9maWxlc1BhZ2VNb2R1bGUub25pbml0cHJvZmlsZXMoKTtcbiAgICB9XG59KTtcbiIsIndpbmRvdy5uZXdHaWdSYW5nZVNsaWRlciA9IChmdW5jdGlvbigpIHtcbiAgdmFyIHJhbmdlU2xpZGVyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNsaWRlciA9ICQoXCIucmFuZ2Utc2xpZGVyXCIpLFxuICAgICAgcmFuZ2UgPSAkKFwiLnJhbmdlLXNsaWRlcl9fcmFuZ2VcIiksXG4gICAgICB2YWx1ZSA9ICQoXCIucmFuZ2Utc2xpZGVyX192YWx1ZVwiKTtcblxuICAgIHNsaWRlci5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFsdWUuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gJCh0aGlzKVxuICAgICAgICAgIC5wcmV2KClcbiAgICAgICAgICAuYXR0cihcInZhbHVlXCIpO1xuICAgICAgICAkKHRoaXMpLmh0bWwodmFsdWUpO1xuICAgICAgfSk7XG5cbiAgICAgIHJhbmdlLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG4gICAgICAgICQodGhpcylcbiAgICAgICAgICAubmV4dCh2YWx1ZSlcbiAgICAgICAgICAuaHRtbCh0aGlzLnZhbHVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gIHJhbmdlU2xpZGVyKCk7XG59KSgpO1xuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuc21hcnRTZWFyY2hNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgU21hcnQgU2VhcmNoXG5cbiAgICB2YXIgc2VhcmNoQXJyYXkgPSBuZXcgQXJyYXkoKTtcbiAgICB2YXIga2V5dXBUaW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgZGF0YUxlbmd0aCA9IDBcblxuICAgIHZhciBzZWFyY2hBID0gJyc7XG5cbiAgICBmdW5jdGlvbiBzbWFydFNlYXJjaCgpIHtcbiAgICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xuICAgICAgICAvLyBidWlsZCB1cmwgZm9yIHNlYXJjaGluZ1xuICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAkLmVhY2goc2VhcmNoQXJyYXksIGZ1bmN0aW9uKGksIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoUSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnICYmIGl0ZW0udmFsdWUgPT0gJycgJiYgc2VhcmNoQXJyYXkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnYWxsJztcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCAhPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGFncycgJiYgaXRlbS52YWx1ZSA9PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICdjYXRlZ29yeScgJiYgaXRlbS52YWx1ZSA9PSAnYWxsJykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCYnICsgaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnJicgKyBpdGVtLnR5cGUgKyAnPScgKyBpdGVtLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gc2VhcmNoUTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSAnYWxsJztcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgIHVybDogdXJsICsgJyZsaW1pdD0xMDAwJyxcbiAgICAgICAgICAgIHFyeTogc2VhcmNoQSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT0gJ251bGwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IHJlc3VsdDogYE5vIHJlc3VsdHMgZm9yIHRoaXMgc2VhcmNoYCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTZWFyY2ggRXZlbnRzXG5cbiAgICAvLyBTdWJtaXQgc2VhcmNoIGZvciB0ZXh0IGZpZWxkXG4gICAgJChkb2N1bWVudCkub24oJ2tleXVwJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlLmxlbmd0aCA8IDIgJiYgdGhpcy52YWx1ZS5sZW5ndGggPiAwKSByZXR1cm47XG4gICAgICAgIGxpbWl0ID0gOTtcbiAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0U3RyaW5nID0gJChlLnRhcmdldCkudmFsKCkuc3BsaXQoXCIgXCIpLmpvaW4oXCIlMjBcIik7XG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWFyY2hBcnJheSk7XG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICB9KTtcblxuICAgIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIGRyb3Bkb3duIGV4cGVydGlzZVxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9ICQodGhpcykuZHJvcGRvd24oJ2dldCB2YWx1ZScpO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ2NhdGVnb3J5JywgdmFsdWU6IGVsIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgICAgICAgICAgaWYgKGVsICE9ICdhbGwnKSBsb2FkX3RhZ3NfcGVyX2RvbWFpbihlbCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNza2lsbHMtdGFncycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcbiAgICAgICAgY29uc29sZS5sb2coZWwpO1xuICAgICAgICBpZiAoZWwgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSBlbC5qb2luKFwiJTIwXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKVxuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0YWdzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0YWdzJywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0YWdzID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsICcjc2xpZGVyLXJhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSAkKHRoaXMpLnNsaWRlcihcInZhbHVlc1wiKTtcbiAgICAgICAgaWYgKHZhbHVlc1swXSA9PSAwICYmIHZhbHVlc1sxXSA9PSAyMDAwKSB7XG4gICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBxMXJhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHExcmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHExcmFuZ2UgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cblxuXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmxvYWQtbW9yZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaW1pdCA9IGxpbWl0ICsgOTtcbiAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBzZWFyY2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNtYXJ0U2VhcmNoKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7Il19
