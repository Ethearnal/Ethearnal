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
require("./modules/onInitNetwork.js"); // MODULE with INIT NETWORK PAGE

},{"./modules/generateGigs.js":2,"./modules/globalEvents.js":3,"./modules/imageCrop.js":4,"./modules/newGigModal.js":5,"./modules/onInitGigs.js":6,"./modules/onInitNetwork.js":7,"./modules/onInitProfile.js":8,"./modules/onInitProfiles.js":9,"./modules/range-slider.js":10,"./modules/smartSearch.js":11}],2:[function(require,module,exports){
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
"use strict";

// Smart Search Declarating
window.networkPageModule = function () {
  function initNetwork() {
    var map;
    var infowindow = new google.maps.InfoWindow();
    function initialize() {

      var mapProp = {
        center: new google.maps.LatLng(52.4550, -3.3833),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      map = new google.maps.Map(document.getElementById("map"), mapProp);

      var json1 = {
        "geoJSON": [{
          "geo": {
            "zip_code": "EC2V",
            "latitude": 51.5142,
            "country_name": "United Kingdom",
            "region_name": "England",
            "ip": "178.62.22.110",
            "longitude": -0.0931,
            "city": "London",
            "time_zone": "Europe/London",
            "region_code": "ENG",
            "country_code": "GB",
            "metro_code": 0
          },
          "port": "5678",
          "ip4": "178.62.22.110",
          "service_url": "http://178.62.22.110:5678"
        }, {
          "ip4": "165.227.184.55",
          "port": "5678",
          "geo": {
            "zip_code": "07014",
            "latitude": 40.8326,
            "country_name": "United States",
            "region_name": "New Jersey",
            "ip": "165.227.184.55",
            "longitude": -74.1307,
            "metro_code": 501,
            "city": "Clifton",
            "time_zone": "America/New_York",
            "region_code": "NJ",
            "country_code": "US"
          },
          "service_url": "http://165.227.184.55:5678"
        }, {
          "ip4": "46.101.223.52",
          "port": "5678",
          "geo": {
            "zip_code": "09039",
            "latitude": 50.1167,
            "metro_code": 0,
            "region_name": "Hesse",
            "ip": "46.101.223.52",
            "longitude": 8.6833,
            "country_name": "Germany",
            "city": "Frankfurt am Main",
            "time_zone": "Europe/Berlin",
            "region_code": "HE",
            "country_code": "DE"
          },
          "service_url": "http://46.101.223.52:5678"
        }]
      };

      $.each(json1.geoJSON, function (key, data) {
        var latLng = new google.maps.LatLng(data.geo.latitude, data.geo.longitude);
        var marker = new google.maps.Marker({
          position: latLng,
          map: map,
          title: data.geo.country_name
        });

        var country = data.geo.country_name;
        var ip4 = data.ip4;

        bindInfoWindow(marker, map, infowindow, country, ip4);
      });
    }

    function bindInfoWindow(marker, map, infowindow, country, ip4) {
      google.maps.event.addListener(marker, 'click', function () {

        $('#modal-network').find('.ntw-country').text(country);
        $('#modal-network').find('.ntw-ip').text(ip4);
        $("[data-target='#modal-network']").trigger('click');
        // infowindow.setContent(strDescription);
        // infowindow.open(map, marker);
      });
    }

    google.maps.event.addDomListener(window, 'load', initialize);

    //   // openlayer old
    //   var map = new ol.Map({
    //     target: 'map',
    //     layers: [
    //       new ol.layer.Tile({
    //         source: new ol.source.OSM()
    //       })
    //     ],
    //     view: new ol.View({
    //       center: ol.proj.fromLonLat([37.41, 8.82]),
    //       zoom: 4
    //     })
    //   })
    //
    //   var pin_icon = '//cdn.rawgit.com/jonataswalker/ol3-contextmenu/master/examples/img/pin_drop.png';
    //   var center_icon = '//cdn.rawgit.com/jonataswalker/ol3-contextmenu/master/examples/img/center.png';
    //   var list_icon = '//cdn.rawgit.com/jonataswalker/ol3-contextmenu/master/examples/img/view_list.png';
    //
    //   map.on('click', function (e) {
    //     console.log(this)
    //   })
  }

  return {
    oninitNetwork: function oninitNetwork() {
      return initNetwork();
    }
  };
}();

$(document).ready(function () {
  if ($('body').hasClass('network-page')) {
    networkPageModule.oninitNetwork();
  }
});

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdE5ldHdvcmsuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9yYW5nZS1zbGlkZXIuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DO0FBQ3BDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSw0QkFBUixFLENBQXVDOzs7OztBQ1R2QztBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRCxLQUFoRCxFQUF1RCxHQUF2RCxFQUE0RDs7QUFFeEQsWUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUFFO0FBQVE7O0FBRW5ELFlBQUksVUFBVSxpQkFBZDtBQUNBLFlBQUksZ0JBQWdCLElBQXBCO0FBQ0EsWUFBSSxh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NUwwQixFQUEzQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwicmVxdWlyZShcIi4vbW9kdWxlcy9zbWFydFNlYXJjaC5qc1wiKTsgLy8gTU9EVUxFIEZPUiBTRUFSQ0hJTkdcbnJlcXVpcmUoXCIuL21vZHVsZXMvZ2xvYmFsRXZlbnRzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHTE9CQUwgRVZFTlRTXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2ltYWdlQ3JvcC5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU1BR0UgQ1JPUFBFUlxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlcy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBQUk9GSUxFIFBBR0VcbnJlcXVpcmUoXCIuL21vZHVsZXMvZ2VuZXJhdGVHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHaWdzIGdlbmVyYXRvclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHSUdTIFBBR0UgSU5JVFxucmVxdWlyZShcIi4vbW9kdWxlcy9yYW5nZS1zbGlkZXIuanNcIik7IC8vIE1PRFVMRSB3aXRoIFJBTkdFIFNMSURFUlxucmVxdWlyZShcIi4vbW9kdWxlcy9uZXdHaWdNb2RhbC5qc1wiKTsgLy8gTU9EVUxFIHdpdGggQ1JFQVRFIE5FVyBHSUdcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0TmV0d29yay5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBORVRXT1JLIFBBR0VcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LmdlbmVyYXRlR2lnc01vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIGZ1bmN0aW9uIGdlbmVyYXRlR2lnc0Zyb21EYXRhKGdpZ0lELCBnaWdPYmplY3QsIGlzT3duLCBvbmUpIHtcbiAgICAgICBcbiAgICAgICAgaWYgKGNoZWNrX2dpZ19tYXJrZWRfZGVsZXRlZChnaWdPYmplY3QpKSB7IHJldHVybiB9XG5cbiAgICAgICAgdmFyIGFwaV9jZG4gPSBhcGlfZ2V0X2Nkbl91cmwoKTtcbiAgICAgICAgdmFyIHByb2ZpbGVfaW1hZ2UgPSBudWxsO1xuICAgICAgICB2YXIgb3duZXJfZ3VpZCA9IG51bGw7XG4gICAgICAgIHZhciBpbWdfc3JjID0gJyc7XG4gICAgICAgIHZhciBmdWxsbmFtZSA9ICcnO1xuICAgICAgICB2YXIgY2F0ZWdvcnlPYmogPSB7XG4gICAgICAgICAgICBcInNkXCI6IFwiU29mdHdhcmUgRGV2ZWxvcG1lbnRcIixcbiAgICAgICAgICAgIFwiZmFcIjogXCJGaW5hbmNlICYgQWNjb3VudGluZ1wiLFxuICAgICAgICAgICAgXCJtYVwiOiBcIk11c2ljICYgQXVkaW9cIixcbiAgICAgICAgICAgIFwiZ2RcIjogXCJHcmFwaGljICYgRGVzaWduXCIsXG4gICAgICAgICAgICBcInZhXCI6IFwiVmlkZW8gJiBBbmltYXRpb25cIixcbiAgICAgICAgICAgIFwidHdcIjogXCJUZXh0ICYgV3JpdGluZ1wiLFxuICAgICAgICAgICAgXCJjc1wiOiBcIkNvbnN1bHRpbmcgU2VydmljZXNcIixcbiAgICAgICAgICAgIFwib3NcIjogXCJPdGhlciBTZXJ2aWNlc1wiXG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcm91bmRfcHJpY2UgPSBNYXRoLnJvdW5kKGdpZ09iamVjdC5wcmljZSAqIDEwMDApIC8gMTAwMDtcbiAgICAgICAgdmFyIGdpZ0RlbGV0ZVN0cmluZyA9ICcnO1xuICAgICAgICBpZiAoaXNPd24pIHtcbiAgICAgICAgICAgIHZhciBnaWdEZWxldGVTdHJpbmcgPSAnPGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0gZGVsZXRlXCI+RGVsZXRlPC9saT4nXG4gICAgICAgIH1cbiAgICAgICAgdmFyIGRyb3Bkb3duQnV0dG9uID0gJzxidXR0b24gaWQ9XCJEREInICsgZ2lnSUQgKyAnXCIgY2xhc3M9XCJkcm9wZG93bi1naWcgbWRsLWJ1dHRvbiBtZGwtanMtYnV0dG9uIG1kbC1idXR0b24tLWljb24gZHJvcGRvd24tYnV0dG9uIGJ0bi1pbmZvLWVkaXRcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+bW9yZV92ZXJ0PC9pPjwvYnV0dG9uPic7XG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT4nICsgZ2lnRGVsZXRlU3RyaW5nICsgJzwvdWw+JztcblxuICAgICAgICBpZiAoZ2lnT2JqZWN0Lmhhc093blByb3BlcnR5KCdvd25lcl9ndWlkJykpIHtcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcblxuICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICdwcm9maWxlUGljdHVyZScsIGZ1bmN0aW9uKHByb2ZpbGVQaWN0dXJlVVJMKSB7XG4gICAgICAgICAgICAgICAgaW1nX3NyYyA9IGFwaV9jZG4gKyBKU09OLnBhcnNlKHByb2ZpbGVQaWN0dXJlVVJMKSArICcmdGh1bWI9MSc7XG4gICAgICAgICAgICAgICAgLy8gJCgnI2ltZ2F2JyArIGdpZ0lEKS5hdHRyKCdzcmMnLCBwX3NyYyk7XG4gICAgICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICduYW1lJywgZnVuY3Rpb24obmFtZV9qc3RyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc19vID0gSlNPTi5wYXJzZShuYW1lX2pzdHIpO1xuICAgICAgICAgICAgICAgICAgICBmdWxsbmFtZSA9IG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdDtcbiAgICAgICAgICAgICAgICAgICAgLy8gJCgnI25tb3duJyArIGdpZ0lEKS50ZXh0KG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdMYXlvdXQgPSBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImltZy1jYXJkXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB1cmwoJHthcGlfY2RuICsgZ2lnT2JqZWN0LmltYWdlX2hhc2h9JnRodW1iPTEpIGNlbnRlciBuby1yZXBlYXQ7IGJhY2tncm91bmQtc2l6ZTogY292ZXI7XCIgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25CdXR0b259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93blVMfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXJkLWxhYmVsXCI+JHtjYXRlZ29yeU9ialtnaWdPYmplY3QuY2F0ZWdvcnldfTwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWltZ1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJkaXYtaW1nLXdyYXBcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgnJHtpbWdfc3JjfScpXCI+PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1uYW1lXCIgaWQ9XCJubW93biR7Z2lnSUR9XCI+JHtmdWxsbmFtZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cInVzZXItcm9sZVwiPiR7Y2F0ZWdvcnlPYmpbZ2lnT2JqZWN0LmNhdGVnb3J5XX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1pbmZvXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcmljZVwiPlNUQVJUSU5HIEFUOiA8c3Bhbj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cG9seW1lcjwvaT4ke3JvdW5kX3ByaWNlfTwvc3Bhbj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbmUgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5naWdzLWNvbnRhaW5lclwiKS5wcmVwZW5kKGdpZ0xheW91dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChnaWdMYXlvdXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaWQsIG9iaiwgaXNPd24sIG9uZSkge1xuICAgICAgICAgICAgcmV0dXJuIGdlbmVyYXRlR2lnc0Zyb21EYXRhKGlkLCBvYmosIGlzT3duLCBvbmUpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuIiwiZnVuY3Rpb24gZmlsdGVyUHJvZmlsZUNhcmRzKHF1ZXJ5LCAkaW5wdXQpIHtcbiAgLyogQ0hFQ0sgRk9SIFFVRVJZIE1BVENIIFdJVEggTkFNRSAqL1xuICAkKCcucHJvZmlsZS11c2VyLWNhcmQnKS5lYWNoKGZ1bmN0aW9uKGksaXRlbSkge1xuICAgIHZhciBuYW1lID0gJChpdGVtKS5maW5kKCcudXNlci1uYW1lJykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XG4gICAgbmFtZS5tYXRjaChxdWVyeS50b0xvd2VyQ2FzZSgpKSA/ICQoaXRlbSkucmVtb3ZlQ2xhc3MoJ2hpZGRlbicpIDogJChpdGVtKS5hZGRDbGFzcygnaGlkZGVuJylcbiAgfSk7XG4gIC8qIEFERCBSRUQgQk9SREVSIFRPIElOUFVUIElGIE5PIFNFQVJDSCBNQVRDSEVEICovXG4gICQoJy5wcm9maWxlLXVzZXItY2FyZCcpLmxlbmd0aCA9PSAkKCcucHJvZmlsZS11c2VyLWNhcmQuaGlkZGVuJykubGVuZ3RoID8gJGlucHV0LmFkZENsYXNzKCdlcnJvcicpIDogJGlucHV0LnJlbW92ZUNsYXNzKCdlcnJvcicpO1xufVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAvLyBHbG9iYWwgRXZlbnRzXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcbiAgICAgIGlmICghJChlLnRhcmdldCkuY2xvc2VzdCgnLmRyb3Bkb3duJykubGVuZ3RoKSB7XG4gICAgICAgICAgJCgnI3NldHRpbmdzLWRyb3Bkb3duJykucGFyZW50cygnLmRyb3Bkb3duJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcbiAgICAgIH1cbiAgfSk7XG4gIC8vIERyb3Bkb3duIHNob3cgaW4gaGVhZGVyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjc2V0dGluZ3MtZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnc2hvdycpO1xuICAgICAgLy8gLnNpYmxpbmdzKCdbZGF0YS1sYWJlbGxlZGJ5PXNldHRpbmdzLWRyb3Bkb3duXScpLlxuICB9KTtcblxuICAvLyBPUEVOIEdJRyBCSUcgTU9EQUwgT04gTUVOVSBjbGlja1xuICAkKCdib2R5JykuZGVsZWdhdGUoJ2xpLmpzLW9wZW4tZ2lnLW1vZGFsJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICQodGhpcykuY2xvc2VzdCgnLmdpZycpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gIH0pO1xuXG4gIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXG4gIGlmICggJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykgKSB7XG4gICAgLyogRklMVEVSIFBST0ZJTEUgQ0FSRFMgKi9cbiAgICAkKGRvY3VtZW50KS5vbignaW5wdXQnLCAnLnByb2ZpbGVzLXBhZ2UgI3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbigpIHtcbiAgICAgIGZpbHRlclByb2ZpbGVDYXJkcyggJCh0aGlzKS52YWwoKSwgJCh0aGlzKSApO1xuICAgIH0pO1xuXG4gICAgLyogT1BFTiBJTlRFUk5BTCBQUk9GSUxFIFBBR0UgKi9cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucHJvZmlsZS11c2VyLWNhcmQnLGZ1bmN0aW9uKCl7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvdWkvcHJvZmlsZS8jJyArICQodGhpcykuYXR0cignaWQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8vIFJFRElSRUNUIFRPIFBST0ZJTEUgUEFHRSBPTiBDTElDSyBPTiBVU0VSUyBQUk9GSUxFXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc09wZW5HaWdPd25lclByb2ZpbGUnLGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XG4gIH0pO1xufSlcbiIsIndpbmRvdy4kdXBsb2FkQ3JvcCA9ICQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKS5jcm9wcGllKHtcbiAgdmlld3BvcnQ6IHtcbiAgICB3aWR0aDogNDUwLFxuICAgIGhlaWdodDogMTUwXG4gIH0sXG4gIGVuYWJsZVpvb206IHRydWUsXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxufSk7XG5cbndpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUgPSAkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpLmNyb3BwaWUoe1xuICB2aWV3cG9ydDoge1xuICAgIHdpZHRoOiAxNTAsXG4gICAgaGVpZ2h0OiAxNTAsXG4gICAgdHlwZTogXCJjaXJjbGVcIlxuICB9LFxuICBlbmFibGVab29tOiB0cnVlLFxuICBlbmFibGVSZXNpemU6IHRydWVcbn0pO1xuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpe1xuICAgIC8qIEJVVFRPTiBJTklUIENMSUNLIE9OIElOUFVUIFRZUEUgRklMRSAqL1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc0Nyb3BVcGxvYWQnLGZ1bmN0aW9uKCl7XG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb250ZW50Jyk7XG4gICAgICAkY29udGVudC5maW5kKCdpbnB1dCNpbnB1dC1pbWFnZS1naWcnKS5jbGljaygpO1xuICAgIH0pO1xuXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5qc0Nyb3BVcGxvYWRQcm9maWxlXCIsIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XG4gICAgICAkY29udGVudC5maW5kKFwiaW5wdXQjaW5wdXQtaW1hZ2UtcHJvZmlsZVwiKS5jbGljaygpO1xuICAgIH0pO1xuXG4gICAgLyogQlVUVE9OIEZPUiBHRVRUSU5HIENST1AgUkVTVWx0ICovXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFJlc3VsdCcsZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jb250ZW50Jyk7XG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3AuY3JvcHBpZSgncmVzdWx0JywnYmFzZTY0JykudGhlbiggZnVuY3Rpb24oYmFzZTY0KSB7XG4gICAgICAgICRjb250ZW50LmZpbmQoJ2ltZyNpbnB1dC1pbWFnZS1naWcnKS5hdHRyKCdzcmMnLCBiYXNlNjQpLnNob3coNTAwKS5yZW1vdmVDbGFzcygnZW1wdHknKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1naWdcIikpLnNob3coNTAwKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5zaG93KCk7XG4gICAgICB9KTtcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcC5jcm9wcGllKCdyZXN1bHQnLCdibG9iJykudGhlbiggZnVuY3Rpb24oYmxvYikge1xuICAgICAgICB3aW5kb3cuJHVwbG9hZENyb3BCbG9iID0gYmxvYjtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1naWdcIikpLmhpZGUoNDAwKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XG4gICAgICB9KTtcbiAgICB9KVxuXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5qc0Nyb3BSZXN1bHRQcm9maWxlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdChcIi5jb250ZW50XCIpO1xuICAgICAgd2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZS5jcm9wcGllKFwicmVzdWx0XCIsIFwiYmFzZTY0XCIpLnRoZW4oZnVuY3Rpb24oYmFzZTY0KSB7XG4gICAgICAgICAgJGNvbnRlbnQuZmluZChcInNwYW4jaW5wdXQtaW1hZ2UtcHJvZmlsZVwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsICd1cmwoJysgYmFzZTY0ICsnKScpLnNob3coNTAwKS5yZW1vdmVDbGFzcyhcImVtcHR5XCIpO1xuICAgICAgICAgICRjb250ZW50LmZpbmQoJChcIiNjcm9wcGVyLXdyYXAtcHJvZmlsZVwiKSkuc2hvdyg1MDApO1xuICAgICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuc2hvdygpO1xuICAgICAgICB9KTtcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUuY3JvcHBpZShcInJlc3VsdFwiLCBcImJsb2JcIikudGhlbihmdW5jdGlvbihibG9iKSB7XG4gICAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcEJsb2JQcm9maWxlID0gYmxvYjtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5oaWRlKDQwMCk7XG4gICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuaGlkZSgpO1xuICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIndpbmRvdy5jcmVhdGVOZXdHaWcgPSAoZnVuY3Rpb24oKSB7XG4gICAgJChcIiNhZGQtZ2lnXCIpLmZpbmQoXCIjbmV3R2lnZXhwaXJlXCIpLmRhdGVwaWNrZXIoKTtcbiAgICAkKFwiI2FkZC1naWdcIikub24oXCJoaWRkZW4uYnMubW9kYWxcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCIuZ2lnLXRhZ3NcIikuZmluZChcIi5kZWxldGVcIikuY2xpY2soKTtcbiAgICAgICAgJCh0aGlzKVxuICAgICAgICAgICAgLmZpbmQoXCJpbWcjaW5wdXQtaW1hZ2UtZ2lnXCIpLmhpZGUoKS5hZGRDbGFzcyhcImVtcHR5XCIpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIi5pbWctbGFiZWxcIikuc2hvdygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLnRleHQoJycpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmhpZGUoKS5lbmQoKVxuICAgICAgICAgICAgLmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuaGlkZSgpO1xuICAgICAgICAkKHRoaXMpXG4gICAgICAgICAgICAuZmluZChcImlucHV0LHRleHRhcmVhLHNlbGVjdFwiKS52YWwoXCJcIikuZW5kKClcbiAgICAgICAgICAgIC5maW5kKFwiLnJhbmdlLXNsaWRlclwiKVxuICAgICAgICAgICAgLmZpbmQoXCJpbnB1dFwiKS52YWwoXCIwXCIpLmVuZCgpXG4gICAgICAgICAgICAuZmluZChcIi5yYW5nZS1zbGlkZXJfX3ZhbHVlXCIpLnRleHQoXCIwXCIpO1xuICAgICAgICAkKHRoaXMpLmZpbmQoXCIjbmV3LWdpZy1jYXRlZ29yeVwiKS5wYXJlbnQoKS5maW5kKFwiLnRleHRcIikudGV4dChcIkFsbCBDYXRlZ29yaWVzXCIpO1xuICAgIH0pO1xuXG4gICAgdmFyIGNhbGN1bGF0ZWRMb2NrO1xuICAgICQoJy5qc0NhbGN1bGF0ZWRMb2NrJykub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGNvc3QgPSAkKCcjcmVwdXRhdGlvbkNvc3QnKS52YWwoKSxcbiAgICAgICAgICBhbW91bnQgPSAkKCcjYW1vdW50JykudmFsKCksXG4gICAgICAgICAgJGNhbGN1bGF0ZWRMb2NrID0gJCgnI2NhbGN1bGF0ZWRMb2NrJyksXG4gICAgICAgICAgY2FsY3VsYXRlZExvY2sgPSBjYWxjTG9jayhjb3N0LCBhbW91bnQpXG4gICAgICAgICAgJGNhbGN1bGF0ZWRMb2NrLnRleHQoY2FsY3VsYXRlZExvY2sgKyAnIEVSVCcpO1xuICAgIH0pXG5cbn0pKCk7XG5cbmZ1bmN0aW9uIGNhbGNMb2NrIChjb3N0LCBhbW91bnQpIHtcbiAgcmV0dXJuIChjb3N0ICogYW1vdW50KSAvIDEwMDtcbn1cbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xud2luZG93LmdpZ3NQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0R2lncygpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcbiAgICAgICAgJCgnLm5hdi10YWJzIC5naWdzJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICBnZXRMaXN0T2ZHaWdzKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0R2lnczogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5pdEdpZ3MoKTtcbiAgICAgICAgfVxuICAgIH1cblxufSkoKTtcblxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdnaWdzLXBhZ2UnKSkge1xuICAgICAgICBnaWdzUGFnZU1vZHVsZS5vbmluaXRHaWdzKCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cubmV0d29ya1BhZ2VNb2R1bGUgPSAoZnVuY3Rpb24gKCkge1xuICBmdW5jdGlvbiBpbml0TmV0d29yayAoKSB7XG4gICAgdmFyIG1hcDtcbiAgICB2YXIgaW5mb3dpbmRvdyA9IG5ldyBnb29nbGUubWFwcy5JbmZvV2luZG93KCk7XG4gICAgZnVuY3Rpb24gaW5pdGlhbGl6ZSgpIHtcblxuICAgICAgICB2YXIgbWFwUHJvcCA9IHtcbiAgICAgICAgICAgIGNlbnRlcjogbmV3IGdvb2dsZS5tYXBzLkxhdExuZyg1Mi40NTUwLCAtMy4zODMzKSxcbiAgICAgICAgICAgIHpvb206IDUsXG4gICAgICAgICAgICBtYXBUeXBlSWQ6IGdvb2dsZS5tYXBzLk1hcFR5cGVJZC5ST0FETUFQXG4gICAgICAgIH07XG5cbiAgICAgICAgbWFwID0gbmV3IGdvb2dsZS5tYXBzLk1hcChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1hcFwiKSwgbWFwUHJvcCk7XG5cbiAgICAgICAgdmFyIGpzb24xID0ge1xuICAgICAgICAgIFwiZ2VvSlNPTlwiOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBcImdlb1wiOiB7XG4gICAgICAgICAgICAgICAgICBcInppcF9jb2RlXCI6IFwiRUMyVlwiLFxuICAgICAgICAgICAgICAgICAgXCJsYXRpdHVkZVwiOiA1MS41MTQyLFxuICAgICAgICAgICAgICAgICAgXCJjb3VudHJ5X25hbWVcIjogXCJVbml0ZWQgS2luZ2RvbVwiLFxuICAgICAgICAgICAgICAgICAgXCJyZWdpb25fbmFtZVwiOiBcIkVuZ2xhbmRcIixcbiAgICAgICAgICAgICAgICAgIFwiaXBcIjogXCIxNzguNjIuMjIuMTEwXCIsXG4gICAgICAgICAgICAgICAgICBcImxvbmdpdHVkZVwiOiAtMC4wOTMxLFxuICAgICAgICAgICAgICAgICAgXCJjaXR5XCI6IFwiTG9uZG9uXCIsXG4gICAgICAgICAgICAgICAgICBcInRpbWVfem9uZVwiOiBcIkV1cm9wZS9Mb25kb25cIixcbiAgICAgICAgICAgICAgICAgIFwicmVnaW9uX2NvZGVcIjogXCJFTkdcIixcbiAgICAgICAgICAgICAgICAgIFwiY291bnRyeV9jb2RlXCI6IFwiR0JcIixcbiAgICAgICAgICAgICAgICAgIFwibWV0cm9fY29kZVwiOiAwXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBcInBvcnRcIjogXCI1Njc4XCIsXG4gICAgICAgICAgICAgICAgXCJpcDRcIjogXCIxNzguNjIuMjIuMTEwXCIsXG4gICAgICAgICAgICAgICAgXCJzZXJ2aWNlX3VybFwiOiBcImh0dHA6Ly8xNzguNjIuMjIuMTEwOjU2NzhcIlxuICAgICAgICAgICAgICB9LCB7XG4gICAgICAgICAgICAgICAgXCJpcDRcIjogXCIxNjUuMjI3LjE4NC41NVwiLFxuICAgICAgICAgICAgICAgIFwicG9ydFwiOiBcIjU2NzhcIixcbiAgICAgICAgICAgICAgICBcImdlb1wiOiB7XG4gICAgICAgICAgICAgICAgICBcInppcF9jb2RlXCI6IFwiMDcwMTRcIixcbiAgICAgICAgICAgICAgICAgIFwibGF0aXR1ZGVcIjogNDAuODMyNixcbiAgICAgICAgICAgICAgICAgIFwiY291bnRyeV9uYW1lXCI6IFwiVW5pdGVkIFN0YXRlc1wiLFxuICAgICAgICAgICAgICAgICAgXCJyZWdpb25fbmFtZVwiOiBcIk5ldyBKZXJzZXlcIixcbiAgICAgICAgICAgICAgICAgIFwiaXBcIjogXCIxNjUuMjI3LjE4NC41NVwiLFxuICAgICAgICAgICAgICAgICAgXCJsb25naXR1ZGVcIjogLTc0LjEzMDcsXG4gICAgICAgICAgICAgICAgICBcIm1ldHJvX2NvZGVcIjogNTAxLFxuICAgICAgICAgICAgICAgICAgXCJjaXR5XCI6IFwiQ2xpZnRvblwiLFxuICAgICAgICAgICAgICAgICAgXCJ0aW1lX3pvbmVcIjogXCJBbWVyaWNhL05ld19Zb3JrXCIsXG4gICAgICAgICAgICAgICAgICBcInJlZ2lvbl9jb2RlXCI6IFwiTkpcIixcbiAgICAgICAgICAgICAgICAgIFwiY291bnRyeV9jb2RlXCI6IFwiVVNcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJzZXJ2aWNlX3VybFwiOiBcImh0dHA6Ly8xNjUuMjI3LjE4NC41NTo1Njc4XCJcbiAgICAgICAgICAgICAgfSwge1xuICAgICAgICAgICAgICAgIFwiaXA0XCI6IFwiNDYuMTAxLjIyMy41MlwiLFxuICAgICAgICAgICAgICAgIFwicG9ydFwiOiBcIjU2NzhcIixcbiAgICAgICAgICAgICAgICBcImdlb1wiOiB7XG4gICAgICAgICAgICAgICAgICBcInppcF9jb2RlXCI6IFwiMDkwMzlcIixcbiAgICAgICAgICAgICAgICAgIFwibGF0aXR1ZGVcIjogNTAuMTE2NyxcbiAgICAgICAgICAgICAgICAgIFwibWV0cm9fY29kZVwiOiAwLFxuICAgICAgICAgICAgICAgICAgXCJyZWdpb25fbmFtZVwiOiBcIkhlc3NlXCIsXG4gICAgICAgICAgICAgICAgICBcImlwXCI6IFwiNDYuMTAxLjIyMy41MlwiLFxuICAgICAgICAgICAgICAgICAgXCJsb25naXR1ZGVcIjogOC42ODMzLFxuICAgICAgICAgICAgICAgICAgXCJjb3VudHJ5X25hbWVcIjogXCJHZXJtYW55XCIsXG4gICAgICAgICAgICAgICAgICBcImNpdHlcIjogXCJGcmFua2Z1cnQgYW0gTWFpblwiLFxuICAgICAgICAgICAgICAgICAgXCJ0aW1lX3pvbmVcIjogXCJFdXJvcGUvQmVybGluXCIsXG4gICAgICAgICAgICAgICAgICBcInJlZ2lvbl9jb2RlXCI6IFwiSEVcIixcbiAgICAgICAgICAgICAgICAgIFwiY291bnRyeV9jb2RlXCI6IFwiREVcIlxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXCJzZXJ2aWNlX3VybFwiOiBcImh0dHA6Ly80Ni4xMDEuMjIzLjUyOjU2NzhcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgIH07XG5cbiAgICAgICAgJC5lYWNoKGpzb24xLmdlb0pTT04sIGZ1bmN0aW9uIChrZXksIGRhdGEpIHtcbiAgICAgICAgICB2YXIgbGF0TG5nID0gbmV3IGdvb2dsZS5tYXBzLkxhdExuZyhkYXRhLmdlby5sYXRpdHVkZSwgZGF0YS5nZW8ubG9uZ2l0dWRlKTtcbiAgICAgICAgICB2YXIgbWFya2VyID0gbmV3IGdvb2dsZS5tYXBzLk1hcmtlcih7XG4gICAgICAgICAgICAgIHBvc2l0aW9uOiBsYXRMbmcsXG4gICAgICAgICAgICAgIG1hcDogbWFwLFxuICAgICAgICAgICAgICB0aXRsZTogZGF0YS5nZW8uY291bnRyeV9uYW1lXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICB2YXIgY291bnRyeSA9IGRhdGEuZ2VvLmNvdW50cnlfbmFtZTtcbiAgICAgICAgICB2YXIgaXA0ID0gZGF0YS5pcDQ7XG5cbiAgICAgICAgICBiaW5kSW5mb1dpbmRvdyhtYXJrZXIsIG1hcCwgaW5mb3dpbmRvdywgY291bnRyeSwgaXA0KTtcblxuICAgICAgICB9KTtcblxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGJpbmRJbmZvV2luZG93KG1hcmtlciwgbWFwLCBpbmZvd2luZG93LCBjb3VudHJ5LCBpcDQpIHtcbiAgICAgICAgZ29vZ2xlLm1hcHMuZXZlbnQuYWRkTGlzdGVuZXIobWFya2VyLCAnY2xpY2snLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAkKCcjbW9kYWwtbmV0d29yaycpLmZpbmQoJy5udHctY291bnRyeScpLnRleHQoY291bnRyeSlcbiAgICAgICAgICAkKCcjbW9kYWwtbmV0d29yaycpLmZpbmQoJy5udHctaXAnKS50ZXh0KGlwNClcbiAgICAgICAgICAkKFwiW2RhdGEtdGFyZ2V0PScjbW9kYWwtbmV0d29yayddXCIpLnRyaWdnZXIoJ2NsaWNrJylcbiAgICAgICAgICAgIC8vIGluZm93aW5kb3cuc2V0Q29udGVudChzdHJEZXNjcmlwdGlvbik7XG4gICAgICAgICAgICAvLyBpbmZvd2luZG93Lm9wZW4obWFwLCBtYXJrZXIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnb29nbGUubWFwcy5ldmVudC5hZGREb21MaXN0ZW5lcih3aW5kb3csICdsb2FkJywgaW5pdGlhbGl6ZSk7XG5cbiAgLy8gICAvLyBvcGVubGF5ZXIgb2xkXG4gIC8vICAgdmFyIG1hcCA9IG5ldyBvbC5NYXAoe1xuICAvLyAgICAgdGFyZ2V0OiAnbWFwJyxcbiAgLy8gICAgIGxheWVyczogW1xuICAvLyAgICAgICBuZXcgb2wubGF5ZXIuVGlsZSh7XG4gIC8vICAgICAgICAgc291cmNlOiBuZXcgb2wuc291cmNlLk9TTSgpXG4gIC8vICAgICAgIH0pXG4gIC8vICAgICBdLFxuICAvLyAgICAgdmlldzogbmV3IG9sLlZpZXcoe1xuICAvLyAgICAgICBjZW50ZXI6IG9sLnByb2ouZnJvbUxvbkxhdChbMzcuNDEsIDguODJdKSxcbiAgLy8gICAgICAgem9vbTogNFxuICAvLyAgICAgfSlcbiAgLy8gICB9KVxuICAvL1xuICAvLyAgIHZhciBwaW5faWNvbiA9ICcvL2Nkbi5yYXdnaXQuY29tL2pvbmF0YXN3YWxrZXIvb2wzLWNvbnRleHRtZW51L21hc3Rlci9leGFtcGxlcy9pbWcvcGluX2Ryb3AucG5nJztcbiAgLy8gICB2YXIgY2VudGVyX2ljb24gPSAnLy9jZG4ucmF3Z2l0LmNvbS9qb25hdGFzd2Fsa2VyL29sMy1jb250ZXh0bWVudS9tYXN0ZXIvZXhhbXBsZXMvaW1nL2NlbnRlci5wbmcnO1xuICAvLyAgIHZhciBsaXN0X2ljb24gPSAnLy9jZG4ucmF3Z2l0LmNvbS9qb25hdGFzd2Fsa2VyL29sMy1jb250ZXh0bWVudS9tYXN0ZXIvZXhhbXBsZXMvaW1nL3ZpZXdfbGlzdC5wbmcnO1xuICAvL1xuICAvLyAgIG1hcC5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAvLyAgICAgY29uc29sZS5sb2codGhpcylcbiAgLy8gICB9KVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBvbmluaXROZXR3b3JrOiBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gaW5pdE5ldHdvcmsoKVxuICAgIH1cbiAgfVxufSkoKVxuXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCduZXR3b3JrLXBhZ2UnKSkge1xuICAgICAgICBuZXR3b3JrUGFnZU1vZHVsZS5vbmluaXROZXR3b3JrKCk7XG4gICAgfVxufSk7XG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcbndpbmRvdy5wcm9maWxlUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xuXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGUoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgLyogUkVTRVQgQU5EIEdFVCBORVcgUFJPRklMRSBJRCBIQVNIICovXG4gICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSBudWxsO1xuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpO1xuICAgICAgICAgICAgdXBkYXRlUHJvZmlsZSgpO1xuICAgICAgICAgICAgZ2V0R2lncyh3aW5kb3cucHJvZmlsZUlEKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJy5yZWRlc2lnbmVkLWdpZy1tb2RhbCcpLmFkZENsYXNzKCduby1idXR0b24tb3JkZXInKTtcbiAgICAgICAgICAgICQoJy5lZGl0QnRuUHJvZmlsZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGdldE5vZGVEYXRhKGZ1bmN0aW9uKG5vZGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKG5vZGVEYXRhKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gZGF0YS5ndWlkO1xuICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoKTtcbiAgICAgICAgICAgICAgICBnZXRHaWdzKGRhdGEuZ3VpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRHaWdzKGd1aWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZ3VpZCk7XG4gICAgICAgIGdldFByb2ZpbGVHaWdzKGd1aWQsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBwcm9maWxlX2dpZ3MgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9maWxlX2dpZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS92MS9kaHQvaGtleS8/aGtleT1cIiArIHByb2ZpbGVfZ2lnc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgaGs6IHByb2ZpbGVfZ2lnc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc19kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnX28gPSBKU09OLnBhcnNlKGpzX2RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlR2lnc01vZHVsZS5nZW5lcmF0ZSh0aGlzLmhrLCBnaWdfbywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyT25lR2lnKGdpZ2lkLCBvbmUpIHtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogXCIvYXBpL3YxL2RodC9oa2V5Lz9oa2V5PVwiICsgZ2lnaWQsXG4gICAgICAgICAgICBoazogZ2lnaWQsXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oanNfZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnX28gPSBKU09OLnBhcnNlKGpzX2RhdGEpO1xuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUdpZ3NNb2R1bGUuZ2VuZXJhdGUodGhpcy5oaywgZ2lnX28sIHRydWUsIG9uZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbmluaXQ6IGluaXRQcm9maWxlLFxuICAgICAgICBnZXRBbGxHaWdzOiBnZXRHaWdzLFxuICAgICAgICByZW5kZXJPbmVHaWc6IHJlbmRlck9uZUdpZ1xuICAgIH1cbn0pKCk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZS1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZXMoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5uYXYtdGFicyAucHJvZmlsZXMnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIG1haW5fcHJvZmlsZV9jYXJkcygpO1xuICAgIH1cblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanNMb2FkTW9yZVByb2ZpbGVzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpbWl0ID0gbGltaXQgKyA5O1xuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcbiAgICB9KTtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0cHJvZmlsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSkge1xuICAgICAgICBwcm9maWxlc1BhZ2VNb2R1bGUub25pbml0cHJvZmlsZXMoKTtcbiAgICB9XG59KTtcbiIsIndpbmRvdy5uZXdHaWdSYW5nZVNsaWRlciA9IChmdW5jdGlvbigpIHtcblx0dmFyIHJhbmdlU2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNsaWRlciA9ICQoXCIucmFuZ2Utc2xpZGVyXCIpLFxuXHRcdFx0cmFuZ2UgPSAkKFwiLnJhbmdlLXNsaWRlcl9fcmFuZ2VcIiksXG5cdFx0XHR2YWx1ZSA9ICQoXCIucmFuZ2Utc2xpZGVyX192YWx1ZVwiKTtcblxuXHRcdHNsaWRlci5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFsdWUuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZhbHVlID0gJCh0aGlzKVxuXHRcdFx0XHRcdC5wcmV2KClcblx0XHRcdFx0XHQuYXR0cihcInZhbHVlXCIpO1xuXHRcdFx0XHQkKHRoaXMpLmh0bWwodmFsdWUpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJhbmdlLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHQubmV4dCh2YWx1ZSlcblx0XHRcdFx0XHQuaHRtbCh0aGlzLnZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHJhbmdlU2xpZGVyKCk7XG59KSgpO1xuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuc21hcnRTZWFyY2hNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgU21hcnQgU2VhcmNoXG5cbiAgICB2YXIgc2VhcmNoQXJyYXkgPSBuZXcgQXJyYXkoKTtcbiAgICB2YXIga2V5dXBUaW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgZGF0YUxlbmd0aCA9IDBcblxuICAgIHZhciBzZWFyY2hBID0gJyc7XG5cbiAgICBmdW5jdGlvbiBzbWFydFNlYXJjaCgpIHtcbiAgICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xuICAgICAgICAvLyBidWlsZCB1cmwgZm9yIHNlYXJjaGluZ1xuICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAkLmVhY2goc2VhcmNoQXJyYXksIGZ1bmN0aW9uKGksIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoUSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnICYmIGl0ZW0udmFsdWUgPT0gJycgJiYgc2VhcmNoQXJyYXkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnYWxsJztcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCAhPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGFncycgJiYgaXRlbS52YWx1ZSA9PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICdjYXRlZ29yeScgJiYgaXRlbS52YWx1ZSA9PSAnYWxsJykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCYnICsgaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnJicgKyBpdGVtLnR5cGUgKyAnPScgKyBpdGVtLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gc2VhcmNoUTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSAnYWxsJztcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgIHVybDogdXJsICsgJyZsaW1pdD0xMDAwJyxcbiAgICAgICAgICAgIHFyeTogc2VhcmNoQSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT0gJ251bGwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IHJlc3VsdDogYE5vIHJlc3VsdHMgZm9yIHRoaXMgc2VhcmNoYCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTZWFyY2ggRXZlbnRzXG5cbiAgICAvLyBTdWJtaXQgc2VhcmNoIGZvciB0ZXh0IGZpZWxkXG4gICAgJChkb2N1bWVudCkub24oJ2tleXVwJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlLmxlbmd0aCA8IDIgJiYgdGhpcy52YWx1ZS5sZW5ndGggPiAwKSByZXR1cm47XG4gICAgICAgIGxpbWl0ID0gOTtcbiAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0U3RyaW5nID0gJChlLnRhcmdldCkudmFsKCkuc3BsaXQoXCIgXCIpLmpvaW4oXCIlMjBcIik7XG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWFyY2hBcnJheSk7XG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICB9KTtcblxuICAgIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIGRyb3Bkb3duIGV4cGVydGlzZVxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9ICQodGhpcykuZHJvcGRvd24oJ2dldCB2YWx1ZScpO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ2NhdGVnb3J5JywgdmFsdWU6IGVsIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgICAgICAgICAgaWYgKGVsICE9ICdhbGwnKSBsb2FkX3RhZ3NfcGVyX2RvbWFpbihlbCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNza2lsbHMtdGFncycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcbiAgICAgICAgY29uc29sZS5sb2coZWwpO1xuICAgICAgICBpZiAoZWwgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSBlbC5qb2luKFwiJTIwXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKVxuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0YWdzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0YWdzJywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0YWdzID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCcsICcjc2xpZGVyLXJhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSAkKHRoaXMpLnNsaWRlcihcInZhbHVlc1wiKTtcbiAgICAgICAgaWYgKHZhbHVlc1swXSA9PSAwICYmIHZhbHVlc1sxXSA9PSAyMDAwKSB7XG4gICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBxMXJhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHExcmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHExcmFuZ2UgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cblxuXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzTG9hZE1vcmVTZWFyY2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbGltaXQgPSBsaW1pdCArIDk7XG4gICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzbWFydFNlYXJjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpOyJdfQ==
