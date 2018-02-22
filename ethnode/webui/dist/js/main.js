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

// Network
window.networkPageModule = function () {

  function initNetwork() {

    var json1 = [{
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
    }];

    var sourceFeatures = new ol.source.Vector(),
        layerFeatures = new ol.layer.Vector({ source: sourceFeatures });

    var map = new ol.Map({
      target: 'map',
      layers: [new ol.layer.Tile({ source: new ol.source.OSM() }), layerFeatures],
      view: new ol.View({ center: [0, 0], zoom: 2 })
    });

    var style1 = [new ol.style.Style({
      image: new ol.style.Icon({
        rotateWithView: false,
        anchor: [0.5, 1],
        anchorXUnits: 'fraction',
        anchorYUnits: 'fraction',
        opacity: 1,
        scale: 0.7,
        // src: '//cdn.rawgit.com/jonataswalker/ol3-contextmenu/master/examples/img/pin_drop.png'
        src: '//raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png'
      }),
      zIndex: 5
    }), new ol.style.Style({
      image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({ color: 'rgba(255,255,255,1)' }),
        stroke: new ol.style.Stroke({ color: 'rgba(0,0,0,1)' })
      })
    })];

    for (var i = 0; i < json1.length; i++) {
      var count = 0;
      console.log(json1[i].geo.latitude);
      console.log(json1[i].geo.longitude);

      var feature = new ol.Feature({
        type: 'click',
        ip4: json1[i].ip4,
        country: json1[i].geo.country_name,
        geometry: new ol.geom.Point(ol.proj.transform([json1[i].geo.longitude, json1[i].geo.latitude], 'EPSG:4326', 'EPSG:3857'))
      });
      feature.setStyle(style1);
      sourceFeatures.addFeature(feature);
    }

    map.on('click', function (evt) {
      var f = map.forEachFeatureAtPixel(evt.pixel, function (ft, layer) {
        return ft;
      });
      if (f && f.get('type') === 'click') {
        var geometry = f.getGeometry();
        var coord = geometry.getCoordinates();

        $('#modal-network').find('.ntw-country').text(f.j.country);
        $('#modal-network').find('.ntw-ip').text(f.j.ip4);
        $("[data-target='#modal-network']").trigger('click');
      }
    });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdE5ldHdvcmsuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9yYW5nZS1zbGlkZXIuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DO0FBQ3BDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSw0QkFBUixFLENBQXVDOzs7OztBQ1R2QztBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRCxLQUFoRCxFQUF1RCxHQUF2RCxFQUE0RDs7QUFFeEQsWUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUFFO0FBQVE7O0FBRW5ELFlBQUksVUFBVSxpQkFBZDtBQUNBLFlBQUksZ0JBQWdCLElBQXBCO0FBQ0EsWUFBSSxhQUFhLElBQWpCO0FBQ0EsWUFBSSxVQUFVLEVBQWQ7QUFDQSxZQUFJLFdBQVcsRUFBZjtBQUNBLFlBQUksY0FBYztBQUNkLGtCQUFNLHNCQURRO0FBRWQsa0JBQU0sc0JBRlE7QUFHZCxrQkFBTSxlQUhRO0FBSWQsa0JBQU0sa0JBSlE7QUFLZCxrQkFBTSxtQkFMUTtBQU1kLGtCQUFNLGdCQU5RO0FBT2Qsa0JBQU0scUJBUFE7QUFRZCxrQkFBTTtBQVJRLFNBQWxCOztBQVdBLFlBQUksY0FBYyxLQUFLLEtBQUwsQ0FBVyxVQUFVLEtBQVYsR0FBa0IsSUFBN0IsSUFBcUMsSUFBdkQ7QUFDQSxZQUFJLGtCQUFrQixFQUF0QjtBQUNBLFlBQUksS0FBSixFQUFXO0FBQ1AsZ0JBQUksa0JBQWtCLCtDQUF0QjtBQUNIO0FBQ0QsWUFBSSxpQkFBaUIsb0JBQW9CLEtBQXBCLEdBQTRCLGlKQUFqRDtBQUNBLFlBQUksYUFBYSwwRkFBMEYsS0FBMUYsR0FBa0csMERBQWxHLEdBQStKLGVBQS9KLEdBQWlMLE9BQWxNOztBQUVBLFlBQUksVUFBVSxjQUFWLENBQXlCLFlBQXpCLENBQUosRUFBNEM7QUFDeEMseUJBQWEsVUFBVSxVQUF2Qjs7QUFFQSw0QkFBZ0IsVUFBaEIsRUFBNEIsZ0JBQTVCLEVBQThDLFVBQVMsaUJBQVQsRUFBNEI7QUFDdEUsMEJBQVUsVUFBVSxLQUFLLEtBQUwsQ0FBVyxpQkFBWCxDQUFWLEdBQTBDLFVBQXBEO0FBQ0E7QUFDQSxnQ0FBZ0IsVUFBaEIsRUFBNEIsTUFBNUIsRUFBb0MsVUFBUyxTQUFULEVBQW9CO0FBQ3BELHdCQUFJLFVBQVUsS0FBSyxLQUFMLENBQVcsU0FBWCxDQUFkO0FBQ0EsK0JBQVcsUUFBUSxLQUFSLEdBQWdCLEdBQWhCLEdBQXNCLFFBQVEsSUFBekM7QUFDQTtBQUNBLHdCQUFJLGlEQUErQyxLQUEvQyw4SEFDK0MsVUFBVSxVQUFVLFVBRG5FLDZGQUVNLGNBRk4sc0NBR00sVUFITiw4REFJOEIsWUFBWSxVQUFVLFFBQXRCLENBSjlCLHVMQU93RCxPQVB4RCwyR0FTZ0MsS0FUaEMsVUFTMEMsUUFUMUMsMkRBVXVCLFlBQVksVUFBVSxRQUF0QixDQVZ2QiwyR0FZc0IsVUFBVSxLQVpoQyxzSkFja0YsV0FkbEYsOENBQUo7QUFnQkEsc0JBQUUsaUJBQUYsRUFBcUIsTUFBckI7QUFDQSx3QkFBSSxPQUFPLElBQVgsRUFBaUI7QUFDYiwwQkFBRSxpQkFBRixFQUFxQixPQUFyQixDQUE2QixTQUE3QjtBQUNILHFCQUZELE1BR0s7QUFDRCwwQkFBRSxpQkFBRixFQUFxQixNQUFyQixDQUE0QixTQUE1QjtBQUNIO0FBQ0QscUNBQWlCLFVBQWpCO0FBQ0gsaUJBNUJEO0FBNkJILGFBaENEO0FBaUNIO0FBQ0o7O0FBRUQsV0FBTztBQUNILGtCQUFVLGtCQUFTLEVBQVQsRUFBYSxHQUFiLEVBQWtCLEtBQWxCLEVBQXlCLEdBQXpCLEVBQThCO0FBQ3BDLG1CQUFPLHFCQUFxQixFQUFyQixFQUF5QixHQUF6QixFQUE4QixLQUE5QixFQUFxQyxHQUFyQyxDQUFQO0FBQ0g7QUFIRSxLQUFQO0FBTUgsQ0EzRTJCLEVBQTVCOzs7OztBQ0RBLFNBQVMsa0JBQVQsQ0FBNEIsS0FBNUIsRUFBbUMsTUFBbkMsRUFBMkM7QUFDekM7QUFDQSxJQUFFLG9CQUFGLEVBQXdCLElBQXhCLENBQTZCLFVBQVMsQ0FBVCxFQUFXLElBQVgsRUFBaUI7QUFDNUMsUUFBSSxPQUFPLEVBQUUsSUFBRixFQUFRLElBQVIsQ0FBYSxZQUFiLEVBQTJCLElBQTNCLEdBQWtDLFdBQWxDLEVBQVg7QUFDQSxTQUFLLEtBQUwsQ0FBVyxNQUFNLFdBQU4sRUFBWCxJQUFrQyxFQUFFLElBQUYsRUFBUSxXQUFSLENBQW9CLFFBQXBCLENBQWxDLEdBQWtFLEVBQUUsSUFBRixFQUFRLFFBQVIsQ0FBaUIsUUFBakIsQ0FBbEU7QUFDRCxHQUhEO0FBSUE7QUFDQSxJQUFFLG9CQUFGLEVBQXdCLE1BQXhCLElBQWtDLEVBQUUsMkJBQUYsRUFBK0IsTUFBakUsR0FBMEUsT0FBTyxRQUFQLENBQWdCLE9BQWhCLENBQTFFLEdBQXFHLE9BQU8sV0FBUCxDQUFtQixPQUFuQixDQUFyRztBQUNEOztBQUVELEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVTtBQUMxQjtBQUNBLElBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsVUFBUyxDQUFULEVBQVk7QUFDMUIsUUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFKLEVBQVksT0FBWixDQUFvQixXQUFwQixFQUFpQyxNQUF0QyxFQUE4QztBQUMxQyxRQUFFLG9CQUFGLEVBQXdCLE9BQXhCLENBQWdDLFdBQWhDLEVBQTZDLFdBQTdDLENBQXlELE1BQXpEO0FBQ0g7QUFDSixHQUpEO0FBS0E7QUFDQSxJQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsT0FBZixFQUF3QixvQkFBeEIsRUFBOEMsVUFBUyxDQUFULEVBQVk7QUFDdEQsTUFBRSxjQUFGO0FBQ0EsTUFBRSxlQUFGO0FBQ0EsTUFBRSxJQUFGLEVBQVEsT0FBUixDQUFnQixXQUFoQixFQUE2QixXQUE3QixDQUF5QyxNQUF6QztBQUNBO0FBQ0gsR0FMRDs7QUFPQTtBQUNBLElBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsc0JBQW5CLEVBQTJDLE9BQTNDLEVBQW9ELFVBQVMsQ0FBVCxFQUFZO0FBQzlELE1BQUUsSUFBRixFQUFRLE9BQVIsQ0FBZ0IsTUFBaEIsRUFBd0IsT0FBeEIsQ0FBZ0MsT0FBaEM7QUFDRCxHQUZEOztBQUlBO0FBQ0EsTUFBSyxFQUFFLE1BQUYsRUFBVSxRQUFWLENBQW1CLGVBQW5CLENBQUwsRUFBMkM7QUFDekM7QUFDQSxNQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsT0FBZixFQUF3QiwrQkFBeEIsRUFBeUQsWUFBVztBQUNsRSx5QkFBb0IsRUFBRSxJQUFGLEVBQVEsR0FBUixFQUFwQixFQUFtQyxFQUFFLElBQUYsQ0FBbkM7QUFDRCxLQUZEOztBQUlBO0FBQ0EsTUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLE9BQWYsRUFBdUIsb0JBQXZCLEVBQTRDLFlBQVU7QUFDcEQsYUFBTyxRQUFQLENBQWdCLElBQWhCLEdBQXVCLGtCQUFrQixFQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsSUFBYixDQUF6QztBQUNELEtBRkQ7QUFHRDs7QUFFRDtBQUNBLElBQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXVCLHdCQUF2QixFQUFnRCxZQUFXO0FBQ3pELFdBQU8sUUFBUCxDQUFnQixJQUFoQixHQUF1QixrQkFBa0IsRUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLFNBQWIsQ0FBekM7QUFDRCxHQUZEO0FBR0QsQ0FyQ0Q7Ozs7O0FDVkEsT0FBTyxXQUFQLEdBQXFCLEVBQUUsbUJBQUYsRUFBdUIsT0FBdkIsQ0FBK0I7QUFDbEQsWUFBVTtBQUNSLFdBQU8sR0FEQztBQUVSLFlBQVE7QUFGQSxHQUR3QztBQUtsRCxjQUFZLElBTHNDO0FBTWxELGdCQUFjO0FBTm9DLENBQS9CLENBQXJCOztBQVNBLE9BQU8sa0JBQVAsR0FBNEIsRUFBRSx1QkFBRixFQUEyQixPQUEzQixDQUFtQztBQUM3RCxZQUFVO0FBQ1IsV0FBTyxHQURDO0FBRVIsWUFBUSxHQUZBO0FBR1IsVUFBTTtBQUhFLEdBRG1EO0FBTTdELGNBQVksSUFOaUQ7QUFPN0QsZ0JBQWM7QUFQK0MsQ0FBbkMsQ0FBNUI7O0FBVUEsRUFBRSxRQUFGLEVBQVksS0FBWixDQUFrQixZQUFVO0FBQ3hCO0FBQ0EsSUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLE9BQWYsRUFBdUIsZUFBdkIsRUFBdUMsWUFBVTtBQUMvQyxRQUFJLFdBQVcsRUFBRSxJQUFGLEVBQVEsT0FBUixDQUFnQixVQUFoQixDQUFmO0FBQ0EsYUFBUyxJQUFULENBQWMsdUJBQWQsRUFBdUMsS0FBdkM7QUFDRCxHQUhEOztBQUtBLElBQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLHNCQUF4QixFQUFnRCxZQUFXO0FBQ3pELFFBQUksV0FBVyxFQUFFLElBQUYsRUFBUSxPQUFSLENBQWdCLFVBQWhCLENBQWY7QUFDQSxhQUFTLElBQVQsQ0FBYywyQkFBZCxFQUEyQyxLQUEzQztBQUNELEdBSEQ7O0FBS0E7QUFDQSxJQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsT0FBZixFQUF1QixlQUF2QixFQUF1QyxVQUFTLENBQVQsRUFBVztBQUNoRCxNQUFFLGNBQUY7QUFDQSxRQUFJLFdBQVcsRUFBRSxJQUFGLEVBQVEsT0FBUixDQUFnQixVQUFoQixDQUFmO0FBQ0EsV0FBTyxXQUFQLENBQW1CLE9BQW5CLENBQTJCLFFBQTNCLEVBQW9DLFFBQXBDLEVBQThDLElBQTlDLENBQW9ELFVBQVMsTUFBVCxFQUFpQjtBQUNuRSxlQUFTLElBQVQsQ0FBYyxxQkFBZCxFQUFxQyxJQUFyQyxDQUEwQyxLQUExQyxFQUFpRCxNQUFqRCxFQUF5RCxJQUF6RCxDQUE4RCxHQUE5RCxFQUFtRSxXQUFuRSxDQUErRSxPQUEvRTtBQUNBLGVBQVMsSUFBVCxDQUFjLEVBQUUsbUJBQUYsQ0FBZCxFQUFzQyxJQUF0QyxDQUEyQyxHQUEzQztBQUNBLGVBQVMsSUFBVCxDQUFjLEVBQUUsWUFBRixFQUFnQixJQUFoQixDQUFxQixjQUFyQixDQUFkLEVBQW9ELElBQXBEO0FBQ0QsS0FKRDtBQUtBLFdBQU8sV0FBUCxDQUFtQixPQUFuQixDQUEyQixRQUEzQixFQUFvQyxNQUFwQyxFQUE0QyxJQUE1QyxDQUFrRCxVQUFTLElBQVQsRUFBZTtBQUMvRCxhQUFPLGVBQVAsR0FBeUIsSUFBekI7QUFDQSxlQUFTLElBQVQsQ0FBYyxFQUFFLG1CQUFGLENBQWQsRUFBc0MsSUFBdEMsQ0FBMkMsR0FBM0M7QUFDQSxlQUFTLElBQVQsQ0FBYyxFQUFFLFlBQUYsRUFBZ0IsSUFBaEIsQ0FBcUIsY0FBckIsQ0FBZCxFQUFvRCxJQUFwRDtBQUNELEtBSkQ7QUFLRCxHQWJEOztBQWVBLElBQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLHNCQUF4QixFQUFnRCxVQUFTLENBQVQsRUFBWTtBQUMxRCxNQUFFLGNBQUY7QUFDQSxRQUFJLFdBQVcsRUFBRSxJQUFGLEVBQVEsT0FBUixDQUFnQixVQUFoQixDQUFmO0FBQ0EsV0FBTyxrQkFBUCxDQUEwQixPQUExQixDQUFrQyxRQUFsQyxFQUE0QyxRQUE1QyxFQUFzRCxJQUF0RCxDQUEyRCxVQUFTLE1BQVQsRUFBaUI7QUFDeEUsZUFBUyxJQUFULENBQWMsMEJBQWQsRUFBMEMsR0FBMUMsQ0FBOEMsa0JBQTlDLEVBQWtFLFNBQVEsTUFBUixHQUFnQixHQUFsRixFQUF1RixJQUF2RixDQUE0RixHQUE1RixFQUFpRyxXQUFqRyxDQUE2RyxPQUE3RztBQUNBLGVBQVMsSUFBVCxDQUFjLEVBQUUsdUJBQUYsQ0FBZCxFQUEwQyxJQUExQyxDQUErQyxHQUEvQztBQUNBLGVBQVMsSUFBVCxDQUFjLEVBQUUsWUFBRixFQUFnQixJQUFoQixDQUFxQixjQUFyQixDQUFkLEVBQW9ELElBQXBEO0FBQ0QsS0FKSDtBQUtBLFdBQU8sa0JBQVAsQ0FBMEIsT0FBMUIsQ0FBa0MsUUFBbEMsRUFBNEMsTUFBNUMsRUFBb0QsSUFBcEQsQ0FBeUQsVUFBUyxJQUFULEVBQWU7QUFDdEUsYUFBTyxzQkFBUCxHQUFnQyxJQUFoQztBQUNBLGVBQVMsSUFBVCxDQUFjLEVBQUUsdUJBQUYsQ0FBZCxFQUEwQyxJQUExQyxDQUErQyxHQUEvQztBQUNBLGVBQVMsSUFBVCxDQUFjLEVBQUUsWUFBRixFQUFnQixJQUFoQixDQUFxQixjQUFyQixDQUFkLEVBQW9ELElBQXBEO0FBQ0QsS0FKRDtBQUtELEdBYkQ7QUFjSCxDQTFDRDs7Ozs7QUNuQkEsT0FBTyxZQUFQLEdBQXVCLFlBQVc7QUFDOUIsTUFBRSxVQUFGLEVBQWMsSUFBZCxDQUFtQixlQUFuQixFQUFvQyxVQUFwQztBQUNBLE1BQUUsVUFBRixFQUFjLEVBQWQsQ0FBaUIsaUJBQWpCLEVBQW9DLFVBQVMsQ0FBVCxFQUFZO0FBQzVDLFVBQUUsSUFBRixFQUFRLElBQVIsQ0FBYSxXQUFiLEVBQTBCLElBQTFCLENBQStCLFNBQS9CLEVBQTBDLEtBQTFDO0FBQ0EsVUFBRSxJQUFGLEVBQ0ssSUFETCxDQUNVLHFCQURWLEVBQ2lDLElBRGpDLEdBQ3dDLFFBRHhDLENBQ2lELE9BRGpELEVBQzBELEdBRDFELEdBRUssSUFGTCxDQUVVLFlBRlYsRUFFd0IsSUFGeEIsR0FFK0IsV0FGL0IsQ0FFMkMsUUFGM0MsRUFFcUQsSUFGckQsQ0FFMEQsRUFGMUQsRUFFOEQsR0FGOUQsR0FHSyxJQUhMLENBR1UsbUJBSFYsRUFHK0IsSUFIL0IsR0FHc0MsR0FIdEMsR0FJSyxJQUpMLENBSVUsRUFBRSxZQUFGLEVBQWdCLElBQWhCLENBQXFCLGNBQXJCLENBSlYsRUFJZ0QsSUFKaEQ7QUFLQSxVQUFFLElBQUYsRUFDSyxJQURMLENBQ1UsdUJBRFYsRUFDbUMsR0FEbkMsQ0FDdUMsRUFEdkMsRUFDMkMsR0FEM0MsR0FFSyxJQUZMLENBRVUsZUFGVixFQUdLLElBSEwsQ0FHVSxPQUhWLEVBR21CLEdBSG5CLENBR3VCLEdBSHZCLEVBRzRCLEdBSDVCLEdBSUssSUFKTCxDQUlVLHNCQUpWLEVBSWtDLElBSmxDLENBSXVDLEdBSnZDO0FBS0EsVUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLG1CQUFiLEVBQWtDLE1BQWxDLEdBQTJDLElBQTNDLENBQWdELE9BQWhELEVBQXlELElBQXpELENBQThELGdCQUE5RDtBQUNILEtBYkQ7O0FBZUEsUUFBSSxjQUFKO0FBQ0EsTUFBRSxtQkFBRixFQUF1QixFQUF2QixDQUEwQixPQUExQixFQUFtQyxZQUFZO0FBQzdDLFlBQUksT0FBTyxFQUFFLGlCQUFGLEVBQXFCLEdBQXJCLEVBQVg7QUFBQSxZQUNJLFNBQVMsRUFBRSxTQUFGLEVBQWEsR0FBYixFQURiO0FBQUEsWUFFSSxrQkFBa0IsRUFBRSxpQkFBRixDQUZ0QjtBQUFBLFlBR0ksaUJBQWlCLFNBQVMsSUFBVCxFQUFlLE1BQWYsQ0FIckI7QUFJSSx3QkFBZ0IsSUFBaEIsQ0FBcUIsaUJBQWlCLE1BQXRDO0FBQ0wsS0FORDtBQVFILENBMUJxQixFQUF0Qjs7QUE0QkEsU0FBUyxRQUFULENBQW1CLElBQW5CLEVBQXlCLE1BQXpCLEVBQWlDO0FBQy9CLFdBQVEsT0FBTyxNQUFSLEdBQWtCLEdBQXpCO0FBQ0Q7Ozs7O0FDOUJEO0FBQ0EsT0FBTyxjQUFQLEdBQXlCLFlBQVc7O0FBRWhDLFFBQUksVUFBVSxFQUFFLDBCQUFGLENBQWQ7QUFDQSxRQUFJLEtBQUssUUFBUSxNQUFSLENBQWUsQ0FBZixDQUFUOztBQUVBLGFBQVMsUUFBVCxHQUFvQjtBQUNoQixVQUFFLHFCQUFGLEVBQXlCLFdBQXpCLENBQXFDLFFBQXJDO0FBQ0EsVUFBRSxpQkFBRixFQUFxQixRQUFyQixDQUE4QixRQUE5QjtBQUNBO0FBQ0g7O0FBRUQsV0FBTztBQUNILG9CQUFZLHNCQUFXO0FBQ25CLG1CQUFPLFVBQVA7QUFDSDtBQUhFLEtBQVA7QUFNSCxDQWpCdUIsRUFBeEI7O0FBb0JBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUN6QixRQUFJLEVBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsV0FBbkIsQ0FBSixFQUFxQztBQUNqQyx1QkFBZSxVQUFmO0FBQ0g7QUFDSixDQUpEOzs7OztBQ3JCQTtBQUNBLE9BQU8saUJBQVAsR0FBNEIsWUFBWTs7QUFFdEMsV0FBUyxXQUFULEdBQXdCOztBQUV0QixRQUFJLFFBQVEsQ0FDVjtBQUNFLGFBQU87QUFDTCxvQkFBWSxNQURQO0FBRUwsb0JBQVksT0FGUDtBQUdMLHdCQUFnQixnQkFIWDtBQUlMLHVCQUFlLFNBSlY7QUFLTCxjQUFNLGVBTEQ7QUFNTCxxQkFBYSxDQUFDLE1BTlQ7QUFPTCxnQkFBUSxRQVBIO0FBUUwscUJBQWEsZUFSUjtBQVNMLHVCQUFlLEtBVFY7QUFVTCx3QkFBZ0IsSUFWWDtBQVdMLHNCQUFjO0FBWFQsT0FEVDtBQWNFLGNBQVEsTUFkVjtBQWVFLGFBQU8sZUFmVDtBQWdCRSxxQkFBZTtBQWhCakIsS0FEVSxFQW1CVjtBQUNFLGFBQU8sZ0JBRFQ7QUFFRSxjQUFRLE1BRlY7QUFHRSxhQUFPO0FBQ0wsb0JBQVksT0FEUDtBQUVMLG9CQUFZLE9BRlA7QUFHTCx3QkFBZ0IsZUFIWDtBQUlMLHVCQUFlLFlBSlY7QUFLTCxjQUFNLGdCQUxEO0FBTUwscUJBQWEsQ0FBQyxPQU5UO0FBT0wsc0JBQWMsR0FQVDtBQVFMLGdCQUFRLFNBUkg7QUFTTCxxQkFBYSxrQkFUUjtBQVVMLHVCQUFlLElBVlY7QUFXTCx3QkFBZ0I7QUFYWCxPQUhUO0FBZ0JFLHFCQUFlO0FBaEJqQixLQW5CVSxFQXFDVjtBQUNFLGFBQU8sZUFEVDtBQUVFLGNBQVEsTUFGVjtBQUdFLGFBQU87QUFDTCxvQkFBWSxPQURQO0FBRUwsb0JBQVksT0FGUDtBQUdMLHNCQUFjLENBSFQ7QUFJTCx1QkFBZSxPQUpWO0FBS0wsY0FBTSxlQUxEO0FBTUwscUJBQWEsTUFOUjtBQU9MLHdCQUFnQixTQVBYO0FBUUwsZ0JBQVEsbUJBUkg7QUFTTCxxQkFBYSxlQVRSO0FBVUwsdUJBQWUsSUFWVjtBQVdMLHdCQUFnQjtBQVhYLE9BSFQ7QUFnQkUscUJBQWU7QUFoQmpCLEtBckNVLENBQVo7O0FBeURBLFFBQUksaUJBQWlCLElBQUksR0FBRyxNQUFILENBQVUsTUFBZCxFQUFyQjtBQUFBLFFBQ0ksZ0JBQWdCLElBQUksR0FBRyxLQUFILENBQVMsTUFBYixDQUFvQixFQUFDLFFBQVEsY0FBVCxFQUFwQixDQURwQjs7QUFHQSxRQUFJLE1BQU0sSUFBSSxHQUFHLEdBQVAsQ0FBVztBQUNuQixjQUFRLEtBRFc7QUFFbkIsY0FBUSxDQUNOLElBQUksR0FBRyxLQUFILENBQVMsSUFBYixDQUFrQixFQUFDLFFBQVEsSUFBSSxHQUFHLE1BQUgsQ0FBVSxHQUFkLEVBQVQsRUFBbEIsQ0FETSxFQUVOLGFBRk0sQ0FGVztBQU1uQixZQUFNLElBQUksR0FBRyxJQUFQLENBQVksRUFBRSxRQUFRLENBQUMsQ0FBRCxFQUFJLENBQUosQ0FBVixFQUFrQixNQUFNLENBQXhCLEVBQVo7QUFOYSxLQUFYLENBQVY7O0FBU0EsUUFBSSxTQUFTLENBQ1gsSUFBSSxHQUFHLEtBQUgsQ0FBUyxLQUFiLENBQW1CO0FBQ2pCLGFBQU8sSUFBSSxHQUFHLEtBQUgsQ0FBUyxJQUFiLENBQW1CO0FBQ3hCLHdCQUFnQixLQURRO0FBRXhCLGdCQUFRLENBQUMsR0FBRCxFQUFNLENBQU4sQ0FGZ0I7QUFHeEIsc0JBQWMsVUFIVTtBQUl4QixzQkFBYyxVQUpVO0FBS3hCLGlCQUFTLENBTGU7QUFNeEIsZUFBTyxHQU5pQjtBQU94QjtBQUNBLGFBQUs7QUFSbUIsT0FBbkIsQ0FEVTtBQVdqQixjQUFRO0FBWFMsS0FBbkIsQ0FEVyxFQWNYLElBQUksR0FBRyxLQUFILENBQVMsS0FBYixDQUFtQjtBQUNqQixhQUFPLElBQUksR0FBRyxLQUFILENBQVMsTUFBYixDQUFvQjtBQUN6QixnQkFBUSxDQURpQjtBQUV6QixjQUFNLElBQUksR0FBRyxLQUFILENBQVMsSUFBYixDQUFrQixFQUFDLE9BQU8scUJBQVIsRUFBbEIsQ0FGbUI7QUFHekIsZ0JBQVEsSUFBSSxHQUFHLEtBQUgsQ0FBUyxNQUFiLENBQW9CLEVBQUMsT0FBTyxlQUFSLEVBQXBCO0FBSGlCLE9BQXBCO0FBRFUsS0FBbkIsQ0FkVyxDQUFiOztBQXVCQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksTUFBTSxNQUExQixFQUFrQyxHQUFsQyxFQUF1QztBQUNyQyxVQUFJLFFBQVEsQ0FBWjtBQUNBLGNBQVEsR0FBUixDQUFZLE1BQU0sQ0FBTixFQUFTLEdBQVQsQ0FBYSxRQUF6QjtBQUNBLGNBQVEsR0FBUixDQUFZLE1BQU0sQ0FBTixFQUFTLEdBQVQsQ0FBYSxTQUF6Qjs7QUFFQSxVQUFJLFVBQVUsSUFBSSxHQUFHLE9BQVAsQ0FBZTtBQUMzQixjQUFNLE9BRHFCO0FBRTNCLGFBQUssTUFBTSxDQUFOLEVBQVMsR0FGYTtBQUczQixpQkFBUyxNQUFNLENBQU4sRUFBUyxHQUFULENBQWEsWUFISztBQUkzQixrQkFBVSxJQUFJLEdBQUcsSUFBSCxDQUFRLEtBQVosQ0FBa0IsR0FBRyxJQUFILENBQVEsU0FBUixDQUFrQixDQUFDLE1BQU0sQ0FBTixFQUFTLEdBQVQsQ0FBYSxTQUFkLEVBQXlCLE1BQU0sQ0FBTixFQUFTLEdBQVQsQ0FBYSxRQUF0QyxDQUFsQixFQUFtRSxXQUFuRSxFQUFnRixXQUFoRixDQUFsQjtBQUppQixPQUFmLENBQWQ7QUFNQSxjQUFRLFFBQVIsQ0FBaUIsTUFBakI7QUFDQSxxQkFBZSxVQUFmLENBQTBCLE9BQTFCO0FBQ0Q7O0FBRUQsUUFBSSxFQUFKLENBQU8sT0FBUCxFQUFnQixVQUFTLEdBQVQsRUFBYztBQUM1QixVQUFJLElBQUksSUFBSSxxQkFBSixDQUEwQixJQUFJLEtBQTlCLEVBQXFDLFVBQVMsRUFBVCxFQUFhLEtBQWIsRUFBb0I7QUFBRSxlQUFPLEVBQVA7QUFBVyxPQUF0RSxDQUFSO0FBQ0EsVUFBSSxLQUFLLEVBQUUsR0FBRixDQUFNLE1BQU4sTUFBa0IsT0FBM0IsRUFBb0M7QUFDbEMsWUFBSSxXQUFXLEVBQUUsV0FBRixFQUFmO0FBQ0EsWUFBSSxRQUFRLFNBQVMsY0FBVCxFQUFaOztBQUVBLFVBQUUsZ0JBQUYsRUFBb0IsSUFBcEIsQ0FBeUIsY0FBekIsRUFBeUMsSUFBekMsQ0FBOEMsRUFBRSxDQUFGLENBQUksT0FBbEQ7QUFDQSxVQUFFLGdCQUFGLEVBQW9CLElBQXBCLENBQXlCLFNBQXpCLEVBQW9DLElBQXBDLENBQXlDLEVBQUUsQ0FBRixDQUFJLEdBQTdDO0FBQ0EsVUFBRSxnQ0FBRixFQUFvQyxPQUFwQyxDQUE0QyxPQUE1QztBQUNEO0FBQ0YsS0FWRDtBQVdEOztBQUVELFNBQU87QUFDTCxtQkFBZSx5QkFBWTtBQUN6QixhQUFPLGFBQVA7QUFDRDtBQUhJLEdBQVA7QUFLRCxDQWpJMEIsRUFBM0I7O0FBbUlBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUN6QixNQUFJLEVBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBSixFQUF3QztBQUNwQyxzQkFBa0IsYUFBbEI7QUFDSDtBQUNKLENBSkQ7Ozs7O0FDcElBO0FBQ0EsT0FBTyxpQkFBUCxHQUE0QixZQUFXOztBQUVuQyxRQUFJLFVBQVUsRUFBRSwwQkFBRixDQUFkO0FBQ0EsUUFBSSxLQUFLLFFBQVEsTUFBUixDQUFlLENBQWYsQ0FBVDs7QUFFQSxhQUFTLFdBQVQsR0FBdUI7QUFDbkIsVUFBRSxxQkFBRixFQUF5QixXQUF6QixDQUFxQyxRQUFyQzs7QUFFQTtBQUNBLGVBQU8sU0FBUCxHQUFtQixJQUFuQjs7QUFFQSxZQUFJLE9BQU8sUUFBUCxDQUFnQixJQUFwQixFQUEwQjtBQUN0QixtQkFBTyxTQUFQLEdBQW1CLE9BQU8sUUFBUCxDQUFnQixJQUFoQixDQUFxQixLQUFyQixDQUEyQixDQUEzQixDQUFuQjtBQUNBO0FBQ0Esb0JBQVEsT0FBTyxTQUFmO0FBQ0gsU0FKRCxNQUlPO0FBQ0gsY0FBRSx1QkFBRixFQUEyQixRQUEzQixDQUFvQyxpQkFBcEM7QUFDQSxjQUFFLGlCQUFGLEVBQXFCLFdBQXJCLENBQWlDLFFBQWpDO0FBQ0Esd0JBQVksVUFBUyxRQUFULEVBQW1CO0FBQzNCLG9CQUFJLE9BQU8sS0FBSyxLQUFMLENBQVcsUUFBWCxDQUFYO0FBQ0EsdUJBQU8sU0FBUCxHQUFtQixLQUFLLElBQXhCO0FBQ0Esa0JBQUUsaUJBQUYsRUFBcUIsTUFBckI7QUFDQTtBQUNBLHdCQUFRLEtBQUssSUFBYjtBQUNILGFBTkQ7QUFPSDtBQUNKOztBQUVELGFBQVMsT0FBVCxDQUFpQixJQUFqQixFQUF1QjtBQUNuQixnQkFBUSxHQUFSLENBQVksSUFBWjtBQUNBLHVCQUFlLElBQWYsRUFBcUIsVUFBUyxJQUFULEVBQWU7QUFDaEMsZ0JBQUksZUFBZSxLQUFLLEtBQUwsQ0FBVyxJQUFYLENBQW5CO0FBQ0EsaUJBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxhQUFhLE1BQWpDLEVBQXlDLEdBQXpDLEVBQThDO0FBQzFDLGtCQUFFLElBQUYsQ0FBTztBQUNILHlCQUFLLDRCQUE0QixhQUFhLENBQWIsQ0FEOUI7QUFFSCx3QkFBSSxhQUFhLENBQWIsQ0FGRDtBQUdILDBCQUFNLEtBSEg7QUFJSCxpQ0FBYSxLQUpWO0FBS0gsNkJBQVMsaUJBQVMsT0FBVCxFQUFrQjtBQUN2Qiw0QkFBSSxXQUFXLE1BQWYsRUFBdUI7QUFDbkIsZ0NBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQVo7QUFDQSwrQ0FBbUIsUUFBbkIsQ0FBNEIsS0FBSyxFQUFqQyxFQUFxQyxLQUFyQyxFQUE0QyxJQUE1QztBQUNILHlCQUhELE1BR087QUFDSCw4QkFBRSxpQkFBRixFQUFxQixNQUFyQjtBQUNIO0FBQ0oscUJBWkU7QUFhSCwyQkFBTyxlQUFTLE1BQVQsRUFBZ0I7QUFDbkIsZ0NBQVEsR0FBUixDQUFZLEtBQVosRUFBbUIsTUFBbkI7QUFDQTtBQUNIO0FBaEJFLGlCQUFQO0FBa0JIO0FBQ0osU0F0QkQ7QUF1Qkg7O0FBRUQsYUFBUyxZQUFULENBQXNCLEtBQXRCLEVBQTZCLEdBQTdCLEVBQWtDO0FBQzlCLFVBQUUsSUFBRixDQUFPO0FBQ0gsaUJBQUssNEJBQTRCLEtBRDlCO0FBRUgsZ0JBQUksS0FGRDtBQUdILGtCQUFNLEtBSEg7QUFJSCx5QkFBYSxLQUpWO0FBS0gscUJBQVMsaUJBQVMsT0FBVCxFQUFrQjtBQUN2QixvQkFBSSxXQUFXLE1BQWYsRUFBdUI7QUFDbkIsd0JBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxPQUFYLENBQVo7QUFDQSx1Q0FBbUIsUUFBbkIsQ0FBNEIsS0FBSyxFQUFqQyxFQUFxQyxLQUFyQyxFQUE0QyxJQUE1QyxFQUFrRCxHQUFsRDtBQUNILGlCQUhELE1BR087QUFDSCxzQkFBRSxpQkFBRixFQUFxQixNQUFyQjtBQUNIO0FBQ0osYUFaRTtBQWFILG1CQUFPLGVBQVMsT0FBVCxFQUFnQjtBQUNuQix3QkFBUSxHQUFSLENBQVksS0FBWixFQUFtQixPQUFuQjtBQUNBO0FBQ0g7QUFoQkUsU0FBUDtBQWtCSDs7QUFFRCxXQUFPO0FBQ0gsZ0JBQVEsV0FETDtBQUVILG9CQUFZLE9BRlQ7QUFHSCxzQkFBYztBQUhYLEtBQVA7QUFLSCxDQWpGMEIsRUFBM0I7O0FBb0ZBLEVBQUUsUUFBRixFQUFZLEtBQVosQ0FBa0IsWUFBVztBQUN6QixRQUFJLEVBQUUsTUFBRixFQUFVLFFBQVYsQ0FBbUIsY0FBbkIsQ0FBSixFQUF3QztBQUNwQywwQkFBa0IsTUFBbEI7QUFDSDtBQUNKLENBSkQ7Ozs7O0FDckZBO0FBQ0EsT0FBTyxrQkFBUCxHQUE2QixZQUFXOztBQUVwQyxRQUFJLFVBQVUsRUFBRSwwQkFBRixDQUFkO0FBQ0EsUUFBSSxLQUFLLFFBQVEsTUFBUixDQUFlLENBQWYsQ0FBVDs7QUFFQSxhQUFTLFlBQVQsR0FBd0I7QUFDcEIsVUFBRSxxQkFBRixFQUF5QixXQUF6QixDQUFxQyxRQUFyQztBQUNBLFVBQUUscUJBQUYsRUFBeUIsUUFBekIsQ0FBa0MsUUFBbEM7QUFDQTtBQUNIOztBQUVELE1BQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxPQUFmLEVBQXdCLHFCQUF4QixFQUErQyxZQUFXO0FBQ3RELGdCQUFRLFFBQVEsQ0FBaEI7QUFDQTtBQUNILEtBSEQ7O0FBTUEsV0FBTztBQUNILHdCQUFnQiwwQkFBVztBQUN2QixtQkFBTyxjQUFQO0FBQ0g7QUFIRSxLQUFQO0FBTUgsQ0F2QjJCLEVBQTVCOztBQTBCQSxFQUFFLFFBQUYsRUFBWSxLQUFaLENBQWtCLFlBQVc7QUFDekIsUUFBSSxFQUFFLE1BQUYsRUFBVSxRQUFWLENBQW1CLGVBQW5CLENBQUosRUFBeUM7QUFDckMsMkJBQW1CLGNBQW5CO0FBQ0g7QUFDSixDQUpEOzs7OztBQzNCQSxPQUFPLGlCQUFQLEdBQTRCLFlBQVc7QUFDdEMsS0FBSSxjQUFjLFNBQWQsV0FBYyxHQUFXO0FBQzVCLE1BQUksU0FBUyxFQUFFLGVBQUYsQ0FBYjtBQUFBLE1BQ0MsUUFBUSxFQUFFLHNCQUFGLENBRFQ7QUFBQSxNQUVDLFFBQVEsRUFBRSxzQkFBRixDQUZUOztBQUlBLFNBQU8sSUFBUCxDQUFZLFlBQVc7QUFDdEIsU0FBTSxJQUFOLENBQVcsWUFBVztBQUNyQixRQUFJLFFBQVEsRUFBRSxJQUFGLEVBQ1YsSUFEVSxHQUVWLElBRlUsQ0FFTCxPQUZLLENBQVo7QUFHQSxNQUFFLElBQUYsRUFBUSxJQUFSLENBQWEsS0FBYjtBQUNBLElBTEQ7O0FBT0EsU0FBTSxFQUFOLENBQVMsT0FBVCxFQUFrQixZQUFXO0FBQzVCLE1BQUUsSUFBRixFQUNFLElBREYsQ0FDTyxLQURQLEVBRUUsSUFGRixDQUVPLEtBQUssS0FGWjtBQUdBLElBSkQ7QUFLQSxHQWJEO0FBY0EsRUFuQkQ7O0FBcUJBO0FBQ0EsQ0F2QjBCLEVBQTNCOzs7OztBQ0FBO0FBQ0EsT0FBTyxpQkFBUCxHQUE0QixZQUFXO0FBQ25DOztBQUVBLFFBQUksY0FBYyxJQUFJLEtBQUosRUFBbEI7QUFDQSxRQUFJLGVBQWUsSUFBbkI7QUFDQSxRQUFJLGFBQWEsQ0FBakI7O0FBRUEsUUFBSSxVQUFVLEVBQWQ7O0FBRUEsYUFBUyxXQUFULEdBQXVCO0FBQ25CLFlBQUksTUFBTSxpQkFBVjtBQUNBO0FBQ0EsWUFBSSxZQUFZLE1BQWhCLEVBQXdCO0FBQ3BCLGNBQUUsSUFBRixDQUFPLFdBQVAsRUFBb0IsVUFBUyxDQUFULEVBQVksSUFBWixFQUFrQjtBQUNsQyxvQkFBSSxVQUFVLEVBQWQ7QUFDQSxvQkFBSSxLQUFLLElBQUwsSUFBYSxNQUFiLElBQXVCLEtBQUssS0FBTCxJQUFjLEVBQXJDLElBQTJDLFlBQVksTUFBWixJQUFzQixDQUFyRSxFQUF3RTtBQUNwRSwrQkFBVyxLQUFYO0FBQ0EsMkJBQU8sS0FBUDtBQUNILGlCQUhELE1BR08sSUFBSSxLQUFLLElBQUwsSUFBYSxNQUFiLElBQXVCLEtBQUssS0FBTCxJQUFjLEVBQXJDLElBQTJDLFlBQVksTUFBWixJQUFzQixDQUFyRSxFQUF3RTtBQUMzRSwyQkFBTyxFQUFQO0FBQ0gsaUJBRk0sTUFFQSxJQUFJLEtBQUssSUFBTCxJQUFhLE1BQWIsSUFBdUIsS0FBSyxLQUFMLElBQWMsUUFBekMsRUFBbUQ7QUFDdEQsMkJBQU8sRUFBUDtBQUNILGlCQUZNLE1BRUEsSUFBSSxLQUFLLElBQUwsSUFBYSxNQUFiLElBQXVCLEtBQUssS0FBTCxJQUFjLEVBQXpDLEVBQTZDO0FBQ2hELDJCQUFPLEVBQVA7QUFDSCxpQkFGTSxNQUVBLElBQUksS0FBSyxJQUFMLElBQWEsVUFBYixJQUEyQixLQUFLLEtBQUwsSUFBYyxLQUE3QyxFQUFvRDtBQUN2RCwyQkFBTyxLQUFQO0FBQ0gsaUJBRk0sTUFFQSxJQUFJLEtBQUssSUFBTCxJQUFhLFNBQWIsSUFBMEIsWUFBWSxNQUFaLElBQXNCLENBQXBELEVBQXVEO0FBQzFELCtCQUFXLFNBQVMsS0FBSyxJQUFkLEdBQXFCLEdBQXJCLEdBQTJCLEtBQUssS0FBM0M7QUFDQSwyQkFBTyxPQUFQO0FBQ0gsaUJBSE0sTUFHQTtBQUNILCtCQUFXLE1BQU0sS0FBSyxJQUFYLEdBQWtCLEdBQWxCLEdBQXdCLEtBQUssS0FBeEM7QUFDQSwyQkFBTyxPQUFQO0FBQ0g7QUFDSixhQXBCRDtBQXFCSCxTQXRCRCxNQXNCTztBQUNILG1CQUFPLEtBQVA7QUFDSDs7QUFFRCxVQUFFLElBQUYsQ0FBTztBQUNILGtCQUFNLEtBREg7QUFFSCxpQkFBSyxNQUFNLGFBRlI7QUFHSCxpQkFBSyxPQUhGO0FBSUgscUJBQVMsaUJBQVMsSUFBVCxFQUFlO0FBQ3BCLDZCQUFhLEtBQUssTUFBbEI7QUFDQSxvQkFBSSxRQUFRLE1BQVosRUFBb0I7QUFDaEIsMkJBQU8sS0FBSyxTQUFMLENBQWUsRUFBRSxvQ0FBRixFQUFmLENBQVA7QUFDSDtBQUNELHlDQUF5QixJQUF6QjtBQUNIO0FBVkUsU0FBUDtBQVlIOztBQUVEOztBQUVBO0FBQ0EsTUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IscUJBQXhCLEVBQStDLFVBQVMsQ0FBVCxFQUFZO0FBQ3ZELFlBQUksS0FBSyxLQUFMLENBQVcsTUFBWCxHQUFvQixDQUFwQixJQUF5QixLQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLENBQWpELEVBQW9EO0FBQ3BELGdCQUFRLENBQVI7QUFDQSxVQUFFLGlCQUFGLEVBQXFCLEtBQXJCO0FBQ0EsY0FBTSxZQUFXO0FBQ2IsZ0JBQUksZUFBZSxFQUFFLEVBQUUsTUFBSixFQUFZLEdBQVosR0FBa0IsS0FBbEIsQ0FBd0IsR0FBeEIsRUFBNkIsSUFBN0IsQ0FBa0MsS0FBbEMsQ0FBbkI7QUFDQSxnQkFBSSxZQUFZLE1BQWhCLEVBQXdCO0FBQ3BCLG9CQUFJLE9BQU8sS0FBWDtBQUNBLDRCQUFZLE1BQVosQ0FBbUIsVUFBUyxJQUFULEVBQWU7QUFDOUIsd0JBQUksS0FBSyxJQUFMLElBQWEsTUFBakIsRUFBeUI7QUFDckIsK0JBQU8sSUFBUDtBQUNBLG9DQUFZLE1BQVosQ0FBbUIsWUFBWSxPQUFaLENBQW9CLElBQXBCLENBQW5CLEVBQThDLENBQTlDO0FBQ0Esb0NBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFPLFlBQXZCLEVBQWpCO0FBQ0g7QUFDSixpQkFORDtBQU9BLG9CQUFJLFFBQVEsS0FBWixFQUFtQjtBQUNmLGdDQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBTyxZQUF2QixFQUFqQjtBQUNIO0FBQ0osYUFaRCxNQVlPO0FBQ0gsNEJBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sTUFBUixFQUFnQixPQUFPLFlBQXZCLEVBQWpCO0FBQ0g7QUFDRCxvQkFBUSxHQUFSLENBQVksV0FBWjtBQUNBLDhCQUFrQixNQUFsQjtBQUNILFNBbkJELEVBbUJHLEdBbkJIO0FBb0JILEtBeEJEOztBQTBCQTtBQUNBLE1BQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxRQUFmLEVBQXlCLDBCQUF6QixFQUFxRCxZQUFXO0FBQzVELFlBQUksS0FBSyxFQUFFLElBQUYsRUFBUSxRQUFSLENBQWlCLFdBQWpCLENBQVQ7QUFDQSxnQkFBUSxDQUFSO0FBQ0EsVUFBRSxpQkFBRixFQUFxQixLQUFyQjtBQUNBLGNBQU0sWUFBVztBQUNiLGdCQUFJLFlBQVksTUFBaEIsRUFBd0I7QUFDcEIsNEJBQVksTUFBWixDQUFtQixVQUFTLElBQVQsRUFBZTtBQUM5Qix3QkFBSSxLQUFLLElBQUwsSUFBYSxNQUFqQixFQUF5QjtBQUNyQixvQ0FBWSxNQUFaLENBQW1CLFlBQVksT0FBWixDQUFvQixJQUFwQixDQUFuQixFQUE4QyxDQUE5QztBQUNIO0FBQ0osaUJBSkQ7O0FBTUEsb0JBQUksV0FBVyxLQUFmO0FBQ0EsNEJBQVksTUFBWixDQUFtQixVQUFTLElBQVQsRUFBZTtBQUM5Qix3QkFBSSxLQUFLLElBQUwsSUFBYSxVQUFqQixFQUE2QjtBQUN6QixtQ0FBVyxJQUFYO0FBQ0Esb0NBQVksTUFBWixDQUFtQixZQUFZLE9BQVosQ0FBb0IsSUFBcEIsQ0FBbkIsRUFBOEMsQ0FBOUM7QUFDQSxvQ0FBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxVQUFSLEVBQW9CLE9BQU8sRUFBM0IsRUFBakI7QUFDSDtBQUNKLGlCQU5EO0FBT0Esb0JBQUksWUFBWSxLQUFoQixFQUF1QjtBQUNuQixnQ0FBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxVQUFSLEVBQW9CLE9BQU8sRUFBM0IsRUFBakI7QUFDSDtBQUNKLGFBbEJELE1Ba0JPO0FBQ0gsNEJBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sVUFBUixFQUFvQixPQUFPLEVBQTNCLEVBQWpCO0FBQ0g7QUFDRCw4QkFBa0IsTUFBbEI7QUFDQSxnQkFBSSxNQUFNLEtBQVYsRUFBaUIscUJBQXFCLEVBQXJCO0FBQ3BCLFNBeEJELEVBd0JHLEdBeEJIO0FBeUJILEtBN0JEOztBQStCQSxNQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsUUFBZixFQUF5QixjQUF6QixFQUF5QyxZQUFXO0FBQ2hELFlBQUksS0FBSyxFQUFFLElBQUYsRUFBUSxRQUFSLENBQWlCLFdBQWpCLENBQVQ7QUFDQSxnQkFBUSxHQUFSLENBQVksRUFBWjtBQUNBLFlBQUksTUFBTSxJQUFWLEVBQWdCO0FBQ2hCLGdCQUFRLENBQVI7QUFDQSxVQUFFLGlCQUFGLEVBQXFCLEtBQXJCO0FBQ0EsY0FBTSxZQUFXO0FBQ2IsY0FBRSxpQkFBRixFQUFxQixLQUFyQjtBQUNBLGdCQUFJLGVBQWUsR0FBRyxJQUFILENBQVEsS0FBUixDQUFuQjtBQUNBLG9CQUFRLEdBQVIsQ0FBWSxZQUFaO0FBQ0EsZ0JBQUksWUFBWSxNQUFoQixFQUF3QjtBQUNwQixvQkFBSSxPQUFPLEtBQVg7QUFDQSw0QkFBWSxNQUFaLENBQW1CLFVBQVMsSUFBVCxFQUFlO0FBQzlCLHdCQUFJLEtBQUssSUFBTCxJQUFhLE1BQWpCLEVBQXlCO0FBQ3JCLCtCQUFPLElBQVA7QUFDQSxvQ0FBWSxNQUFaLENBQW1CLFlBQVksT0FBWixDQUFvQixJQUFwQixDQUFuQixFQUE4QyxDQUE5QztBQUNBLG9DQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBTyxZQUF2QixFQUFqQjtBQUNIO0FBQ0osaUJBTkQ7QUFPQSxvQkFBSSxRQUFRLEtBQVosRUFBbUI7QUFDZixnQ0FBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxNQUFSLEVBQWdCLE9BQU8sWUFBdkIsRUFBakI7QUFDSDtBQUNKLGFBWkQsTUFZTztBQUNILDRCQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLE1BQVIsRUFBZ0IsT0FBTyxZQUF2QixFQUFqQjtBQUNIO0FBQ0QsOEJBQWtCLE1BQWxCO0FBQ0gsU0FwQkQsRUFvQkcsR0FwQkg7QUFxQkgsS0EzQkQ7O0FBNkJBLE1BQUUsUUFBRixFQUFZLEVBQVosQ0FBZSxTQUFmLEVBQTBCLGVBQTFCLEVBQTJDLFlBQVc7QUFDbEQsWUFBSSxTQUFTLEVBQUUsSUFBRixFQUFRLE1BQVIsQ0FBZSxRQUFmLENBQWI7QUFDQSxZQUFJLE9BQU8sQ0FBUCxLQUFhLENBQWIsSUFBa0IsT0FBTyxDQUFQLEtBQWEsSUFBbkMsRUFBeUM7QUFDckMsd0JBQVksTUFBWixDQUFtQixVQUFTLElBQVQsRUFBZTtBQUM5QixvQkFBSSxLQUFLLElBQUwsSUFBYSxTQUFqQixFQUE0QjtBQUN4QixnQ0FBWSxNQUFaLENBQW1CLFlBQVksT0FBWixDQUFvQixJQUFwQixDQUFuQixFQUE4QyxDQUE5QztBQUNIO0FBQ0osYUFKRDtBQUtBO0FBQ0g7QUFDRCxnQkFBUSxDQUFSO0FBQ0EsVUFBRSxpQkFBRixFQUFxQixLQUFyQjtBQUNBLGNBQU0sWUFBVztBQUNiLGdCQUFJLFlBQVksTUFBaEIsRUFBd0I7QUFDcEIsb0JBQUksVUFBVSxLQUFkO0FBQ0EsNEJBQVksTUFBWixDQUFtQixVQUFTLElBQVQsRUFBZTtBQUM5Qix3QkFBSSxLQUFLLElBQUwsSUFBYSxTQUFqQixFQUE0QjtBQUN4QixrQ0FBVSxJQUFWO0FBQ0Esb0NBQVksTUFBWixDQUFtQixZQUFZLE9BQVosQ0FBb0IsSUFBcEIsQ0FBbkIsRUFBOEMsQ0FBOUM7QUFDQSxvQ0FBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxTQUFSLEVBQW1CLE9BQU8sT0FBTyxDQUFQLElBQVksS0FBWixHQUFvQixPQUFPLENBQVAsQ0FBOUMsRUFBakI7QUFDSDtBQUNKLGlCQU5EO0FBT0Esb0JBQUksV0FBVyxLQUFmLEVBQXNCO0FBQ2xCLGdDQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLFNBQVIsRUFBbUIsT0FBTyxPQUFPLENBQVAsSUFBWSxLQUFaLEdBQW9CLE9BQU8sQ0FBUCxDQUE5QyxFQUFqQjtBQUNIO0FBQ0osYUFaRCxNQVlPO0FBQ0gsNEJBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sU0FBUixFQUFtQixPQUFPLE9BQU8sQ0FBUCxJQUFZLEtBQVosR0FBb0IsT0FBTyxDQUFQLENBQTlDLEVBQWpCO0FBQ0g7QUFDRCw4QkFBa0IsTUFBbEI7QUFDSCxTQWpCRCxFQWlCRyxHQWpCSDtBQWtCSCxLQTlCRDs7QUFtQ0EsTUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsbUJBQXhCLEVBQTZDLFlBQVc7QUFDcEQsZ0JBQVEsUUFBUSxDQUFoQjtBQUNBLDBCQUFrQixNQUFsQjtBQUNILEtBSEQ7O0FBS0EsV0FBTztBQUNILGdCQUFRLGtCQUFXO0FBQ2YsbUJBQU8sYUFBUDtBQUNIO0FBSEUsS0FBUDtBQU1ILENBNUwwQixFQUEzQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwicmVxdWlyZShcIi4vbW9kdWxlcy9zbWFydFNlYXJjaC5qc1wiKTsgLy8gTU9EVUxFIEZPUiBTRUFSQ0hJTkdcclxucmVxdWlyZShcIi4vbW9kdWxlcy9nbG9iYWxFdmVudHMuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdMT0JBTCBFVkVOVFNcclxucmVxdWlyZShcIi4vbW9kdWxlcy9pbWFnZUNyb3AuanNcIik7IC8vIE1PRFVMRSB3aXRoIElNQUdFIENST1BQRVJcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGVzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2dlbmVyYXRlR2lncy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR2lncyBnZW5lcmF0b3JcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHSUdTIFBBR0UgSU5JVFxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL3JhbmdlLXNsaWRlci5qc1wiKTsgLy8gTU9EVUxFIHdpdGggUkFOR0UgU0xJREVSXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvbmV3R2lnTW9kYWwuanNcIik7IC8vIE1PRFVMRSB3aXRoIENSRUFURSBORVcgR0lHXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0TmV0d29yay5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBORVRXT1JLIFBBR0VcclxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5nZW5lcmF0ZUdpZ3NNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVHaWdzRnJvbURhdGEoZ2lnSUQsIGdpZ09iamVjdCwgaXNPd24sIG9uZSkge1xyXG4gICAgICAgXHJcbiAgICAgICAgaWYgKGNoZWNrX2dpZ19tYXJrZWRfZGVsZXRlZChnaWdPYmplY3QpKSB7IHJldHVybiB9XHJcblxyXG4gICAgICAgIHZhciBhcGlfY2RuID0gYXBpX2dldF9jZG5fdXJsKCk7XHJcbiAgICAgICAgdmFyIHByb2ZpbGVfaW1hZ2UgPSBudWxsO1xyXG4gICAgICAgIHZhciBvd25lcl9ndWlkID0gbnVsbDtcclxuICAgICAgICB2YXIgaW1nX3NyYyA9ICcnO1xyXG4gICAgICAgIHZhciBmdWxsbmFtZSA9ICcnO1xyXG4gICAgICAgIHZhciBjYXRlZ29yeU9iaiA9IHtcclxuICAgICAgICAgICAgXCJzZFwiOiBcIlNvZnR3YXJlIERldmVsb3BtZW50XCIsXHJcbiAgICAgICAgICAgIFwiZmFcIjogXCJGaW5hbmNlICYgQWNjb3VudGluZ1wiLFxyXG4gICAgICAgICAgICBcIm1hXCI6IFwiTXVzaWMgJiBBdWRpb1wiLFxyXG4gICAgICAgICAgICBcImdkXCI6IFwiR3JhcGhpYyAmIERlc2lnblwiLFxyXG4gICAgICAgICAgICBcInZhXCI6IFwiVmlkZW8gJiBBbmltYXRpb25cIixcclxuICAgICAgICAgICAgXCJ0d1wiOiBcIlRleHQgJiBXcml0aW5nXCIsXHJcbiAgICAgICAgICAgIFwiY3NcIjogXCJDb25zdWx0aW5nIFNlcnZpY2VzXCIsXHJcbiAgICAgICAgICAgIFwib3NcIjogXCJPdGhlciBTZXJ2aWNlc1wiXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcm91bmRfcHJpY2UgPSBNYXRoLnJvdW5kKGdpZ09iamVjdC5wcmljZSAqIDEwMDApIC8gMTAwMDtcclxuICAgICAgICB2YXIgZ2lnRGVsZXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgaWYgKGlzT3duKSB7XHJcbiAgICAgICAgICAgIHZhciBnaWdEZWxldGVTdHJpbmcgPSAnPGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0gZGVsZXRlXCI+RGVsZXRlPC9saT4nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBkcm9wZG93bkJ1dHRvbiA9ICc8YnV0dG9uIGlkPVwiRERCJyArIGdpZ0lEICsgJ1wiIGNsYXNzPVwiZHJvcGRvd24tZ2lnIG1kbC1idXR0b24gbWRsLWpzLWJ1dHRvbiBtZGwtYnV0dG9uLS1pY29uIGRyb3Bkb3duLWJ1dHRvbiBidG4taW5mby1lZGl0XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPm1vcmVfdmVydDwvaT48L2J1dHRvbj4nO1xyXG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT4nICsgZ2lnRGVsZXRlU3RyaW5nICsgJzwvdWw+JztcclxuXHJcbiAgICAgICAgaWYgKGdpZ09iamVjdC5oYXNPd25Qcm9wZXJ0eSgnb3duZXJfZ3VpZCcpKSB7XHJcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcclxuXHJcbiAgICAgICAgICAgIGdldFByb2ZpbGVWYWx1ZShvd25lcl9ndWlkLCAncHJvZmlsZVBpY3R1cmUnLCBmdW5jdGlvbihwcm9maWxlUGljdHVyZVVSTCkge1xyXG4gICAgICAgICAgICAgICAgaW1nX3NyYyA9IGFwaV9jZG4gKyBKU09OLnBhcnNlKHByb2ZpbGVQaWN0dXJlVVJMKSArICcmdGh1bWI9MSc7XHJcbiAgICAgICAgICAgICAgICAvLyAkKCcjaW1nYXYnICsgZ2lnSUQpLmF0dHIoJ3NyYycsIHBfc3JjKTtcclxuICAgICAgICAgICAgICAgIGdldFByb2ZpbGVWYWx1ZShvd25lcl9ndWlkLCAnbmFtZScsIGZ1bmN0aW9uKG5hbWVfanN0cikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc19vID0gSlNPTi5wYXJzZShuYW1lX2pzdHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxuYW1lID0gbmFtZXNfby5maXJzdCArIFwiIFwiICsgbmFtZXNfby5sYXN0O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICQoJyNubW93bicgKyBnaWdJRCkudGV4dChuYW1lc19vLmZpcnN0ICsgXCIgXCIgKyBuYW1lc19vLmxhc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdMYXlvdXQgPSBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW1nLWNhcmRcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgke2FwaV9jZG4gKyBnaWdPYmplY3QuaW1hZ2VfaGFzaH0mdGh1bWI9MSkgY2VudGVyIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIiA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duQnV0dG9ufVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93blVMfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtbGFiZWxcIj4ke2NhdGVnb3J5T2JqW2dpZ09iamVjdC5jYXRlZ29yeV19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWltZ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpdi1pbWctd3JhcFwiIHN0eWxlPVwiYmFja2dyb3VuZDogdXJsKCcke2ltZ19zcmN9JylcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1uYW1lXCIgaWQ9XCJubW93biR7Z2lnSUR9XCI+JHtmdWxsbmFtZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1yb2xlXCI+JHtjYXRlZ29yeU9ialtnaWdPYmplY3QuY2F0ZWdvcnldfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItaW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJpY2VcIj5TVEFSVElORyBBVDogPHNwYW4+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnBvbHltZXI8L2k+JHtyb3VuZF9wcmljZX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob25lID09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5naWdzLWNvbnRhaW5lclwiKS5wcmVwZW5kKGdpZ0xheW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChnaWdMYXlvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVEb20oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaWQsIG9iaiwgaXNPd24sIG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVHaWdzRnJvbURhdGEoaWQsIG9iaiwgaXNPd24sIG9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiZnVuY3Rpb24gZmlsdGVyUHJvZmlsZUNhcmRzKHF1ZXJ5LCAkaW5wdXQpIHtcclxuICAvKiBDSEVDSyBGT1IgUVVFUlkgTUFUQ0ggV0lUSCBOQU1FICovXHJcbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykuZWFjaChmdW5jdGlvbihpLGl0ZW0pIHtcclxuICAgIHZhciBuYW1lID0gJChpdGVtKS5maW5kKCcudXNlci1uYW1lJykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBuYW1lLm1hdGNoKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID8gJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgOiAkKGl0ZW0pLmFkZENsYXNzKCdoaWRkZW4nKVxyXG4gIH0pO1xyXG4gIC8qIEFERCBSRUQgQk9SREVSIFRPIElOUFVUIElGIE5PIFNFQVJDSCBNQVRDSEVEICovXHJcbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykubGVuZ3RoID09ICQoJy5wcm9maWxlLXVzZXItY2FyZC5oaWRkZW4nKS5sZW5ndGggPyAkaW5wdXQuYWRkQ2xhc3MoJ2Vycm9yJykgOiAkaW5wdXQucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XHJcbn1cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcbiAgLy8gR2xvYmFsIEV2ZW50c1xyXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZHJvcGRvd24nKS5sZW5ndGgpIHtcclxuICAgICAgICAgICQoJyNzZXR0aW5ncy1kcm9wZG93bicpLnBhcmVudHMoJy5kcm9wZG93bicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgIH1cclxuICB9KTtcclxuICAvLyBEcm9wZG93biBzaG93IGluIGhlYWRlclxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjc2V0dGluZ3MtZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnc2hvdycpO1xyXG4gICAgICAvLyAuc2libGluZ3MoJ1tkYXRhLWxhYmVsbGVkYnk9c2V0dGluZ3MtZHJvcGRvd25dJykuXHJcbiAgfSk7XHJcblxyXG4gIC8vIE9QRU4gR0lHIEJJRyBNT0RBTCBPTiBNRU5VIGNsaWNrXHJcbiAgJCgnYm9keScpLmRlbGVnYXRlKCdsaS5qcy1vcGVuLWdpZy1tb2RhbCcsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmdpZycpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXHJcbiAgaWYgKCAkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSApIHtcclxuICAgIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXHJcbiAgICAkKGRvY3VtZW50KS5vbignaW5wdXQnLCAnLnByb2ZpbGVzLXBhZ2UgI3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbigpIHtcclxuICAgICAgZmlsdGVyUHJvZmlsZUNhcmRzKCAkKHRoaXMpLnZhbCgpLCAkKHRoaXMpICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKiBPUEVOIElOVEVSTkFMIFBST0ZJTEUgUEFHRSAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnByb2ZpbGUtdXNlci1jYXJkJyxmdW5jdGlvbigpe1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvdWkvcHJvZmlsZS8jJyArICQodGhpcykuYXR0cignaWQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gUkVESVJFQ1QgVE8gUFJPRklMRSBQQUdFIE9OIENMSUNLIE9OIFVTRVJTIFBST0ZJTEVcclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuanNPcGVuR2lnT3duZXJQcm9maWxlJyxmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgfSk7XHJcbn0pXHJcbiIsIndpbmRvdy4kdXBsb2FkQ3JvcCA9ICQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKS5jcm9wcGllKHtcclxuICB2aWV3cG9ydDoge1xyXG4gICAgd2lkdGg6IDQ1MCxcclxuICAgIGhlaWdodDogMTUwXHJcbiAgfSxcclxuICBlbmFibGVab29tOiB0cnVlLFxyXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxyXG59KTtcclxuXHJcbndpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUgPSAkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpLmNyb3BwaWUoe1xyXG4gIHZpZXdwb3J0OiB7XHJcbiAgICB3aWR0aDogMTUwLFxyXG4gICAgaGVpZ2h0OiAxNTAsXHJcbiAgICB0eXBlOiBcImNpcmNsZVwiXHJcbiAgfSxcclxuICBlbmFibGVab29tOiB0cnVlLFxyXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxyXG59KTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcbiAgICAvKiBCVVRUT04gSU5JVCBDTElDSyBPTiBJTlBVVCBUWVBFIEZJTEUgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc0Nyb3BVcGxvYWQnLGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcclxuICAgICAgJGNvbnRlbnQuZmluZCgnaW5wdXQjaW5wdXQtaW1hZ2UtZ2lnJykuY2xpY2soKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuanNDcm9wVXBsb2FkUHJvZmlsZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICRjb250ZW50LmZpbmQoXCJpbnB1dCNpbnB1dC1pbWFnZS1wcm9maWxlXCIpLmNsaWNrKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKiBCVVRUT04gRk9SIEdFVFRJTkcgQ1JPUCBSRVNVbHQgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc0Nyb3BSZXN1bHQnLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wLmNyb3BwaWUoJ3Jlc3VsdCcsJ2Jhc2U2NCcpLnRoZW4oIGZ1bmN0aW9uKGJhc2U2NCkge1xyXG4gICAgICAgICRjb250ZW50LmZpbmQoJ2ltZyNpbnB1dC1pbWFnZS1naWcnKS5hdHRyKCdzcmMnLCBiYXNlNjQpLnNob3coNTAwKS5yZW1vdmVDbGFzcygnZW1wdHknKTtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuc2hvdyg1MDApO1xyXG4gICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuc2hvdygpO1xyXG4gICAgICB9KTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wLmNyb3BwaWUoJ3Jlc3VsdCcsJ2Jsb2InKS50aGVuKCBmdW5jdGlvbihibG9iKSB7XHJcbiAgICAgICAgd2luZG93LiR1cGxvYWRDcm9wQmxvYiA9IGJsb2I7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1naWdcIikpLmhpZGUoNDAwKTtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLmhpZGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuanNDcm9wUmVzdWx0UHJvZmlsZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XHJcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUuY3JvcHBpZShcInJlc3VsdFwiLCBcImJhc2U2NFwiKS50aGVuKGZ1bmN0aW9uKGJhc2U2NCkge1xyXG4gICAgICAgICAgJGNvbnRlbnQuZmluZChcInNwYW4jaW5wdXQtaW1hZ2UtcHJvZmlsZVwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsICd1cmwoJysgYmFzZTY0ICsnKScpLnNob3coNTAwKS5yZW1vdmVDbGFzcyhcImVtcHR5XCIpO1xyXG4gICAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5zaG93KDUwMCk7XHJcbiAgICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZS5jcm9wcGllKFwicmVzdWx0XCIsIFwiYmxvYlwiKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcclxuICAgICAgICB3aW5kb3cuJHVwbG9hZENyb3BCbG9iUHJvZmlsZSA9IGJsb2I7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5oaWRlKDQwMCk7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJ3aW5kb3cuY3JlYXRlTmV3R2lnID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgJChcIiNhZGQtZ2lnXCIpLmZpbmQoXCIjbmV3R2lnZXhwaXJlXCIpLmRhdGVwaWNrZXIoKTtcclxuICAgICQoXCIjYWRkLWdpZ1wiKS5vbihcImhpZGRlbi5icy5tb2RhbFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgJCh0aGlzKS5maW5kKFwiLmdpZy10YWdzXCIpLmZpbmQoXCIuZGVsZXRlXCIpLmNsaWNrKCk7XHJcbiAgICAgICAgJCh0aGlzKVxyXG4gICAgICAgICAgICAuZmluZChcImltZyNpbnB1dC1pbWFnZS1naWdcIikuaGlkZSgpLmFkZENsYXNzKFwiZW1wdHlcIikuZW5kKClcclxuICAgICAgICAgICAgLmZpbmQoXCIuaW1nLWxhYmVsXCIpLnNob3coKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS50ZXh0KCcnKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmhpZGUoKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XHJcbiAgICAgICAgJCh0aGlzKVxyXG4gICAgICAgICAgICAuZmluZChcImlucHV0LHRleHRhcmVhLHNlbGVjdFwiKS52YWwoXCJcIikuZW5kKClcclxuICAgICAgICAgICAgLmZpbmQoXCIucmFuZ2Utc2xpZGVyXCIpXHJcbiAgICAgICAgICAgIC5maW5kKFwiaW5wdXRcIikudmFsKFwiMFwiKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZChcIi5yYW5nZS1zbGlkZXJfX3ZhbHVlXCIpLnRleHQoXCIwXCIpO1xyXG4gICAgICAgICQodGhpcykuZmluZChcIiNuZXctZ2lnLWNhdGVnb3J5XCIpLnBhcmVudCgpLmZpbmQoXCIudGV4dFwiKS50ZXh0KFwiQWxsIENhdGVnb3JpZXNcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgY2FsY3VsYXRlZExvY2s7XHJcbiAgICAkKCcuanNDYWxjdWxhdGVkTG9jaycpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGNvc3QgPSAkKCcjcmVwdXRhdGlvbkNvc3QnKS52YWwoKSxcclxuICAgICAgICAgIGFtb3VudCA9ICQoJyNhbW91bnQnKS52YWwoKSxcclxuICAgICAgICAgICRjYWxjdWxhdGVkTG9jayA9ICQoJyNjYWxjdWxhdGVkTG9jaycpLFxyXG4gICAgICAgICAgY2FsY3VsYXRlZExvY2sgPSBjYWxjTG9jayhjb3N0LCBhbW91bnQpXHJcbiAgICAgICAgICAkY2FsY3VsYXRlZExvY2sudGV4dChjYWxjdWxhdGVkTG9jayArICcgRVJUJyk7XHJcbiAgICB9KVxyXG5cclxufSkoKTtcclxuXHJcbmZ1bmN0aW9uIGNhbGNMb2NrIChjb3N0LCBhbW91bnQpIHtcclxuICByZXR1cm4gKGNvc3QgKiBhbW91bnQpIC8gMTAwO1xyXG59XHJcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cuZ2lnc1BhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXHJcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R2lncygpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAuZ2lncycpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBnZXRMaXN0T2ZHaWdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbmluaXRHaWdzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXRHaWdzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ2dpZ3MtcGFnZScpKSB7XHJcbiAgICAgICAgZ2lnc1BhZ2VNb2R1bGUub25pbml0R2lncygpO1xyXG4gICAgfVxyXG59KTsiLCIvLyBOZXR3b3JrXHJcbndpbmRvdy5uZXR3b3JrUGFnZU1vZHVsZSA9IChmdW5jdGlvbiAoKSB7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXROZXR3b3JrICgpIHtcclxuXHJcbiAgICB2YXIganNvbjEgPSBbXHJcbiAgICAgIHtcclxuICAgICAgICBcImdlb1wiOiB7XHJcbiAgICAgICAgICBcInppcF9jb2RlXCI6IFwiRUMyVlwiLFxyXG4gICAgICAgICAgXCJsYXRpdHVkZVwiOiA1MS41MTQyLFxyXG4gICAgICAgICAgXCJjb3VudHJ5X25hbWVcIjogXCJVbml0ZWQgS2luZ2RvbVwiLFxyXG4gICAgICAgICAgXCJyZWdpb25fbmFtZVwiOiBcIkVuZ2xhbmRcIixcclxuICAgICAgICAgIFwiaXBcIjogXCIxNzguNjIuMjIuMTEwXCIsXHJcbiAgICAgICAgICBcImxvbmdpdHVkZVwiOiAtMC4wOTMxLFxyXG4gICAgICAgICAgXCJjaXR5XCI6IFwiTG9uZG9uXCIsXHJcbiAgICAgICAgICBcInRpbWVfem9uZVwiOiBcIkV1cm9wZS9Mb25kb25cIixcclxuICAgICAgICAgIFwicmVnaW9uX2NvZGVcIjogXCJFTkdcIixcclxuICAgICAgICAgIFwiY291bnRyeV9jb2RlXCI6IFwiR0JcIixcclxuICAgICAgICAgIFwibWV0cm9fY29kZVwiOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICBcInBvcnRcIjogXCI1Njc4XCIsXHJcbiAgICAgICAgXCJpcDRcIjogXCIxNzguNjIuMjIuMTEwXCIsXHJcbiAgICAgICAgXCJzZXJ2aWNlX3VybFwiOiBcImh0dHA6Ly8xNzguNjIuMjIuMTEwOjU2NzhcIlxyXG4gICAgICB9LFxyXG4gICAgICB7XHJcbiAgICAgICAgXCJpcDRcIjogXCIxNjUuMjI3LjE4NC41NVwiLFxyXG4gICAgICAgIFwicG9ydFwiOiBcIjU2NzhcIixcclxuICAgICAgICBcImdlb1wiOiB7XHJcbiAgICAgICAgICBcInppcF9jb2RlXCI6IFwiMDcwMTRcIixcclxuICAgICAgICAgIFwibGF0aXR1ZGVcIjogNDAuODMyNixcclxuICAgICAgICAgIFwiY291bnRyeV9uYW1lXCI6IFwiVW5pdGVkIFN0YXRlc1wiLFxyXG4gICAgICAgICAgXCJyZWdpb25fbmFtZVwiOiBcIk5ldyBKZXJzZXlcIixcclxuICAgICAgICAgIFwiaXBcIjogXCIxNjUuMjI3LjE4NC41NVwiLFxyXG4gICAgICAgICAgXCJsb25naXR1ZGVcIjogLTc0LjEzMDcsXHJcbiAgICAgICAgICBcIm1ldHJvX2NvZGVcIjogNTAxLFxyXG4gICAgICAgICAgXCJjaXR5XCI6IFwiQ2xpZnRvblwiLFxyXG4gICAgICAgICAgXCJ0aW1lX3pvbmVcIjogXCJBbWVyaWNhL05ld19Zb3JrXCIsXHJcbiAgICAgICAgICBcInJlZ2lvbl9jb2RlXCI6IFwiTkpcIixcclxuICAgICAgICAgIFwiY291bnRyeV9jb2RlXCI6IFwiVVNcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzZXJ2aWNlX3VybFwiOiBcImh0dHA6Ly8xNjUuMjI3LjE4NC41NTo1Njc4XCJcclxuICAgICAgfSxcclxuICAgICAge1xyXG4gICAgICAgIFwiaXA0XCI6IFwiNDYuMTAxLjIyMy41MlwiLFxyXG4gICAgICAgIFwicG9ydFwiOiBcIjU2NzhcIixcclxuICAgICAgICBcImdlb1wiOiB7XHJcbiAgICAgICAgICBcInppcF9jb2RlXCI6IFwiMDkwMzlcIixcclxuICAgICAgICAgIFwibGF0aXR1ZGVcIjogNTAuMTE2NyxcclxuICAgICAgICAgIFwibWV0cm9fY29kZVwiOiAwLFxyXG4gICAgICAgICAgXCJyZWdpb25fbmFtZVwiOiBcIkhlc3NlXCIsXHJcbiAgICAgICAgICBcImlwXCI6IFwiNDYuMTAxLjIyMy41MlwiLFxyXG4gICAgICAgICAgXCJsb25naXR1ZGVcIjogOC42ODMzLFxyXG4gICAgICAgICAgXCJjb3VudHJ5X25hbWVcIjogXCJHZXJtYW55XCIsXHJcbiAgICAgICAgICBcImNpdHlcIjogXCJGcmFua2Z1cnQgYW0gTWFpblwiLFxyXG4gICAgICAgICAgXCJ0aW1lX3pvbmVcIjogXCJFdXJvcGUvQmVybGluXCIsXHJcbiAgICAgICAgICBcInJlZ2lvbl9jb2RlXCI6IFwiSEVcIixcclxuICAgICAgICAgIFwiY291bnRyeV9jb2RlXCI6IFwiREVcIlxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCJzZXJ2aWNlX3VybFwiOiBcImh0dHA6Ly80Ni4xMDEuMjIzLjUyOjU2NzhcIlxyXG4gICAgICB9XHJcbiAgICBdXHJcblxyXG4gICAgdmFyIHNvdXJjZUZlYXR1cmVzID0gbmV3IG9sLnNvdXJjZS5WZWN0b3IoKSxcclxuICAgICAgICBsYXllckZlYXR1cmVzID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7c291cmNlOiBzb3VyY2VGZWF0dXJlc30pXHJcblxyXG4gICAgdmFyIG1hcCA9IG5ldyBvbC5NYXAoe1xyXG4gICAgICB0YXJnZXQ6ICdtYXAnLFxyXG4gICAgICBsYXllcnM6IFtcclxuICAgICAgICBuZXcgb2wubGF5ZXIuVGlsZSh7c291cmNlOiBuZXcgb2wuc291cmNlLk9TTSgpfSksXHJcbiAgICAgICAgbGF5ZXJGZWF0dXJlc1xyXG4gICAgICBdLFxyXG4gICAgICB2aWV3OiBuZXcgb2wuVmlldyh7IGNlbnRlcjogWzAsIDBdLCB6b29tOiAyIH0pXHJcbiAgICB9KVxyXG5cclxuICAgIHZhciBzdHlsZTEgPSBbXHJcbiAgICAgIG5ldyBvbC5zdHlsZS5TdHlsZSh7XHJcbiAgICAgICAgaW1hZ2U6IG5ldyBvbC5zdHlsZS5JY29uKCh7XHJcbiAgICAgICAgICByb3RhdGVXaXRoVmlldzogZmFsc2UsXHJcbiAgICAgICAgICBhbmNob3I6IFswLjUsIDFdLFxyXG4gICAgICAgICAgYW5jaG9yWFVuaXRzOiAnZnJhY3Rpb24nLFxyXG4gICAgICAgICAgYW5jaG9yWVVuaXRzOiAnZnJhY3Rpb24nLFxyXG4gICAgICAgICAgb3BhY2l0eTogMSxcclxuICAgICAgICAgIHNjYWxlOiAwLjcsXHJcbiAgICAgICAgICAvLyBzcmM6ICcvL2Nkbi5yYXdnaXQuY29tL2pvbmF0YXN3YWxrZXIvb2wzLWNvbnRleHRtZW51L21hc3Rlci9leGFtcGxlcy9pbWcvcGluX2Ryb3AucG5nJ1xyXG4gICAgICAgICAgc3JjOiAnLy9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pvbmF0YXN3YWxrZXIvbWFwLXV0aWxzL21hc3Rlci9pbWFnZXMvbWFya2VyLnBuZydcclxuICAgICAgICB9KSksXHJcbiAgICAgICAgekluZGV4OiA1XHJcbiAgICAgIH0pLFxyXG4gICAgICBuZXcgb2wuc3R5bGUuU3R5bGUoe1xyXG4gICAgICAgIGltYWdlOiBuZXcgb2wuc3R5bGUuQ2lyY2xlKHtcclxuICAgICAgICAgIHJhZGl1czogNSxcclxuICAgICAgICAgIGZpbGw6IG5ldyBvbC5zdHlsZS5GaWxsKHtjb2xvcjogJ3JnYmEoMjU1LDI1NSwyNTUsMSknfSksXHJcbiAgICAgICAgICBzdHJva2U6IG5ldyBvbC5zdHlsZS5TdHJva2Uoe2NvbG9yOiAncmdiYSgwLDAsMCwxKSd9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICBdXHJcblxyXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBqc29uMS5sZW5ndGg7IGkrKykge1xyXG4gICAgICB2YXIgY291bnQgPSAwXHJcbiAgICAgIGNvbnNvbGUubG9nKGpzb24xW2ldLmdlby5sYXRpdHVkZSlcclxuICAgICAgY29uc29sZS5sb2coanNvbjFbaV0uZ2VvLmxvbmdpdHVkZSlcclxuXHJcbiAgICAgIHZhciBmZWF0dXJlID0gbmV3IG9sLkZlYXR1cmUoe1xyXG4gICAgICAgIHR5cGU6ICdjbGljaycsXHJcbiAgICAgICAgaXA0OiBqc29uMVtpXS5pcDQsXHJcbiAgICAgICAgY291bnRyeToganNvbjFbaV0uZ2VvLmNvdW50cnlfbmFtZSxcclxuICAgICAgICBnZW9tZXRyeTogbmV3IG9sLmdlb20uUG9pbnQob2wucHJvai50cmFuc2Zvcm0oW2pzb24xW2ldLmdlby5sb25naXR1ZGUsIGpzb24xW2ldLmdlby5sYXRpdHVkZV0sICdFUFNHOjQzMjYnLCAnRVBTRzozODU3JykpXHJcbiAgICAgIH0pXHJcbiAgICAgIGZlYXR1cmUuc2V0U3R5bGUoc3R5bGUxKTtcclxuICAgICAgc291cmNlRmVhdHVyZXMuYWRkRmVhdHVyZShmZWF0dXJlKTtcclxuICAgIH1cclxuXHJcbiAgICBtYXAub24oJ2NsaWNrJywgZnVuY3Rpb24oZXZ0KSB7XHJcbiAgICAgIHZhciBmID0gbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChldnQucGl4ZWwsIGZ1bmN0aW9uKGZ0LCBsYXllcikgeyByZXR1cm4gZnQgfSlcclxuICAgICAgaWYgKGYgJiYgZi5nZXQoJ3R5cGUnKSA9PT0gJ2NsaWNrJykge1xyXG4gICAgICAgIHZhciBnZW9tZXRyeSA9IGYuZ2V0R2VvbWV0cnkoKVxyXG4gICAgICAgIHZhciBjb29yZCA9IGdlb21ldHJ5LmdldENvb3JkaW5hdGVzKClcclxuXHJcbiAgICAgICAgJCgnI21vZGFsLW5ldHdvcmsnKS5maW5kKCcubnR3LWNvdW50cnknKS50ZXh0KGYuai5jb3VudHJ5KVxyXG4gICAgICAgICQoJyNtb2RhbC1uZXR3b3JrJykuZmluZCgnLm50dy1pcCcpLnRleHQoZi5qLmlwNClcclxuICAgICAgICAkKFwiW2RhdGEtdGFyZ2V0PScjbW9kYWwtbmV0d29yayddXCIpLnRyaWdnZXIoJ2NsaWNrJylcclxuICAgICAgfVxyXG4gICAgfSlcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBvbmluaXROZXR3b3JrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBpbml0TmV0d29yaygpXHJcbiAgICB9XHJcbiAgfVxyXG59KSgpXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ25ldHdvcmstcGFnZScpKSB7XHJcbiAgICAgICAgbmV0d29ya1BhZ2VNb2R1bGUub25pbml0TmV0d29yaygpO1xyXG4gICAgfVxyXG59KTtcclxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5wcm9maWxlUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcclxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcblxyXG4gICAgICAgIC8qIFJFU0VUIEFORCBHRVQgTkVXIFBST0ZJTEUgSUQgSEFTSCAqL1xyXG4gICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSBudWxsO1xyXG5cclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcclxuICAgICAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpO1xyXG4gICAgICAgICAgICB1cGRhdGVQcm9maWxlKCk7XHJcbiAgICAgICAgICAgIGdldEdpZ3Mod2luZG93LnByb2ZpbGVJRCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJCgnLnJlZGVzaWduZWQtZ2lnLW1vZGFsJykuYWRkQ2xhc3MoJ25vLWJ1dHRvbi1vcmRlcicpO1xyXG4gICAgICAgICAgICAkKCcuZWRpdEJ0blByb2ZpbGUnKS5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XHJcbiAgICAgICAgICAgIGdldE5vZGVEYXRhKGZ1bmN0aW9uKG5vZGVEYXRhKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgZGF0YSA9IEpTT04ucGFyc2Uobm9kZURhdGEpO1xyXG4gICAgICAgICAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IGRhdGEuZ3VpZDtcclxuICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgdXBkYXRlUHJvZmlsZSgpO1xyXG4gICAgICAgICAgICAgICAgZ2V0R2lncyhkYXRhLmd1aWQpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIGZ1bmN0aW9uIGdldEdpZ3MoZ3VpZCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGd1aWQpO1xyXG4gICAgICAgIGdldFByb2ZpbGVHaWdzKGd1aWQsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgdmFyIHByb2ZpbGVfZ2lncyA9IEpTT04ucGFyc2UoZGF0YSk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHJvZmlsZV9naWdzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogXCIvYXBpL3YxL2RodC9oa2V5Lz9oa2V5PVwiICsgcHJvZmlsZV9naWdzW2ldLFxyXG4gICAgICAgICAgICAgICAgICAgIGhrOiBwcm9maWxlX2dpZ3NbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oanNfZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBnaWdfbyA9IEpTT04ucGFyc2UoanNfZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUdpZ3NNb2R1bGUuZ2VuZXJhdGUodGhpcy5oaywgZ2lnX28sIHRydWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRVJSJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZW5kZXJPbmVHaWcoZ2lnaWQsIG9uZSkge1xyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHVybDogXCIvYXBpL3YxL2RodC9oa2V5Lz9oa2V5PVwiICsgZ2lnaWQsXHJcbiAgICAgICAgICAgIGhrOiBnaWdpZCxcclxuICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcclxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc19kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnX28gPSBKU09OLnBhcnNlKGpzX2RhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlR2lnc01vZHVsZS5nZW5lcmF0ZSh0aGlzLmhrLCBnaWdfbywgdHJ1ZSwgb25lKTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0VSUicsIGVycm9yKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25pbml0OiBpbml0UHJvZmlsZSxcclxuICAgICAgICBnZXRBbGxHaWdzOiBnZXRHaWdzLFxyXG4gICAgICAgIHJlbmRlck9uZUdpZzogcmVuZGVyT25lR2lnXHJcbiAgICB9XHJcbn0pKCk7XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlLXBhZ2UnKSkge1xyXG4gICAgICAgIHByb2ZpbGVQYWdlTW9kdWxlLm9uaW5pdCgpO1xyXG4gICAgfVxyXG59KTsiLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnByb2ZpbGVzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcclxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQcm9maWxlcygpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAucHJvZmlsZXMnKS5hZGRDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgbWFpbl9wcm9maWxlX2NhcmRzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qc0xvYWRNb3JlUHJvZmlsZXMnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBsaW1pdCA9IGxpbWl0ICsgOTtcclxuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcclxuICAgIH0pO1xyXG5cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uaW5pdHByb2ZpbGVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlcygpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7XHJcblxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdwcm9maWxlcy1wYWdlJykpIHtcclxuICAgICAgICBwcm9maWxlc1BhZ2VNb2R1bGUub25pbml0cHJvZmlsZXMoKTtcclxuICAgIH1cclxufSk7XHJcbiIsIndpbmRvdy5uZXdHaWdSYW5nZVNsaWRlciA9IChmdW5jdGlvbigpIHtcclxuXHR2YXIgcmFuZ2VTbGlkZXIgPSBmdW5jdGlvbigpIHtcclxuXHRcdHZhciBzbGlkZXIgPSAkKFwiLnJhbmdlLXNsaWRlclwiKSxcclxuXHRcdFx0cmFuZ2UgPSAkKFwiLnJhbmdlLXNsaWRlcl9fcmFuZ2VcIiksXHJcblx0XHRcdHZhbHVlID0gJChcIi5yYW5nZS1zbGlkZXJfX3ZhbHVlXCIpO1xyXG5cclxuXHRcdHNsaWRlci5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHR2YWx1ZS5lYWNoKGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdHZhciB2YWx1ZSA9ICQodGhpcylcclxuXHRcdFx0XHRcdC5wcmV2KClcclxuXHRcdFx0XHRcdC5hdHRyKFwidmFsdWVcIik7XHJcblx0XHRcdFx0JCh0aGlzKS5odG1sKHZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblxyXG5cdFx0XHRyYW5nZS5vbihcImlucHV0XCIsIGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdCQodGhpcylcclxuXHRcdFx0XHRcdC5uZXh0KHZhbHVlKVxyXG5cdFx0XHRcdFx0Lmh0bWwodGhpcy52YWx1ZSk7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSk7XHJcblx0fTtcclxuXHJcblx0cmFuZ2VTbGlkZXIoKTtcclxufSkoKTtcclxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5zbWFydFNlYXJjaE1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuICAgIC8vIEdsb2JhbCB2YXJpYWJsZXMgZm9yIFNtYXJ0IFNlYXJjaFxyXG5cclxuICAgIHZhciBzZWFyY2hBcnJheSA9IG5ldyBBcnJheSgpO1xyXG4gICAgdmFyIGtleXVwVGltZW91dCA9IG51bGw7XHJcbiAgICB2YXIgZGF0YUxlbmd0aCA9IDBcclxuXHJcbiAgICB2YXIgc2VhcmNoQSA9ICcnO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNtYXJ0U2VhcmNoKCkge1xyXG4gICAgICAgIHZhciB1cmwgPSBhcGlfaWR4X2Nkbl91cmwoKTtcclxuICAgICAgICAvLyBidWlsZCB1cmwgZm9yIHNlYXJjaGluZ1xyXG4gICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJC5lYWNoKHNlYXJjaEFycmF5LCBmdW5jdGlvbihpLCBpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoUSA9ICcnO1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcgJiYgaXRlbS52YWx1ZSA9PSAnJyAmJiBzZWFyY2hBcnJheS5sZW5ndGggPT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnICYmIGl0ZW0udmFsdWUgPT0gJycgJiYgc2VhcmNoQXJyYXkubGVuZ3RoICE9IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGFncycgJiYgaXRlbS52YWx1ZSA9PSAnc2VsZWN0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0YWdzJyAmJiBpdGVtLnZhbHVlID09ICcnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ2NhdGVnb3J5JyAmJiBpdGVtLnZhbHVlID09ICdhbGwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnYWxsJicgKyBpdGVtLnR5cGUgKyAnPScgKyBpdGVtLnZhbHVlO1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSBzZWFyY2hRO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hRICs9ICcmJyArIGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHVybCArPSAnYWxsJztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgIHR5cGU6ICdHRVQnLFxyXG4gICAgICAgICAgICB1cmw6IHVybCArICcmbGltaXQ9MTAwMCcsXHJcbiAgICAgICAgICAgIHFyeTogc2VhcmNoQSxcclxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xyXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT0gJ251bGwnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgZGF0YSA9IEpTT04uc3RyaW5naWZ5KHsgcmVzdWx0OiBgTm8gcmVzdWx0cyBmb3IgdGhpcyBzZWFyY2hgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKGRhdGEpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU2VhcmNoIEV2ZW50c1xyXG5cclxuICAgIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIHRleHQgZmllbGRcclxuICAgICQoZG9jdW1lbnQpLm9uKCdrZXl1cCcsICdpbnB1dCNzZWFyY2gtaGVhZGVyJywgZnVuY3Rpb24oZSkge1xyXG4gICAgICAgIGlmICh0aGlzLnZhbHVlLmxlbmd0aCA8IDIgJiYgdGhpcy52YWx1ZS5sZW5ndGggPiAwKSByZXR1cm47XHJcbiAgICAgICAgbGltaXQgPSA5O1xyXG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSAkKGUudGFyZ2V0KS52YWwoKS5zcGxpdChcIiBcIikuam9pbihcIiUyMFwiKTtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIGlmICh0ZXh0ID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgY29uc29sZS5sb2coc2VhcmNoQXJyYXkpO1xyXG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gU3VibWl0IHNlYXJjaCBmb3IgZHJvcGRvd24gZXhwZXJ0aXNlXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNkb21haW4tZXhwZXJ0aXNlLXNlbGVjdCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBlbCA9ICQodGhpcykuZHJvcGRvd24oJ2dldCB2YWx1ZScpO1xyXG4gICAgICAgIGxpbWl0ID0gOTtcclxuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICB2YXIgY2F0ZWdvcnkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAnY2F0ZWdvcnknKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhdGVnb3J5ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ2NhdGVnb3J5JywgdmFsdWU6IGVsIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKGNhdGVnb3J5ID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAnY2F0ZWdvcnknLCB2YWx1ZTogZWwgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XHJcbiAgICAgICAgICAgIGlmIChlbCAhPSAnYWxsJykgbG9hZF90YWdzX3Blcl9kb21haW4oZWwpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNza2lsbHMtdGFncycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBlbCA9ICQodGhpcykuZHJvcGRvd24oJ2dldCB2YWx1ZScpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVsKTtcclxuICAgICAgICBpZiAoZWwgPT0gbnVsbCkgcmV0dXJuO1xyXG4gICAgICAgIGxpbWl0ID0gOTtcclxuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgICAgICB2YXIgb3V0cHV0U3RyaW5nID0gZWwuam9pbihcIiUyMFwiKTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKVxyXG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGFncyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0YWdzJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWdzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRhZ3MgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0YWdzJywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ21vdXNldXAnLCAnI3NsaWRlci1yYW5nZScsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciB2YWx1ZXMgPSAkKHRoaXMpLnNsaWRlcihcInZhbHVlc1wiKTtcclxuICAgICAgICBpZiAodmFsdWVzWzBdID09IDAgJiYgdmFsdWVzWzFdID09IDIwMDApIHtcclxuICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBsaW1pdCA9IDk7XHJcbiAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICBkZWxheShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHExcmFuZ2UgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcTFyYW5nZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHExcmFuZ2UgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3ExcmFuZ2UnLCB2YWx1ZTogdmFsdWVzWzBdICsgJyUyMCcgKyB2YWx1ZXNbMV0gfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3ExcmFuZ2UnLCB2YWx1ZTogdmFsdWVzWzBdICsgJyUyMCcgKyB2YWx1ZXNbMV0gfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgIH0pO1xyXG5cclxuXHJcblxyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanNMb2FkTW9yZVNlYXJjaCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxpbWl0ID0gbGltaXQgKyA5O1xyXG4gICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzZWFyY2g6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gc21hcnRTZWFyY2goKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpOyJdfQ==
