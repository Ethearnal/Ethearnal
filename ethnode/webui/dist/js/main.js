(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _showExport = require("./showExport");

var _showExport2 = _interopRequireDefault(_showExport);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("./modules/smartSearch.js"); // MODULE FOR SEARCHING
require("./modules/globalEvents.js"); // MODULE with GLOBAL EVENTS
require("./modules/imageCrop.js"); // MODULE with IMAGE CROPPER
require("./modules/onInitProfile.js"); // MODULE with INIT PROFILE PAGE
require("./modules/onInitProfiles.js"); // MODULE with INIT PROFILE PAGE
require("./modules/generateGigs.js"); // MODULE with Gigs generator
require("./modules/onInitGigs.js"); // MODULE with GIGS PAGE INIT

console.log(_showExport2.default.name);

},{"./modules/generateGigs.js":2,"./modules/globalEvents.js":3,"./modules/imageCrop.js":4,"./modules/onInitGigs.js":5,"./modules/onInitProfile.js":6,"./modules/onInitProfiles.js":7,"./modules/smartSearch.js":8,"./showExport":9}],2:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.generateGigsModule = function () {

    function generateGigsFromData(gigID, gigObject) {
        if (check_gig_marked_deleted(gigObject)) {
            return;
        }

        var api_cdn = api_get_cdn_url();
        var profile_image = null;
        var owner_guid = null;
        var img_src = '';
        var fullname = '';

        var round_price = Math.round(gigObject.price * 1000) / 1000;
        var dropdownButton = '<button id="DDB' + gigID + '" class="dropdown-gig mdl-button mdl-js-button mdl-button--icon dropdown-button btn-info-edit"><i class="material-icons">more_vert</i></button>';
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB' + gigID + '"><li class="mdl-menu__item js-open-gig-modal">Open</li></ul>';

        if (gigObject.hasOwnProperty('owner_guid')) {
            owner_guid = gigObject.owner_guid;

            getProfileValue(owner_guid, 'profilePicture', function (profilePictureURL) {
                img_src = api_cdn + JSON.parse(profilePictureURL) + '&thumb=1';
                // $('#imgav' + gigID).attr('src', p_src);
                getProfileValue(owner_guid, 'name', function (name_jstr) {
                    var names_o = JSON.parse(name_jstr);
                    fullname = names_o.first + " " + names_o.last;
                    // $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
                    var gigLayout = '<div class="user-card gig"  id="' + gigID + '" data-toggle="modal" data-target="#gigModal">\n                        <div class="img-card" style="background: url(' + (api_cdn + gigObject.image_hash) + ') center no-repeat; background-size: cover;" >\n                            ' + dropdownButton + '\n                            ' + dropdownUL + '\n                            <div class="card-label">' + gigObject.general_domain_of_expertise + '</div>\n                        </div>\n                        <div class="user-profile-img">\n                            <img id="imgav' + gigID + '" src="' + img_src + '" alt="Avatar">\n                        </div>\n                        <p class="user-name" id="nmown' + gigID + '">' + fullname + '</p>\n                        <p class="user-role">' + gigObject.general_domain_of_expertise + '</p>\n                        <div class="user-info">\n                            <p class="info">' + gigObject.title + '</p>\n                        </div>\n                        <div class="user-price">STARTING AT: <span><i class="material-icons">polymer</i>' + round_price + '</span></div>\n                    </div>';
                    $('.preloader-card').remove();
                    $(".gigs-container").append(gigLayout);
                    componentHandler.upgradeDom();
                });
            });
        }
    }

    return {
        generate: function generate(id, obj) {
            return generateGigsFromData(id, obj);
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
    var $contetnt = $(this).closest('.content');
    $content.find('input#input-image-gig').click();
  });

  /* BUTTON FOR GETTING CROP RESUlt */
  $(document).on('click', '.jsCropResult', function (e) {
    e.preventDefault();
    var $content = $(this).closest('.content');
    window.$uploadCrop.croppie('result', 'base64').then(function (base64) {
      $content.find('img#input-image-gig').attr('src', base64).show().removeClass('empty');
    });
    window.$uploadCrop.croppie('result', 'blob').then(function (blob) {
      window.$uploadCropBlob = blob;
    });
  });
});

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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
            getNodeData(function (nodeData) {
                $data = JSON.parse(nodeData);
                window.profileID = $data.guid;
                $('.preloader-card').remove();
                updateProfile();
                getGigs($data.guid);
            });
        }
    };

    function getGigs(guid) {
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
                            generateGigsModule.generate(this.hk, gig_o);
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
        oninit: initProfile
    };
}();

