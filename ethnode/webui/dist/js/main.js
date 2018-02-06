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

        var round_price = Math.round(gigObject.price * 1000) / 1000;
        var dropdownButton = '<button id="DDB' + gigID + '" class="dropdown-gig mdl-button mdl-js-button mdl-button--icon dropdown-button btn-info-edit"><i class="material-icons">more_vert</i></button>';
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB' + gigID + '"><li class="mdl-menu__item js-open-gig-modal">Open</li></ul>';

        var gigLayout = '<div class="user-card gig"  id="' + gigID + '" data-toggle="modal" data-target="#gigModal">\n                        <div class="img-card" style="background: url(' + (api_cdn + gigObject.image_hash) + ') center no-repeat; background-size: cover;" >\n                            ' + dropdownButton + '\n                            ' + dropdownUL + '\n                            <div class="card-label">' + gigObject.general_domain_of_expertise + '</div>\n                        </div>\n                        <div class="user-profile-img">\n                            <img id="imgav' + gigID + '" src="' + img_src + '" alt="Avatar">\n                        </div>\n                        <p class="user-name" id="nmown' + gigID + '"></p>\n                        <p class="user-role">' + gigObject.general_domain_of_expertise + '</p>\n                        <div class="user-info">\n                            <p class="info">' + gigObject.title + '</p>\n                        </div>\n                        <div class="user-price">STARTING AT: <span><i class="material-icons">polymer</i>' + round_price + '</span></div>\n                    </div>';

        var preloader = '<div class="preloader-card"><img src="./dist/img/preloader.gif" alt=""></div>';
        if ($(".gigs-container").children().length == 0) {
            $(".gigs-container").append(preloader);
        }
        $(".gigs-container").prepend(gigLayout);
        componentHandler.upgradeDom();

        if (gigObject.hasOwnProperty('owner_guid')) {
            owner_guid = gigObject.owner_guid;
            getProfileValue(owner_guid, 'profilePicture', function (profilePictureURL) {
                var p_src = api_cdn + JSON.parse(profilePictureURL) + '&thumb=1';
                $('#imgav' + gigID).attr('src', p_src);
                getProfileValue(owner_guid, 'name', function (name_jstr) {
                    var names_o = JSON.parse(name_jstr);
                    $('#nmown' + gigID).text(names_o.first + " " + names_o.last);
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
    $(document).on('input', '.profiles-page #search-header', function () {
      filterProfileCards($(this).val(), $(this));
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
        getNodeData(function (nodeData) {
            $data = JSON.parse(nodeData);
            window.profileID = $data.guid;
            $('.preloader-card').remove();
            updateProfile();
            getGigs($data.guid);
        });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdEdpZ3MuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyIsInNyYy9qcy9zaG93RXhwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNRQTs7Ozs7O0FBUkEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DOztBQUdwQyxRQUFRLEdBQVIsQ0FBWSxxQkFBSSxJQUFoQjs7Ozs7QUNUQTtBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRDtBQUM1QyxZQUFJLHlCQUF5QixTQUF6QixDQUFKLEVBQXlDO0FBQUU7QUFBUTs7QUFFbkQsWUFBSSxVQUFVLGlCQUFkO0FBQ0EsWUFBSSxnQkFBZ0IsSUFBcEI7QUFDQSxZQUFJLGFBQWEsSUFBakI7QUFDQSxZQUFJLFVBQVUsRUFBZDs7QUFHQSxZQUFJLGNBQWMsS0FBSyxLQUFMLENBQVcsVUFBVSxLQUFWLEdBQWtCLElBQTdCLElBQXFDLElBQXZEO0FBQ0EsWUFBSSxpQkFBaUIsb0JBQW9CLEtBQXBCLEdBQTRCLGlK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QUFrQixNQUFsQjtBQUNIO0FBQ0osS0FmRDs7QUFpQkE7QUFDQSxNQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsUUFBZixFQUF5QiwwQkFBekIsRUFBcUQsWUFBVztBQUM1RCxZQUFJLEtBQUssRUFBRSxJQUFGLEVBQVEsUUFBUixDQUFpQixXQUFqQixDQUFUO0FBQ0EsNkJBQXFCLEVBQXJCO0FBQ0E7QUFDSCxLQUpEOztBQU1BLFdBQU87QUFDSCxnQkFBUSxrQkFBVztBQUNmLG1CQUFPLGFBQVA7QUFDSDtBQUhFLEtBQVA7QUFLRCxDQW5FMEIsRUFBM0I7Ozs7Ozs7O2tCQ0RlO0FBQ2IsUUFBTSxRQURPO0FBRWIsT0FBSztBQUZRLEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZShcIi4vbW9kdWxlcy9zbWFydFNlYXJjaC5qc1wiKTsgLy8gTU9EVUxFIEZPUiBTRUFSQ0hJTkdcclxucmVxdWlyZShcIi4vbW9kdWxlcy9nbG9iYWxFdmVudHMuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdMT0JBTCBFVkVOVFNcclxucmVxdWlyZShcIi4vbW9kdWxlcy9pbWFnZUNyb3AuanNcIik7IC8vIE1PRFVMRSB3aXRoIElNQUdFIENST1BQRVJcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGVzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2dlbmVyYXRlR2lncy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR2lncyBnZW5lcmF0b3JcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHSUdTIFBBR0UgSU5JVFxyXG5cclxuaW1wb3J0IG9iaiBmcm9tICcuL3Nob3dFeHBvcnQnO1xyXG5jb25zb2xlLmxvZyhvYmoubmFtZSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5nZW5lcmF0ZUdpZ3NNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVHaWdzRnJvbURhdGEoZ2lnSUQsIGdpZ09iamVjdCkge1xyXG4gICAgICAgIGlmIChjaGVja19naWdfbWFya2VkX2RlbGV0ZWQoZ2lnT2JqZWN0KSkgeyByZXR1cm4gfVxyXG5cclxuICAgICAgICB2YXIgYXBpX2NkbiA9IGFwaV9nZXRfY2RuX3VybCgpO1xyXG4gICAgICAgIHZhciBwcm9maWxlX2ltYWdlID0gbnVsbDtcclxuICAgICAgICB2YXIgb3duZXJfZ3VpZCA9IG51bGw7XHJcbiAgICAgICAgdmFyIGltZ19zcmMgPSAnJztcclxuXHJcblxyXG4gICAgICAgIHZhciByb3VuZF9wcmljZSA9IE1hdGgucm91bmQoZ2lnT2JqZWN0LnByaWNlICogMTAwMCkgLyAxMDAwO1xyXG4gICAgICAgIHZhciBkcm9wZG93bkJ1dHRvbiA9ICc8YnV0dG9uIGlkPVwiRERCJyArIGdpZ0lEICsgJ1wiIGNsYXNzPVwiZHJvcGRvd24tZ2lnIG1kbC1idXR0b24gbWRsLWpzLWJ1dHRvbiBtZGwtYnV0dG9uLS1pY29uIGRyb3Bkb3duLWJ1dHRvbiBidG4taW5mby1lZGl0XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPm1vcmVfdmVydDwvaT48L2J1dHRvbj4nO1xyXG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT48L3VsPic7XHJcblxyXG4gICAgICAgIHZhciBnaWdMYXlvdXQgPVxyXG4gICAgICAgICAgICAgICAgICBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW1nLWNhcmRcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgke2FwaV9jZG4gKyBnaWdPYmplY3QuaW1hZ2VfaGFzaH0pIGNlbnRlciBuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogY292ZXI7XCIgPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93bkJ1dHRvbn1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25VTH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWxhYmVsXCI+JHtnaWdPYmplY3QuZ2VuZXJhbF9kb21haW5fb2ZfZXhwZXJ0aXNlfTwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJvZmlsZS1pbWdcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgaWQ9XCJpbWdhdiR7Z2lnSUR9XCIgc3JjPVwiJHtpbWdfc3JjfVwiIGFsdD1cIkF2YXRhclwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1c2VyLW5hbWVcIiBpZD1cIm5tb3duJHtnaWdJRH1cIj48L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1yb2xlXCI+JHtnaWdPYmplY3QuZ2VuZXJhbF9kb21haW5fb2ZfZXhwZXJ0aXNlfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItaW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJpY2VcIj5TVEFSVElORyBBVDogPHNwYW4+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnBvbHltZXI8L2k+JHtyb3VuZF9wcmljZX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuXHJcbiAgICAgICAgdmFyIHByZWxvYWRlciA9IGA8ZGl2IGNsYXNzPVwicHJlbG9hZGVyLWNhcmRcIj48aW1nIHNyYz1cIi4vZGlzdC9pbWcvcHJlbG9hZGVyLmdpZlwiIGFsdD1cIlwiPjwvZGl2PmA7XHJcbiAgICAgICAgaWYgKCQoXCIuZ2lncy1jb250YWluZXJcIikuY2hpbGRyZW4oKS5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChwcmVsb2FkZXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLnByZXBlbmQoZ2lnTGF5b3V0KTtcclxuICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVEb20oKTtcclxuXHJcbiAgICAgICAgaWYgKGdpZ09iamVjdC5oYXNPd25Qcm9wZXJ0eSgnb3duZXJfZ3VpZCcpKSB7XHJcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcclxuICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICdwcm9maWxlUGljdHVyZScsIGZ1bmN0aW9uKHByb2ZpbGVQaWN0dXJlVVJMKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcF9zcmMgPSBhcGlfY2RuICsgSlNPTi5wYXJzZShwcm9maWxlUGljdHVyZVVSTCkgKyAnJnRodW1iPTEnO1xyXG4gICAgICAgICAgICAgICAgJCgnI2ltZ2F2JyArIGdpZ0lEKS5hdHRyKCdzcmMnLCBwX3NyYyk7XHJcbiAgICAgICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ25hbWUnLCBmdW5jdGlvbihuYW1lX2pzdHIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgbmFtZXNfbyA9IEpTT04ucGFyc2UobmFtZV9qc3RyKVxyXG4gICAgICAgICAgICAgICAgICAgICQoJyNubW93bicgKyBnaWdJRCkudGV4dChuYW1lc19vLmZpcnN0ICsgXCIgXCIgKyBuYW1lc19vLmxhc3QpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaWQsIG9iaikge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVHaWdzRnJvbURhdGEoaWQsIG9iaik7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiZnVuY3Rpb24gZmlsdGVyUHJvZmlsZUNhcmRzKHF1ZXJ5LCAkaW5wdXQpIHtcclxuICAvKiBDSEVDSyBGT1IgUVVFUlkgTUFUQ0ggV0lUSCBOQU1FICovXHJcbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykuZWFjaChmdW5jdGlvbihpLGl0ZW0pIHtcclxuICAgIHZhciBuYW1lID0gJChpdGVtKS5maW5kKCcudXNlci1uYW1lJykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBuYW1lLm1hdGNoKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID8gJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgOiAkKGl0ZW0pLmFkZENsYXNzKCdoaWRkZW4nKVxyXG4gIH0pO1xyXG4gIC8qIEFERCBSRUQgQk9SREVSIFRPIElOUFVUIElGIE5PIFNFQVJDSCBNQVRDSEVEICovXHJcbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykubGVuZ3RoID09ICQoJy5wcm9maWxlLXVzZXItY2FyZC5oaWRkZW4nKS5sZW5ndGggPyAkaW5wdXQuYWRkQ2xhc3MoJ2Vycm9yJykgOiAkaW5wdXQucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XHJcbn1cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcbiAgLy8gR2xvYmFsIEV2ZW50c1xyXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZHJvcGRvd24nKS5sZW5ndGgpIHtcclxuICAgICAgICAgICQoJyNzZXR0aW5ncy1kcm9wZG93bicpLnBhcmVudHMoJy5kcm9wZG93bicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgIH1cclxuICB9KTtcclxuICAvLyBEcm9wZG93biBzaG93IGluIGhlYWRlclxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjc2V0dGluZ3MtZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnc2hvdycpO1xyXG4gICAgICAvLyAuc2libGluZ3MoJ1tkYXRhLWxhYmVsbGVkYnk9c2V0dGluZ3MtZHJvcGRvd25dJykuXHJcbiAgfSk7XHJcblxyXG4gIC8vIE9QRU4gR0lHIEJJRyBNT0RBTCBPTiBNRU5VIGNsaWNrXHJcbiAgJCgnYm9keScpLmRlbGVnYXRlKCdsaS5qcy1vcGVuLWdpZy1tb2RhbCcsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmdpZycpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXHJcbiAgaWYgKCAkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSApIHtcclxuICAgICQoZG9jdW1lbnQpLm9uKCdpbnB1dCcsICcucHJvZmlsZXMtcGFnZSAjc2VhcmNoLWhlYWRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBmaWx0ZXJQcm9maWxlQ2FyZHMoICQodGhpcykudmFsKCksICQodGhpcykgKTtcclxuICAgIH0pO1xyXG4gIH1cclxufSlcclxuIiwid2luZG93LiR1cGxvYWRDcm9wID0gJCgnI2Nyb3BwZXItd3JhcC1naWcnKS5jcm9wcGllKHtcclxuICAgIHZpZXdwb3J0OiB7XHJcbiAgICAgICAgd2lkdGg6IDQ1MCxcclxuICAgICAgICBoZWlnaHQ6IDE1MFxyXG4gICAgfSxcclxuICAgIGVuYWJsZVpvb206IHRydWVcclxufSk7XHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xyXG4gICAgLyogQlVUVE9OIElOSVQgQ0xJQ0sgT04gSU5QVVQgVFlQRSBGSUxFICovXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuanNDcm9wVXBsb2FkJyxmdW5jdGlvbigpe1xyXG4gICAgICB2YXIgJGNvbnRldG50ID0gJCh0aGlzKS5jbG9zZXN0KCcuY29udGVudCcpO1xyXG4gICAgICAkY29udGVudC5maW5kKCdpbnB1dCNpbnB1dC1pbWFnZS1naWcnKS5jbGljaygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLyogQlVUVE9OIEZPUiBHRVRUSU5HIENST1AgUkVTVWx0ICovXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuanNDcm9wUmVzdWx0JyxmdW5jdGlvbihlKXtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb250ZW50Jyk7XHJcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcC5jcm9wcGllKCdyZXN1bHQnLCdiYXNlNjQnKS50aGVuKCBmdW5jdGlvbihiYXNlNjQpIHtcclxuICAgICAgICAkY29udGVudC5maW5kKCdpbWcjaW5wdXQtaW1hZ2UtZ2lnJykuYXR0cignc3JjJyxiYXNlNjQpLnNob3coKS5yZW1vdmVDbGFzcygnZW1wdHknKTtcclxuICAgICAgfSk7XHJcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcC5jcm9wcGllKCdyZXN1bHQnLCdibG9iJykudGhlbiggZnVuY3Rpb24oYmxvYikge1xyXG4gICAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcEJsb2IgPSBibG9iO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcbn0pO1xyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LmdpZ3NQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxyXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdEdpZ3MoKSB7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICAkKCcubmF2LXRhYnMgLmdpZ3MnKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgZ2V0TGlzdE9mR2lncygpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25pbml0R2lnczogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpbml0R2lncygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdnaWdzLXBhZ2UnKSkge1xyXG4gICAgICAgIGdpZ3NQYWdlTW9kdWxlLm9uaW5pdEdpZ3MoKTtcclxuICAgIH1cclxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5wcm9maWxlUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcclxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIC8qIFJFU0VUIEFORCBHRVQgTkVXIFBST0ZJTEUgSUQgSEFTSCAqL1xyXG4gICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSBudWxsO1xyXG4gICAgICAgIGdldE5vZGVEYXRhKGZ1bmN0aW9uKG5vZGVEYXRhKSB7XHJcbiAgICAgICAgICAgICRkYXRhID0gSlNPTi5wYXJzZShub2RlRGF0YSk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSAkZGF0YS5ndWlkO1xyXG4gICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgdXBkYXRlUHJvZmlsZSgpO1xyXG4gICAgICAgICAgICBnZXRHaWdzKCRkYXRhLmd1aWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICBmdW5jdGlvbiBnZXRHaWdzKGd1aWQpIHtcclxuICAgICAgZ2V0UHJvZmlsZUdpZ3MoZ3VpZCwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgdmFyIHByb2ZpbGVfZ2lncyA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2ZpbGVfZ2lncy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL3YxL2RodC9oa2V5Lz9oa2V5PVwiICsgcHJvZmlsZV9naWdzW2ldLFxyXG4gICAgICAgICAgICAgICAgICBoazogcHJvZmlsZV9naWdzW2ldLFxyXG4gICAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaWdfbyA9IEpTT04ucGFyc2UoanNfZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VSUicsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBvbmluaXQ6IGluaXRQcm9maWxlXHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlLXBhZ2UnKSkge1xyXG4gICAgICBwcm9maWxlUGFnZU1vZHVsZS5vbmluaXQoKTtcclxuICAgIH1cclxufSk7XHJcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxyXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGVzKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5wcm9maWxlcycpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uaW5pdHByb2ZpbGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykpIHtcclxuICAgICAgICBwcm9maWxlc1BhZ2VNb2R1bGUub25pbml0cHJvZmlsZXMoKTtcclxuICAgIH1cclxufSk7XHJcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cuc21hcnRTZWFyY2hNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcbiAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgU21hcnQgU2VhcmNoXHJcblxyXG4gIHZhciBzZWFyY2hBcnJheSA9IG5ldyBBcnJheSgpO1xyXG5cclxuICBmdW5jdGlvbiBzbWFydFNlYXJjaCgpIHtcclxuICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xyXG4gICAgICB2YXIgc2VhcmNoUSA9ICcnO1xyXG4gICAgICAvLyBidWlsZCB1cmwgZm9yIHNlYXJjaGluZ1xyXG4gICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAkLmVhY2goc2VhcmNoQXJyYXksIGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgICAgIHVybCArPSAnYWxsJztcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBzZWFyY2hRICs9IGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgIHVybCArPSBpdGVtLnR5cGUgKyAnPScgKyBpdGVtLnZhbHVlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICB1cmw6IHVybCxcclxuICAgICAgICAgIHFyeTogc2VhcmNoUSxcclxuICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhkYXRhKTtcclxuICAgICAgICAgICAgICBpZiAoZGF0YSA9PSAnbnVsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHsgcmVzdWx0OiBcIk5vIHJlc3VsdHNcIiB9KTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKHNlYXJjaFEsIGRhdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vIFNlYXJjaCBFdmVudHNcclxuXHJcbiAgLy8gU3VibWl0IHNlYXJjaCBmb3IgdGV4dCBmaWVsZFxyXG4gICQoZG9jdW1lbnQpLm9uKCdrZXlwcmVzcycsICdpbnB1dCNzZWFyY2gtaGVhZGVyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoZS53aGljaCA9PSAxMykge1xyXG4gICAgICAgICAgdmFyIG91dHB1dFN0cmluZyA9ICQoZS50YXJnZXQpLnZhbCgpLnNwbGl0KFwiIFwiKS5qb2luKFwiJTIwXCIpO1xyXG4gICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgfVxyXG4gIH0pO1xyXG5cclxuICAvLyBTdWJtaXQgc2VhcmNoIGZvciBkcm9wZG93biBleHBlcnRpc2VcclxuICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNkb21haW4tZXhwZXJ0aXNlLXNlbGVjdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcclxuICAgICAgbG9hZF90YWdzX3Blcl9kb21haW4oZWwpO1xyXG4gICAgICBzZWFyY2hfZXZlbnQoKTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHtcclxuICAgICAgc2VhcmNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiBzbWFydFNlYXJjaCgpO1xyXG4gICAgICB9XHJcbiAgfVxyXG59KSgpO1xyXG4iLCJleHBvcnQgZGVmYXVsdCB7XHJcbiAgbmFtZTogJ0FuZHJldycsXHJcbiAgYWdlOiAxMDBcclxufVxyXG4iXX0=
