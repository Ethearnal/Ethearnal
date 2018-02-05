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
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="DDB' + gigID + '"><li class="mdl-menu__item open-modal" open-modal="#edit-gig">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

        var gigLayout = '<div class="user-card gig"  id="' + gigID + '" data-toggle="modal" data-target="#gigModal">\n                        <div class="img-card">\n                            ' + dropdownButton + '\n                            ' + dropdownUL + '\n                            <img src="' + (api_cdn + gigObject.image_hash) + '">\n                            <div class="card-label">' + gigObject.general_domain_of_expertise + '</div>\n                        </div>\n                        <div class="user-profile-img">\n                            <img id="imgav' + gigID + '" src="' + img_src + '" alt="Avatar">\n                        </div>\n                        <p class="user-name" id="nmown' + gigID + '"></p>\n                        <p class="user-role">' + gigObject.general_domain_of_expertise + '</p>\n                        <div class="user-info">\n                            <p class="info">' + gigObject.title + '</p>\n                        </div>\n                        <div class="user-price">STARTING AT: <span><i class="material-icons">polymer</i>' + round_price + '</span></div>\n                    </div>';

        var preloader = '<div class="preloader-card"><img src="./dist/img/preloader.gif" alt=""></div>';
        if ($(".gigs-container").children().length == 0) {
            $(".gigs-container").append(preloader);
        }
        $(".gigs-container").prepend(gigLayout);
        componentHandler.upgradeDom();

        if (gigObject.hasOwnProperty('owner_guid')) {
            owner_guid = gigObject.owner_guid;
            getProfileValue(owner_guid, 'profilePicture', function (profilePictureURL) {
                var p_src = api_cdn + JSON.parse(profilePictureURL);
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

},{}],4:[function(require,module,exports){
'use strict';

window.$uploadCrop = $('#cropie').croppie({
    enableExif: true,
    viewport: {
        width: 200,
        height: 200,
        type: 'circle'
    },
    boundary: {
        width: 300,
        height: 300
    }
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
        getNodeData(function (node_data) {
            var node = $.parseJSON(node_data);
            getProfileGigs(node.guid, function (data) {
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
                $('.preloader-card').remove();
            });
        });
    }

    return {
        oninit: function oninit() {
            return initProfile();
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdEdpZ3MuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyIsInNyYy9qcy9zaG93RXhwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNRQTs7Ozs7O0FBUkEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DOztBQUdwQyxRQUFRLEdBQVIsQ0FBWSxxQkFBSSxJQUFoQjs7Ozs7QUNUQTtBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRDtBQUM1QyxZQUFJLHlCQUF5QixTQUF6QixDQUFKLEVBQXlDO0FBQUU7QUFBUTs7QUFFbkQsWUFBSSxVQUFVLGlCQUFkO0FBQ0EsWUFBSSxnQkFBZ0IsSUFBcEI7QUFDQSxZQUFJLGFBQWEsSUFBakI7QUFDQSxZQUFJLFVBQVUsRUFBZDs7QUFHQSxZQUFJLGNBQWMsS0FBSyxLQUFMLENBQVcsVUFBVSxLQUFWLEdBQWtCLElBQTdCLElBQXFDLElBQXZEO0FBQ0EsWUFBSSxpQkFBaUIsb0JBQW9CLEtBQXBCLEdBQTRCLGlK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QUF5QjtBQUNyQixvQ0FBWSxNQUFaLENBQW1CLFlBQVksT0FBWixDQUFvQixJQUFwQixDQUFuQixFQUE4QyxDQUE5QztBQUNBLG9DQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBTyxZQUF2QixFQUFqQjtBQUNIO0FBQ0osaUJBTEQ7QUFNSCxhQVBELE1BT087QUFDSCw0QkFBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQU8sWUFBdkIsRUFBakI7QUFDSDtBQUNELDhCQUFrQixNQUFsQjtBQUNIO0FBQ0osS0FmRDs7QUFpQkE7QUFDQSxNQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsUUFBZixFQUF5QiwwQkFBekIsRUFBcUQsWUFBVztBQUM1RCxZQUFJLEtBQUssRUFBRSxJQUFGLEVBQVEsUUFBUixDQUFpQixXQUFqQixDQUFUO0FBQ0EsNkJBQXFCLEVBQXJCO0FBQ0E7QUFDSCxLQUpEOztBQU1BLFdBQU87QUFDSCxnQkFBUSxrQkFBVztBQUNmLG1CQUFPLGFBQVA7QUFDSDtBQUhFLEtBQVA7QUFLRCxDQW5FMEIsRUFBM0I7Ozs7Ozs7O2tCQ0RlO0FBQ2IsUUFBTSxRQURPO0FBRWIsT0FBSztBQUZRLEMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwicmVxdWlyZShcIi4vbW9kdWxlcy9zbWFydFNlYXJjaC5qc1wiKTsgLy8gTU9EVUxFIEZPUiBTRUFSQ0hJTkdcbnJlcXVpcmUoXCIuL21vZHVsZXMvZ2xvYmFsRXZlbnRzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHTE9CQUwgRVZFTlRTXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2ltYWdlQ3JvcC5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU1BR0UgQ1JPUFBFUlxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlcy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBQUk9GSUxFIFBBR0VcbnJlcXVpcmUoXCIuL21vZHVsZXMvZ2VuZXJhdGVHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHaWdzIGdlbmVyYXRvclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHSUdTIFBBR0UgSU5JVFxuXG5pbXBvcnQgb2JqIGZyb20gJy4vc2hvd0V4cG9ydCc7XG5jb25zb2xlLmxvZyhvYmoubmFtZSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuZ2VuZXJhdGVHaWdzTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVHaWdzRnJvbURhdGEoZ2lnSUQsIGdpZ09iamVjdCkge1xuICAgICAgICBpZiAoY2hlY2tfZ2lnX21hcmtlZF9kZWxldGVkKGdpZ09iamVjdCkpIHsgcmV0dXJuIH1cblxuICAgICAgICB2YXIgYXBpX2NkbiA9IGFwaV9nZXRfY2RuX3VybCgpO1xuICAgICAgICB2YXIgcHJvZmlsZV9pbWFnZSA9IG51bGw7XG4gICAgICAgIHZhciBvd25lcl9ndWlkID0gbnVsbDtcbiAgICAgICAgdmFyIGltZ19zcmMgPSAnJztcblxuXG4gICAgICAgIHZhciByb3VuZF9wcmljZSA9IE1hdGgucm91bmQoZ2lnT2JqZWN0LnByaWNlICogMTAwMCkgLyAxMDAwO1xuICAgICAgICB2YXIgZHJvcGRvd25CdXR0b24gPSAnPGJ1dHRvbiBpZD1cIkREQicgKyBnaWdJRCArICdcIiBjbGFzcz1cImRyb3Bkb3duLWdpZyBtZGwtYnV0dG9uIG1kbC1qcy1idXR0b24gbWRsLWJ1dHRvbi0taWNvbiBkcm9wZG93bi1idXR0b24gYnRuLWluZm8tZWRpdFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5tb3JlX3ZlcnQ8L2k+PC9idXR0b24+JztcbiAgICAgICAgdmFyIGRyb3Bkb3duVUwgPSAnPHVsIGNsYXNzPVwibWRsLW1lbnUgbWRsLW1lbnUtLWJvdHRvbS1yaWdodCBtZGwtanMtbWVudSBtZGwtanMtcmlwcGxlLWVmZmVjdFwiIGZvcj1cIkREQicgKyBnaWdJRCArICdcIj48bGkgY2xhc3M9XCJtZGwtbWVudV9faXRlbSBvcGVuLW1vZGFsXCIgb3Blbi1tb2RhbD1cIiNlZGl0LWdpZ1wiPkVkaXQ8L2xpPjxsaSBjbGFzcz1cIm1kbC1tZW51X19pdGVtIGRlbGV0ZVwiPkRlbGV0ZTwvbGk+PC91bD4nO1xuXG4gICAgICAgIHZhciBnaWdMYXlvdXQgPSBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImltZy1jYXJkXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93bkJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duVUx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBzcmM9XCIke2FwaV9jZG4gKyBnaWdPYmplY3QuaW1hZ2VfaGFzaH1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1sYWJlbFwiPiR7Z2lnT2JqZWN0LmdlbmVyYWxfZG9tYWluX29mX2V4cGVydGlzZX08L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJvZmlsZS1pbWdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIGlkPVwiaW1nYXYke2dpZ0lEfVwiIHNyYz1cIiR7aW1nX3NyY31cIiBhbHQ9XCJBdmF0YXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1c2VyLW5hbWVcIiBpZD1cIm5tb3duJHtnaWdJRH1cIj48L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInVzZXItcm9sZVwiPiR7Z2lnT2JqZWN0LmdlbmVyYWxfZG9tYWluX29mX2V4cGVydGlzZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcmljZVwiPlNUQVJUSU5HIEFUOiA8c3Bhbj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cG9seW1lcjwvaT4ke3JvdW5kX3ByaWNlfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcblxuICAgICAgICB2YXIgcHJlbG9hZGVyID0gYDxkaXYgY2xhc3M9XCJwcmVsb2FkZXItY2FyZFwiPjxpbWcgc3JjPVwiLi9kaXN0L2ltZy9wcmVsb2FkZXIuZ2lmXCIgYWx0PVwiXCI+PC9kaXY+YDtcbiAgICAgICAgaWYgKCQoXCIuZ2lncy1jb250YWluZXJcIikuY2hpbGRyZW4oKS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgJChcIi5naWdzLWNvbnRhaW5lclwiKS5hcHBlbmQocHJlbG9hZGVyKTtcbiAgICAgICAgfVxuICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLnByZXBlbmQoZ2lnTGF5b3V0KTtcbiAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRG9tKCk7XG5cbiAgICAgICAgaWYgKGdpZ09iamVjdC5oYXNPd25Qcm9wZXJ0eSgnb3duZXJfZ3VpZCcpKSB7XG4gICAgICAgICAgICBvd25lcl9ndWlkID0gZ2lnT2JqZWN0Lm93bmVyX2d1aWQ7XG4gICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ3Byb2ZpbGVQaWN0dXJlJywgZnVuY3Rpb24ocHJvZmlsZVBpY3R1cmVVUkwpIHtcbiAgICAgICAgICAgICAgICB2YXIgcF9zcmMgPSBhcGlfY2RuICsgSlNPTi5wYXJzZShwcm9maWxlUGljdHVyZVVSTCk7XG4gICAgICAgICAgICAgICAgJCgnI2ltZ2F2JyArIGdpZ0lEKS5hdHRyKCdzcmMnLCBwX3NyYyk7XG4gICAgICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICduYW1lJywgZnVuY3Rpb24obmFtZV9qc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc19vID0gSlNPTi5wYXJzZShuYW1lX2pzdHIpXG4gICAgICAgICAgICAgICAgICAgICQoJyNubW93bicgKyBnaWdJRCkudGV4dChuYW1lc19vLmZpcnN0ICsgXCIgXCIgKyBuYW1lc19vLmxhc3QpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbihpZCwgb2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVHaWdzRnJvbURhdGEoaWQsIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7IiwiLy8gR2xvYmFsIEV2ZW50c1xuJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLmRyb3Bkb3duJykubGVuZ3RoKSB7XG4gICAgICAgICQoJyNzZXR0aW5ncy1kcm9wZG93bicpLnBhcmVudHMoJy5kcm9wZG93bicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XG4gICAgfVxufSk7XG4vLyBEcm9wZG93biBzaG93IGluIGhlYWRlclxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzZXR0aW5ncy1kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAkKHRoaXMpLnBhcmVudHMoJy5kcm9wZG93bicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XG5cbiAgICAvLyAuc2libGluZ3MoJ1tkYXRhLWxhYmVsbGVkYnk9c2V0dGluZ3MtZHJvcGRvd25dJykuXG59KTsiLCJ3aW5kb3cuJHVwbG9hZENyb3AgPSAkKCcjY3JvcGllJykuY3JvcHBpZSh7XG4gICAgZW5hYmxlRXhpZjogdHJ1ZSxcbiAgICB2aWV3cG9ydDoge1xuICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICBoZWlnaHQ6IDIwMCxcbiAgICAgICAgdHlwZTogJ2NpcmNsZSdcbiAgICB9LFxuICAgIGJvdW5kYXJ5OiB7XG4gICAgICAgIHdpZHRoOiAzMDAsXG4gICAgICAgIGhlaWdodDogMzAwXG4gICAgfVxufSk7XG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcbndpbmRvdy5naWdzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xuXG4gICAgZnVuY3Rpb24gaW5pdEdpZ3MoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5uYXYtdGFicyAuZ2lncycpLmFkZENsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgZ2V0TGlzdE9mR2lncygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uaW5pdEdpZ3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRHaWdzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygnZ2lncy1wYWdlJykpIHtcbiAgICAgICAgZ2lnc1BhZ2VNb2R1bGUub25pbml0R2lncygpO1xuICAgIH1cbn0pOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LnByb2ZpbGVQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZSgpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgZ2V0Tm9kZURhdGEoZnVuY3Rpb24obm9kZV9kYXRhKSB7XG4gICAgICAgICAgICB2YXIgbm9kZSA9ICQucGFyc2VKU09OKG5vZGVfZGF0YSk7XG4gICAgICAgICAgICBnZXRQcm9maWxlR2lncyhub2RlLmd1aWQsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvZmlsZV9naWdzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2ZpbGVfZ2lncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBwcm9maWxlX2dpZ3NbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBoazogcHJvZmlsZV9naWdzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ19vID0gSlNPTi5wYXJzZShqc19kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VSUicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbmluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZS1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZXMoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5uYXYtdGFicyAucHJvZmlsZXMnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIG1haW5fcHJvZmlsZV9jYXJkcygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uaW5pdHByb2ZpbGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbml0UHJvZmlsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZXNQYWdlTW9kdWxlLm9uaW5pdHByb2ZpbGVzKCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuc21hcnRTZWFyY2hNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG4gIC8vIEdsb2JhbCB2YXJpYWJsZXMgZm9yIFNtYXJ0IFNlYXJjaFxuXG4gIHZhciBzZWFyY2hBcnJheSA9IG5ldyBBcnJheSgpO1xuXG4gIGZ1bmN0aW9uIHNtYXJ0U2VhcmNoKCkge1xuICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xuICAgICAgdmFyIHNlYXJjaFEgPSAnJztcbiAgICAgIC8vIGJ1aWxkIHVybCBmb3Igc2VhcmNoaW5nXG4gICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgJC5lYWNoKHNlYXJjaEFycmF5LCBmdW5jdGlvbihpLCBpdGVtKSB7XG4gICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzZWFyY2hRICs9IGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XG4gICAgICAgICAgICAgICAgICB1cmwgKz0gaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgIHFyeTogc2VhcmNoUSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgICBpZiAoZGF0YSA9PSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IHJlc3VsdDogXCJObyByZXN1bHRzXCIgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKHNlYXJjaFEsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gU2VhcmNoIEV2ZW50c1xuXG4gIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIHRleHQgZmllbGRcbiAgJChkb2N1bWVudCkub24oJ2tleXByZXNzJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS53aGljaCA9PSAxMykge1xuICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSAkKGUudGFyZ2V0KS52YWwoKS5zcGxpdChcIiBcIikuam9pbihcIiUyMFwiKTtcbiAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICAgIH1cbiAgfSk7XG5cbiAgLy8gU3VibWl0IHNlYXJjaCBmb3IgZHJvcGRvd24gZXhwZXJ0aXNlXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcbiAgICAgIGxvYWRfdGFnc19wZXJfZG9tYWluKGVsKTtcbiAgICAgIHNlYXJjaF9ldmVudCgpO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgICAgc2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc21hcnRTZWFyY2goKTtcbiAgICAgIH1cbiAgfVxufSkoKTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ0FuZHJldycsXG4gIGFnZTogMTAwXG59XG4iXX0=