$(document).ready(function () {
    if ($('body').hasClass('profile-page')) {
        profilePageModule.oninit();
    }
});

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
'use strict';

// Smart Search Declarating
window.smartSearchModule = function () {
    // Global variables for Smart Search

    var searchArray = new Array();

    function smartSearch() {
        var url = api_idx_cdn_url();
        var searchQ = '';
        // build url for searching
        if (searchArray.length) {
            $.each(searchArray, function (i, item) {
                if (item.type == 'text' && item.value == '') {
                    searchQ += 'all';
                    url += 'all';
                } else {
                    searchQ += item.type + '=' + item.value;
                    url += item.type + '=' + item.value;
                }
            });
        }

        $.ajax({
            type: 'GET',
            url: url,
            qry: searchQ,
            success: function success(data) {
                console.log(data);
                if (data == 'null') {
                    data = JSON.stringify({ result: "No results" });
                }
                event_on_search_gig_data(searchQ, data);
            }
        });
    }

    // Search Events

    // Submit search for text field
    $(document).on('keypress', 'input#search-header', function (e) {
        if (e.which == 13) {
            var outputString = $(e.target).val().split(" ").join("%20");
            if (searchArray.length) {
                searchArray.filter(function (item) {
                    if (item.type == 'text') {
                        searchArray.splice(searchArray.indexOf(item), 1);
                        searchArray.push({ type: 'text', value: outputString });
                    }
                });
            } else {
                searchArray.push({ type: 'text', value: outputString });
            }
            smartSearchModule.search();
        }
    });

    // Submit search for dropdown expertise
    $(document).on('change', '#domain-expertise-select', function () {
        var el = $(this).dropdown('get value');
        load_tags_per_domain(el);
        search_event();
    });

    return {
        search: function search() {
            return smartSearch();
        }
    };
}();

},{}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  name: 'Andrew',
  age: 100
};

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdEdpZ3MuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyIsInNyYy9qcy9zaG93RXhwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNRQTs7Ozs7O0FBUkEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DOztBQUdwQyxRQUFRLEdBQVIsQ0FBWSxxQkFBSSxJQUFoQjs7Ozs7QUNUQTtBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRDtBQUM1QyxZQUFJLHlCQUF5QixTQUF6QixDQUFKLEVBQXlDO0FBQUU7QUFBUTs7QUFFbkQsWUFBSSxVQUFVLGlCQUFkO0FBQ0EsWUFBSSxnQkFBZ0IsSUFBcEI7QUFDQSxZQUFJLGFBQWEsSUFBakI7QUFDQSxZQUFJLFVBQVUsRUFBZDtBQUNBLFlBQUksV0FBVyxFQUFmOztBQUVBLFlBQUksY0FBYyxLQUFLLEtBQUwsQ0FBVyxVQUFVLEtBQVYsR0FBa0IsSUFBN0IsSUFBcUMsSUFBdkQ7QUFDQSxZQUFJLGlCQUFpQixv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RUFBOEMsQ0FBOUM7QUFDQSxvQ0FBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQU8sWUFBdkIsRUFBakI7QUFDSDtBQUNKLGlCQUxEO0FBTUgsYUFQRCxNQU9PO0FBQ0gsNEJBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFPLFlBQXZCLEVBQWpCO0FBQ0g7QUFDRCw4QkFBa0IsTUFBbEI7QUFDSDtBQUNKLEtBZkQ7O0FBaUJBO0FBQ0EsTUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLFFBQWYsRUFBeUIsMEJBQXpCLEVBQXFELFlBQVc7QUFDNUQsWUFBSSxLQUFLLEVBQUUsSUFBRixFQUFRLFFBQVIsQ0FBaUIsV0FBakIsQ0FBVDtBQUNBLDZCQUFxQixFQUFyQjtBQUNBO0FBQ0gsS0FKRDs7QUFNQSxXQUFPO0FBQ0gsZ0JBQVEsa0JBQVc7QUFDZixtQkFBTyxhQUFQO0FBQ0g7QUFIRSxLQUFQO0FBS0QsQ0FuRTBCLEVBQTNCOzs7Ozs7OztrQkNEZTtBQUNiLFFBQU0sUUFETztBQUViLE9BQUs7QUFGUSxDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInJlcXVpcmUoXCIuL21vZHVsZXMvc21hcnRTZWFyY2guanNcIik7IC8vIE1PRFVMRSBGT1IgU0VBUkNISU5HXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvZ2xvYmFsRXZlbnRzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHTE9CQUwgRVZFTlRTXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvaW1hZ2VDcm9wLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTUFHRSBDUk9QUEVSXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0UHJvZmlsZS5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBQUk9GSUxFIFBBR0VcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlcy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBQUk9GSUxFIFBBR0VcclxucmVxdWlyZShcIi4vbW9kdWxlcy9nZW5lcmF0ZUdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdpZ3MgZ2VuZXJhdG9yXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0R2lncy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR0lHUyBQQUdFIElOSVRcclxuXHJcbmltcG9ydCBvYmogZnJvbSAnLi9zaG93RXhwb3J0JztcclxuY29uc29sZS5sb2cob2JqLm5hbWUpOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cuZ2VuZXJhdGVHaWdzTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlR2lnc0Zyb21EYXRhKGdpZ0lELCBnaWdPYmplY3QpIHtcclxuICAgICAgICBpZiAoY2hlY2tfZ2lnX21hcmtlZF9kZWxldGVkKGdpZ09iamVjdCkpIHsgcmV0dXJuIH1cclxuXHJcbiAgICAgICAgdmFyIGFwaV9jZG4gPSBhcGlfZ2V0X2Nkbl91cmwoKTtcclxuICAgICAgICB2YXIgcHJvZmlsZV9pbWFnZSA9IG51bGw7XHJcbiAgICAgICAgdmFyIG93bmVyX2d1aWQgPSBudWxsO1xyXG4gICAgICAgIHZhciBpbWdfc3JjID0gJyc7XHJcbiAgICAgICAgdmFyIGZ1bGxuYW1lID0gJyc7XHJcblxyXG4gICAgICAgIHZhciByb3VuZF9wcmljZSA9IE1hdGgucm91bmQoZ2lnT2JqZWN0LnByaWNlICogMTAwMCkgLyAxMDAwO1xyXG4gICAgICAgIHZhciBkcm9wZG93bkJ1dHRvbiA9ICc8YnV0dG9uIGlkPVwiRERCJyArIGdpZ0lEICsgJ1wiIGNsYXNzPVwiZHJvcGRvd24tZ2lnIG1kbC1idXR0b24gbWRsLWpzLWJ1dHRvbiBtZGwtYnV0dG9uLS1pY29uIGRyb3Bkb3duLWJ1dHRvbiBidG4taW5mby1lZGl0XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPm1vcmVfdmVydDwvaT48L2J1dHRvbj4nO1xyXG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT48L3VsPic7XHJcblxyXG4gICAgICAgIGlmIChnaWdPYmplY3QuaGFzT3duUHJvcGVydHkoJ293bmVyX2d1aWQnKSkge1xyXG4gICAgICAgICAgICBvd25lcl9ndWlkID0gZ2lnT2JqZWN0Lm93bmVyX2d1aWQ7XHJcblxyXG4gICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ3Byb2ZpbGVQaWN0dXJlJywgZnVuY3Rpb24ocHJvZmlsZVBpY3R1cmVVUkwpIHtcclxuICAgICAgICAgICAgICAgIGltZ19zcmMgPSBhcGlfY2RuICsgSlNPTi5wYXJzZShwcm9maWxlUGljdHVyZVVSTCkgKyAnJnRodW1iPTEnO1xyXG4gICAgICAgICAgICAgICAgLy8gJCgnI2ltZ2F2JyArIGdpZ0lEKS5hdHRyKCdzcmMnLCBwX3NyYyk7XHJcbiAgICAgICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ25hbWUnLCBmdW5jdGlvbihuYW1lX2pzdHIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZXNfbyA9IEpTT04ucGFyc2UobmFtZV9qc3RyKTtcclxuICAgICAgICAgICAgICAgICAgICBmdWxsbmFtZSA9IG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdDtcclxuICAgICAgICAgICAgICAgICAgICAvLyAkKCcjbm1vd24nICsgZ2lnSUQpLnRleHQobmFtZXNfby5maXJzdCArIFwiIFwiICsgbmFtZXNfby5sYXN0KTtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnTGF5b3V0ID0gYDxkaXYgY2xhc3M9XCJ1c2VyLWNhcmQgZ2lnXCIgIGlkPVwiJHtnaWdJRH1cIiBkYXRhLXRvZ2dsZT1cIm1vZGFsXCIgZGF0YS10YXJnZXQ9XCIjZ2lnTW9kYWxcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImltZy1jYXJkXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB1cmwoJHthcGlfY2RuICsgZ2lnT2JqZWN0LmltYWdlX2hhc2h9KSBjZW50ZXIgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25CdXR0b259XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duVUx9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1sYWJlbFwiPiR7Z2lnT2JqZWN0LmdlbmVyYWxfZG9tYWluX29mX2V4cGVydGlzZX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLXByb2ZpbGUtaW1nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGlkPVwiaW1nYXYke2dpZ0lEfVwiIHNyYz1cIiR7aW1nX3NyY31cIiBhbHQ9XCJBdmF0YXJcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1uYW1lXCIgaWQ9XCJubW93biR7Z2lnSUR9XCI+JHtmdWxsbmFtZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1yb2xlXCI+JHtnaWdPYmplY3QuZ2VuZXJhbF9kb21haW5fb2ZfZXhwZXJ0aXNlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItaW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJpY2VcIj5TVEFSVElORyBBVDogPHNwYW4+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnBvbHltZXI8L2k+JHtyb3VuZF9wcmljZX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChnaWdMYXlvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbihpZCwgb2JqKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZUdpZ3NGcm9tRGF0YShpZCwgb2JqKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpOyIsImZ1bmN0aW9uIGZpbHRlclByb2ZpbGVDYXJkcyhxdWVyeSwgJGlucHV0KSB7XHJcbiAgLyogQ0hFQ0sgRk9SIFFVRVJZIE1BVENIIFdJVEggTkFNRSAqL1xyXG4gICQoJy5wcm9maWxlLXVzZXItY2FyZCcpLmVhY2goZnVuY3Rpb24oaSxpdGVtKSB7XHJcbiAgICB2YXIgbmFtZSA9ICQoaXRlbSkuZmluZCgnLnVzZXItbmFtZScpLnRleHQoKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgbmFtZS5tYXRjaChxdWVyeS50b0xvd2VyQ2FzZSgpKSA/ICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpIDogJChpdGVtKS5hZGRDbGFzcygnaGlkZGVuJylcclxuICB9KTtcclxuICAvKiBBREQgUkVEIEJPUkRFUiBUTyBJTlBVVCBJRiBOTyBTRUFSQ0ggTUFUQ0hFRCAqL1xyXG4gICQoJy5wcm9maWxlLXVzZXItY2FyZCcpLmxlbmd0aCA9PSAkKCcucHJvZmlsZS11c2VyLWNhcmQuaGlkZGVuJykubGVuZ3RoID8gJGlucHV0LmFkZENsYXNzKCdlcnJvcicpIDogJGlucHV0LnJlbW92ZUNsYXNzKCdlcnJvcicpO1xyXG59XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4gIC8vIEdsb2JhbCBFdmVudHNcclxuICAkKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbihlKSB7XHJcbiAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLmRyb3Bkb3duJykubGVuZ3RoKSB7XHJcbiAgICAgICAgICAkKCcjc2V0dGluZ3MtZHJvcGRvd24nKS5wYXJlbnRzKCcuZHJvcGRvd24nKS5yZW1vdmVDbGFzcygnc2hvdycpO1xyXG4gICAgICB9XHJcbiAgfSk7XHJcbiAgLy8gRHJvcGRvd24gc2hvdyBpbiBoZWFkZXJcclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3NldHRpbmdzLWRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICQodGhpcykucGFyZW50cygnLmRyb3Bkb3duJykudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgLy8gLnNpYmxpbmdzKCdbZGF0YS1sYWJlbGxlZGJ5PXNldHRpbmdzLWRyb3Bkb3duXScpLlxyXG4gIH0pO1xyXG5cclxuICAvLyBPUEVOIEdJRyBCSUcgTU9EQUwgT04gTUVOVSBjbGlja1xyXG4gICQoJ2JvZHknKS5kZWxlZ2F0ZSgnbGkuanMtb3Blbi1naWctbW9kYWwnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XHJcbiAgICAkKHRoaXMpLmNsb3Nlc3QoJy5naWcnKS50cmlnZ2VyKCdjbGljaycpO1xyXG4gIH0pO1xyXG5cclxuICAvKiBGSUxURVIgUFJPRklMRSBDQVJEUyAqL1xyXG4gIGlmICggJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykgKSB7XHJcbiAgICAvKiBGSUxURVIgUFJPRklMRSBDQVJEUyAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2lucHV0JywgJy5wcm9maWxlcy1wYWdlICNzZWFyY2gtaGVhZGVyJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgIGZpbHRlclByb2ZpbGVDYXJkcyggJCh0aGlzKS52YWwoKSwgJCh0aGlzKSApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyogT1BFTiBJTlRFUk5BTCBQUk9GSUxFIFBBR0UgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5wcm9maWxlLXVzZXItY2FyZCcsZnVuY3Rpb24oKXtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3VpL3Byb2ZpbGUvIycgKyAkKHRoaXMpLmF0dHIoJ2lkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcbn0pXHJcbiIsIndpbmRvdy4kdXBsb2FkQ3JvcCA9ICQoJyNjcm9wcGVyLXdyYXAtZ2lnJykuY3JvcHBpZSh7XHJcbiAgICB2aWV3cG9ydDoge1xyXG4gICAgICAgIHdpZHRoOiA0NTAsXHJcbiAgICAgICAgaGVpZ2h0OiAxNTBcclxuICAgIH0sXHJcbiAgICBlbmFibGVab29tOiB0cnVlXHJcbn0pO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuICAgIC8qIEJVVFRPTiBJTklUIENMSUNLIE9OIElOUFVUIFRZUEUgRklMRSAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFVwbG9hZCcsZnVuY3Rpb24oKXtcclxuICAgICAgdmFyICRjb250ZXRudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcclxuICAgICAgJGNvbnRlbnQuZmluZCgnaW5wdXQjaW5wdXQtaW1hZ2UtZ2lnJykuY2xpY2soKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qIEJVVFRPTiBGT1IgR0VUVElORyBDUk9QIFJFU1VsdCAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFJlc3VsdCcsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuY29udGVudCcpO1xyXG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3AuY3JvcHBpZSgncmVzdWx0JywnYmFzZTY0JykudGhlbiggZnVuY3Rpb24oYmFzZTY0KSB7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgnaW1nI2lucHV0LWltYWdlLWdpZycpLmF0dHIoJ3NyYycsYmFzZTY0KS5zaG93KCkucmVtb3ZlQ2xhc3MoJ2VtcHR5Jyk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3AuY3JvcHBpZSgncmVzdWx0JywnYmxvYicpLnRoZW4oIGZ1bmN0aW9uKGJsb2IpIHtcclxuICAgICAgICB3aW5kb3cuJHVwbG9hZENyb3BCbG9iID0gYmxvYjtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG59KTtcclxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5naWdzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcclxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRHaWdzKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5naWdzJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIGdldExpc3RPZkdpZ3MoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uaW5pdEdpZ3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5pdEdpZ3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygnZ2lncy1wYWdlJykpIHtcclxuICAgICAgICBnaWdzUGFnZU1vZHVsZS5vbmluaXRHaWdzKCk7XHJcbiAgICB9XHJcbn0pOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cucHJvZmlsZVBhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXHJcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZSgpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG5cclxuICAgICAgICAvKiBSRVNFVCBBTkQgR0VUIE5FVyBQUk9GSUxFIElEIEhBU0ggKi9cclxuICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gbnVsbDtcclxuXHJcbiAgICAgICAgaWYgKCB3aW5kb3cubG9jYXRpb24uaGFzaCApIHtcclxuICAgICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zbGljZSgxKTtcclxuICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoKTtcclxuICAgICAgICAgIGdldEdpZ3Mod2luZG93LnByb2ZpbGVJRCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGdldE5vZGVEYXRhKGZ1bmN0aW9uKG5vZGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgJGRhdGEgPSBKU09OLnBhcnNlKG5vZGVEYXRhKTtcclxuICAgICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gJGRhdGEuZ3VpZDtcclxuICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICB1cGRhdGVQcm9maWxlKCk7XHJcbiAgICAgICAgICAgICAgZ2V0R2lncygkZGF0YS5ndWlkKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0R2lncyhndWlkKSB7XHJcbiAgICAgIGdldFByb2ZpbGVHaWdzKGd1aWQsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgIHZhciBwcm9maWxlX2dpZ3MgPSBKU09OLnBhcnNlKGRhdGEpO1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9maWxlX2dpZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS92MS9kaHQvaGtleS8/aGtleT1cIiArIHByb2ZpbGVfZ2lnc1tpXSxcclxuICAgICAgICAgICAgICAgICAgaGs6IHByb2ZpbGVfZ2lnc1tpXSxcclxuICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc19kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnX28gPSBKU09OLnBhcnNlKGpzX2RhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlR2lnc01vZHVsZS5nZW5lcmF0ZSh0aGlzLmhrLCBnaWdfbyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgb25pbml0OiBpbml0UHJvZmlsZVxyXG4gICAgfVxyXG59KSgpO1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZS1wYWdlJykpIHtcclxuICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnByb2ZpbGVzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcclxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlcygpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAucHJvZmlsZXMnKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgbWFpbl9wcm9maWxlX2NhcmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbmluaXRwcm9maWxlczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbml0UHJvZmlsZXMoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZXMtcGFnZScpKSB7XHJcbiAgICAgICAgcHJvZmlsZXNQYWdlTW9kdWxlLm9uaW5pdHByb2ZpbGVzKCk7XHJcbiAgICB9XHJcbn0pO1xyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnNtYXJ0U2VhcmNoTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG4gIC8vIEdsb2JhbCB2YXJpYWJsZXMgZm9yIFNtYXJ0IFNlYXJjaFxyXG5cclxuICB2YXIgc2VhcmNoQXJyYXkgPSBuZXcgQXJyYXkoKTtcclxuXHJcbiAgZnVuY3Rpb24gc21hcnRTZWFyY2goKSB7XHJcbiAgICAgIHZhciB1cmwgPSBhcGlfaWR4X2Nkbl91cmwoKTtcclxuICAgICAgdmFyIHNlYXJjaFEgPSAnJztcclxuICAgICAgLy8gYnVpbGQgdXJsIGZvciBzZWFyY2hpbmdcclxuICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgJC5lYWNoKHNlYXJjaEFycmF5LCBmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcgJiYgaXRlbS52YWx1ZSA9PSAnJykge1xyXG4gICAgICAgICAgICAgICAgICBzZWFyY2hRICs9ICdhbGwnO1xyXG4gICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSBpdGVtLnR5cGUgKyAnPScgKyBpdGVtLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICB1cmwgKz0gaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJC5hamF4KHtcclxuICAgICAgICAgIHR5cGU6ICdHRVQnLFxyXG4gICAgICAgICAgdXJsOiB1cmwsXHJcbiAgICAgICAgICBxcnk6IHNlYXJjaFEsXHJcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XHJcbiAgICAgICAgICAgICAgaWYgKGRhdGEgPT0gJ251bGwnKSB7XHJcbiAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IHJlc3VsdDogXCJObyByZXN1bHRzXCIgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGV2ZW50X29uX3NlYXJjaF9naWdfZGF0YShzZWFyY2hRLCBkYXRhKTtcclxuICAgICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBTZWFyY2ggRXZlbnRzXHJcblxyXG4gIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIHRleHQgZmllbGRcclxuICAkKGRvY3VtZW50KS5vbigna2V5cHJlc3MnLCAnaW5wdXQjc2VhcmNoLWhlYWRlcicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKGUud2hpY2ggPT0gMTMpIHtcclxuICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSAkKGUudGFyZ2V0KS52YWwoKS5zcGxpdChcIiBcIikuam9pbihcIiUyMFwiKTtcclxuICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XHJcbiAgICAgIH1cclxuICB9KTtcclxuXHJcbiAgLy8gU3VibWl0IHNlYXJjaCBmb3IgZHJvcGRvd24gZXhwZXJ0aXNlXHJcbiAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcjZG9tYWluLWV4cGVydGlzZS1zZWxlY3QnLCBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIGVsID0gJCh0aGlzKS5kcm9wZG93bignZ2V0IHZhbHVlJyk7XHJcbiAgICAgIGxvYWRfdGFnc19wZXJfZG9tYWluKGVsKTtcclxuICAgICAgc2VhcmNoX2V2ZW50KCk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAgIHNlYXJjaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gc21hcnRTZWFyY2goKTtcclxuICAgICAgfVxyXG4gIH1cclxufSkoKTtcclxuIiwiZXhwb3J0IGRlZmF1bHQge1xyXG4gIG5hbWU6ICdBbmRyZXcnLFxyXG4gIGFnZTogMTAwXHJcbn1cclxuIl19
