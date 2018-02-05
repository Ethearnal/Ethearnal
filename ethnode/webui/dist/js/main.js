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
            console.log(node_data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdEdpZ3MuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyIsInNyYy9qcy9zaG93RXhwb3J0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNRQTs7Ozs7O0FBUkEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DOztBQUdwQyxRQUFRLEdBQVIsQ0FBWSxxQkFBSSxJQUFoQjs7Ozs7QUNUQTtBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRDtBQUM1QyxZQUFJLHlCQUF5QixTQUF6QixDQUFKLEVBQXlDO0FBQUU7QUFBUTs7QUFFbkQsWUFBSSxVQUFVLGlCQUFkO0FBQ0EsWUFBSSxnQkFBZ0IsSUFBcEI7QUFDQSxZQUFJLGFBQWEsSUFBakI7QUFDQSxZQUFJLFVBQVUsRUFBZDs7QUFHQSxZQUFJLGNBQWMsS0FBSyxLQUFMLENBQVcsVUFBVSxLQUFWLEdBQWtCLElBQTdCLElBQXFDLElBQXZEO0FBQ0EsWUFBSSxpQkFBaUIsb0JBQW9CLEtBQXBCLEdBQTRCLGlK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QUFJLEtBQUssSUFBTCxJQUFhLE1BQWpCLEVBQXlCO0FBQ3JCLG9DQUFZLE1BQVosQ0FBbUIsWUFBWSxPQUFaLENBQW9CLElBQXBCLENBQW5CLEVBQThDLENBQTlDO0FBQ0Esb0NBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFPLFlBQXZCLEVBQWpCO0FBQ0g7QUFDSixpQkFMRDtBQU1ILGFBUEQsTUFPTztBQUNILDRCQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBTyxZQUF2QixFQUFqQjtBQUNIO0FBQ0QsOEJBQWtCLE1BQWxCO0FBQ0g7QUFDSixLQWZEOztBQWlCQTtBQUNBLE1BQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxRQUFmLEVBQXlCLDBCQUF6QixFQUFxRCxZQUFXO0FBQzVELFlBQUksS0FBSyxFQUFFLElBQUYsRUFBUSxRQUFSLENBQWlCLFdBQWpCLENBQVQ7QUFDQSw2QkFBcUIsRUFBckI7QUFDQTtBQUNILEtBSkQ7O0FBTUEsV0FBTztBQUNILGdCQUFRLGtCQUFXO0FBQ2YsbUJBQU8sYUFBUDtBQUNIO0FBSEUsS0FBUDtBQUtELENBbkUwQixFQUEzQjs7Ozs7Ozs7a0JDRGU7QUFDYixRQUFNLFFBRE87QUFFYixPQUFLO0FBRlEsQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJyZXF1aXJlKFwiLi9tb2R1bGVzL3NtYXJ0U2VhcmNoLmpzXCIpOyAvLyBNT0RVTEUgRk9SIFNFQVJDSElOR1xucmVxdWlyZShcIi4vbW9kdWxlcy9nbG9iYWxFdmVudHMuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdMT0JBTCBFVkVOVFNcbnJlcXVpcmUoXCIuL21vZHVsZXMvaW1hZ2VDcm9wLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTUFHRSBDUk9QUEVSXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGUuanNcIik7IC8vIE1PRFVMRSB3aXRoIElOSVQgUFJPRklMRSBQQUdFXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGVzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxucmVxdWlyZShcIi4vbW9kdWxlcy9nZW5lcmF0ZUdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdpZ3MgZ2VuZXJhdG9yXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdEdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdJR1MgUEFHRSBJTklUXG5cbmltcG9ydCBvYmogZnJvbSAnLi9zaG93RXhwb3J0JztcbmNvbnNvbGUubG9nKG9iai5uYW1lKTsiLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcbndpbmRvdy5nZW5lcmF0ZUdpZ3NNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUdpZ3NGcm9tRGF0YShnaWdJRCwgZ2lnT2JqZWN0KSB7XG4gICAgICAgIGlmIChjaGVja19naWdfbWFya2VkX2RlbGV0ZWQoZ2lnT2JqZWN0KSkgeyByZXR1cm4gfVxuXG4gICAgICAgIHZhciBhcGlfY2RuID0gYXBpX2dldF9jZG5fdXJsKCk7XG4gICAgICAgIHZhciBwcm9maWxlX2ltYWdlID0gbnVsbDtcbiAgICAgICAgdmFyIG93bmVyX2d1aWQgPSBudWxsO1xuICAgICAgICB2YXIgaW1nX3NyYyA9ICcnO1xuXG5cbiAgICAgICAgdmFyIHJvdW5kX3ByaWNlID0gTWF0aC5yb3VuZChnaWdPYmplY3QucHJpY2UgKiAxMDAwKSAvIDEwMDA7XG4gICAgICAgIHZhciBkcm9wZG93bkJ1dHRvbiA9ICc8YnV0dG9uIGlkPVwiRERCJyArIGdpZ0lEICsgJ1wiIGNsYXNzPVwiZHJvcGRvd24tZ2lnIG1kbC1idXR0b24gbWRsLWpzLWJ1dHRvbiBtZGwtYnV0dG9uLS1pY29uIGRyb3Bkb3duLWJ1dHRvbiBidG4taW5mby1lZGl0XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPm1vcmVfdmVydDwvaT48L2J1dHRvbj4nO1xuICAgICAgICB2YXIgZHJvcGRvd25VTCA9ICc8dWwgY2xhc3M9XCJtZGwtbWVudSBtZGwtbWVudS0tYm90dG9tLXJpZ2h0IG1kbC1qcy1tZW51IG1kbC1qcy1yaXBwbGUtZWZmZWN0XCIgZm9yPVwiRERCJyArIGdpZ0lEICsgJ1wiPjxsaSBjbGFzcz1cIm1kbC1tZW51X19pdGVtIG9wZW4tbW9kYWxcIiBvcGVuLW1vZGFsPVwiI2VkaXQtZ2lnXCI+RWRpdDwvbGk+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0gZGVsZXRlXCI+RGVsZXRlPC9saT48L3VsPic7XG5cbiAgICAgICAgdmFyIGdpZ0xheW91dCA9IGA8ZGl2IGNsYXNzPVwidXNlci1jYXJkIGdpZ1wiICBpZD1cIiR7Z2lnSUR9XCIgZGF0YS10b2dnbGU9XCJtb2RhbFwiIGRhdGEtdGFyZ2V0PVwiI2dpZ01vZGFsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW1nLWNhcmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duQnV0dG9ufVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25VTH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8aW1nIHNyYz1cIiR7YXBpX2NkbiArIGdpZ09iamVjdC5pbWFnZV9oYXNofVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWxhYmVsXCI+JHtnaWdPYmplY3QuZ2VuZXJhbF9kb21haW5fb2ZfZXhwZXJ0aXNlfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWltZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpbWcgaWQ9XCJpbWdhdiR7Z2lnSUR9XCIgc3JjPVwiJHtpbWdfc3JjfVwiIGFsdD1cIkF2YXRhclwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInVzZXItbmFtZVwiIGlkPVwibm1vd24ke2dpZ0lEfVwiPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1yb2xlXCI+JHtnaWdPYmplY3QuZ2VuZXJhbF9kb21haW5fb2ZfZXhwZXJ0aXNlfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLWluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImluZm9cIj4ke2dpZ09iamVjdC50aXRsZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLXByaWNlXCI+U1RBUlRJTkcgQVQ6IDxzcGFuPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5wb2x5bWVyPC9pPiR7cm91bmRfcHJpY2V9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG4gICAgICAgIHZhciBwcmVsb2FkZXIgPSBgPGRpdiBjbGFzcz1cInByZWxvYWRlci1jYXJkXCI+PGltZyBzcmM9XCIuL2Rpc3QvaW1nL3ByZWxvYWRlci5naWZcIiBhbHQ9XCJcIj48L2Rpdj5gO1xuICAgICAgICBpZiAoJChcIi5naWdzLWNvbnRhaW5lclwiKS5jaGlsZHJlbigpLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChwcmVsb2FkZXIpO1xuICAgICAgICB9XG4gICAgICAgICQoXCIuZ2lncy1jb250YWluZXJcIikucHJlcGVuZChnaWdMYXlvdXQpO1xuICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVEb20oKTtcblxuICAgICAgICBpZiAoZ2lnT2JqZWN0Lmhhc093blByb3BlcnR5KCdvd25lcl9ndWlkJykpIHtcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcbiAgICAgICAgICAgIGdldFByb2ZpbGVWYWx1ZShvd25lcl9ndWlkLCAncHJvZmlsZVBpY3R1cmUnLCBmdW5jdGlvbihwcm9maWxlUGljdHVyZVVSTCkge1xuICAgICAgICAgICAgICAgIHZhciBwX3NyYyA9IGFwaV9jZG4gKyBKU09OLnBhcnNlKHByb2ZpbGVQaWN0dXJlVVJMKTtcbiAgICAgICAgICAgICAgICAkKCcjaW1nYXYnICsgZ2lnSUQpLmF0dHIoJ3NyYycsIHBfc3JjKTtcbiAgICAgICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ25hbWUnLCBmdW5jdGlvbihuYW1lX2pzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWVzX28gPSBKU09OLnBhcnNlKG5hbWVfanN0cilcbiAgICAgICAgICAgICAgICAgICAgJCgnI25tb3duJyArIGdpZ0lEKS50ZXh0KG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2VuZXJhdGU6IGZ1bmN0aW9uKGlkLCBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZUdpZ3NGcm9tRGF0YShpZCwgb2JqKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTsiLCIvLyBHbG9iYWwgRXZlbnRzXG4kKGRvY3VtZW50KS5jbGljayhmdW5jdGlvbihlKSB7XG4gICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZHJvcGRvd24nKS5sZW5ndGgpIHtcbiAgICAgICAgJCgnI3NldHRpbmdzLWRyb3Bkb3duJykucGFyZW50cygnLmRyb3Bkb3duJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICB9XG59KTtcbi8vIERyb3Bkb3duIHNob3cgaW4gaGVhZGVyXG4kKGRvY3VtZW50KS5vbignY2xpY2snLCAnI3NldHRpbmdzLWRyb3Bkb3duJywgZnVuY3Rpb24oZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICQodGhpcykucGFyZW50cygnLmRyb3Bkb3duJykudG9nZ2xlQ2xhc3MoJ3Nob3cnKTtcblxuICAgIC8vIC5zaWJsaW5ncygnW2RhdGEtbGFiZWxsZWRieT1zZXR0aW5ncy1kcm9wZG93bl0nKS5cbn0pOyIsIndpbmRvdy4kdXBsb2FkQ3JvcCA9ICQoJyNjcm9waWUnKS5jcm9wcGllKHtcbiAgICBlbmFibGVFeGlmOiB0cnVlLFxuICAgIHZpZXdwb3J0OiB7XG4gICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgIGhlaWdodDogMjAwLFxuICAgICAgICB0eXBlOiAnY2lyY2xlJ1xuICAgIH0sXG4gICAgYm91bmRhcnk6IHtcbiAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgaGVpZ2h0OiAzMDBcbiAgICB9XG59KTtcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LmdpZ3NQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0R2lncygpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5naWdzJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBnZXRMaXN0T2ZHaWdzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0R2lnczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5pdEdpZ3MoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdnaWdzLXBhZ2UnKSkge1xuICAgICAgICBnaWdzUGFnZU1vZHVsZS5vbmluaXRHaWdzKCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cucHJvZmlsZVBhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcblxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlKCkge1xuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBnZXROb2RlRGF0YShmdW5jdGlvbihub2RlX2RhdGEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG5vZGVfZGF0YSk7XG4gICAgICAgICAgICB2YXIgbm9kZSA9ICQucGFyc2VKU09OKG5vZGVfZGF0YSk7XG4gICAgICAgICAgICBnZXRQcm9maWxlR2lncyhub2RlLmd1aWQsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgcHJvZmlsZV9naWdzID0gSlNPTi5wYXJzZShkYXRhKTtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb2ZpbGVfZ2lncy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBwcm9maWxlX2dpZ3NbaV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBoazogcHJvZmlsZV9naWdzW2ldLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ19vID0gSlNPTi5wYXJzZShqc19kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VSUicsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbmluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZS1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZXMoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5uYXYtdGFicyAucHJvZmlsZXMnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIG1haW5fcHJvZmlsZV9jYXJkcygpO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIG9uaW5pdHByb2ZpbGVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbml0UHJvZmlsZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZXNQYWdlTW9kdWxlLm9uaW5pdHByb2ZpbGVzKCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuc21hcnRTZWFyY2hNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG4gIC8vIEdsb2JhbCB2YXJpYWJsZXMgZm9yIFNtYXJ0IFNlYXJjaFxuXG4gIHZhciBzZWFyY2hBcnJheSA9IG5ldyBBcnJheSgpO1xuXG4gIGZ1bmN0aW9uIHNtYXJ0U2VhcmNoKCkge1xuICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xuICAgICAgdmFyIHNlYXJjaFEgPSAnJztcbiAgICAgIC8vIGJ1aWxkIHVybCBmb3Igc2VhcmNoaW5nXG4gICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgJC5lYWNoKHNlYXJjaEFycmF5LCBmdW5jdGlvbihpLCBpdGVtKSB7XG4gICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBzZWFyY2hRICs9IGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XG4gICAgICAgICAgICAgICAgICB1cmwgKz0gaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAkLmFqYXgoe1xuICAgICAgICAgIHR5cGU6ICdHRVQnLFxuICAgICAgICAgIHVybDogdXJsLFxuICAgICAgICAgIHFyeTogc2VhcmNoUSxcbiAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgICAgICAgICAgICBpZiAoZGF0YSA9PSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IHJlc3VsdDogXCJObyByZXN1bHRzXCIgfSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKHNlYXJjaFEsIGRhdGEpO1xuICAgICAgICAgIH1cbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gU2VhcmNoIEV2ZW50c1xuXG4gIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIHRleHQgZmllbGRcbiAgJChkb2N1bWVudCkub24oJ2tleXByZXNzJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICBpZiAoZS53aGljaCA9PSAxMykge1xuICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSAkKGUudGFyZ2V0KS52YWwoKS5zcGxpdChcIiBcIikuam9pbihcIiUyMFwiKTtcbiAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICAgIH1cbiAgfSk7XG5cbiAgLy8gU3VibWl0IHNlYXJjaCBmb3IgZHJvcGRvd24gZXhwZXJ0aXNlXG4gICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcbiAgICAgIGxvYWRfdGFnc19wZXJfZG9tYWluKGVsKTtcbiAgICAgIHNlYXJjaF9ldmVudCgpO1xuICB9KTtcblxuICByZXR1cm4ge1xuICAgICAgc2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gc21hcnRTZWFyY2goKTtcbiAgICAgIH1cbiAgfVxufSkoKTtcbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgbmFtZTogJ0FuZHJldycsXG4gIGFnZTogMTAwXG59XG4iXX0=
