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
  // update data interval
  var interval = 1000 * 60 * 5;
  function initNetwork() {
    // array of CDN's
    var listData = void 0;
    var urlsArr = [];
    $.get('http://159.65.56.140:4567/api/v1/dht/cdn-list', function (data) {
      // check if not empty
      if (data) {
        listData = JSON.parse(data);
      }
    }).done(function () {
      for (var i = 0; i < listData.length; i++) {
        var apiList = listData[i] + '/api/cdn/v1/info';
        urlsArr.push(apiList);
      }
      // start refresh chain
      startChain(1);
    });
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
    $('#modal-network').on('hide.bs.modal', function () {
      $('#peer-list').html('');
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
        var peerList = feature.N.service_url + '/api/v1/dht/peers';
        console.log(peerList);
        var peerData = void 0;
        $.get(peerList, function (data) {
          // check if not empty
          if (data) {
            peerData = JSON.parse(data);
          }
        }).done(function () {
          console.log(peerData);
          for (var peer in peerData) {
            var img_src;
            var block;
            console.log(peerData[peer].profile.profilePicture);
            if (!peerData[peer].profile.is_cdn) {
              img_src = feature.N.ip4 + ':5678/api/cdn/v1/resource?hkey=' + peerData[peer].profile.profilePicture + '&thumb=1';
              block = '<div><img src="' + img_src + '"/>Test test</div>';
              $('#peer-list').append(block);
            } else {
              block = '<div><img src="' + img_src + '"/>Test test</div>';
              $('#peer-list').append(block);
            }
          }
        });

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdE5ldHdvcmsuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9yYW5nZS1zbGlkZXIuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DO0FBQ3BDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSw0QkFBUixFLENBQXVDOzs7OztBQ1R2QztBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRCxLQUFoRCxFQUF1RCxHQUF2RCxFQUE0RDs7QUFFeEQsWUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUFFO0FBQVE7O0FBRW5ELFlBQUksVUFBVSxpQkFBZDtBQUNBLFlBQUksZ0JBQWdCLElBQXBCO0FBQ0EsWUFBSSxh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QUFqQixFQUE0QjtBQUN4QixrQ0FBVSxJQUFWO0FBQ0Esb0NBQVksTUFBWixDQUFtQixZQUFZLE9BQVosQ0FBb0IsSUFBcEIsQ0FBbkIsRUFBOEMsQ0FBOUM7QUFDQSxvQ0FBWSxJQUFaLENBQWlCLEVBQUUsTUFBTSxTQUFSLEVBQW1CLE9BQU8sT0FBTyxDQUFQLElBQVksS0FBWixHQUFvQixPQUFPLENBQVAsQ0FBOUMsRUFBakI7QUFDSDtBQUNKLGlCQU5EO0FBT0Esb0JBQUksV0FBVyxLQUFmLEVBQXNCO0FBQ2xCLGdDQUFZLElBQVosQ0FBaUIsRUFBRSxNQUFNLFNBQVIsRUFBbUIsT0FBTyxPQUFPLENBQVAsSUFBWSxLQUFaLEdBQW9CLE9BQU8sQ0FBUCxDQUE5QyxFQUFqQjtBQUNIO0FBQ0osYUFaRCxNQVlPO0FBQ0gsNEJBQVksSUFBWixDQUFpQixFQUFFLE1BQU0sU0FBUixFQUFtQixPQUFPLE9BQU8sQ0FBUCxJQUFZLEtBQVosR0FBb0IsT0FBTyxDQUFQLENBQTlDLEVBQWpCO0FBQ0g7QUFDRCw4QkFBa0IsTUFBbEI7QUFDSCxTQWpCRCxFQWlCRyxHQWpCSDtBQWtCSCxLQTlCRDs7QUFtQ0EsTUFBRSxRQUFGLEVBQVksRUFBWixDQUFlLE9BQWYsRUFBd0IsbUJBQXhCLEVBQTZDLFlBQVc7QUFDcEQsZ0JBQVEsUUFBUSxDQUFoQjtBQUNBLDBCQUFrQixNQUFsQjtBQUNILEtBSEQ7O0FBS0EsV0FBTztBQUNILGdCQUFRLGtCQUFXO0FBQ2YsbUJBQU8sYUFBUDtBQUNIO0FBSEUsS0FBUDtBQU1ILENBNUwwQixFQUEzQiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9cmV0dXJuIGV9KSgpIiwicmVxdWlyZShcIi4vbW9kdWxlcy9zbWFydFNlYXJjaC5qc1wiKTsgLy8gTU9EVUxFIEZPUiBTRUFSQ0hJTkdcclxucmVxdWlyZShcIi4vbW9kdWxlcy9nbG9iYWxFdmVudHMuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdMT0JBTCBFVkVOVFNcclxucmVxdWlyZShcIi4vbW9kdWxlcy9pbWFnZUNyb3AuanNcIik7IC8vIE1PRFVMRSB3aXRoIElNQUdFIENST1BQRVJcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGVzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL2dlbmVyYXRlR2lncy5qc1wiKTsgLy8gTU9EVUxFIHdpdGggR2lncyBnZW5lcmF0b3JcclxucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXRHaWdzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBHSUdTIFBBR0UgSU5JVFxyXG5yZXF1aXJlKFwiLi9tb2R1bGVzL3JhbmdlLXNsaWRlci5qc1wiKTsgLy8gTU9EVUxFIHdpdGggUkFOR0UgU0xJREVSXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvbmV3R2lnTW9kYWwuanNcIik7IC8vIE1PRFVMRSB3aXRoIENSRUFURSBORVcgR0lHXHJcbnJlcXVpcmUoXCIuL21vZHVsZXMvb25Jbml0TmV0d29yay5qc1wiKTsgLy8gTU9EVUxFIHdpdGggSU5JVCBORVRXT1JLIFBBR0VcclxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXHJcbndpbmRvdy5nZW5lcmF0ZUdpZ3NNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVHaWdzRnJvbURhdGEoZ2lnSUQsIGdpZ09iamVjdCwgaXNPd24sIG9uZSkge1xyXG4gICAgICAgXHJcbiAgICAgICAgaWYgKGNoZWNrX2dpZ19tYXJrZWRfZGVsZXRlZChnaWdPYmplY3QpKSB7IHJldHVybiB9XHJcblxyXG4gICAgICAgIHZhciBhcGlfY2RuID0gYXBpX2dldF9jZG5fdXJsKCk7XHJcbiAgICAgICAgdmFyIHByb2ZpbGVfaW1hZ2UgPSBudWxsO1xyXG4gICAgICAgIHZhciBvd25lcl9ndWlkID0gbnVsbDtcclxuICAgICAgICB2YXIgaW1nX3NyYyA9ICcnO1xyXG4gICAgICAgIHZhciBmdWxsbmFtZSA9ICcnO1xyXG4gICAgICAgIHZhciBjYXRlZ29yeU9iaiA9IHtcclxuICAgICAgICAgICAgXCJzZFwiOiBcIlNvZnR3YXJlIERldmVsb3BtZW50XCIsXHJcbiAgICAgICAgICAgIFwiZmFcIjogXCJGaW5hbmNlICYgQWNjb3VudGluZ1wiLFxyXG4gICAgICAgICAgICBcIm1hXCI6IFwiTXVzaWMgJiBBdWRpb1wiLFxyXG4gICAgICAgICAgICBcImdkXCI6IFwiR3JhcGhpYyAmIERlc2lnblwiLFxyXG4gICAgICAgICAgICBcInZhXCI6IFwiVmlkZW8gJiBBbmltYXRpb25cIixcclxuICAgICAgICAgICAgXCJ0d1wiOiBcIlRleHQgJiBXcml0aW5nXCIsXHJcbiAgICAgICAgICAgIFwiY3NcIjogXCJDb25zdWx0aW5nIFNlcnZpY2VzXCIsXHJcbiAgICAgICAgICAgIFwib3NcIjogXCJPdGhlciBTZXJ2aWNlc1wiXHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgcm91bmRfcHJpY2UgPSBNYXRoLnJvdW5kKGdpZ09iamVjdC5wcmljZSAqIDEwMDApIC8gMTAwMDtcclxuICAgICAgICB2YXIgZ2lnRGVsZXRlU3RyaW5nID0gJyc7XHJcbiAgICAgICAgaWYgKGlzT3duKSB7XHJcbiAgICAgICAgICAgIHZhciBnaWdEZWxldGVTdHJpbmcgPSAnPGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0gZGVsZXRlXCI+RGVsZXRlPC9saT4nXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBkcm9wZG93bkJ1dHRvbiA9ICc8YnV0dG9uIGlkPVwiRERCJyArIGdpZ0lEICsgJ1wiIGNsYXNzPVwiZHJvcGRvd24tZ2lnIG1kbC1idXR0b24gbWRsLWpzLWJ1dHRvbiBtZGwtYnV0dG9uLS1pY29uIGRyb3Bkb3duLWJ1dHRvbiBidG4taW5mby1lZGl0XCI+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPm1vcmVfdmVydDwvaT48L2J1dHRvbj4nO1xyXG4gICAgICAgIHZhciBkcm9wZG93blVMID0gJzx1bCBjbGFzcz1cIm1kbC1tZW51IG1kbC1tZW51LS1ib3R0b20tcmlnaHQgbWRsLWpzLW1lbnUgbWRsLWpzLXJpcHBsZS1lZmZlY3RcIiBmb3I9XCJEREInICsgZ2lnSUQgKyAnXCI+PGxpIGNsYXNzPVwibWRsLW1lbnVfX2l0ZW0ganMtb3Blbi1naWctbW9kYWxcIj5PcGVuPC9saT4nICsgZ2lnRGVsZXRlU3RyaW5nICsgJzwvdWw+JztcclxuXHJcbiAgICAgICAgaWYgKGdpZ09iamVjdC5oYXNPd25Qcm9wZXJ0eSgnb3duZXJfZ3VpZCcpKSB7XHJcbiAgICAgICAgICAgIG93bmVyX2d1aWQgPSBnaWdPYmplY3Qub3duZXJfZ3VpZDtcclxuXHJcbiAgICAgICAgICAgIGdldFByb2ZpbGVWYWx1ZShvd25lcl9ndWlkLCAncHJvZmlsZVBpY3R1cmUnLCBmdW5jdGlvbihwcm9maWxlUGljdHVyZVVSTCkge1xyXG4gICAgICAgICAgICAgICAgaW1nX3NyYyA9IGFwaV9jZG4gKyBKU09OLnBhcnNlKHByb2ZpbGVQaWN0dXJlVVJMKSArICcmdGh1bWI9MSc7XHJcbiAgICAgICAgICAgICAgICAvLyAkKCcjaW1nYXYnICsgZ2lnSUQpLmF0dHIoJ3NyYycsIHBfc3JjKTtcclxuICAgICAgICAgICAgICAgIGdldFByb2ZpbGVWYWx1ZShvd25lcl9ndWlkLCAnbmFtZScsIGZ1bmN0aW9uKG5hbWVfanN0cikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBuYW1lc19vID0gSlNPTi5wYXJzZShuYW1lX2pzdHIpO1xyXG4gICAgICAgICAgICAgICAgICAgIGZ1bGxuYW1lID0gbmFtZXNfby5maXJzdCArIFwiIFwiICsgbmFtZXNfby5sYXN0O1xyXG4gICAgICAgICAgICAgICAgICAgIC8vICQoJyNubW93bicgKyBnaWdJRCkudGV4dChuYW1lc19vLmZpcnN0ICsgXCIgXCIgKyBuYW1lc19vLmxhc3QpO1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdMYXlvdXQgPSBgPGRpdiBjbGFzcz1cInVzZXItY2FyZCBnaWdcIiAgaWQ9XCIke2dpZ0lEfVwiIGRhdGEtdG9nZ2xlPVwibW9kYWxcIiBkYXRhLXRhcmdldD1cIiNnaWdNb2RhbFwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW1nLWNhcmRcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgke2FwaV9jZG4gKyBnaWdPYmplY3QuaW1hZ2VfaGFzaH0mdGh1bWI9MSkgY2VudGVyIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIiA+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duQnV0dG9ufVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93blVMfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtbGFiZWxcIj4ke2NhdGVnb3J5T2JqW2dpZ09iamVjdC5jYXRlZ29yeV19PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwidXNlci1wcm9maWxlLWltZ1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpdi1pbWctd3JhcFwiIHN0eWxlPVwiYmFja2dyb3VuZDogdXJsKCcke2ltZ19zcmN9JylcIj48L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1uYW1lXCIgaWQ9XCJubW93biR7Z2lnSUR9XCI+JHtmdWxsbmFtZX08L3A+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1yb2xlXCI+JHtjYXRlZ29yeU9ialtnaWdPYmplY3QuY2F0ZWdvcnldfTwvcD5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItaW5mb1wiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJpbmZvXCI+JHtnaWdPYmplY3QudGl0bGV9PC9wPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVzZXItcHJpY2VcIj5TVEFSVElORyBBVDogPHNwYW4+PGkgY2xhc3M9XCJtYXRlcmlhbC1pY29uc1wiPnBvbHltZXI8L2k+JHtyb3VuZF9wcmljZX08L3NwYW4+PC9kaXY+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+YDtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAob25lID09IHRydWUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJChcIi5naWdzLWNvbnRhaW5lclwiKS5wcmVwZW5kKGdpZ0xheW91dCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLmFwcGVuZChnaWdMYXlvdXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRIYW5kbGVyLnVwZ3JhZGVEb20oKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZW5lcmF0ZTogZnVuY3Rpb24oaWQsIG9iaiwgaXNPd24sIG9uZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVHaWdzRnJvbURhdGEoaWQsIG9iaiwgaXNPd24sIG9uZSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuIiwiZnVuY3Rpb24gZmlsdGVyUHJvZmlsZUNhcmRzKHF1ZXJ5LCAkaW5wdXQpIHtcclxuICAvKiBDSEVDSyBGT1IgUVVFUlkgTUFUQ0ggV0lUSCBOQU1FICovXHJcbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykuZWFjaChmdW5jdGlvbihpLGl0ZW0pIHtcclxuICAgIHZhciBuYW1lID0gJChpdGVtKS5maW5kKCcudXNlci1uYW1lJykudGV4dCgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICBuYW1lLm1hdGNoKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID8gJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgOiAkKGl0ZW0pLmFkZENsYXNzKCdoaWRkZW4nKVxyXG4gIH0pO1xyXG4gIC8qIEFERCBSRUQgQk9SREVSIFRPIElOUFVUIElGIE5PIFNFQVJDSCBNQVRDSEVEICovXHJcbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykubGVuZ3RoID09ICQoJy5wcm9maWxlLXVzZXItY2FyZC5oaWRkZW4nKS5sZW5ndGggPyAkaW5wdXQuYWRkQ2xhc3MoJ2Vycm9yJykgOiAkaW5wdXQucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XHJcbn1cclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcbiAgLy8gR2xvYmFsIEV2ZW50c1xyXG4gICQoZG9jdW1lbnQpLmNsaWNrKGZ1bmN0aW9uKGUpIHtcclxuICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZHJvcGRvd24nKS5sZW5ndGgpIHtcclxuICAgICAgICAgICQoJyNzZXR0aW5ncy1kcm9wZG93bicpLnBhcmVudHMoJy5kcm9wZG93bicpLnJlbW92ZUNsYXNzKCdzaG93Jyk7XHJcbiAgICAgIH1cclxuICB9KTtcclxuICAvLyBEcm9wZG93biBzaG93IGluIGhlYWRlclxyXG4gICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcjc2V0dGluZ3MtZHJvcGRvd24nLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgJCh0aGlzKS5wYXJlbnRzKCcuZHJvcGRvd24nKS50b2dnbGVDbGFzcygnc2hvdycpO1xyXG4gICAgICAvLyAuc2libGluZ3MoJ1tkYXRhLWxhYmVsbGVkYnk9c2V0dGluZ3MtZHJvcGRvd25dJykuXHJcbiAgfSk7XHJcblxyXG4gIC8vIE9QRU4gR0lHIEJJRyBNT0RBTCBPTiBNRU5VIGNsaWNrXHJcbiAgJCgnYm9keScpLmRlbGVnYXRlKCdsaS5qcy1vcGVuLWdpZy1tb2RhbCcsICdjbGljaycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICQodGhpcykuY2xvc2VzdCgnLmdpZycpLnRyaWdnZXIoJ2NsaWNrJyk7XHJcbiAgfSk7XHJcblxyXG4gIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXHJcbiAgaWYgKCAkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSApIHtcclxuICAgIC8qIEZJTFRFUiBQUk9GSUxFIENBUkRTICovXHJcbiAgICAkKGRvY3VtZW50KS5vbignaW5wdXQnLCAnLnByb2ZpbGVzLXBhZ2UgI3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbigpIHtcclxuICAgICAgZmlsdGVyUHJvZmlsZUNhcmRzKCAkKHRoaXMpLnZhbCgpLCAkKHRoaXMpICk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKiBPUEVOIElOVEVSTkFMIFBST0ZJTEUgUEFHRSAqL1xyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLnByb2ZpbGUtdXNlci1jYXJkJyxmdW5jdGlvbigpe1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvdWkvcHJvZmlsZS8jJyArICQodGhpcykuYXR0cignaWQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gUkVESVJFQ1QgVE8gUFJPRklMRSBQQUdFIE9OIENMSUNLIE9OIFVTRVJTIFBST0ZJTEVcclxuICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuanNPcGVuR2lnT3duZXJQcm9maWxlJyxmdW5jdGlvbigpIHtcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdkYXRhLWlkJyk7XHJcbiAgfSk7XHJcbn0pXHJcbiIsIndpbmRvdy4kdXBsb2FkQ3JvcCA9ICQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKS5jcm9wcGllKHtcclxuICB2aWV3cG9ydDoge1xyXG4gICAgd2lkdGg6IDQ1MCxcclxuICAgIGhlaWdodDogMTUwXHJcbiAgfSxcclxuICBlbmFibGVab29tOiB0cnVlLFxyXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxyXG59KTtcclxuXHJcbndpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUgPSAkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpLmNyb3BwaWUoe1xyXG4gIHZpZXdwb3J0OiB7XHJcbiAgICB3aWR0aDogMTUwLFxyXG4gICAgaGVpZ2h0OiAxNTAsXHJcbiAgICB0eXBlOiBcImNpcmNsZVwiXHJcbiAgfSxcclxuICBlbmFibGVab29tOiB0cnVlLFxyXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxyXG59KTtcclxuXHJcbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XHJcbiAgICAvKiBCVVRUT04gSU5JVCBDTElDSyBPTiBJTlBVVCBUWVBFIEZJTEUgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc0Nyb3BVcGxvYWQnLGZ1bmN0aW9uKCl7XHJcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcclxuICAgICAgJGNvbnRlbnQuZmluZCgnaW5wdXQjaW5wdXQtaW1hZ2UtZ2lnJykuY2xpY2soKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuanNDcm9wVXBsb2FkUHJvZmlsZVwiLCBmdW5jdGlvbigpIHtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XHJcbiAgICAgICRjb250ZW50LmZpbmQoXCJpbnB1dCNpbnB1dC1pbWFnZS1wcm9maWxlXCIpLmNsaWNrKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvKiBCVVRUT04gRk9SIEdFVFRJTkcgQ1JPUCBSRVNVbHQgKi9cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5qc0Nyb3BSZXN1bHQnLGZ1bmN0aW9uKGUpe1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wLmNyb3BwaWUoJ3Jlc3VsdCcsJ2Jhc2U2NCcpLnRoZW4oIGZ1bmN0aW9uKGJhc2U2NCkge1xyXG4gICAgICAgICRjb250ZW50LmZpbmQoJ2ltZyNpbnB1dC1pbWFnZS1naWcnKS5hdHRyKCdzcmMnLCBiYXNlNjQpLnNob3coNTAwKS5yZW1vdmVDbGFzcygnZW1wdHknKTtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuc2hvdyg1MDApO1xyXG4gICAgICAgICRjb250ZW50LmZpbmQoJChcIi5idG5zLXdyYXBcIikuZmluZChcIi5idG4tc3VjY2Vzc1wiKSkuc2hvdygpO1xyXG4gICAgICB9KTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wLmNyb3BwaWUoJ3Jlc3VsdCcsJ2Jsb2InKS50aGVuKCBmdW5jdGlvbihibG9iKSB7XHJcbiAgICAgICAgd2luZG93LiR1cGxvYWRDcm9wQmxvYiA9IGJsb2I7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1naWdcIikpLmhpZGUoNDAwKTtcclxuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLmhpZGUoKTtcclxuICAgICAgfSk7XHJcbiAgICB9KVxyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKFwiY2xpY2tcIiwgXCIuanNDcm9wUmVzdWx0UHJvZmlsZVwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XHJcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcFByb2ZpbGUuY3JvcHBpZShcInJlc3VsdFwiLCBcImJhc2U2NFwiKS50aGVuKGZ1bmN0aW9uKGJhc2U2NCkge1xyXG4gICAgICAgICAgJGNvbnRlbnQuZmluZChcInNwYW4jaW5wdXQtaW1hZ2UtcHJvZmlsZVwiKS5jc3MoXCJiYWNrZ3JvdW5kLWltYWdlXCIsICd1cmwoJysgYmFzZTY0ICsnKScpLnNob3coNTAwKS5yZW1vdmVDbGFzcyhcImVtcHR5XCIpO1xyXG4gICAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5zaG93KDUwMCk7XHJcbiAgICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLnNob3coKTtcclxuICAgICAgICB9KTtcclxuICAgICAgd2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZS5jcm9wcGllKFwicmVzdWx0XCIsIFwiYmxvYlwiKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcclxuICAgICAgICB3aW5kb3cuJHVwbG9hZENyb3BCbG9iUHJvZmlsZSA9IGJsb2I7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5oaWRlKDQwMCk7XHJcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJ3aW5kb3cuY3JlYXRlTmV3R2lnID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgJChcIiNhZGQtZ2lnXCIpLmZpbmQoXCIjbmV3R2lnZXhwaXJlXCIpLmRhdGVwaWNrZXIoKTtcclxuICAgICQoXCIjYWRkLWdpZ1wiKS5vbihcImhpZGRlbi5icy5tb2RhbFwiLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgJCh0aGlzKS5maW5kKFwiLmdpZy10YWdzXCIpLmZpbmQoXCIuZGVsZXRlXCIpLmNsaWNrKCk7XHJcbiAgICAgICAgJCh0aGlzKVxyXG4gICAgICAgICAgICAuZmluZChcImltZyNpbnB1dC1pbWFnZS1naWdcIikuaGlkZSgpLmFkZENsYXNzKFwiZW1wdHlcIikuZW5kKClcclxuICAgICAgICAgICAgLmZpbmQoXCIuaW1nLWxhYmVsXCIpLnNob3coKS5yZW1vdmVDbGFzcyhcImFjdGl2ZVwiKS50ZXh0KCcnKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmhpZGUoKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XHJcbiAgICAgICAgJCh0aGlzKVxyXG4gICAgICAgICAgICAuZmluZChcImlucHV0LHRleHRhcmVhLHNlbGVjdFwiKS52YWwoXCJcIikuZW5kKClcclxuICAgICAgICAgICAgLmZpbmQoXCIucmFuZ2Utc2xpZGVyXCIpXHJcbiAgICAgICAgICAgIC5maW5kKFwiaW5wdXRcIikudmFsKFwiMFwiKS5lbmQoKVxyXG4gICAgICAgICAgICAuZmluZChcIi5yYW5nZS1zbGlkZXJfX3ZhbHVlXCIpLnRleHQoXCIwXCIpO1xyXG4gICAgICAgICQodGhpcykuZmluZChcIiNuZXctZ2lnLWNhdGVnb3J5XCIpLnBhcmVudCgpLmZpbmQoXCIudGV4dFwiKS50ZXh0KFwiQWxsIENhdGVnb3JpZXNcIik7XHJcbiAgICB9KTtcclxuXHJcbiAgICB2YXIgY2FsY3VsYXRlZExvY2s7XHJcbiAgICAkKCcuanNDYWxjdWxhdGVkTG9jaycpLm9uKCdpbnB1dCcsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgdmFyIGNvc3QgPSAkKCcjcmVwdXRhdGlvbkNvc3QnKS52YWwoKSxcclxuICAgICAgICAgIGFtb3VudCA9ICQoJyNhbW91bnQnKS52YWwoKSxcclxuICAgICAgICAgICRjYWxjdWxhdGVkTG9jayA9ICQoJyNjYWxjdWxhdGVkTG9jaycpLFxyXG4gICAgICAgICAgY2FsY3VsYXRlZExvY2sgPSBjYWxjTG9jayhjb3N0LCBhbW91bnQpXHJcbiAgICAgICAgICAkY2FsY3VsYXRlZExvY2sudGV4dChjYWxjdWxhdGVkTG9jayArICcgRVJUJyk7XHJcbiAgICB9KVxyXG5cclxufSkoKTtcclxuXHJcbmZ1bmN0aW9uIGNhbGNMb2NrIChjb3N0LCBhbW91bnQpIHtcclxuICByZXR1cm4gKGNvc3QgKiBhbW91bnQpIC8gMTAwO1xyXG59XHJcbiIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cuZ2lnc1BhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXHJcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcclxuXHJcbiAgICBmdW5jdGlvbiBpbml0R2lncygpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAuZ2lncycpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBnZXRMaXN0T2ZHaWdzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbmluaXRHaWdzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGluaXRHaWdzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ2dpZ3MtcGFnZScpKSB7XHJcbiAgICAgICAgZ2lnc1BhZ2VNb2R1bGUub25pbml0R2lncygpO1xyXG4gICAgfVxyXG59KTsiLCIvLyBOZXR3b3JrXHJcbndpbmRvdy5uZXR3b3JrUGFnZU1vZHVsZSA9IChmdW5jdGlvbiAoKSB7XHJcbiAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKVxyXG4gICQoJy5uYXYtdGFicyAubmV0d29yaycpLmFkZENsYXNzKCdhY3RpdmUnKVxyXG4gIC8vIHVwZGF0ZSBkYXRhIGludGVydmFsXHJcbiAgY29uc3QgaW50ZXJ2YWwgPSAxMDAwICogNjAgKiA1XHJcbiAgZnVuY3Rpb24gaW5pdE5ldHdvcmsgKCkge1xyXG4gICAgLy8gYXJyYXkgb2YgQ0ROJ3NcclxuICAgIGxldCBsaXN0RGF0YVxyXG4gICAgbGV0IHVybHNBcnIgPSBbXVxyXG4gICAgJC5nZXQoJ2h0dHA6Ly8xNTkuNjUuNTYuMTQwOjQ1NjcvYXBpL3YxL2RodC9jZG4tbGlzdCcsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgIC8vIGNoZWNrIGlmIG5vdCBlbXB0eVxyXG4gICAgICBpZiAoZGF0YSkge1xyXG4gICAgICAgIGxpc3REYXRhID0gSlNPTi5wYXJzZShkYXRhKVxyXG4gICAgICB9XHJcbiAgICB9KS5kb25lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0RGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGxldCBhcGlMaXN0ID0gbGlzdERhdGFbaV0gKyAnL2FwaS9jZG4vdjEvaW5mbydcclxuICAgICAgICB1cmxzQXJyLnB1c2goYXBpTGlzdClcclxuICAgICAgfVxyXG4gICAgICAvLyBzdGFydCByZWZyZXNoIGNoYWluXHJcbiAgICAgIHN0YXJ0Q2hhaW4oMSlcclxuICAgIH0pXHJcbiAgICAvLyAgTWFwIGxheWVyc1xyXG4gICAgY29uc3QgbGF5ZXJNYXAgPSBuZXcgb2wubGF5ZXIuVGlsZSh7c291cmNlOiBuZXcgb2wuc291cmNlLk9TTSgpfSlcclxuICAgIGNvbnN0IHNvdXJjZUZlYXR1cmVzID0gbmV3IG9sLnNvdXJjZS5WZWN0b3IoKVxyXG4gICAgY29uc3QgbGF5ZXJGZWF0dXJlcyA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe3NvdXJjZTogc291cmNlRmVhdHVyZXN9KVxyXG4gICAgLy8gY3JlYXRlIG5ldyBNYXBcclxuICAgIGNvbnN0IG1hcCA9IG5ldyBvbC5NYXAoe1xyXG4gICAgICB0YXJnZXQ6ICdtYXAnLFxyXG4gICAgICBsYXllcnM6IFtsYXllck1hcCwgbGF5ZXJGZWF0dXJlc10sXHJcbiAgICAgIHZpZXc6IG5ldyBvbC5WaWV3KHsgY2VudGVyOiBvbC5wcm9qLnRyYW5zZm9ybShbMi40MSwgMTUuODJdLCAnRVBTRzo0MzI2JywgJ0VQU0c6Mzg1NycpLCB6b29tOiAzIH0pXHJcbiAgICB9KVxyXG4gICAgLy8gTWFya2VyIHN0eWxlXHJcbiAgICBjb25zdCBzdHlsZU1rID0gW1xyXG4gICAgICBuZXcgb2wuc3R5bGUuU3R5bGUoe1xyXG4gICAgICAgIGltYWdlOiBuZXcgb2wuc3R5bGUuSWNvbigoe1xyXG4gICAgICAgICAgYW5jaG9yOiBbMC41LCAxXSxcclxuICAgICAgICAgIHNjYWxlOiAxLFxyXG4gICAgICAgICAgc3JjOiAnaHR0cDovL2ltYWdlLmliYi5jby9mTEVhbmMvbWFwc19hbmRfZmxhZ3NfMS5wbmcnXHJcbiAgICAgICAgfSkpLFxyXG4gICAgICAgIHpJbmRleDogNVxyXG4gICAgICB9KVxyXG4gICAgXVxyXG4gICAgLy8gdG9vbHRpcHNcclxuICAgIGNvbnN0IHRvb2x0aXAgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndG9vbHRpcCcpXHJcbiAgICBjb25zdCBvdmVybGF5ID0gbmV3IG9sLk92ZXJsYXkoe1xyXG4gICAgICBlbGVtZW50OiB0b29sdGlwLFxyXG4gICAgICBvZmZzZXQ6IFsxMCwgMF0sXHJcbiAgICAgIHBvc2l0aW9uaW5nOiAnYm90dG9tLWxlZnQnXHJcbiAgICB9KVxyXG4gICAgbWFwLmFkZE92ZXJsYXkob3ZlcmxheSlcclxuXHJcbiAgICAvLyBldmVudCBoYW5kbGVyc1xyXG4gICAgbWFwLm9uKCdwb2ludGVybW92ZScsIGRpc3BsYXlUb29sdGlwKVxyXG4gICAgbWFwLm9uKCdjbGljaycsIHNob3dNb2RhbClcclxuICAgICQoJyNuZXR3b3JrU2VsZWN0Jykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXHJcbiAgICAgIGNvbnNvbGUubG9nKClcclxuICAgICAgbGV0IHN0ciA9ICQodGhpcykuY2xvc2VzdCgnLmNkbi1kZXRhaWxzJykuZmluZCgnI3NlcnZpY2VfdXJsJykudmFsKClcclxuICAgICAgc3RyID0gc3RyLnN1YnN0cmluZygwLCBzdHIubGVuZ3RoIC0gNClcclxuICAgICAgbGV0IHVybCA9IHN0ciArICc0NTY3L3VpJ1xyXG5cclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB1cmxcclxuICAgIH0pXHJcbiAgICAkKCcjbW9kYWwtbmV0d29yaycpLm9uKCdoaWRlLmJzLm1vZGFsJywgZnVuY3Rpb24gKCkge1xyXG4gICAgICAkKCcjcGVlci1saXN0JykuaHRtbCgnJylcclxuICAgIH0pXHJcbiAgICAvLyBzdGFydCB1cGRhdGUgY2hhaW5cclxuICAgIGZ1bmN0aW9uIHN0YXJ0Q2hhaW4gKGkpIHtcclxuICAgICAgaWYgKGkgPT09IDEpIHtcclxuICAgICAgICBjcmVhdGVNYXJrZXJzKHVybHNBcnIpXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgICBjcmVhdGVNYXJrZXJzKHVybHNBcnIpXHJcbiAgICAgICAgfSwgaW50ZXJ2YWwpXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvLyBjcmVhdGluZyBNYXJrZXJzIG9uIE1hcFxyXG4gICAgZnVuY3Rpb24gY3JlYXRlTWFya2VycyAodXJsQXJyYXkpIHtcclxuICAgICAgbGV0IGdlb0RhdGFcclxuICAgICAgLy8gbG9vcCBhcnJheSB3aXRoIHVybCdzXHJcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXJsQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBsZXQgdXJsID0gdXJsQXJyYXlbaV1cclxuICAgICAgICAvLyBnZXQgZGF0YVxyXG4gICAgICAgICQuZ2V0KHVybCwgZnVuY3Rpb24gKGRhdGEpIHtcclxuICAgICAgICAgIC8vIGNoZWNrIGlmIG5vdCBlbXB0eVxyXG4gICAgICAgICAgaWYgKGRhdGEpIHtcclxuICAgICAgICAgICAgZ2VvRGF0YSA9IEpTT04ucGFyc2UoZGF0YSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KS5kb25lKGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgIGxldCBmZWF0dXJlID0gbmV3IG9sLkZlYXR1cmUoe1xyXG4gICAgICAgICAgICBzZXJ2aWNlX3VybDogZ2VvRGF0YS5odHRwLnNlcnZpY2VfdXJsLFxyXG4gICAgICAgICAgICBnZW86IGdlb0RhdGEuaHR0cC5nZW8sXHJcbiAgICAgICAgICAgIGlwNDogZ2VvRGF0YS5odHRwLmlwNCxcclxuICAgICAgICAgICAgY291bnRyeTogZ2VvRGF0YS5odHRwLmdlby5jb3VudHJ5X25hbWUsXHJcbiAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgb2wuZ2VvbS5Qb2ludChvbC5wcm9qLnRyYW5zZm9ybShbZ2VvRGF0YS5odHRwLmdlby5sb25naXR1ZGUsIGdlb0RhdGEuaHR0cC5nZW8ubGF0aXR1ZGVdLCAnRVBTRzo0MzI2JywgJ0VQU0c6Mzg1NycpKVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC8vIGFwcGVuZCBNYXJrZXIgb24gbWFwXHJcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlTWspXHJcbiAgICAgICAgICBzb3VyY2VGZWF0dXJlcy5hZGRGZWF0dXJlKGZlYXR1cmUpXHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICAvLyBjbGVhcmUgTWFya2VyIGxheWVyc1xyXG4gICAgICBzb3VyY2VGZWF0dXJlcy5jbGVhcigpXHJcbiAgICAgIHN0YXJ0Q2hhaW4oMilcclxuICAgIH1cclxuXHJcbiAgICAvLyBzaG93IG1vZGFsIG9uIGNsaWNrXHJcbiAgICBmdW5jdGlvbiBzaG93TW9kYWwgKGV2dCkge1xyXG4gICAgICBsZXQgZmVhdHVyZSA9IG1hcC5mb3JFYWNoRmVhdHVyZUF0UGl4ZWwoZXZ0LnBpeGVsLCBmdW5jdGlvbiAoZmVhdHVyZSkge1xyXG4gICAgICAgIHJldHVybiBmZWF0dXJlXHJcbiAgICAgIH0pXHJcbiAgICAgIGlmIChmZWF0dXJlKSB7XHJcbiAgICAgICAgbGV0IGluZm8gPSBmZWF0dXJlLk4uZ2VvLmNpdHkgKyAnLCAnICsgZmVhdHVyZS5OLmdlby5jb3VudHJ5X25hbWVcclxuICAgICAgICAkKCcjc2VydmljZV91cmwnKS52YWwoZmVhdHVyZS5OLnNlcnZpY2VfdXJsKVxyXG4gICAgICAgICQoJyNtb2RhbC1uZXR3b3JrJykuZmluZCgnLm50dy1jb3VudHJ5JykudGV4dChpbmZvKVxyXG4gICAgICAgICQoJyNtb2RhbC1uZXR3b3JrJykuZmluZCgnLm50dy1pcCcpLnRleHQoZmVhdHVyZS5OLmlwNClcclxuICAgICAgICBsZXQgcGVlckxpc3QgPSBmZWF0dXJlLk4uc2VydmljZV91cmwgKyAnL2FwaS92MS9kaHQvcGVlcnMnXHJcbiAgICAgICAgY29uc29sZS5sb2cocGVlckxpc3QpXHJcbiAgICAgICAgbGV0IHBlZXJEYXRhXHJcbiAgICAgICAgJC5nZXQocGVlckxpc3QsIGZ1bmN0aW9uIChkYXRhKSB7XHJcbiAgICAgICAgICAvLyBjaGVjayBpZiBub3QgZW1wdHlcclxuICAgICAgICAgIGlmIChkYXRhKSB7XHJcbiAgICAgICAgICAgIHBlZXJEYXRhID0gSlNPTi5wYXJzZShkYXRhKVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLmRvbmUoZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgY29uc29sZS5sb2cocGVlckRhdGEpXHJcbiAgICAgICAgICBmb3IgKGxldCBwZWVyIGluIHBlZXJEYXRhKSB7XHJcbiAgICAgICAgICAgIHZhciBpbWdfc3JjXHJcbiAgICAgICAgICAgIHZhciBibG9ja1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwZWVyRGF0YVtwZWVyXS5wcm9maWxlLnByb2ZpbGVQaWN0dXJlKTtcclxuICAgICAgICAgICAgaWYgKCFwZWVyRGF0YVtwZWVyXS5wcm9maWxlLmlzX2Nkbikge1xyXG4gICAgICAgICAgICAgICAgaW1nX3NyYyA9IGZlYXR1cmUuTi5pcDQgKyAnOjU2NzgvYXBpL2Nkbi92MS9yZXNvdXJjZT9oa2V5PScgKyBwZWVyRGF0YVtwZWVyXS5wcm9maWxlLnByb2ZpbGVQaWN0dXJlICsgJyZ0aHVtYj0xJ1xyXG4gICAgICAgICAgICAgICAgYmxvY2sgPSBgPGRpdj48aW1nIHNyYz1cIiR7aW1nX3NyY31cIi8+VGVzdCB0ZXN0PC9kaXY+YFxyXG4gICAgICAgICAgICAgICAgJCgnI3BlZXItbGlzdCcpLmFwcGVuZChibG9jaylcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGJsb2NrID0gYDxkaXY+PGltZyBzcmM9XCIke2ltZ19zcmN9XCIvPlRlc3QgdGVzdDwvZGl2PmBcclxuICAgICAgICAgICAgICAgICQoJyNwZWVyLWxpc3QnKS5hcHBlbmQoYmxvY2spXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkKFwiW2RhdGEtdGFyZ2V0PScjbW9kYWwtbmV0d29yayddXCIpLnRyaWdnZXIoJ2NsaWNrJylcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGxldCB0YXJnZXQgPSBtYXAuZ2V0VGFyZ2V0KClcclxuICAgIGxldCBqVGFyZ2V0ID0gdHlwZW9mIHRhcmdldCA9PT0gXCJzdHJpbmdcIiA/ICQoXCIjXCIrdGFyZ2V0KSA6ICQodGFyZ2V0KVxyXG4gICAgLy8gc2hvdyB0b29sdGlwIG9uIGhvdmVyXHJcbiAgICBmdW5jdGlvbiBkaXNwbGF5VG9vbHRpcCAoZXZ0KSB7XHJcbiAgICAgIGxldCBmZWF0dXJlID0gbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChldnQucGl4ZWwsIGZ1bmN0aW9uIChmZWF0dXJlKSB7XHJcbiAgICAgICAgcmV0dXJuIGZlYXR1cmVcclxuICAgICAgfSlcclxuICAgICAgdG9vbHRpcC5zdHlsZS5kaXNwbGF5ID0gZmVhdHVyZSA/ICcnIDogJ25vbmUnXHJcbiAgICAgIGlmIChmZWF0dXJlKSB7XHJcbiAgICAgICAgbGV0IGluZm8gPSBmZWF0dXJlLk4uZ2VvLmNpdHkgKyAnLCAnICsgZmVhdHVyZS5OLmdlby5jb3VudHJ5X25hbWVcclxuICAgICAgICBvdmVybGF5LnNldFBvc2l0aW9uKGV2dC5jb29yZGluYXRlKVxyXG4gICAgICAgICQodG9vbHRpcCkudGV4dChpbmZvKVxyXG4gICAgICAgIGpUYXJnZXQuY3NzKFwiY3Vyc29yXCIsICdwb2ludGVyJylcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBqVGFyZ2V0LmNzcyhcImN1cnNvclwiLCAnJylcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBvbmluaXROZXR3b3JrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgIHJldHVybiBpbml0TmV0d29yaygpXHJcbiAgICB9XHJcbiAgfVxyXG59KSgpXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCduZXR3b3JrLXBhZ2UnKSkge1xyXG4gICAgbmV0d29ya1BhZ2VNb2R1bGUub25pbml0TmV0d29yaygpXHJcbiAgfVxyXG59KVxyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnByb2ZpbGVQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxyXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGUoKSB7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5uYXYtbGluaycpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcclxuXHJcbiAgICAgICAgLyogUkVTRVQgQU5EIEdFVCBORVcgUFJPRklMRSBJRCBIQVNIICovXHJcbiAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IG51bGw7XHJcblxyXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xyXG4gICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gd2luZG93LmxvY2F0aW9uLmhhc2guc2xpY2UoMSk7XHJcbiAgICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoKTtcclxuICAgICAgICAgICAgZ2V0R2lncyh3aW5kb3cucHJvZmlsZUlEKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkKCcucmVkZXNpZ25lZC1naWctbW9kYWwnKS5hZGRDbGFzcygnbm8tYnV0dG9uLW9yZGVyJyk7XHJcbiAgICAgICAgICAgICQoJy5lZGl0QnRuUHJvZmlsZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcclxuICAgICAgICAgICAgZ2V0Tm9kZURhdGEoZnVuY3Rpb24obm9kZURhdGEpIHtcclxuICAgICAgICAgICAgICAgIHZhciBkYXRhID0gSlNPTi5wYXJzZShub2RlRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gZGF0YS5ndWlkO1xyXG4gICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgICAgICB1cGRhdGVQcm9maWxlKCk7XHJcbiAgICAgICAgICAgICAgICBnZXRHaWdzKGRhdGEuZ3VpZCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0R2lncyhndWlkKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZ3VpZCk7XHJcbiAgICAgICAgZ2V0UHJvZmlsZUdpZ3MoZ3VpZCwgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICB2YXIgcHJvZmlsZV9naWdzID0gSlNPTi5wYXJzZShkYXRhKTtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9maWxlX2dpZ3MubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgICAgICQuYWpheCh7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBwcm9maWxlX2dpZ3NbaV0sXHJcbiAgICAgICAgICAgICAgICAgICAgaGs6IHByb2ZpbGVfZ2lnc1tpXSxcclxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICAgICAgICAgIHByb2Nlc3NEYXRhOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc19kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ19vID0gSlNPTi5wYXJzZShqc19kYXRhKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlR2lnc01vZHVsZS5nZW5lcmF0ZSh0aGlzLmhrLCBnaWdfbywgdHJ1ZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHJlbmRlck9uZUdpZyhnaWdpZCwgb25lKSB7XHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdXJsOiBcIi9hcGkvdjEvZGh0L2hrZXkvP2hrZXk9XCIgKyBnaWdpZCxcclxuICAgICAgICAgICAgaGs6IGdpZ2lkLFxyXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxyXG4gICAgICAgICAgICBwcm9jZXNzRGF0YTogZmFsc2UsXHJcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGpzX2RhdGEpIHtcclxuICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBnaWdfbyA9IEpTT04ucGFyc2UoanNfZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgZ2VuZXJhdGVHaWdzTW9kdWxlLmdlbmVyYXRlKHRoaXMuaGssIGdpZ19vLCB0cnVlLCBvbmUpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnRVJSJywgZXJyb3IpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvbmluaXQ6IGluaXRQcm9maWxlLFxyXG4gICAgICAgIGdldEFsbEdpZ3M6IGdldEdpZ3MsXHJcbiAgICAgICAgcmVuZGVyT25lR2lnOiByZW5kZXJPbmVHaWdcclxuICAgIH1cclxufSkoKTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGUtcGFnZScpKSB7XHJcbiAgICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XHJcbiAgICB9XHJcbn0pOyIsIi8vIFNtYXJ0IFNlYXJjaCBEZWNsYXJhdGluZ1xyXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxyXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGVzKCkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIC5wcm9maWxlcycpLmFkZENsYXNzKCdhY3RpdmUnKTtcclxuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcclxuICAgIH1cclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzTG9hZE1vcmVQcm9maWxlcycsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGxpbWl0ID0gbGltaXQgKyA5O1xyXG4gICAgICAgIG1haW5fcHJvZmlsZV9jYXJkcygpO1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgb25pbml0cHJvZmlsZXM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gaW5pdFByb2ZpbGVzKCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxufSkoKTtcclxuXHJcblxyXG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcclxuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSkge1xyXG4gICAgICAgIHByb2ZpbGVzUGFnZU1vZHVsZS5vbmluaXRwcm9maWxlcygpO1xyXG4gICAgfVxyXG59KTtcclxuIiwid2luZG93Lm5ld0dpZ1JhbmdlU2xpZGVyID0gKGZ1bmN0aW9uKCkge1xyXG5cdHZhciByYW5nZVNsaWRlciA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0dmFyIHNsaWRlciA9ICQoXCIucmFuZ2Utc2xpZGVyXCIpLFxyXG5cdFx0XHRyYW5nZSA9ICQoXCIucmFuZ2Utc2xpZGVyX19yYW5nZVwiKSxcclxuXHRcdFx0dmFsdWUgPSAkKFwiLnJhbmdlLXNsaWRlcl9fdmFsdWVcIik7XHJcblxyXG5cdFx0c2xpZGVyLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdHZhbHVlLmVhY2goZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0dmFyIHZhbHVlID0gJCh0aGlzKVxyXG5cdFx0XHRcdFx0LnByZXYoKVxyXG5cdFx0XHRcdFx0LmF0dHIoXCJ2YWx1ZVwiKTtcclxuXHRcdFx0XHQkKHRoaXMpLmh0bWwodmFsdWUpO1xyXG5cdFx0XHR9KTtcclxuXHJcblx0XHRcdHJhbmdlLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XHJcblx0XHRcdFx0JCh0aGlzKVxyXG5cdFx0XHRcdFx0Lm5leHQodmFsdWUpXHJcblx0XHRcdFx0XHQuaHRtbCh0aGlzLnZhbHVlKTtcclxuXHRcdFx0fSk7XHJcblx0XHR9KTtcclxuXHR9O1xyXG5cclxuXHRyYW5nZVNsaWRlcigpO1xyXG59KSgpO1xyXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcclxud2luZG93LnNtYXJ0U2VhcmNoTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgU21hcnQgU2VhcmNoXHJcblxyXG4gICAgdmFyIHNlYXJjaEFycmF5ID0gbmV3IEFycmF5KCk7XHJcbiAgICB2YXIga2V5dXBUaW1lb3V0ID0gbnVsbDtcclxuICAgIHZhciBkYXRhTGVuZ3RoID0gMFxyXG5cclxuICAgIHZhciBzZWFyY2hBID0gJyc7XHJcblxyXG4gICAgZnVuY3Rpb24gc21hcnRTZWFyY2goKSB7XHJcbiAgICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xyXG4gICAgICAgIC8vIGJ1aWxkIHVybCBmb3Igc2VhcmNoaW5nXHJcbiAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xyXG4gICAgICAgICAgICAkLmVhY2goc2VhcmNoQXJyYXksIGZ1bmN0aW9uKGksIGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgIHZhciBzZWFyY2hRID0gJyc7XHJcbiAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnYWxsJztcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGV4dCcgJiYgaXRlbS52YWx1ZSA9PSAnJyAmJiBzZWFyY2hBcnJheS5sZW5ndGggIT0gMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcclxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0YWdzJyAmJiBpdGVtLnZhbHVlID09ICdzZWxlY3QnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAnY2F0ZWdvcnknICYmIGl0ZW0udmFsdWUgPT0gJ2FsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScgJiYgc2VhcmNoQXJyYXkubGVuZ3RoID09IDEpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hRICs9ICdhbGwmJyArIGl0ZW0udHlwZSArICc9JyArIGl0ZW0udmFsdWU7XHJcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJyYnICsgaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcclxuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gc2VhcmNoUTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJC5hamF4KHtcclxuICAgICAgICAgICAgdHlwZTogJ0dFVCcsXHJcbiAgICAgICAgICAgIHVybDogdXJsICsgJyZsaW1pdD0xMDAwJyxcclxuICAgICAgICAgICAgcXJ5OiBzZWFyY2hBLFxyXG4gICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XHJcbiAgICAgICAgICAgICAgICBpZiAoZGF0YSA9PSAnbnVsbCcpIHtcclxuICAgICAgICAgICAgICAgICAgICBkYXRhID0gSlNPTi5zdHJpbmdpZnkoeyByZXN1bHQ6IGBObyByZXN1bHRzIGZvciB0aGlzIHNlYXJjaGAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBldmVudF9vbl9zZWFyY2hfZ2lnX2RhdGEoZGF0YSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBTZWFyY2ggRXZlbnRzXHJcblxyXG4gICAgLy8gU3VibWl0IHNlYXJjaCBmb3IgdGV4dCBmaWVsZFxyXG4gICAgJChkb2N1bWVudCkub24oJ2tleXVwJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XHJcbiAgICAgICAgaWYgKHRoaXMudmFsdWUubGVuZ3RoIDwgMiAmJiB0aGlzLnZhbHVlLmxlbmd0aCA+IDApIHJldHVybjtcclxuICAgICAgICBsaW1pdCA9IDk7XHJcbiAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcclxuICAgICAgICBkZWxheShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIG91dHB1dFN0cmluZyA9ICQoZS50YXJnZXQpLnZhbCgpLnNwbGl0KFwiIFwiKS5qb2luKFwiJTIwXCIpO1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdGV4dCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRleHQgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWFyY2hBcnJheSk7XHJcbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xyXG4gICAgICAgIH0sIDUwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBTdWJtaXQgc2VhcmNoIGZvciBkcm9wZG93biBleHBlcnRpc2VcclxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5kcm9wZG93bignZ2V0IHZhbHVlJyk7XHJcbiAgICAgICAgbGltaXQgPSA5O1xyXG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGFncycpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdjYXRlZ29yeScpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAnY2F0ZWdvcnknLCB2YWx1ZTogZWwgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2F0ZWdvcnkgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ2NhdGVnb3J5JywgdmFsdWU6IGVsIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgICAgICAgaWYgKGVsICE9ICdhbGwnKSBsb2FkX3RhZ3NfcGVyX2RvbWFpbihlbCk7XHJcbiAgICAgICAgfSwgMjAwKTtcclxuICAgIH0pO1xyXG5cclxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI3NraWxscy10YWdzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGVsID0gJCh0aGlzKS5kcm9wZG93bignZ2V0IHZhbHVlJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2coZWwpO1xyXG4gICAgICAgIGlmIChlbCA9PSBudWxsKSByZXR1cm47XHJcbiAgICAgICAgbGltaXQgPSA5O1xyXG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XHJcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSBlbC5qb2luKFwiJTIwXCIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhvdXRwdXRTdHJpbmcpXHJcbiAgICAgICAgICAgIGlmIChzZWFyY2hBcnJheS5sZW5ndGgpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0YWdzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAodGFncyA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xyXG4gICAgICAgIH0sIDIwMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCB0b3VjaGVuZCcsICcjc2xpZGVyLXJhbmdlJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHZhbHVlcyA9ICQodGhpcykuc2xpZGVyKFwidmFsdWVzXCIpO1xyXG4gICAgICAgIGlmICh2YWx1ZXNbMF0gPT0gMCAmJiB2YWx1ZXNbMV0gPT0gMjAwMCkge1xyXG4gICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxpbWl0ID0gOTtcclxuICAgICAgICAkKCcuZ2lncy1jb250YWluZXInKS5lbXB0eSgpO1xyXG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcTFyYW5nZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICdxMXJhbmdlJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxMXJhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3ExcmFuZ2UnLCB2YWx1ZTogdmFsdWVzWzBdICsgJyUyMCcgKyB2YWx1ZXNbMV0gfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICBpZiAocTFyYW5nZSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAncTFyYW5nZScsIHZhbHVlOiB2YWx1ZXNbMF0gKyAnJTIwJyArIHZhbHVlc1sxXSB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcclxuICAgICAgICB9LCAyMDApO1xyXG4gICAgfSk7XHJcblxyXG5cclxuXHJcblxyXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5qc0xvYWRNb3JlU2VhcmNoJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgbGltaXQgPSBsaW1pdCArIDk7XHJcbiAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIHNlYXJjaDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzbWFydFNlYXJjaCgpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbn0pKCk7Il19
