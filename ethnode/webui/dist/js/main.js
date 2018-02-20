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

    function generateGigsFromData(gigID, gigObject, isOwn, one) {

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
                    if (one == true) {
                        $(".gigs-container").prepend(gigLayout);
                    } else {
                        $(".gigs-container").append(gigLayout);
                    }
                    componentHandler.upgradeDom();
                });
            });
        }
    }

    return {
        generate: function generate(id, obj, isOwn, one) {
            return generateGigsFromData(id, obj, isOwn, one);
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
"use strict";

window.$uploadCrop = $("#cropper-wrap-gig").croppie({
  viewport: {
    width: 450,
    height: 150
  },
  enableZoom: true,
  enableResize: true
});

window.$uploadCropProfile = $("#cropper-wrap-profile").croppie({
  viewport: {
    width: 150,
    height: 150,
    type: "circle"
  },
  enableZoom: true,
  enableResize: true
});

$(document).ready(function () {
  /* BUTTON INIT CLICK ON INPUT TYPE FILE */
  $(document).on('click', '.jsCropUpload', function () {
    var $content = $(this).closest('.content');
    $content.find('input#input-image-gig').click();
  });

  $(document).on("click", ".jsCropUploadProfile", function () {
    var $content = $(this).closest(".content");
    $content.find("input#input-image-profile").click();
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

  $(document).on("click", ".jsCropResultProfile", function (e) {
    e.preventDefault();
    var $content = $(this).closest(".content");
    window.$uploadCropProfile.croppie("result", "base64").then(function (base64) {
      $content.find("span#input-image-profile").css("background-image", 'url(' + base64 + ')').show(500).removeClass("empty");
      $content.find($("#cropper-wrap-profile")).show(500);
      $content.find($(".btns-wrap").find(".btn-success")).show();
    });
    window.$uploadCropProfile.croppie("result", "blob").then(function (blob) {
      window.$uploadCropBlobProfile = blob;
      $content.find($("#cropper-wrap-profile")).hide(400);
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

    var calculatedLock;
    $('.jsCalculatedLock').on('input', function () {
        var cost = $('#reputationCost').val(),
            amount = $('#amount').val(),
            $calculatedLock = $('#calculatedLock'),
            calculatedLock = calcLock(cost, amount);
        $calculatedLock.text(calculatedLock + ' ERT');
    });
}();

function calcLock(cost, amount) {
    return cost * amount / 100;
}

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

    function renderOneGig(gigid, one) {
        $.ajax({
            url: "/api/v1/dht/hkey/?hkey=" + gigid,
            hk: gigid,
            type: "GET",
            processData: false,
            success: function success(js_data) {
                if (js_data != 'null') {
                    var gig_o = JSON.parse(js_data);
                    generateGigsModule.generate(this.hk, gig_o, true, one);
                } else {
                    $('.preloader-card').remove();
                }
            },
            error: function error(_error2) {
                console.log('ERR', _error2);
                return;
            }
        });
    }

    return {
        oninit: initProfile,
        getAllGigs: getGigs,
        renderOneGig: renderOneGig
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

    $(document).on('click', '.jsLoadMoreProfiles', function () {
        limit = limit + 9;
        main_profile_cards();
    });

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

    $(document).on('click', '.jsLoadMoreSearch', function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdFByb2ZpbGUuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlcy5qcyIsInNyYy9qcy9tb2R1bGVzL3JhbmdlLXNsaWRlci5qcyIsInNyYy9qcy9tb2R1bGVzL3NtYXJ0U2VhcmNoLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSwyQkFBUixFLENBQXNDO0FBQ3RDLFFBQVEsd0JBQVIsRSxDQUFtQztBQUNuQyxRQUFRLDRCQUFSLEUsQ0FBdUM7QUFDdkMsUUFBUSw2QkFBUixFLENBQXdDO0FBQ3hDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHlCQUFSLEUsQ0FBb0M7QUFDcEMsUUFBUSwyQkFBUixFLENBQXNDO0FBQ3RDLFFBQVEsMEJBQVIsRSxDQUFxQzs7Ozs7QUNSckM7QUFDQSxPQUFPLGtCQUFQLEdBQTZCLFlBQVc7O0FBRXBDLGFBQVMsb0JBQVQsQ0FBOEIsS0FBOUIsRUFBcUMsU0FBckMsRUFBZ0QsS0FBaEQsRUFBdUQsR0FBdkQsRUFBNEQ7O0FBRXhELFlBQUkseUJBQXlCLFNBQXpCLENBQUosRUFBeUM7QUFBRTtBQUFROztBQUVuRCxZQUFJLFVBQVUsaUJBQWQ7QUFDQSxZQUFJLGdCQUFnQixJQUFwQjtBQUNBLFlBQUksYUFBYSxJQUFqQjtBQUNBLFlBQUksVUFBVSxFQUFkO0FBQ0EsWUFBSSxXQUFXLEVBQWY7QUFDQSxZQUFJ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S0FBWixHQUFvQixPQUFPLENBQVAsQ0FBOUMsRUFBakI7QUFDSDtBQUNELDhCQUFrQixNQUFsQjtBQUNILFNBakJELEVBaUJHLEdBakJIO0FBa0JILEtBOUJEOztBQW1DQSxNQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsT0FBZixFQUF3QixtQkFBeEIsRUFBNkMsWUFBVztBQUNwRCxnQkFBUSxRQUFRLENBQWhCO0FBQ0EsMEJBQWtCLE1BQWxCO0FBQ0gsS0FIRDs7QUFLQSxXQUFPO0FBQ0gsZ0JBQVEsa0JBQVc7QUFDZixtQkFBTyxhQUFQO0FBQ0g7QUFIRSxLQUFQO0FBTUgsQ0E1TDBCLEVBQTNCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJyZXF1aXJlKFwiLi9tb2R1bGVzL3NtYXJ0U2VhcmNoLmpzXCIpOyAvLyBNT0RVTEUgRk9SIFNFQVJDSElOR1xucmVxdWlyZShcIi4vbW9kdWxlcy9nbG9iYWxFdmVudHMuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdMT0JBTCBFVkVOVFNcbnJlcXVpcmUoXCIuL21vZHVsZXMvaW1hZ2VDcm9wLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTUFHRSBDUk9QUEVSXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGUuanNcIik7IC8vIE1PRFVMRSB3aXRoIElOSVQgUFJPRklMRSBQQUdFXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGVzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxucmVxdWlyZShcIi4vbW9kdWxlcy9nZW5lcmF0ZUdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdpZ3MgZ2VuZXJhdG9yXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdEdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdJR1MgUEFHRSBJTklUXG5yZXF1aXJlKFwiLi9tb2R1bGVzL3JhbmdlLXNsaWRlci5qc1wiKTsgLy8gTU9EVUxFIHdpdGggUkFOR0UgU0xJREVSXG5yZXF1aXJlKFwiLi9tb2R1bGVzL25ld0dpZ01vZGFsLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBDUkVBVEUgTkVXIEdJRyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LmdlbmVyYXRlR2lnc01vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlR2lnc0Zyb21EYXRhKGdpZ0lELCBnaWdPYmplY3QsIGlzT3duLCBvbmUpIHtcbiAgICAgICBcbiAgICAgICAgaWYgKGNoZWNrX2dpZ19tYXJrZWRfZGVsZXRlZChnaWdPYmplY3QpKSB7IHJldHVybiB9XG5cbiAgICAgICAgdmFyIGFwaV9jZG4gPSBhcGlfZ2V0X2Nkbl91cmwoKTtcbiAgICAgICAgdmFyIHByb2ZpbGVfaW1hZ2UgPSBudWxsO1xuICAgICAgICB2YXIgb3duZXJfZ3VpZCA9IG51bGw7XG4gICAgICAgIHZhciBpbWdfc3JjID0gJyc7XG4gICAgICAgIHZhciBmdWxsbmFtZSA9ICcnO1xuICAgICAgICB2YXIgY2F0ZWdvcnlPYmogPSB7XG4gICAgICAgICAgICBcInNkXCI6IFwiU29mdHdhcmUgRGV2ZWxvcG1lbnRcIixcbiAgICAgICAgICAgIFwiZmFcIjogXCJGaW5hbmNlICYgQWNjb3VudGluZ1wiLFxuICAgICAgICAgICAgXCJtYVwiOiBcIk11c2ljICYgQXVkaW9cIixcbiAgICAgICAgICAgIFwiZ2RcIjogXCJHcmFwaGljICYgRGVzaWduXCIsXG4gICAgICAgICAgICBcInZhXCI6IFwiVmlkZW8gJiBBbmltYXRpb25cIixcbiAgICAgICAgICAgIFwidHdcIjogXCJUZXh0ICYgV3JpdGluZ1wiLFxuICAgICAgICAgICAgXCJjc1wiOiBcIkNvbnN1bHRpbmcgU2VydmljZXNcIixcbiAgICAgICAgICAgIFwib3NcIjogXCJPdGhlciBTZXJ2aWNlc1wiXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcm91bmRfcHJpY2UgPSBNYXRoLnJvdW5kKGdpZ09iamVjdC5wcmljZSAqIDEwMDApIC8gMTAwMDtcbiAgICAgICAgdmFyIGdpZ0RlbGV0ZVN0cmluZyA9ICcnO1xuICAgICAgICBpZiAoaXNPd24pIHtcbiAgICAgICAgICAgIHZhciBnaWdEZWxldGVTdHJpbmcgPSAnPGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0gZGVsZXRlXCI+RGVsZXRlPC9saT4nXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRyb3Bkb3duQnV0dG9uID0gJzxidXR0b24gaWQ9XCJEREInICsgZ2lnSUQgKyAnXCIgY2xhc3M9XCJkcm9wZG93bi1naWcgbWRsLWJ1dHRvbiBtZGwtanMtYnV0dG9uIG1kbC1idXR0b24tLWljb24gZHJvcGRvd24tYnV0dG9uIGJ0bi1pbmZvLWVkaXRcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+bW9yZV92ZXJ0PC9pPjwvYnV0dG9uPic7XG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT4nICsgZ2lnRGVsZXRlU3RyaW5nICsgJzwvdWw+JztcblxuICAgICAgICBpZiAoZ2lnT2JqZWN0Lmhhc093blByb3BlcnR5KCdvd25lcl9ndWlkJykpIHtcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcblxuICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICdwcm9maWxlUGljdHVyZScsIGZ1bmN0aW9uKHByb2ZpbGVQaWN0dXJlVVJMKSB7XG4gICAgICAgICAgICAgICAgaW1nX3NyYyA9IGFwaV9jZG4gKyBKU09OLnBhcnNlKHByb2ZpbGVQaWN0dXJlVVJMKSArICcmdGh1bWI9MSc7XG4gICAgICAgICAgICAgICAgLy8gJCgnI2ltZ2F2JyArIGdpZ0lEKS5hdHRyKCdzcmMnLCBwX3NyYyk7XG4gICAgICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICduYW1lJywgZnVuY3Rpb24obmFtZV9qc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc19vID0gSlNPTi5wYXJzZShuYW1lX2pzdHIpO1xuICAgICAgICAgICAgICAgICAgICBmdWxsbmFtZSA9IG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gJCgnI25tb3duJyArIGdpZ0lEKS50ZXh0KG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdMYXlvdXQgPSBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImltZy1jYXJkXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB1cmwoJHthcGlfY2RuICsgZ2lnT2JqZWN0LmltYWdlX2hhc2h9JnRodW1iPTEpIGNlbnRlciBuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogY292ZXI7XCIgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25CdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93blVMfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWxhYmVsXCI+JHtjYXRlZ29yeU9ialtnaWdPYmplY3QuY2F0ZWdvcnldfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWltZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXYtaW1nLXdyYXBcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgnJHtpbWdfc3JjfScpXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1uYW1lXCIgaWQ9XCJubW93biR7Z2lnSUR9XCI+JHtmdWxsbmFtZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInVzZXItcm9sZVwiPiR7Y2F0ZWdvcnlPYmpbZ2lnT2JqZWN0LmNhdGVnb3J5XX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcmljZVwiPlNUQVJUSU5HIEFUOiA8c3Bhbj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cG9seW1lcjwvaT4ke3JvdW5kX3ByaWNlfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbmUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5naWdzLWNvbnRhaW5lclwiKS5wcmVwZW5kKGdpZ0xheW91dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChnaWdMYXlvdXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaWQsIG9iaiwgaXNPd24sIG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGdlbmVyYXRlR2lnc0Zyb21EYXRhKGlkLCBvYmosIGlzT3duLCBvbmUpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuIiwiZnVuY3Rpb24gZmlsdGVyUHJvZmlsZUNhcmRzKHF1ZXJ5LCAkaW5wdXQpIHtcbiAgLyogQ0hFQ0sgRk9SIFFVRVJZIE1BVENIIFdJVEggTkFNRSAqL1xuICAkKCcucHJvZmlsZS11c2VyLWNhcmQnKS5lYWNoKGZ1bmN0aW9uKGksaXRlbSkge1xuICAgIHZhciBuYW1lID0gJChpdGVtKS5maW5kKCcudXNlci1uYW1lJykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgbmFtZS5tYXRjaChxdWVyeS50b0xvd2VyQ2FzZSgpKSA/ICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpIDogJChpdGVtKS5hZGRDbGFzcygnaGlkZGVuJylcbiAgfSk7XG4gIC8qIEFERCBSRUQgQk9SREVSIFRPIElOUFVUIElGIE5PIFNFQVJDSCBNQVRDSEVEICovXG4gICQoJy5wcm9maWxlLXVzZXItY2FyZCcpLmxlbmd0aCA9PSAkKCcucHJvZmlsZS11c2VyLWNhcmQuaGlkZGVuJykubGVuZ3RoID8gJGlucHV0LmFkZENsYXNzKCdlcnJvcicpIDogJGlucHV0LnJlbW92ZUNsYXNzKCdlcnJvcicpO1xufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAvLyBHbG9iYWwgRXZlbnRzXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLmRyb3Bkb3duJykubGVuZ3RoKSB7XG4gICAgICAgICAgJCgnI3NldHRpbmdzLWRyb3Bkb3duJykucGFyZW50cygnLmRyb3Bkb3duJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICAgIH1cbiAgfSk7XG4gIC8vIERyb3Bkb3duIHNob3cgaW4gaGVhZGVyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjc2V0dGluZ3MtZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnc2hvdycpO1xuICAgICAgLy8gLnNpYmxpbmdzKCdbZGF0YS1sYWJlbGxlZGJ5PXNldHRpbmdzLWRyb3Bkb3duXScpLlxuICB9KTtcblxuICAvLyBPUEVOIEdJRyBCSUcgTU9EQUwgT04gTUVOVSBjbGlja1xuICAkKCdib2R5JykuZGVsZWdhdGUoJ2xpLmpzLW9wZW4tZ2lnLW1vZGFsJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICQodGhpcykuY2xvc2VzdCgnLmdpZycpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gIH0pO1xuXG4gIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXG4gIGlmICggJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykgKSB7XG4gICAgLyogRklMVEVSIFBST0ZJTEUgQ0FSRFMgKi9cbiAgICAkKGRvY3VtZW50KS5vbignaW5wdXQnLCAnLnByb2ZpbGVzLXBhZ2UgI3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIGZpbHRlclByb2ZpbGVDYXJkcyggJCh0aGlzKS52YWwoKSwgJCh0aGlzKSApO1xuICAgIH0pO1xuXG4gICAgLyogT1BFTiBJTlRFUk5BTCBQUk9GSUxFIFBBR0UgKi9cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucHJvZmlsZS11c2VyLWNhcmQnLGZ1bmN0aW9uKCl7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvdWkvcHJvZmlsZS8jJyArICQodGhpcykuYXR0cignaWQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJFRElSRUNUIFRPIFBST0ZJTEUgUEFHRSBPTiBDTElDSyBPTiBVU0VSUyBQUk9GSUxFXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc09wZW5HaWdPd25lclByb2ZpbGUnLGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XG4gIH0pO1xufSlcbiIsIndpbmRvdy4kdXBsb2FkQ3JvcCA9ICQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKS5jcm9wcGllKHtcbiAgdmlld3BvcnQ6IHtcbiAgICB3aWR0aDogNDUwLFxuICAgIGhlaWdodDogMTUwXG4gIH0sXG4gIGVuYWJsZVpvb206IHRydWUsXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxufSk7XG5cbndpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUgPSAkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpLmNyb3BwaWUoe1xuICB2aWV3cG9ydDoge1xuICAgIHdpZHRoOiAxNTAsXG4gICAgaGVpZ2h0OiAxNTAsXG4gICAgdHlwZTogXCJjaXJjbGVcIlxuICB9LFxuICBlbmFibGVab29tOiB0cnVlLFxuICBlbmFibGVSZXNpemU6IHRydWVcbn0pO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIC8qIEJVVFRPTiBJTklUIENMSUNLIE9OIElOUFVUIFRZUEUgRklMRSAqL1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc0Nyb3BVcGxvYWQnLGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb250ZW50Jyk7XG4gICAgICAkY29udGVudC5maW5kKCdpbnB1dCNpbnB1dC1pbWFnZS1naWcnKS5jbGljaygpO1xuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5qc0Nyb3BVcGxvYWRQcm9maWxlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XG4gICAgICAkY29udGVudC5maW5kKFwiaW5wdXQjaW5wdXQtaW1hZ2UtcHJvZmlsZVwiKS5jbGljaygpO1xuICAgIH0pO1xuXG4gICAgLyogQlVUVE9OIEZPUiBHRVRUSU5HIENST1AgUkVTVWx0ICovXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFJlc3VsdCcsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb250ZW50Jyk7XG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3AuY3JvcHBpZSgncmVzdWx0JywnYmFzZTY0JykudGhlbiggZnVuY3Rpb24oYmFzZTY0KSB7XG4gICAgICAgICRjb250ZW50LmZpbmQoJ2ltZyNpbnB1dC1pbWFnZS1naWcnKS5hdHRyKCdzcmMnLCBiYXNlNjQpLnNob3coNTAwKS5yZW1vdmVDbGFzcygnZW1wdHknKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1naWdcIikpLnNob3coNTAwKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5zaG93KCk7XG4gICAgICB9KTtcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcC5jcm9wcGllKCdyZXN1bHQnLCdibG9iJykudGhlbiggZnVuY3Rpb24oYmxvYikge1xuICAgICAgICB3aW5kb3cuJHVwbG9hZENyb3BCbG9iID0gYmxvYjtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1naWdcIikpLmhpZGUoNDAwKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XG4gICAgICB9KTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5qc0Nyb3BSZXN1bHRQcm9maWxlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdChcIi5jb250ZW50XCIpO1xuICAgICAgd2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZS5jcm9wcGllKFwicmVzdWx0XCIsIFwiYmFzZTY0XCIpLnRoZW4oZnVuY3Rpb24oYmFzZTY0KSB7XG4gICAgICAgICAgJGNvbnRlbnQuZmluZChcInNwYW4jaW5wdXQtaW1hZ2UtcHJvZmlsZVwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsICd1cmwoJysgYmFzZTY0ICsnKScpLnNob3coNTAwKS5yZW1vdmVDbGFzcyhcImVtcHR5XCIpO1xuICAgICAgICAgICRjb250ZW50LmZpbmQoJChcIiNjcm9wcGVyLXdyYXAtcHJvZmlsZVwiKSkuc2hvdyg1MDApO1xuICAgICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUuY3JvcHBpZShcInJlc3VsdFwiLCBcImJsb2JcIikudGhlbihmdW5jdGlvbihibG9iKSB7XG4gICAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcEJsb2JQcm9maWxlID0gYmxvYjtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5oaWRlKDQwMCk7XG4gICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuaGlkZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIndpbmRvdy5jcmVhdGVOZXdHaWcgPSAoZnVuY3Rpb24oKSB7XG4gICAgJChcIiNhZGQtZ2lnXCIpLmZpbmQoXCIjbmV3R2lnZXhwaXJlXCIpLmRhdGVwaWNrZXIoKTtcbiAgICAkKFwiI2FkZC1naWdcIikub24oXCJoaWRkZW4uYnMubW9kYWxcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCIuZ2lnLXRhZ3NcIikuZmluZChcIi5kZWxldGVcIikuY2xpY2soKTtcbiAgICAgICAgJCh0aGlzKVxuICAgICAgICAgICAgLmZpbmQoXCJpbWcjaW5wdXQtaW1hZ2UtZ2lnXCIpLmhpZGUoKS5hZGRDbGFzcyhcImVtcHR5XCIpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIi5pbWctbGFiZWxcIikuc2hvdygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLnRleHQoJycpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmhpZGUoKS5lbmQoKVxuICAgICAgICAgICAgLmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuaGlkZSgpO1xuICAgICAgICAkKHRoaXMpXG4gICAgICAgICAgICAuZmluZChcImlucHV0LHRleHRhcmVhLHNlbGVjdFwiKS52YWwoXCJcIikuZW5kKClcbiAgICAgICAgICAgIC5maW5kKFwiLnJhbmdlLXNsaWRlclwiKVxuICAgICAgICAgICAgLmZpbmQoXCJpbnB1dFwiKS52YWwoXCIwXCIpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIi5yYW5nZS1zbGlkZXJfX3ZhbHVlXCIpLnRleHQoXCIwXCIpO1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCIjbmV3LWdpZy1jYXRlZ29yeVwiKS5wYXJlbnQoKS5maW5kKFwiLnRleHRcIikudGV4dChcIkFsbCBDYXRlZ29yaWVzXCIpO1xuICAgIH0pO1xuXG4gICAgdmFyIGNhbGN1bGF0ZWRMb2NrO1xuICAgICQoJy5qc0NhbGN1bGF0ZWRMb2NrJykub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvc3QgPSAkKCcjcmVwdXRhdGlvbkNvc3QnKS52YWwoKSxcbiAgICAgICAgICBhbW91bnQgPSAkKCcjYW1vdW50JykudmFsKCksXG4gICAgICAgICAgJGNhbGN1bGF0ZWRMb2NrID0gJCgnI2NhbGN1bGF0ZWRMb2NrJyksXG4gICAgICAgICAgY2FsY3VsYXRlZExvY2sgPSBjYWxjTG9jayhjb3N0LCBhbW91bnQpXG4gICAgICAgICAgJGNhbGN1bGF0ZWRMb2NrLnRleHQoY2FsY3VsYXRlZExvY2sgKyAnIEVSVCcpO1xuICAgIH0pXG5cbn0pKCk7XG5cbmZ1bmN0aW9uIGNhbGNMb2NrIChjb3N0LCBhbW91bnQpIHtcbiAgcmV0dXJuIChjb3N0ICogYW1vdW50KSAvIDEwMDtcbn1cbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LmdpZ3NQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0R2lncygpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5naWdzJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBnZXRMaXN0T2ZHaWdzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0R2lnczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5pdEdpZ3MoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdnaWdzLXBhZ2UnKSkge1xuICAgICAgICBnaWdzUGFnZU1vZHVsZS5vbmluaXRHaWdzKCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cucHJvZmlsZVBhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcblxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlKCkge1xuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXG4gICAgICAgIC8qIFJFU0VUIEFORCBHRVQgTkVXIFBST0ZJTEUgSUQgSEFTSCAqL1xuICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gbnVsbDtcblxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKTtcbiAgICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoKTtcbiAgICAgICAgICAgIGdldEdpZ3Mod2luZG93LnByb2ZpbGVJRCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKCcucmVkZXNpZ25lZC1naWctbW9kYWwnKS5hZGRDbGFzcygnbm8tYnV0dG9uLW9yZGVyJyk7XG4gICAgICAgICAgICAkKCcuZWRpdEJ0blByb2ZpbGUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICBnZXROb2RlRGF0YShmdW5jdGlvbihub2RlRGF0YSkge1xuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShub2RlRGF0YSk7XG4gICAgICAgICAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IGRhdGEuZ3VpZDtcbiAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICB1cGRhdGVQcm9maWxlKCk7XG4gICAgICAgICAgICAgICAgZ2V0R2lncyhkYXRhLmd1aWQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZ2V0R2lncyhndWlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGd1aWQpO1xuICAgICAgICBnZXRQcm9maWxlR2lncyhndWlkLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICB2YXIgcHJvZmlsZV9naWdzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvZmlsZV9naWdzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBwcm9maWxlX2dpZ3NbaV0sXG4gICAgICAgICAgICAgICAgICAgIGhrOiBwcm9maWxlX2dpZ3NbaV0sXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IFwiR0VUXCIsXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oanNfZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGpzX2RhdGEgIT0gJ251bGwnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ19vID0gSlNPTi5wYXJzZShqc19kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUdpZ3NNb2R1bGUuZ2VuZXJhdGUodGhpcy5oaywgZ2lnX28sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRVJSJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlbmRlck9uZUdpZyhnaWdpZCwgb25lKSB7XG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB1cmw6IFwiL2FwaS92MS9kaHQvaGtleS8/aGtleT1cIiArIGdpZ2lkLFxuICAgICAgICAgICAgaGs6IGdpZ2lkLFxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ19vID0gSlNPTi5wYXJzZShqc19kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vLCB0cnVlLCBvbmUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRVJSJywgZXJyb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0OiBpbml0UHJvZmlsZSxcbiAgICAgICAgZ2V0QWxsR2lnczogZ2V0R2lncyxcbiAgICAgICAgcmVuZGVyT25lR2lnOiByZW5kZXJPbmVHaWdcbiAgICB9XG59KSgpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGUtcGFnZScpKSB7XG4gICAgICAgIHByb2ZpbGVQYWdlTW9kdWxlLm9uaW5pdCgpO1xuICAgIH1cbn0pOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LnByb2ZpbGVzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xuXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGVzKCkge1xuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcubmF2LXRhYnMgLnByb2ZpbGVzJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcbiAgICB9XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzTG9hZE1vcmVQcm9maWxlcycsIGZ1bmN0aW9uKCkge1xuICAgICAgICBsaW1pdCA9IGxpbWl0ICsgOTtcbiAgICAgICAgbWFpbl9wcm9maWxlX2NhcmRzKCk7XG4gICAgfSk7XG5cblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uaW5pdHByb2ZpbGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbml0UHJvZmlsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZXNQYWdlTW9kdWxlLm9uaW5pdHByb2ZpbGVzKCk7XG4gICAgfVxufSk7XG4iLCJ3aW5kb3cubmV3R2lnUmFuZ2VTbGlkZXIgPSAoZnVuY3Rpb24oKSB7XG5cdHZhciByYW5nZVNsaWRlciA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzbGlkZXIgPSAkKFwiLnJhbmdlLXNsaWRlclwiKSxcblx0XHRcdHJhbmdlID0gJChcIi5yYW5nZS1zbGlkZXJfX3JhbmdlXCIpLFxuXHRcdFx0dmFsdWUgPSAkKFwiLnJhbmdlLXNsaWRlcl9fdmFsdWVcIik7XG5cblx0XHRzbGlkZXIuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdHZhbHVlLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciB2YWx1ZSA9ICQodGhpcylcblx0XHRcdFx0XHQucHJldigpXG5cdFx0XHRcdFx0LmF0dHIoXCJ2YWx1ZVwiKTtcblx0XHRcdFx0JCh0aGlzKS5odG1sKHZhbHVlKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyYW5nZS5vbihcImlucHV0XCIsIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQkKHRoaXMpXG5cdFx0XHRcdFx0Lm5leHQodmFsdWUpXG5cdFx0XHRcdFx0Lmh0bWwodGhpcy52YWx1ZSk7XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fTtcblxuXHRyYW5nZVNsaWRlcigpO1xufSkoKTtcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LnNtYXJ0U2VhcmNoTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuICAgIC8vIEdsb2JhbCB2YXJpYWJsZXMgZm9yIFNtYXJ0IFNlYXJjaFxuXG4gICAgdmFyIHNlYXJjaEFycmF5ID0gbmV3IEFycmF5KCk7XG4gICAgdmFyIGtleXVwVGltZW91dCA9IG51bGw7XG4gICAgdmFyIGRhdGFMZW5ndGggPSAwXG5cbiAgICB2YXIgc2VhcmNoQSA9ICcnO1xuXG4gICAgZnVuY3Rpb24gc21hcnRTZWFyY2goKSB7XG4gICAgICAgIHZhciB1cmwgPSBhcGlfaWR4X2Nkbl91cmwoKTtcbiAgICAgICAgLy8gYnVpbGQgdXJsIGZvciBzZWFyY2hpbmdcbiAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgJC5lYWNoKHNlYXJjaEFycmF5LCBmdW5jdGlvbihpLCBpdGVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIHNlYXJjaFEgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnYWxsJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcgJiYgaXRlbS52YWx1ZSA9PSAnJyAmJiBzZWFyY2hBcnJheS5sZW5ndGggIT0gMSkge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnICYmIGl0ZW0udmFsdWUgPT0gJ3NlbGVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0YWdzJyAmJiBpdGVtLnZhbHVlID09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnY2F0ZWdvcnknICYmIGl0ZW0udmFsdWUgPT0gJ2FsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICdxMXJhbmdlJyAmJiBzZWFyY2hBcnJheS5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hRICs9ICdhbGwmJyArIGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBzZWFyY2hRO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJyYnICsgaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XG4gICAgICAgIH1cblxuICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXG4gICAgICAgICAgICB1cmw6IHVybCArICcmbGltaXQ9MTAwMCcsXG4gICAgICAgICAgICBxcnk6IHNlYXJjaEEsXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuICAgICAgICAgICAgICAgIGlmIChkYXRhID09ICdudWxsJykge1xuICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoeyByZXN1bHQ6IGBObyByZXN1bHRzIGZvciB0aGlzIHNlYXJjaGAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGV2ZW50X29uX3NlYXJjaF9naWdfZGF0YShkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU2VhcmNoIEV2ZW50c1xuXG4gICAgLy8gU3VibWl0IHNlYXJjaCBmb3IgdGV4dCBmaWVsZFxuICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsICdpbnB1dCNzZWFyY2gtaGVhZGVyJywgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAodGhpcy52YWx1ZS5sZW5ndGggPCAyICYmIHRoaXMudmFsdWUubGVuZ3RoID4gMCkgcmV0dXJuO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIG91dHB1dFN0cmluZyA9ICQoZS50YXJnZXQpLnZhbCgpLnNwbGl0KFwiIFwiKS5qb2luKFwiJTIwXCIpO1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0ZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0ZXh0ID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc29sZS5sb2coc2VhcmNoQXJyYXkpO1xuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDUwMCk7XG4gICAgfSk7XG5cbiAgICAvLyBTdWJtaXQgc2VhcmNoIGZvciBkcm9wZG93biBleHBlcnRpc2VcbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNkb21haW4tZXhwZXJ0aXNlLXNlbGVjdCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcbiAgICAgICAgbGltaXQgPSA5O1xuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICBkZWxheShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0YWdzJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICB2YXIgY2F0ZWdvcnkgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdjYXRlZ29yeScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAnY2F0ZWdvcnknLCB2YWx1ZTogZWwgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAnY2F0ZWdvcnknLCB2YWx1ZTogZWwgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICAgICAgICAgIGlmIChlbCAhPSAnYWxsJykgbG9hZF90YWdzX3Blcl9kb21haW4oZWwpO1xuICAgICAgICB9LCAyMDApO1xuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcjc2tpbGxzLXRhZ3MnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5kcm9wZG93bignZ2V0IHZhbHVlJyk7XG4gICAgICAgIGNvbnNvbGUubG9nKGVsKTtcbiAgICAgICAgaWYgKGVsID09IG51bGwpIHJldHVybjtcbiAgICAgICAgbGltaXQgPSA5O1xuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICBkZWxheShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgICAgICB2YXIgb3V0cHV0U3RyaW5nID0gZWwuam9pbihcIiUyMFwiKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG91dHB1dFN0cmluZylcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFncyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBpZiAodGFncyA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0YWdzJywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgICAgICB9LCAyMDApO1xuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCAnI3NsaWRlci1yYW5nZScsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgdmFsdWVzID0gJCh0aGlzKS5zbGlkZXIoXCJ2YWx1ZXNcIik7XG4gICAgICAgIGlmICh2YWx1ZXNbMF0gPT0gMCAmJiB2YWx1ZXNbMV0gPT0gMjAwMCkge1xuICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdxMXJhbmdlJykge1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGltaXQgPSA5O1xuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xuICAgICAgICBkZWxheShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgcTFyYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxMXJhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxMXJhbmdlID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgICAgICB9LCAyMDApO1xuICAgIH0pO1xuXG5cblxuXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qc0xvYWRNb3JlU2VhcmNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpbWl0ID0gbGltaXQgKyA5O1xuICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHNlYXJjaDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc21hcnRTZWFyY2goKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTsiXX0=
