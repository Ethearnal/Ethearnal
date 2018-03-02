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
'use strict';

// Network
window.networkPageModule = function () {
  $('.nav-tabs .nav-link').removeClass('active');
  $('.nav-tabs .network').addClass('active');
  // array of CDN's
  var urlsArr = ['http://159.89.165.91:5678/api/cdn/v1/info', 'http://159.89.112.171:5678/api/cdn/v1/info', 'http://207.154.238.7:5678/api/cdn/v1/info'];
  // update data interval
  var interval = 1000 * 60 * 5;
  function initNetwork() {
    //  Map layers
    var layerMap = new ol.layer.Tile({ source: new ol.source.OSM() });
    var sourceFeatures = new ol.source.Vector();
    var layerFeatures = new ol.layer.Vector({ source: sourceFeatures });
    // create new Map
    var map = new ol.Map({
      target: 'map',
      layers: [layerMap, layerFeatures],
      view: new ol.View({ center: ol.proj.transform([2.41, 15.82], 'EPSG:4326', 'EPSG:3857'), zoom: 3 })
    });
    // Marker style
    var styleMk = [new ol.style.Style({
      image: new ol.style.Icon({
        anchor: [0.5, 1],
        scale: 1,
        src: 'http://image.ibb.co/fLEanc/maps_and_flags_1.png'
      }),
      zIndex: 5
    })];
    // tooltips
    var tooltip = document.getElementById('tooltip');
    var overlay = new ol.Overlay({
      element: tooltip,
      offset: [10, 0],
      positioning: 'bottom-left'
    });
    map.addOverlay(overlay);

    // start refresh chain
    startChain(1);

    // event handlers
    map.on('pointermove', displayTooltip);
    map.on('click', showModal);
    $('#networkSelect').on('click', function (e) {
      e.preventDefault();
      console.log();
      var str = $(this).closest('.cdn-details').find('#service_url').val();
      str = str.substring(0, str.length - 4);
      var url = str + '4567/ui';

      window.location.href = url;
    });

    // start update chain
    function startChain(i) {
      if (i === 1) {
        createMarkers(urlsArr);
      } else {
        setTimeout(function () {
          createMarkers(urlsArr);
        }, interval);
      }
    }

    // creating Markers on Map
    function createMarkers(urlArray) {
      var geoData = void 0;
      // loop array with url's
      for (var i = 0; i < urlArray.length; i++) {
        var url = urlArray[i];
        // get data
        $.get(url, function (data) {
          // check if not empty
          if (data) {
            geoData = JSON.parse(data);
          }
        }).done(function () {
          var feature = new ol.Feature({
            service_url: geoData.http.service_url,
            geo: geoData.http.geo,
            ip4: geoData.http.ip4,
            country: geoData.http.geo.country_name,
            geometry: new ol.geom.Point(ol.proj.transform([geoData.http.geo.longitude, geoData.http.geo.latitude], 'EPSG:4326', 'EPSG:3857'))
          });
          // append Marker on map
          feature.setStyle(styleMk);
          sourceFeatures.addFeature(feature);
        });
      }
      // cleare Marker layers
      sourceFeatures.clear();
      startChain(2);
    }

    // show modal on click
    function showModal(evt) {
      var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      if (feature) {
        var info = feature.N.geo.city + ', ' + feature.N.geo.country_name;
        $('#service_url').val(feature.N.service_url);
        $('#modal-network').find('.ntw-country').text(info);
        $('#modal-network').find('.ntw-ip').text(feature.N.ip4);
        $("[data-target='#modal-network']").trigger('click');
      }
    }

    var target = map.getTarget();
    var jTarget = typeof target === "string" ? $("#" + target) : $(target);
    // show tooltip on hover
    function displayTooltip(evt) {
      var feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature;
      });
      tooltip.style.display = feature ? '' : 'none';
      if (feature) {
        var info = feature.N.geo.city + ', ' + feature.N.geo.country_name;
        overlay.setPosition(evt.coordinate);
        $(tooltip).text(info);
        jTarget.css("cursor", 'pointer');
      } else {
        jTarget.css("cursor", '');
      }
    }
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

    $(document).on('mouseup touchend', '#slider-range', function () {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdE5ldHdvcmsuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9yYW5nZS1zbGlkZXIuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DO0FBQ3BDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSw0QkFBUixFLENBQXVDOzs7OztBQ1R2QztBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRCxLQUFoRCxFQUF1RCxHQUF2RCxFQUE0RDs7QUFFeEQsWUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUFFO0FBQVE7O0FBRW5ELFlBQUksVUFBVSxpQkFBZDtBQUNBLFlBQUksZ0JBQWdCLElBQXBCO0FBQ0EsWUFBSSxh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QW9CLE9BQU8sQ0FBUCxDQUE5QyxFQUFqQjtBQUNIO0FBQ0osaUJBTkQ7QUFPQSxvQkFBSSxXQUFXLEtBQWYsRUFBc0I7QUFDbEIsZ0NBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sU0FBUixFQUFtQixPQUFPLE9BQU8sQ0FBUCxJQUFZLEtBQVosR0FBb0IsT0FBTyxDQUFQLENBQTlDLEVBQWpCO0FBQ0g7QUFDSixhQVpELE1BWU87QUFDSCw0QkFBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxTQUFSLEVBQW1CLE9BQU8sT0FBTyxDQUFQLElBQVksS0FBWixHQUFvQixPQUFPLENBQVAsQ0FBOUMsRUFBakI7QUFDSDtBQUNELDhCQUFrQixNQUFsQjtBQUNILFNBakJELEVBaUJHLEdBakJIO0FBa0JILEtBOUJEOztBQW1DQSxNQUFFLFFBQUYsRUFBWSxFQUFaLENBQWUsT0FBZixFQUF3QixtQkFBeEIsRUFBNkMsWUFBVztBQUNwRCxnQkFBUSxRQUFRLENBQWhCO0FBQ0EsMEJBQWtCLE1BQWxCO0FBQ0gsS0FIRDs7QUFLQSxXQUFPO0FBQ0gsZ0JBQVEsa0JBQVc7QUFDZixtQkFBTyxhQUFQO0FBQ0g7QUFIRSxLQUFQO0FBTUgsQ0E1TDBCLEVBQTNCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJyZXF1aXJlKFwiLi9tb2R1bGVzL3NtYXJ0U2VhcmNoLmpzXCIpOyAvLyBNT0RVTEUgRk9SIFNFQVJDSElOR1xyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR0xPQkFMIEVWRU5UU1xyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2ltYWdlQ3JvcC5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU1BR0UgQ1JPUFBFUlxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGUuanNcIik7IC8vIE1PRFVMRSB3aXRoIElOSVQgUFJPRklMRSBQQUdFXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanNcIik7IC8vIE1PRFVMRSB3aXRoIElOSVQgUFJPRklMRSBQQUdFXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvZ2VuZXJhdGVHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHaWdzIGdlbmVyYXRvclxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdEdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdJR1MgUEFHRSBJTklUXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvcmFuZ2Utc2xpZGVyLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBSQU5HRSBTTElERVJcclxucmVxdWlyZShcIi4vbW9kdWxlcy9uZXdHaWdNb2RhbC5qc1wiKTsgLy8gTU9EVUxFIHdpdGggQ1JFQVRFIE5FVyBHSUdcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXROZXR3b3JrLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIE5FVFdPUksgUEFHRVxyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LmdlbmVyYXRlR2lnc01vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICBmdW5jdGlvbiBnZW5lcmF0ZUdpZ3NGcm9tRGF0YShnaWdJRCwgZ2lnT2JqZWN0LCBpc093biwgb25lKSB7XHJcbiAgICAgICBcclxuICAgICAgICBpZiAoY2hlY2tfZ2lnX21hcmtlZF9kZWxldGVkKGdpZ09iamVjdCkpIHsgcmV0dXJuIH1cclxuXHJcbiAgICAgICAgdmFyIGFwaV9jZG4gPSBhcGlfZ2V0X2Nkbl91cmwoKTtcclxuICAgICAgICB2YXIgcHJvZmlsZV9pbWFnZSA9IG51bGw7XHJcbiAgICAgICAgdmFyIG93bmVyX2d1aWQgPSBudWxsO1xyXG4gICAgICAgIHZhciBpbWdfc3JjID0gJyc7XHJcbiAgICAgICAgdmFyIGZ1bGxuYW1lID0gJyc7XHJcbiAgICAgICAgdmFyIGNhdGVnb3J5T2JqID0ge1xyXG4gICAgICAgICAgICBcInNkXCI6IFwiU29mdHdhcmUgRGV2ZWxvcG1lbnRcIixcclxuICAgICAgICAgICAgXCJmYVwiOiBcIkZpbmFuY2UgJiBBY2NvdW50aW5nXCIsXHJcbiAgICAgICAgICAgIFwibWFcIjogXCJNdXNpYyAmIEF1ZGlvXCIsXHJcbiAgICAgICAgICAgIFwiZ2RcIjogXCJHcmFwaGljICYgRGVzaWduXCIsXHJcbiAgICAgICAgICAgIFwidmFcIjogXCJWaWRlbyAmIEFuaW1hdGlvblwiLFxyXG4gICAgICAgICAgICBcInR3XCI6IFwiVGV4dCAmIFdyaXRpbmdcIixcclxuICAgICAgICAgICAgXCJjc1wiOiBcIkNvbnN1bHRpbmcgU2VydmljZXNcIixcclxuICAgICAgICAgICAgXCJvc1wiOiBcIk90aGVyIFNlcnZpY2VzXCJcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciByb3VuZF9wcmljZSA9IE1hdGgucm91bmQoZ2lnT2JqZWN0LnByaWNlICogMTAwMCkgLyAxMDAwO1xyXG4gICAgICAgIHZhciBnaWdEZWxldGVTdHJpbmcgPSAnJztcclxuICAgICAgICBpZiAoaXNPd24pIHtcclxuICAgICAgICAgICAgdmFyIGdpZ0RlbGV0ZVN0cmluZyA9ICc8bGkgY2xhc3M9XCJtZGwtbWVudV9faXRlbSBkZWxldGVcIj5EZWxldGU8L2xpPidcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGRyb3Bkb3duQnV0dG9uID0gJzxidXR0b24gaWQ9XCJEREInICsgZ2lnSUQgKyAnXCIgY2xhc3M9XCJkcm9wZG93bi1naWcgbWRsLWJ1dHRvbiBtZGwtanMtYnV0dG9uIG1kbC1idXR0b24tLWljb24gZHJvcGRvd24tYnV0dG9uIGJ0bi1pbmZvLWVkaXRcIj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+bW9yZV92ZXJ0PC9pPjwvYnV0dG9uPic7XHJcbiAgICAgICAgdmFyIGRyb3Bkb3duVUwgPSAnPHVsIGNsYXNzPVwibWRsLW1lbnUgbWRsLW1lbnUtLWJvdHRvbS1yaWdodCBtZGwtanMtbWVudSBtZGwtanMtcmlwcGxlLWVmZmVjdFwiIGZvcj1cIkREQicgKyBnaWdJRCArICdcIj48bGkgY2xhc3M9XCJtZGwtbWVudV9faXRlbSBqcy1vcGVuLWdpZy1tb2RhbFwiPk9wZW48L2xpPicgKyBnaWdEZWxldGVTdHJpbmcgKyAnPC91bD4nO1xyXG5cclxuICAgICAgICBpZiAoZ2lnT2JqZWN0Lmhhc093blByb3BlcnR5KCdvd25lcl9ndWlkJykpIHtcclxuICAgICAgICAgICAgb3duZXJfZ3VpZCA9IGdpZ09iamVjdC5vd25lcl9ndWlkO1xyXG5cclxuICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICdwcm9maWxlUGljdHVyZScsIGZ1bmN0aW9uKHByb2ZpbGVQaWN0dXJlVVJMKSB7XHJcbiAgICAgICAgICAgICAgICBpbWdfc3JjID0gYXBpX2NkbiArIEpTT04ucGFyc2UocHJvZmlsZVBpY3R1cmVVUkwpICsgJyZ0aHVtYj0xJztcclxuICAgICAgICAgICAgICAgIC8vICQoJyNpbWdhdicgKyBnaWdJRCkuYXR0cignc3JjJywgcF9zcmMpO1xyXG4gICAgICAgICAgICAgICAgZ2V0UHJvZmlsZVZhbHVlKG93bmVyX2d1aWQsICduYW1lJywgZnVuY3Rpb24obmFtZV9qc3RyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWVzX28gPSBKU09OLnBhcnNlKG5hbWVfanN0cik7XHJcbiAgICAgICAgICAgICAgICAgICAgZnVsbG5hbWUgPSBuYW1lc19vLmZpcnN0ICsgXCIgXCIgKyBuYW1lc19vLmxhc3Q7XHJcbiAgICAgICAgICAgICAgICAgICAgLy8gJCgnI25tb3duJyArIGdpZ0lEKS50ZXh0KG5hbWVzX28uZmlyc3QgKyBcIiBcIiArIG5hbWVzX28ubGFzdCk7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ0xheW91dCA9IGA8ZGl2IGNsYXNzPVwidXNlci1jYXJkIGdpZ1wiICBpZD1cIiR7Z2lnSUR9XCIgZGF0YS10b2dnbGU9XCJtb2RhbFwiIGRhdGEtdGFyZ2V0PVwiI2dpZ01vZGFsXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJpbWctY2FyZFwiIHN0eWxlPVwiYmFja2dyb3VuZDogdXJsKCR7YXBpX2NkbiArIGdpZ09iamVjdC5pbWFnZV9oYXNofSZ0aHVtYj0xKSBjZW50ZXIgbm8tcmVwZWF0OyBiYWNrZ3JvdW5kLXNpemU6IGNvdmVyO1wiID5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR7ZHJvcGRvd25CdXR0b259XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duVUx9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2FyZC1sYWJlbFwiPiR7Y2F0ZWdvcnlPYmpbZ2lnT2JqZWN0LmNhdGVnb3J5XX08L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLXByb2ZpbGUtaW1nXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZGl2LWltZy13cmFwXCIgc3R5bGU9XCJiYWNrZ3JvdW5kOiB1cmwoJyR7aW1nX3NyY30nKVwiPjwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1c2VyLW5hbWVcIiBpZD1cIm5tb3duJHtnaWdJRH1cIj4ke2Z1bGxuYW1lfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1c2VyLXJvbGVcIj4ke2NhdGVnb3J5T2JqW2dpZ09iamVjdC5jYXRlZ29yeV19PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1pbmZvXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImluZm9cIj4ke2dpZ09iamVjdC50aXRsZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcmljZVwiPlNUQVJUSU5HIEFUOiA8c3Bhbj48aSBjbGFzcz1cIm1hdGVyaWFsLWljb25zXCI+cG9seW1lcjwvaT4ke3JvdW5kX3ByaWNlfTwvc3Bhbj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xyXG4gICAgICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChvbmUgPT0gdHJ1ZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLnByZXBlbmQoZ2lnTGF5b3V0KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuZ2lncy1jb250YWluZXJcIikuYXBwZW5kKGdpZ0xheW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEhhbmRsZXIudXBncmFkZURvbSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbihpZCwgb2JqLCBpc093biwgb25lKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBnZW5lcmF0ZUdpZ3NGcm9tRGF0YShpZCwgb2JqLCBpc093biwgb25lKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG4iLCJmdW5jdGlvbiBmaWx0ZXJQcm9maWxlQ2FyZHMocXVlcnksICRpbnB1dCkge1xyXG4gIC8qIENIRUNLIEZPUiBRVUVSWSBNQVRDSCBXSVRIIE5BTUUgKi9cclxuICAkKCcucHJvZmlsZS11c2VyLWNhcmQnKS5lYWNoKGZ1bmN0aW9uKGksaXRlbSkge1xyXG4gICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmZpbmQoJy51c2VyLW5hbWUnKS50ZXh0KCkudG9Mb3dlckNhc2UoKTtcclxuICAgIG5hbWUubWF0Y2gocXVlcnkudG9Mb3dlckNhc2UoKSkgPyAkKGl0ZW0pLnJlbW92ZUNsYXNzKCdoaWRkZW4nKSA6ICQoaXRlbSkuYWRkQ2xhc3MoJ2hpZGRlbicpXHJcbiAgfSk7XHJcbiAgLyogQUREIFJFRCBCT1JERVIgVE8gSU5QVVQgSUYgTk8gU0VBUkNIIE1BVENIRUQgKi9cclxuICAkKCcucHJvZmlsZS11c2VyLWNhcmQnKS5sZW5ndGggPT0gJCgnLnByb2ZpbGUtdXNlci1jYXJkLmhpZGRlbicpLmxlbmd0aCA/ICRpbnB1dC5hZGRDbGFzcygnZXJyb3InKSA6ICRpbnB1dC5yZW1vdmVDbGFzcygnZXJyb3InKTtcclxufVxyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuICAvLyBHbG9iYWwgRXZlbnRzXHJcbiAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24oZSkge1xyXG4gICAgICBpZiAoISQoZS50YXJnZXQpLmNsb3Nlc3QoJy5kcm9wZG93bicpLmxlbmd0aCkge1xyXG4gICAgICAgICAgJCgnI3NldHRpbmdzLWRyb3Bkb3duJykucGFyZW50cygnLmRyb3Bkb3duJykucmVtb3ZlQ2xhc3MoJ3Nob3cnKTtcclxuICAgICAgfVxyXG4gIH0pO1xyXG4gIC8vIERyb3Bkb3duIHNob3cgaW4gaGVhZGVyXHJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzZXR0aW5ncy1kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAkKHRoaXMpLnBhcmVudHMoJy5kcm9wZG93bicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgIC8vIC5zaWJsaW5ncygnW2RhdGEtbGFiZWxsZWRieT1zZXR0aW5ncy1kcm9wZG93bl0nKS5cclxuICB9KTtcclxuXHJcbiAgLy8gT1BFTiBHSUcgQklHIE1PREFMIE9OIE1FTlUgY2xpY2tcclxuICAkKCdib2R5JykuZGVsZWdhdGUoJ2xpLmpzLW9wZW4tZ2lnLW1vZGFsJywgJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xyXG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuZ2lnJykudHJpZ2dlcignY2xpY2snKTtcclxuICB9KTtcclxuXHJcbiAgLyogRklMVEVSIFBST0ZJTEUgQ0FSRFMgKi9cclxuICBpZiAoICQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZXMtcGFnZScpICkge1xyXG4gICAgLyogRklMVEVSIFBST0ZJTEUgQ0FSRFMgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKCdpbnB1dCcsICcucHJvZmlsZXMtcGFnZSAjc2VhcmNoLWhlYWRlcicsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBmaWx0ZXJQcm9maWxlQ2FyZHMoICQodGhpcykudmFsKCksICQodGhpcykgKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qIE9QRU4gSU5URVJOQUwgUFJPRklMRSBQQUdFICovXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcucHJvZmlsZS11c2VyLWNhcmQnLGZ1bmN0aW9uKCl7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdpZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyBSRURJUkVDVCBUTyBQUk9GSUxFIFBBR0UgT04gQ0xJQ0sgT04gVVNFUlMgUFJPRklMRVxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc09wZW5HaWdPd25lclByb2ZpbGUnLGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3VpL3Byb2ZpbGUvIycgKyAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcclxuICB9KTtcclxufSlcclxuIiwid2luZG93LiR1cGxvYWRDcm9wID0gJChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmNyb3BwaWUoe1xyXG4gIHZpZXdwb3J0OiB7XHJcbiAgICB3aWR0aDogNDUwLFxyXG4gICAgaGVpZ2h0OiAxNTBcclxuICB9LFxyXG4gIGVuYWJsZVpvb206IHRydWUsXHJcbiAgZW5hYmxlUmVzaXplOiB0cnVlXHJcbn0pO1xyXG5cclxud2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZSA9ICQoXCIjY3JvcHBlci13cmFwLXByb2ZpbGVcIikuY3JvcHBpZSh7XHJcbiAgdmlld3BvcnQ6IHtcclxuICAgIHdpZHRoOiAxNTAsXHJcbiAgICBoZWlnaHQ6IDE1MCxcclxuICAgIHR5cGU6IFwiY2lyY2xlXCJcclxuICB9LFxyXG4gIGVuYWJsZVpvb206IHRydWUsXHJcbiAgZW5hYmxlUmVzaXplOiB0cnVlXHJcbn0pO1xyXG5cclxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKXtcclxuICAgIC8qIEJVVFRPTiBJTklUIENMSUNLIE9OIElOUFVUIFRZUEUgRklMRSAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFVwbG9hZCcsZnVuY3Rpb24oKXtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuY29udGVudCcpO1xyXG4gICAgICAkY29udGVudC5maW5kKCdpbnB1dCNpbnB1dC1pbWFnZS1naWcnKS5jbGljaygpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5qc0Nyb3BVcGxvYWRQcm9maWxlXCIsIGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoXCIuY29udGVudFwiKTtcclxuICAgICAgJGNvbnRlbnQuZmluZChcImlucHV0I2lucHV0LWltYWdlLXByb2ZpbGVcIikuY2xpY2soKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8qIEJVVFRPTiBGT1IgR0VUVElORyBDUk9QIFJFU1VsdCAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFJlc3VsdCcsZnVuY3Rpb24oZSl7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KCcuY29udGVudCcpO1xyXG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3AuY3JvcHBpZSgncmVzdWx0JywnYmFzZTY0JykudGhlbiggZnVuY3Rpb24oYmFzZTY0KSB7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgnaW1nI2lucHV0LWltYWdlLWdpZycpLmF0dHIoJ3NyYycsIGJhc2U2NCkuc2hvdyg1MDApLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xyXG4gICAgICAgICRjb250ZW50LmZpbmQoJChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpKS5zaG93KDUwMCk7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5zaG93KCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3AuY3JvcHBpZSgncmVzdWx0JywnYmxvYicpLnRoZW4oIGZ1bmN0aW9uKGJsb2IpIHtcclxuICAgICAgICB3aW5kb3cuJHVwbG9hZENyb3BCbG9iID0gYmxvYjtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuaGlkZSg0MDApO1xyXG4gICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuaGlkZSgpO1xyXG4gICAgICB9KTtcclxuICAgIH0pXHJcblxyXG4gICAgJChkb2N1bWVudCkub24oXCJjbGlja1wiLCBcIi5qc0Nyb3BSZXN1bHRQcm9maWxlXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoXCIuY29udGVudFwiKTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZS5jcm9wcGllKFwicmVzdWx0XCIsIFwiYmFzZTY0XCIpLnRoZW4oZnVuY3Rpb24oYmFzZTY0KSB7XHJcbiAgICAgICAgICAkY29udGVudC5maW5kKFwic3BhbiNpbnB1dC1pbWFnZS1wcm9maWxlXCIpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgJ3VybCgnKyBiYXNlNjQgKycpJykuc2hvdyg1MDApLnJlbW92ZUNsYXNzKFwiZW1wdHlcIik7XHJcbiAgICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLXByb2ZpbGVcIikpLnNob3coNTAwKTtcclxuICAgICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuc2hvdygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3BQcm9maWxlLmNyb3BwaWUoXCJyZXN1bHRcIiwgXCJibG9iXCIpLnRoZW4oZnVuY3Rpb24oYmxvYikge1xyXG4gICAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcEJsb2JQcm9maWxlID0gYmxvYjtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLXByb2ZpbGVcIikpLmhpZGUoNDAwKTtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLmhpZGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIndpbmRvdy5jcmVhdGVOZXdHaWcgPSAoZnVuY3Rpb24oKSB7XHJcbiAgICAkKFwiI2FkZC1naWdcIikuZmluZChcIiNuZXdHaWdleHBpcmVcIikuZGF0ZXBpY2tlcigpO1xyXG4gICAgJChcIiNhZGQtZ2lnXCIpLm9uKFwiaGlkZGVuLmJzLm1vZGFsXCIsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICAkKHRoaXMpLmZpbmQoXCIuZ2lnLXRhZ3NcIikuZmluZChcIi5kZWxldGVcIikuY2xpY2soKTtcclxuICAgICAgICAkKHRoaXMpXHJcbiAgICAgICAgICAgIC5maW5kKFwiaW1nI2lucHV0LWltYWdlLWdpZ1wiKS5oaWRlKCkuYWRkQ2xhc3MoXCJlbXB0eVwiKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZChcIi5pbWctbGFiZWxcIikuc2hvdygpLnJlbW92ZUNsYXNzKFwiYWN0aXZlXCIpLnRleHQoJycpLmVuZCgpXHJcbiAgICAgICAgICAgIC5maW5kKFwiI2Nyb3BwZXItd3JhcC1naWdcIikuaGlkZSgpLmVuZCgpXHJcbiAgICAgICAgICAgIC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLmhpZGUoKTtcclxuICAgICAgICAkKHRoaXMpXHJcbiAgICAgICAgICAgIC5maW5kKFwiaW5wdXQsdGV4dGFyZWEsc2VsZWN0XCIpLnZhbChcIlwiKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZChcIi5yYW5nZS1zbGlkZXJcIilcclxuICAgICAgICAgICAgLmZpbmQoXCJpbnB1dFwiKS52YWwoXCIwXCIpLmVuZCgpXHJcbiAgICAgICAgICAgIC5maW5kKFwiLnJhbmdlLXNsaWRlcl9fdmFsdWVcIikudGV4dChcIjBcIik7XHJcbiAgICAgICAgJCh0aGlzKS5maW5kKFwiI25ldy1naWctY2F0ZWdvcnlcIikucGFyZW50KCkuZmluZChcIi50ZXh0XCIpLnRleHQoXCJBbGwgQ2F0ZWdvcmllc1wiKTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBjYWxjdWxhdGVkTG9jaztcclxuICAgICQoJy5qc0NhbGN1bGF0ZWRMb2NrJykub24oJ2lucHV0JywgZnVuY3Rpb24gKCkge1xyXG4gICAgICB2YXIgY29zdCA9ICQoJyNyZXB1dGF0aW9uQ29zdCcpLnZhbCgpLFxyXG4gICAgICAgICAgYW1vdW50ID0gJCgnI2Ftb3VudCcpLnZhbCgpLFxyXG4gICAgICAgICAgJGNhbGN1bGF0ZWRMb2NrID0gJCgnI2NhbGN1bGF0ZWRMb2NrJyksXHJcbiAgICAgICAgICBjYWxjdWxhdGVkTG9jayA9IGNhbGNMb2NrKGNvc3QsIGFtb3VudClcclxuICAgICAgICAgICRjYWxjdWxhdGVkTG9jay50ZXh0KGNhbGN1bGF0ZWRMb2NrICsgJyBFUlQnKTtcclxuICAgIH0pXHJcblxyXG59KSgpO1xyXG5cclxuZnVuY3Rpb24gY2FsY0xvY2sgKGNvc3QsIGFtb3VudCkge1xyXG4gIHJldHVybiAoY29zdCAqIGFtb3VudCkgLyAxMDA7XHJcbn1cclxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5naWdzUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcclxuXHJcbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcclxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRHaWdzKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5naWdzJykuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgIGdldExpc3RPZkdpZ3MoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIG9uaW5pdEdpZ3M6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5pdEdpZ3MoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG59KSgpO1xyXG5cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygnZ2lncy1wYWdlJykpIHtcclxuICAgICAgICBnaWdzUGFnZU1vZHVsZS5vbmluaXRHaWdzKCk7XHJcbiAgICB9XHJcbn0pOyIsIi8vIE5ldHdvcmtcclxud2luZG93Lm5ldHdvcmtQYWdlTW9kdWxlID0gKGZ1bmN0aW9uICgpIHtcclxuICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgJCgnLm5hdi10YWJzIC5uZXR3b3JrJykuYWRkQ2xhc3MoJ2FjdGl2ZScpXHJcbiAgLy8gYXJyYXkgb2YgQ0ROJ3NcclxuICBjb25zdCB1cmxzQXJyID0gW1xyXG4gICAgJ2h0dHA6Ly8xNTkuODkuMTY1LjkxOjU2NzgvYXBpL2Nkbi92MS9pbmZvJyxcclxuICAgICdodHRwOi8vMTU5Ljg5LjExMi4xNzE6NTY3OC9hcGkvY2RuL3YxL2luZm8nLFxyXG4gICAgJ2h0dHA6Ly8yMDcuMTU0LjIzOC43OjU2NzgvYXBpL2Nkbi92MS9pbmZvJ1xyXG4gIF1cclxuICAvLyB1cGRhdGUgZGF0YSBpbnRlcnZhbFxyXG4gIGNvbnN0IGludGVydmFsID0gMTAwMCAqIDYwICogNVxyXG4gIGZ1bmN0aW9uIGluaXROZXR3b3JrICgpIHtcclxuICAgIC8vICBNYXAgbGF5ZXJzXHJcbiAgICBjb25zdCBsYXllck1hcCA9IG5ldyBvbC5sYXllci5UaWxlKHtzb3VyY2U6IG5ldyBvbC5zb3VyY2UuT1NNKCl9KVxyXG4gICAgY29uc3Qgc291cmNlRmVhdHVyZXMgPSBuZXcgb2wuc291cmNlLlZlY3RvcigpXHJcbiAgICBjb25zdCBsYXllckZlYXR1cmVzID0gbmV3IG9sLmxheWVyLlZlY3Rvcih7c291cmNlOiBzb3VyY2VGZWF0dXJlc30pXHJcbiAgICAvLyBjcmVhdGUgbmV3IE1hcFxyXG4gICAgY29uc3QgbWFwID0gbmV3IG9sLk1hcCh7XHJcbiAgICAgIHRhcmdldDogJ21hcCcsXHJcbiAgICAgIGxheWVyczogW2xheWVyTWFwLCBsYXllckZlYXR1cmVzXSxcclxuICAgICAgdmlldzogbmV3IG9sLlZpZXcoeyBjZW50ZXI6IG9sLnByb2oudHJhbnNmb3JtKFsyLjQxLCAxNS44Ml0sICdFUFNHOjQzMjYnLCAnRVBTRzozODU3JyksIHpvb206IDMgfSlcclxuICAgIH0pXHJcbiAgICAvLyBNYXJrZXIgc3R5bGVcclxuICAgIGNvbnN0IHN0eWxlTWsgPSBbXHJcbiAgICAgIG5ldyBvbC5zdHlsZS5TdHlsZSh7XHJcbiAgICAgICAgaW1hZ2U6IG5ldyBvbC5zdHlsZS5JY29uKCh7XHJcbiAgICAgICAgICBhbmNob3I6IFswLjUsIDFdLFxyXG4gICAgICAgICAgc2NhbGU6IDEsXHJcbiAgICAgICAgICBzcmM6ICdodHRwOi8vaW1hZ2UuaWJiLmNvL2ZMRWFuYy9tYXBzX2FuZF9mbGFnc18xLnBuZydcclxuICAgICAgICB9KSksXHJcbiAgICAgICAgekluZGV4OiA1XHJcbiAgICAgIH0pXHJcbiAgICBdXHJcbiAgICAvLyB0b29sdGlwc1xyXG4gICAgY29uc3QgdG9vbHRpcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0b29sdGlwJylcclxuICAgIGNvbnN0IG92ZXJsYXkgPSBuZXcgb2wuT3ZlcmxheSh7XHJcbiAgICAgIGVsZW1lbnQ6IHRvb2x0aXAsXHJcbiAgICAgIG9mZnNldDogWzEwLCAwXSxcclxuICAgICAgcG9zaXRpb25pbmc6ICdib3R0b20tbGVmdCdcclxuICAgIH0pXHJcbiAgICBtYXAuYWRkT3ZlcmxheShvdmVybGF5KVxyXG5cclxuICAgIC8vIHN0YXJ0IHJlZnJlc2ggY2hhaW5cclxuICAgIHN0YXJ0Q2hhaW4oMSk7XHJcblxyXG4gICAgLy8gZXZlbnQgaGFuZGxlcnNcclxuICAgIG1hcC5vbigncG9pbnRlcm1vdmUnLCBkaXNwbGF5VG9vbHRpcClcclxuICAgIG1hcC5vbignY2xpY2snLCBzaG93TW9kYWwpXHJcbiAgICAkKCcjbmV0d29ya1NlbGVjdCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKVxyXG4gICAgICBjb25zb2xlLmxvZygpXHJcbiAgICAgIGxldCBzdHIgPSAkKHRoaXMpLmNsb3Nlc3QoJy5jZG4tZGV0YWlscycpLmZpbmQoJyNzZXJ2aWNlX3VybCcpLnZhbCgpXHJcbiAgICAgIHN0ciA9IHN0ci5zdWJzdHJpbmcoMCwgc3RyLmxlbmd0aCAtIDQpXHJcbiAgICAgIGxldCB1cmwgPSBzdHIgKyAnNDU2Ny91aSdcclxuXHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXJsXHJcbiAgICB9KVxyXG5cclxuICAgIC8vIHN0YXJ0IHVwZGF0ZSBjaGFpblxyXG4gICAgZnVuY3Rpb24gc3RhcnRDaGFpbiAoaSkge1xyXG4gICAgICBpZiAoaSA9PT0gMSkge1xyXG4gICAgICAgIGNyZWF0ZU1hcmtlcnModXJsc0FycilcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcclxuICAgICAgICAgIGNyZWF0ZU1hcmtlcnModXJsc0FycilcclxuICAgICAgICB9LCBpbnRlcnZhbClcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGNyZWF0aW5nIE1hcmtlcnMgb24gTWFwXHJcbiAgICBmdW5jdGlvbiBjcmVhdGVNYXJrZXJzICh1cmxBcnJheSkge1xyXG4gICAgICBsZXQgZ2VvRGF0YVxyXG4gICAgICAvLyBsb29wIGFycmF5IHdpdGggdXJsJ3NcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB1cmxBcnJheS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCB1cmwgPSB1cmxBcnJheVtpXVxyXG4gICAgICAgIC8vIGdldCBkYXRhXHJcbiAgICAgICAgJC5nZXQodXJsLCBmdW5jdGlvbiAoZGF0YSkge1xyXG4gICAgICAgICAgLy8gY2hlY2sgaWYgbm90IGVtcHR5XHJcbiAgICAgICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgICAgICBnZW9EYXRhID0gSlNPTi5wYXJzZShkYXRhKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgbGV0IGZlYXR1cmUgPSBuZXcgb2wuRmVhdHVyZSh7XHJcbiAgICAgICAgICAgIHNlcnZpY2VfdXJsOiBnZW9EYXRhLmh0dHAuc2VydmljZV91cmwsXHJcbiAgICAgICAgICAgIGdlbzogZ2VvRGF0YS5odHRwLmdlbyxcclxuICAgICAgICAgICAgaXA0OiBnZW9EYXRhLmh0dHAuaXA0LFxyXG4gICAgICAgICAgICBjb3VudHJ5OiBnZW9EYXRhLmh0dHAuZ2VvLmNvdW50cnlfbmFtZSxcclxuICAgICAgICAgICAgZ2VvbWV0cnk6IG5ldyBvbC5nZW9tLlBvaW50KG9sLnByb2oudHJhbnNmb3JtKFtnZW9EYXRhLmh0dHAuZ2VvLmxvbmdpdHVkZSwgZ2VvRGF0YS5odHRwLmdlby5sYXRpdHVkZV0sICdFUFNHOjQzMjYnLCAnRVBTRzozODU3JykpXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLy8gYXBwZW5kIE1hcmtlciBvbiBtYXBcclxuICAgICAgICAgIGZlYXR1cmUuc2V0U3R5bGUoc3R5bGVNaylcclxuICAgICAgICAgIHNvdXJjZUZlYXR1cmVzLmFkZEZlYXR1cmUoZmVhdHVyZSlcclxuICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgIC8vIGNsZWFyZSBNYXJrZXIgbGF5ZXJzXHJcbiAgICAgIHNvdXJjZUZlYXR1cmVzLmNsZWFyKClcclxuICAgICAgc3RhcnRDaGFpbigyKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHNob3cgbW9kYWwgb24gY2xpY2tcclxuICAgIGZ1bmN0aW9uIHNob3dNb2RhbCAoZXZ0KSB7XHJcbiAgICAgIGxldCBmZWF0dXJlID0gbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChldnQucGl4ZWwsIGZ1bmN0aW9uIChmZWF0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZlYXR1cmVcclxuICAgICAgfSlcclxuICAgICAgaWYgKGZlYXR1cmUpIHtcclxuICAgICAgICBsZXQgaW5mbyA9IGZlYXR1cmUuTi5nZW8uY2l0eSArICcsICcgKyBmZWF0dXJlLk4uZ2VvLmNvdW50cnlfbmFtZVxyXG4gICAgICAgICQoJyNzZXJ2aWNlX3VybCcpLnZhbChmZWF0dXJlLk4uc2VydmljZV91cmwpXHJcbiAgICAgICAgJCgnI21vZGFsLW5ldHdvcmsnKS5maW5kKCcubnR3LWNvdW50cnknKS50ZXh0KGluZm8pXHJcbiAgICAgICAgJCgnI21vZGFsLW5ldHdvcmsnKS5maW5kKCcubnR3LWlwJykudGV4dChmZWF0dXJlLk4uaXA0KVxyXG4gICAgICAgICQoXCJbZGF0YS10YXJnZXQ9JyNtb2RhbC1uZXR3b3JrJ11cIikudHJpZ2dlcignY2xpY2snKVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHRhcmdldCA9IG1hcC5nZXRUYXJnZXQoKVxyXG4gICAgbGV0IGpUYXJnZXQgPSB0eXBlb2YgdGFyZ2V0ID09PSBcInN0cmluZ1wiID8gJChcIiNcIit0YXJnZXQpIDogJCh0YXJnZXQpXHJcbiAgICAvLyBzaG93IHRvb2x0aXAgb24gaG92ZXJcclxuICAgIGZ1bmN0aW9uIGRpc3BsYXlUb29sdGlwIChldnQpIHtcclxuICAgICAgbGV0IGZlYXR1cmUgPSBtYXAuZm9yRWFjaEZlYXR1cmVBdFBpeGVsKGV2dC5waXhlbCwgZnVuY3Rpb24gKGZlYXR1cmUpIHtcclxuICAgICAgICByZXR1cm4gZmVhdHVyZVxyXG4gICAgICB9KVxyXG4gICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSBmZWF0dXJlID8gJycgOiAnbm9uZSdcclxuICAgICAgaWYgKGZlYXR1cmUpIHtcclxuICAgICAgICBsZXQgaW5mbyA9IGZlYXR1cmUuTi5nZW8uY2l0eSArICcsICcgKyBmZWF0dXJlLk4uZ2VvLmNvdW50cnlfbmFtZVxyXG4gICAgICAgIG92ZXJsYXkuc2V0UG9zaXRpb24oZXZ0LmNvb3JkaW5hdGUpXHJcbiAgICAgICAgJCh0b29sdGlwKS50ZXh0KGluZm8pXHJcbiAgICAgICAgalRhcmdldC5jc3MoXCJjdXJzb3JcIiwgJ3BvaW50ZXInKVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGpUYXJnZXQuY3NzKFwiY3Vyc29yXCIsICcnKVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIG9uaW5pdE5ldHdvcms6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgcmV0dXJuIGluaXROZXR3b3JrKClcclxuICAgIH1cclxuICB9XHJcblxyXG59KSgpXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCduZXR3b3JrLXBhZ2UnKSkge1xyXG4gICAgbmV0d29ya1BhZ2VNb2R1bGUub25pbml0TmV0d29yaygpXHJcbiAgfVxyXG59KVxyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnByb2ZpbGVQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxyXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGUoKSB7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgLyogUkVTRVQgQU5EIEdFVCBORVcgUFJPRklMRSBJRCBIQVNIICovXHJcbiAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gd2luZG93LmxvY2F0aW9uLmhhc2guc2xpY2UoMSk7XHJcbiAgICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoKTtcclxuICAgICAgICAgICAgZ2V0R2lncyh3aW5kb3cucHJvZmlsZUlEKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcucmVkZXNpZ25lZC1naWctbW9kYWwnKS5hZGRDbGFzcygnbm8tYnV0dG9uLW9yZGVyJyk7XHJcbiAgICAgICAgICAgICQoJy5lZGl0QnRuUHJvZmlsZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgZ2V0Tm9kZURhdGEoZnVuY3Rpb24obm9kZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShub2RlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gZGF0YS5ndWlkO1xyXG4gICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVQcm9maWxlKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRHaWdzKGRhdGEuZ3VpZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0R2lncyhndWlkKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZ3VpZCk7XHJcbiAgICAgICAgZ2V0UHJvZmlsZUdpZ3MoZ3VpZCwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcHJvZmlsZV9naWdzID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9maWxlX2dpZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBwcm9maWxlX2dpZ3NbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgaGs6IHByb2ZpbGVfZ2lnc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc19kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ19vID0gSlNPTi5wYXJzZShqc19kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlR2lnc01vZHVsZS5nZW5lcmF0ZSh0aGlzLmhrLCBnaWdfbywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbmRlck9uZUdpZyhnaWdpZCwgb25lKSB7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBnaWdpZCxcclxuICAgICAgICAgICAgaGs6IGdpZ2lkLFxyXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdfbyA9IEpTT04ucGFyc2UoanNfZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vLCB0cnVlLCBvbmUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRVJSJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbmluaXQ6IGluaXRQcm9maWxlLFxyXG4gICAgICAgIGdldEFsbEdpZ3M6IGdldEdpZ3MsXHJcbiAgICAgICAgcmVuZGVyT25lR2lnOiByZW5kZXJPbmVHaWdcclxuICAgIH1cclxufSkoKTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGUtcGFnZScpKSB7XHJcbiAgICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XHJcbiAgICB9XHJcbn0pOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxyXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGVzKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5wcm9maWxlcycpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzTG9hZE1vcmVQcm9maWxlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxpbWl0ID0gbGltaXQgKyA5O1xyXG4gICAgICAgIG1haW5fcHJvZmlsZV9jYXJkcygpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25pbml0cHJvZmlsZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5pdFByb2ZpbGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSkge1xyXG4gICAgICAgIHByb2ZpbGVzUGFnZU1vZHVsZS5vbmluaXRwcm9maWxlcygpO1xyXG4gICAgfVxyXG59KTtcclxuIiwid2luZG93Lm5ld0dpZ1JhbmdlU2xpZGVyID0gKGZ1bmN0aW9uKCkge1xyXG5cdHZhciByYW5nZVNsaWRlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNsaWRlciA9ICQoXCIucmFuZ2Utc2xpZGVyXCIpLFxyXG5cdFx0XHRyYW5nZSA9ICQoXCIucmFuZ2Utc2xpZGVyX19yYW5nZVwiKSxcclxuXHRcdFx0dmFsdWUgPSAkKFwiLnJhbmdlLXNsaWRlcl9fdmFsdWVcIik7XHJcblxyXG5cdFx0c2xpZGVyLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhbHVlLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHZhbHVlID0gJCh0aGlzKVxyXG5cdFx0XHRcdFx0LnByZXYoKVxyXG5cdFx0XHRcdFx0LmF0dHIoXCJ2YWx1ZVwiKTtcclxuXHRcdFx0XHQkKHRoaXMpLmh0bWwodmFsdWUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJhbmdlLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JCh0aGlzKVxyXG5cdFx0XHRcdFx0Lm5leHQodmFsdWUpXHJcblx0XHRcdFx0XHQuaHRtbCh0aGlzLnZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cclxuXHRyYW5nZVNsaWRlcigpO1xyXG59KSgpO1xyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnNtYXJ0U2VhcmNoTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgU21hcnQgU2VhcmNoXHJcblxyXG4gICAgdmFyIHNlYXJjaEFycmF5ID0gbmV3IEFycmF5KCk7XHJcbiAgICB2YXIga2V5dXBUaW1lb3V0ID0gbnVsbDtcclxuICAgIHZhciBkYXRhTGVuZ3RoID0gMFxyXG5cclxuICAgIHZhciBzZWFyY2hBID0gJyc7XHJcblxyXG4gICAgZnVuY3Rpb24gc21hcnRTZWFyY2goKSB7XHJcbiAgICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xyXG4gICAgICAgIC8vIGJ1aWxkIHVybCBmb3Igc2VhcmNoaW5nXHJcbiAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkLmVhY2goc2VhcmNoQXJyYXksIGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWFyY2hRID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnYWxsJztcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcgJiYgaXRlbS52YWx1ZSA9PSAnJyAmJiBzZWFyY2hBcnJheS5sZW5ndGggIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0YWdzJyAmJiBpdGVtLnZhbHVlID09ICdzZWxlY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnY2F0ZWdvcnknICYmIGl0ZW0udmFsdWUgPT0gJ2FsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScgJiYgc2VhcmNoQXJyYXkubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hRICs9ICdhbGwmJyArIGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJyYnICsgaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gc2VhcmNoUTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogdXJsICsgJyZsaW1pdD0xMDAwJyxcclxuICAgICAgICAgICAgcXJ5OiBzZWFyY2hBLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PSAnbnVsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoeyByZXN1bHQ6IGBObyByZXN1bHRzIGZvciB0aGlzIHNlYXJjaGAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBldmVudF9vbl9zZWFyY2hfZ2lnX2RhdGEoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZWFyY2ggRXZlbnRzXHJcblxyXG4gICAgLy8gU3VibWl0IHNlYXJjaCBmb3IgdGV4dCBmaWVsZFxyXG4gICAgJChkb2N1bWVudCkub24oJ2tleXVwJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUubGVuZ3RoIDwgMiAmJiB0aGlzLnZhbHVlLmxlbmd0aCA+IDApIHJldHVybjtcclxuICAgICAgICBsaW1pdCA9IDk7XHJcbiAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICBkZWxheShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIG91dHB1dFN0cmluZyA9ICQoZS50YXJnZXQpLnZhbCgpLnNwbGl0KFwiIFwiKS5qb2luKFwiJTIwXCIpO1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRleHQgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWFyY2hBcnJheSk7XHJcbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdWJtaXQgc2VhcmNoIGZvciBkcm9wZG93biBleHBlcnRpc2VcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5kcm9wZG93bignZ2V0IHZhbHVlJyk7XHJcbiAgICAgICAgbGltaXQgPSA5O1xyXG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGFncycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdjYXRlZ29yeScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAnY2F0ZWdvcnknLCB2YWx1ZTogZWwgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ2NhdGVnb3J5JywgdmFsdWU6IGVsIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgICAgICAgaWYgKGVsICE9ICdhbGwnKSBsb2FkX3RhZ3NfcGVyX2RvbWFpbihlbCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI3NraWxscy10YWdzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5kcm9wZG93bignZ2V0IHZhbHVlJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coZWwpO1xyXG4gICAgICAgIGlmIChlbCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgbGltaXQgPSA5O1xyXG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSBlbC5qb2luKFwiJTIwXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvdXRwdXRTdHJpbmcpXHJcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YWdzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFncyA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCB0b3VjaGVuZCcsICcjc2xpZGVyLXJhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlcyA9ICQodGhpcykuc2xpZGVyKFwidmFsdWVzXCIpO1xyXG4gICAgICAgIGlmICh2YWx1ZXNbMF0gPT0gMCAmJiB2YWx1ZXNbMV0gPT0gMjAwMCkge1xyXG4gICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbWl0ID0gOTtcclxuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcTFyYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdxMXJhbmdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxMXJhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3ExcmFuZ2UnLCB2YWx1ZTogdmFsdWVzWzBdICsgJyUyMCcgKyB2YWx1ZXNbMV0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocTFyYW5nZSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qc0xvYWRNb3JlU2VhcmNoJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGltaXQgPSBsaW1pdCArIDk7XHJcbiAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNlYXJjaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzbWFydFNlYXJjaCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7Il19
