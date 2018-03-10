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
   // INIT NETWORK JS
  function initNetwork() {
    // array of CDN's
    var urlsArr = [];
    var listData = void 0;

     $.get('/api/v1/dht/cdn-list', function (data) {
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
        scale: 1.0,
        src: 'http://image.ibb.co/fLEanc/maps_and_flags_1.png'
        //src: 'imgs/place.svg'
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
      var data = $('#service_url').val();
      $.ajax({
        type: 'PUT',
        url: '/api/v1/dht/cdn',
        data: data,
        success: function success() {
          $.toast({
            heading: "CDN Changing",
            text: "Your cdn successfully changed!",
            showHideTransition: "fade",
            allowToastClose: true,
            hideAfter: 2500,
            bgColor: "rgba(89, 116, 165, 0.91)",
            textColor: "#fff",
            position: "top-right",
            afterShown: function afterShown() {
              // setTimeout(function() { window.location.href = '/ui' },2400);
            }
          });
        }
      });
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
        $('#peer-list, #peer-list-cdn').empty();
        var info = feature.N.geo.city + ', ' + feature.N.geo.country_name;
        $('#service_url').val(feature.N.service_url);
        $('#modal-network').find('.ntw-country').text(info);
        $('#modal-network').find('.ntw-ip').text(feature.N.ip4).attr('data-ip');
        var peerList = feature.N.service_url + '/api/v1/dht/peers';
        console.log(peerList);
        var peerData = void 0;
        $.get(peerList, function (data) {
          // check if not empty
          if (data) {
            peerData = JSON.parse(data);
          }
        }).done(function () {
          for (var i = 0; i < peerData.length; i++) {
            var img_src;
            var block;
            var href_profile;
            var guid;
            //var guid=peerData[i]['guid'];
            console.log(peerData[i]['profile'].is_cdn);
            //console.log(peerData[i]['profile']);
            if (!peerData[i]['profile'].is_cdn) {
              guid=peerData[i]['guid']
              console.log('GUID',guid);
              href_profile='/ui/profile/#'+ guid;
              console.log('HREF',href_profile);
              img_src = 'http://' + feature.N.ip4 + ':5678/api/cdn/v1/resource?hkey=' + peerData[i]['profile'].profilePicture + '&thumb=1';
              console.log(peerData[i]);
              var firstName = '' ;// peerData[i]['profile'].name.first;
              var lastName = '' ;//peerData[i]['profile'].name.last;

              block = '<a href="' + href_profile + '" style="display: block;" class="icon-box"><img src="'
              + img_src + '" style="width: 49px;"/>'
              //+ '<a href="' + href_profile + '"> View Profile </a>'
              + firstName + ' ' + lastName + '</a>';

              $('#peer-list').append(block);
            } else {
              block = '<div class="icon-box"><img style="width: 49px;" src="../dist/img/cdn.svg" />CDN</div>';
              $('#peer-list-cdn').append(block);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9tb2R1bGVzL2dlbmVyYXRlR2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL2dsb2JhbEV2ZW50cy5qcyIsInNyYy9qcy9tb2R1bGVzL2ltYWdlQ3JvcC5qcyIsInNyYy9qcy9tb2R1bGVzL25ld0dpZ01vZGFsLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0R2lncy5qcyIsInNyYy9qcy9tb2R1bGVzL29uSW5pdE5ldHdvcmsuanMiLCJzcmMvanMvbW9kdWxlcy9vbkluaXRQcm9maWxlLmpzIiwic3JjL2pzL21vZHVsZXMvb25Jbml0UHJvZmlsZXMuanMiLCJzcmMvanMvbW9kdWxlcy9yYW5nZS1zbGlkZXIuanMiLCJzcmMvanMvbW9kdWxlcy9zbWFydFNlYXJjaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsUUFBUSwwQkFBUixFLENBQXFDO0FBQ3JDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLHdCQUFSLEUsQ0FBbUM7QUFDbkMsUUFBUSw0QkFBUixFLENBQXVDO0FBQ3ZDLFFBQVEsNkJBQVIsRSxDQUF3QztBQUN4QyxRQUFRLDJCQUFSLEUsQ0FBc0M7QUFDdEMsUUFBUSx5QkFBUixFLENBQW9DO0FBQ3BDLFFBQVEsMkJBQVIsRSxDQUFzQztBQUN0QyxRQUFRLDBCQUFSLEUsQ0FBcUM7QUFDckMsUUFBUSw0QkFBUixFLENBQXVDOzs7OztBQ1R2QztBQUNBLE9BQU8sa0JBQVAsR0FBNkIsWUFBVzs7QUFFcEMsYUFBUyxvQkFBVCxDQUE4QixLQUE5QixFQUFxQyxTQUFyQyxFQUFnRCxLQUFoRCxFQUF1RCxHQUF2RCxFQUE0RDs7QUFFeEQsWUFBSSx5QkFBeUIsU0FBekIsQ0FBSixFQUF5QztBQUFFO0FBQVE7O0FBRW5ELFlBQUksVUFBVSxpQkFBZDtBQUNBLFlBQUksZ0JBQWdCLElBQXBCO0FBQ0EsWUFBSSxh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Q0gsS0FIRDs7QUFLQSxXQUFPO0FBQ0gsZ0JBQVEsa0JBQVc7QUFDZixtQkFBTyxhQUFQO0FBQ0g7QUFIRSxLQUFQO0FBTUgsQ0E1TDBCLEVBQTNCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc31yZXR1cm4gZX0pKCkiLCJyZXF1aXJlKFwiLi9tb2R1bGVzL3NtYXJ0U2VhcmNoLmpzXCIpOyAvLyBNT0RVTEUgRk9SIFNFQVJDSElOR1xucmVxdWlyZShcIi4vbW9kdWxlcy9nbG9iYWxFdmVudHMuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdMT0JBTCBFVkVOVFNcbnJlcXVpcmUoXCIuL21vZHVsZXMvaW1hZ2VDcm9wLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTUFHRSBDUk9QUEVSXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGUuanNcIik7IC8vIE1PRFVMRSB3aXRoIElOSVQgUFJPRklMRSBQQUdFXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdFByb2ZpbGVzLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIFBST0ZJTEUgUEFHRVxucmVxdWlyZShcIi4vbW9kdWxlcy9nZW5lcmF0ZUdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdpZ3MgZ2VuZXJhdG9yXG5yZXF1aXJlKFwiLi9tb2R1bGVzL29uSW5pdEdpZ3MuanNcIik7IC8vIE1PRFVMRSB3aXRoIEdJR1MgUEFHRSBJTklUXG5yZXF1aXJlKFwiLi9tb2R1bGVzL3JhbmdlLXNsaWRlci5qc1wiKTsgLy8gTU9EVUxFIHdpdGggUkFOR0UgU0xJREVSXG5yZXF1aXJlKFwiLi9tb2R1bGVzL25ld0dpZ01vZGFsLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBDUkVBVEUgTkVXIEdJR1xucmVxdWlyZShcIi4vbW9kdWxlcy9vbkluaXROZXR3b3JrLmpzXCIpOyAvLyBNT0RVTEUgd2l0aCBJTklUIE5FVFdPUksgUEFHRVxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuZ2VuZXJhdGVHaWdzTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgZnVuY3Rpb24gZ2VuZXJhdGVHaWdzRnJvbURhdGEoZ2lnSUQsIGdpZ09iamVjdCwgaXNPd24sIG9uZSkge1xuICAgICAgIFxuICAgICAgICBpZiAoY2hlY2tfZ2lnX21hcmtlZF9kZWxldGVkKGdpZ09iamVjdCkpIHsgcmV0dXJuIH1cblxuICAgICAgICB2YXIgYXBpX2NkbiA9IGFwaV9nZXRfY2RuX3VybCgpO1xuICAgICAgICB2YXIgcHJvZmlsZV9pbWFnZSA9IG51bGw7XG4gICAgICAgIHZhciBvd25lcl9ndWlkID0gbnVsbDtcbiAgICAgICAgdmFyIGltZ19zcmMgPSAnJztcbiAgICAgICAgdmFyIGZ1bGxuYW1lID0gJyc7XG4gICAgICAgIHZhciBjYXRlZ29yeU9iaiA9IHtcbiAgICAgICAgICAgIFwic2RcIjogXCJTb2Z0d2FyZSBEZXZlbG9wbWVudFwiLFxuICAgICAgICAgICAgXCJmYVwiOiBcIkZpbmFuY2UgJiBBY2NvdW50aW5nXCIsXG4gICAgICAgICAgICBcIm1hXCI6IFwiTXVzaWMgJiBBdWRpb1wiLFxuICAgICAgICAgICAgXCJnZFwiOiBcIkdyYXBoaWMgJiBEZXNpZ25cIixcbiAgICAgICAgICAgIFwidmFcIjogXCJWaWRlbyAmIEFuaW1hdGlvblwiLFxuICAgICAgICAgICAgXCJ0d1wiOiBcIlRleHQgJiBXcml0aW5nXCIsXG4gICAgICAgICAgICBcImNzXCI6IFwiQ29uc3VsdGluZyBTZXJ2aWNlc1wiLFxuICAgICAgICAgICAgXCJvc1wiOiBcIk90aGVyIFNlcnZpY2VzXCJcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByb3VuZF9wcmljZSA9IE1hdGgucm91bmQoZ2lnT2JqZWN0LnByaWNlICogMTAwMCkgLyAxMDAwO1xuICAgICAgICB2YXIgZ2lnRGVsZXRlU3RyaW5nID0gJyc7XG4gICAgICAgIGlmIChpc093bikge1xuICAgICAgICAgICAgdmFyIGdpZ0RlbGV0ZVN0cmluZyA9ICc8bGkgY2xhc3M9XCJtZGwtbWVudV9faXRlbSBkZWxldGVcIj5EZWxldGU8L2xpPidcbiAgICAgICAgfVxuICAgICAgICB2YXIgZHJvcGRvd25CdXR0b24gPSAnPGJ1dHRvbiBpZD1cIkREQicgKyBnaWdJRCArICdcIiBjbGFzcz1cImRyb3Bkb3duLWdpZyBtZGwtYnV0dG9uIG1kbC1qcy1idXR0b24gbWRsLWJ1dHRvbi0taWNvbiBkcm9wZG93bi1idXR0b24gYnRuLWluZm8tZWRpdFwiPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5tb3JlX3ZlcnQ8L2k+PC9idXR0b24+JztcbiAgICAgICAgdmFyIGRyb3Bkb3duVUwgPSAnPHVsIGNsYXNzPVwibWRsLW1lbnUgbWRsLW1lbnUtLWJvdHRvbS1yaWdodCBtZGwtanMtbWVudSBtZGwtanMtcmlwcGxlLWVmZmVjdFwiIGZvcj1cIkREQicgKyBnaWdJRCArICdcIj48bGkgY2xhc3M9XCJtZGwtbWVudV9faXRlbSBqcy1vcGVuLWdpZy1tb2RhbFwiPk9wZW48L2xpPicgKyBnaWdEZWxldGVTdHJpbmcgKyAnPC91bD4nO1xuXG4gICAgICAgIGlmIChnaWdPYmplY3QuaGFzT3duUHJvcGVydHkoJ293bmVyX2d1aWQnKSkge1xuICAgICAgICAgICAgb3duZXJfZ3VpZCA9IGdpZ09iamVjdC5vd25lcl9ndWlkO1xuXG4gICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ3Byb2ZpbGVQaWN0dXJlJywgZnVuY3Rpb24ocHJvZmlsZVBpY3R1cmVVUkwpIHtcbiAgICAgICAgICAgICAgICBpbWdfc3JjID0gYXBpX2NkbiArIEpTT04ucGFyc2UocHJvZmlsZVBpY3R1cmVVUkwpICsgJyZ0aHVtYj0xJztcbiAgICAgICAgICAgICAgICAvLyAkKCcjaW1nYXYnICsgZ2lnSUQpLmF0dHIoJ3NyYycsIHBfc3JjKTtcbiAgICAgICAgICAgICAgICBnZXRQcm9maWxlVmFsdWUob3duZXJfZ3VpZCwgJ25hbWUnLCBmdW5jdGlvbihuYW1lX2pzdHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5hbWVzX28gPSBKU09OLnBhcnNlKG5hbWVfanN0cik7XG4gICAgICAgICAgICAgICAgICAgIGZ1bGxuYW1lID0gbmFtZXNfby5maXJzdCArIFwiIFwiICsgbmFtZXNfby5sYXN0O1xuICAgICAgICAgICAgICAgICAgICAvLyAkKCcjbm1vd24nICsgZ2lnSUQpLnRleHQobmFtZXNfby5maXJzdCArIFwiIFwiICsgbmFtZXNfby5sYXN0KTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGdpZ0xheW91dCA9IGA8ZGl2IGNsYXNzPVwidXNlci1jYXJkIGdpZ1wiICBpZD1cIiR7Z2lnSUR9XCIgZGF0YS10b2dnbGU9XCJtb2RhbFwiIGRhdGEtdGFyZ2V0PVwiI2dpZ01vZGFsXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiaW1nLWNhcmRcIiBzdHlsZT1cImJhY2tncm91bmQ6IHVybCgke2FwaV9jZG4gKyBnaWdPYmplY3QuaW1hZ2VfaGFzaH0mdGh1bWI9MSkgY2VudGVyIG5vLXJlcGVhdDsgYmFja2dyb3VuZC1zaXplOiBjb3ZlcjtcIiA+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtkcm9wZG93bkJ1dHRvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAke2Ryb3Bkb3duVUx9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNhcmQtbGFiZWxcIj4ke2NhdGVnb3J5T2JqW2dpZ09iamVjdC5jYXRlZ29yeV19PC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLXByb2ZpbGUtaW1nXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImRpdi1pbWctd3JhcFwiIHN0eWxlPVwiYmFja2dyb3VuZDogdXJsKCcke2ltZ19zcmN9JylcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJ1c2VyLW5hbWVcIiBpZD1cIm5tb3duJHtnaWdJRH1cIj4ke2Z1bGxuYW1lfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxwIGNsYXNzPVwidXNlci1yb2xlXCI+JHtjYXRlZ29yeU9ialtnaWdPYmplY3QuY2F0ZWdvcnldfTwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLWluZm9cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cCBjbGFzcz1cImluZm9cIj4ke2dpZ09iamVjdC50aXRsZX08L3A+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1c2VyLXByaWNlXCI+U1RBUlRJTkcgQVQ6IDxzcGFuPjxpIGNsYXNzPVwibWF0ZXJpYWwtaWNvbnNcIj5wb2x5bWVyPC9pPiR7cm91bmRfcHJpY2V9PC9zcGFuPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuICAgICAgICAgICAgICAgICAgICAkKCcucHJlbG9hZGVyLWNhcmQnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9uZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKFwiLmdpZ3MtY29udGFpbmVyXCIpLnByZXBlbmQoZ2lnTGF5b3V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICQoXCIuZ2lncy1jb250YWluZXJcIikuYXBwZW5kKGdpZ0xheW91dCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SGFuZGxlci51cGdyYWRlRG9tKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdlbmVyYXRlOiBmdW5jdGlvbihpZCwgb2JqLCBpc093biwgb25lKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2VuZXJhdGVHaWdzRnJvbURhdGEoaWQsIG9iaiwgaXNPd24sIG9uZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbn0pKCk7XG4iLCJmdW5jdGlvbiBmaWx0ZXJQcm9maWxlQ2FyZHMocXVlcnksICRpbnB1dCkge1xuICAvKiBDSEVDSyBGT1IgUVVFUlkgTUFUQ0ggV0lUSCBOQU1FICovXG4gICQoJy5wcm9maWxlLXVzZXItY2FyZCcpLmVhY2goZnVuY3Rpb24oaSxpdGVtKSB7XG4gICAgdmFyIG5hbWUgPSAkKGl0ZW0pLmZpbmQoJy51c2VyLW5hbWUnKS50ZXh0KCkudG9Mb3dlckNhc2UoKTtcbiAgICBuYW1lLm1hdGNoKHF1ZXJ5LnRvTG93ZXJDYXNlKCkpID8gJChpdGVtKS5yZW1vdmVDbGFzcygnaGlkZGVuJykgOiAkKGl0ZW0pLmFkZENsYXNzKCdoaWRkZW4nKVxuICB9KTtcbiAgLyogQUREIFJFRCBCT1JERVIgVE8gSU5QVVQgSUYgTk8gU0VBUkNIIE1BVENIRUQgKi9cbiAgJCgnLnByb2ZpbGUtdXNlci1jYXJkJykubGVuZ3RoID09ICQoJy5wcm9maWxlLXVzZXItY2FyZC5oaWRkZW4nKS5sZW5ndGggPyAkaW5wdXQuYWRkQ2xhc3MoJ2Vycm9yJykgOiAkaW5wdXQucmVtb3ZlQ2xhc3MoJ2Vycm9yJyk7XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gIC8vIEdsb2JhbCBFdmVudHNcbiAgJChkb2N1bWVudCkuY2xpY2soZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKCEkKGUudGFyZ2V0KS5jbG9zZXN0KCcuZHJvcGRvd24nKS5sZW5ndGgpIHtcbiAgICAgICAgICAkKCcjc2V0dGluZ3MtZHJvcGRvd24nKS5wYXJlbnRzKCcuZHJvcGRvd24nKS5yZW1vdmVDbGFzcygnc2hvdycpO1xuICAgICAgfVxuICB9KTtcbiAgLy8gRHJvcGRvd24gc2hvdyBpbiBoZWFkZXJcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNzZXR0aW5ncy1kcm9wZG93bicsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAkKHRoaXMpLnBhcmVudHMoJy5kcm9wZG93bicpLnRvZ2dsZUNsYXNzKCdzaG93Jyk7XG4gICAgICAvLyAuc2libGluZ3MoJ1tkYXRhLWxhYmVsbGVkYnk9c2V0dGluZ3MtZHJvcGRvd25dJykuXG4gIH0pO1xuXG4gIC8vIE9QRU4gR0lHIEJJRyBNT0RBTCBPTiBNRU5VIGNsaWNrXG4gICQoJ2JvZHknKS5kZWxlZ2F0ZSgnbGkuanMtb3Blbi1naWctbW9kYWwnLCAnY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgJCh0aGlzKS5jbG9zZXN0KCcuZ2lnJykudHJpZ2dlcignY2xpY2snKTtcbiAgfSk7XG5cbiAgLyogRklMVEVSIFBST0ZJTEUgQ0FSRFMgKi9cbiAgaWYgKCAkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSApIHtcbiAgICAvKiBGSUxURVIgUFJPRklMRSBDQVJEUyAqL1xuICAgICQoZG9jdW1lbnQpLm9uKCdpbnB1dCcsICcucHJvZmlsZXMtcGFnZSAjc2VhcmNoLWhlYWRlcicsIGZ1bmN0aW9uKCkge1xuICAgICAgZmlsdGVyUHJvZmlsZUNhcmRzKCAkKHRoaXMpLnZhbCgpLCAkKHRoaXMpICk7XG4gICAgfSk7XG5cbiAgICAvKiBPUEVOIElOVEVSTkFMIFBST0ZJTEUgUEFHRSAqL1xuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsJy5wcm9maWxlLXVzZXItY2FyZCcsZnVuY3Rpb24oKXtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy91aS9wcm9maWxlLyMnICsgJCh0aGlzKS5hdHRyKCdpZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgLy8gUkVESVJFQ1QgVE8gUFJPRklMRSBQQUdFIE9OIENMSUNLIE9OIFVTRVJTIFBST0ZJTEVcbiAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzT3BlbkdpZ093bmVyUHJvZmlsZScsZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3VpL3Byb2ZpbGUvIycgKyAkKHRoaXMpLmF0dHIoJ2RhdGEtaWQnKTtcbiAgfSk7XG59KVxuIiwid2luZG93LiR1cGxvYWRDcm9wID0gJChcIiNjcm9wcGVyLXdyYXAtZ2lnXCIpLmNyb3BwaWUoe1xuICB2aWV3cG9ydDoge1xuICAgIHdpZHRoOiA0NTAsXG4gICAgaGVpZ2h0OiAxNTBcbiAgfSxcbiAgZW5hYmxlWm9vbTogdHJ1ZSxcbiAgZW5hYmxlUmVzaXplOiB0cnVlXG59KTtcblxud2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZSA9ICQoXCIjY3JvcHBlci13cmFwLXByb2ZpbGVcIikuY3JvcHBpZSh7XG4gIHZpZXdwb3J0OiB7XG4gICAgd2lkdGg6IDE1MCxcbiAgICBoZWlnaHQ6IDE1MCxcbiAgICB0eXBlOiBcImNpcmNsZVwiXG4gIH0sXG4gIGVuYWJsZVpvb206IHRydWUsXG4gIGVuYWJsZVJlc2l6ZTogdHJ1ZVxufSk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCl7XG4gICAgLyogQlVUVE9OIElOSVQgQ0xJQ0sgT04gSU5QVVQgVFlQRSBGSUxFICovXG4gICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywnLmpzQ3JvcFVwbG9hZCcsZnVuY3Rpb24oKXtcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcbiAgICAgICRjb250ZW50LmZpbmQoJ2lucHV0I2lucHV0LWltYWdlLWdpZycpLmNsaWNrKCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLmpzQ3JvcFVwbG9hZFByb2ZpbGVcIiwgZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgJGNvbnRlbnQgPSAkKHRoaXMpLmNsb3Nlc3QoXCIuY29udGVudFwiKTtcbiAgICAgICRjb250ZW50LmZpbmQoXCJpbnB1dCNpbnB1dC1pbWFnZS1wcm9maWxlXCIpLmNsaWNrKCk7XG4gICAgfSk7XG5cbiAgICAvKiBCVVRUT04gRk9SIEdFVFRJTkcgQ1JPUCBSRVNVbHQgKi9cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCcuanNDcm9wUmVzdWx0JyxmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIHZhciAkY29udGVudCA9ICQodGhpcykuY2xvc2VzdCgnLmNvbnRlbnQnKTtcbiAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcC5jcm9wcGllKCdyZXN1bHQnLCdiYXNlNjQnKS50aGVuKCBmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgnaW1nI2lucHV0LWltYWdlLWdpZycpLmF0dHIoJ3NyYycsIGJhc2U2NCkuc2hvdyg1MDApLnJlbW92ZUNsYXNzKCdlbXB0eScpO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuc2hvdyg1MDApO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLnNob3coKTtcbiAgICAgIH0pO1xuICAgICAgd2luZG93LiR1cGxvYWRDcm9wLmNyb3BwaWUoJ3Jlc3VsdCcsJ2Jsb2InKS50aGVuKCBmdW5jdGlvbihibG9iKSB7XG4gICAgICAgIHdpbmRvdy4kdXBsb2FkQ3JvcEJsb2IgPSBibG9iO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLWdpZ1wiKSkuaGlkZSg0MDApO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIuYnRucy13cmFwXCIpLmZpbmQoXCIuYnRuLXN1Y2Nlc3NcIikpLmhpZGUoKTtcbiAgICAgIH0pO1xuICAgIH0pXG5cbiAgICAkKGRvY3VtZW50KS5vbihcImNsaWNrXCIsIFwiLmpzQ3JvcFJlc3VsdFByb2ZpbGVcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgdmFyICRjb250ZW50ID0gJCh0aGlzKS5jbG9zZXN0KFwiLmNvbnRlbnRcIik7XG4gICAgICB3aW5kb3cuJHVwbG9hZENyb3BQcm9maWxlLmNyb3BwaWUoXCJyZXN1bHRcIiwgXCJiYXNlNjRcIikudGhlbihmdW5jdGlvbihiYXNlNjQpIHtcbiAgICAgICAgICAkY29udGVudC5maW5kKFwic3BhbiNpbnB1dC1pbWFnZS1wcm9maWxlXCIpLmNzcyhcImJhY2tncm91bmQtaW1hZ2VcIiwgJ3VybCgnKyBiYXNlNjQgKycpJykuc2hvdyg1MDApLnJlbW92ZUNsYXNzKFwiZW1wdHlcIik7XG4gICAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiI2Nyb3BwZXItd3JhcC1wcm9maWxlXCIpKS5zaG93KDUwMCk7XG4gICAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5zaG93KCk7XG4gICAgICAgIH0pO1xuICAgICAgd2luZG93LiR1cGxvYWRDcm9wUHJvZmlsZS5jcm9wcGllKFwicmVzdWx0XCIsIFwiYmxvYlwiKS50aGVuKGZ1bmN0aW9uKGJsb2IpIHtcbiAgICAgICAgd2luZG93LiR1cGxvYWRDcm9wQmxvYlByb2ZpbGUgPSBibG9iO1xuICAgICAgICAkY29udGVudC5maW5kKCQoXCIjY3JvcHBlci13cmFwLXByb2ZpbGVcIikpLmhpZGUoNDAwKTtcbiAgICAgICAgJGNvbnRlbnQuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwid2luZG93LmNyZWF0ZU5ld0dpZyA9IChmdW5jdGlvbigpIHtcbiAgICAkKFwiI2FkZC1naWdcIikuZmluZChcIiNuZXdHaWdleHBpcmVcIikuZGF0ZXBpY2tlcigpO1xuICAgICQoXCIjYWRkLWdpZ1wiKS5vbihcImhpZGRlbi5icy5tb2RhbFwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgICQodGhpcykuZmluZChcIi5naWctdGFnc1wiKS5maW5kKFwiLmRlbGV0ZVwiKS5jbGljaygpO1xuICAgICAgICAkKHRoaXMpXG4gICAgICAgICAgICAuZmluZChcImltZyNpbnB1dC1pbWFnZS1naWdcIikuaGlkZSgpLmFkZENsYXNzKFwiZW1wdHlcIikuZW5kKClcbiAgICAgICAgICAgIC5maW5kKFwiLmltZy1sYWJlbFwiKS5zaG93KCkucmVtb3ZlQ2xhc3MoXCJhY3RpdmVcIikudGV4dCgnJykuZW5kKClcbiAgICAgICAgICAgIC5maW5kKFwiI2Nyb3BwZXItd3JhcC1naWdcIikuaGlkZSgpLmVuZCgpXG4gICAgICAgICAgICAuZmluZCgkKFwiLmJ0bnMtd3JhcFwiKS5maW5kKFwiLmJ0bi1zdWNjZXNzXCIpKS5oaWRlKCk7XG4gICAgICAgICQodGhpcylcbiAgICAgICAgICAgIC5maW5kKFwiaW5wdXQsdGV4dGFyZWEsc2VsZWN0XCIpLnZhbChcIlwiKS5lbmQoKVxuICAgICAgICAgICAgLmZpbmQoXCIucmFuZ2Utc2xpZGVyXCIpXG4gICAgICAgICAgICAuZmluZChcImlucHV0XCIpLnZhbChcIjBcIikuZW5kKClcbiAgICAgICAgICAgIC5maW5kKFwiLnJhbmdlLXNsaWRlcl9fdmFsdWVcIikudGV4dChcIjBcIik7XG4gICAgICAgICQodGhpcykuZmluZChcIiNuZXctZ2lnLWNhdGVnb3J5XCIpLnBhcmVudCgpLmZpbmQoXCIudGV4dFwiKS50ZXh0KFwiQWxsIENhdGVnb3JpZXNcIik7XG4gICAgfSk7XG5cbiAgICB2YXIgY2FsY3VsYXRlZExvY2s7XG4gICAgJCgnLmpzQ2FsY3VsYXRlZExvY2snKS5vbignaW5wdXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY29zdCA9ICQoJyNyZXB1dGF0aW9uQ29zdCcpLnZhbCgpLFxuICAgICAgICAgIGFtb3VudCA9ICQoJyNhbW91bnQnKS52YWwoKSxcbiAgICAgICAgICAkY2FsY3VsYXRlZExvY2sgPSAkKCcjY2FsY3VsYXRlZExvY2snKSxcbiAgICAgICAgICBjYWxjdWxhdGVkTG9jayA9IGNhbGNMb2NrKGNvc3QsIGFtb3VudClcbiAgICAgICAgICAkY2FsY3VsYXRlZExvY2sudGV4dChjYWxjdWxhdGVkTG9jayArICcgRVJUJyk7XG4gICAgfSlcblxufSkoKTtcblxuZnVuY3Rpb24gY2FsY0xvY2sgKGNvc3QsIGFtb3VudCkge1xuICByZXR1cm4gKGNvc3QgKiBhbW91bnQpIC8gMTAwO1xufVxuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuZ2lnc1BhZ2VNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG5cbiAgICB2YXIgZ2lnX2N0eCA9ICQoXCJbZGF0YS10YXJnZXQ9JyNnaWdNb2RhbCdcIilcbiAgICB2YXIgZWwgPSBnaWdfY3R4LnJlbW92ZSgwKTtcblxuICAgIGZ1bmN0aW9uIGluaXRHaWdzKCkge1xuICAgICAgICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuICAgICAgICAkKCcubmF2LXRhYnMgLmdpZ3MnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIGdldExpc3RPZkdpZ3MoKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbmluaXRHaWdzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBpbml0R2lncygpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ2dpZ3MtcGFnZScpKSB7XG4gICAgICAgIGdpZ3NQYWdlTW9kdWxlLm9uaW5pdEdpZ3MoKTtcbiAgICB9XG59KTsiLCIvLyBOZXR3b3JrXG53aW5kb3cubmV0d29ya1BhZ2VNb2R1bGUgPSAoZnVuY3Rpb24gKCkge1xuICAkKCcubmF2LXRhYnMgLm5hdi1saW5rJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpXG4gICQoJy5uYXYtdGFicyAubmV0d29yaycpLmFkZENsYXNzKCdhY3RpdmUnKVxuICAvLyB1cGRhdGUgZGF0YSBpbnRlcnZhbFxuICBjb25zdCBpbnRlcnZhbCA9IDEwMDAgKiA2MCAqIDVcbiAgXG4gIGZ1bmN0aW9uIGluaXROZXR3b3JrICgpIHtcbiAgICAvLyBhcnJheSBvZiBDRE4nc1xuICAgIGxldCB1cmxzQXJyID0gW11cbiAgICBsZXQgbGlzdERhdGFcbiAgICAkLmdldCgnaHR0cDovLzE1OS42NS41Ni4xNDA6NDU2Ny9hcGkvdjEvZGh0L2Nkbi1saXN0JywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgIC8vIGNoZWNrIGlmIG5vdCBlbXB0eVxuICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgbGlzdERhdGEgPSBKU09OLnBhcnNlKGRhdGEpXG4gICAgICB9XG4gICAgfSkuZG9uZShmdW5jdGlvbiAoKSB7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3REYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCBhcGlMaXN0ID0gbGlzdERhdGFbaV0gKyAnL2FwaS9jZG4vdjEvaW5mbydcbiAgICAgICAgdXJsc0Fyci5wdXNoKGFwaUxpc3QpXG4gICAgICB9XG4gICAgICAvLyBzdGFydCByZWZyZXNoIGNoYWluXG4gICAgICBzdGFydENoYWluKDEpXG4gICAgfSlcbiAgICAvLyAgTWFwIGxheWVyc1xuICAgIGNvbnN0IGxheWVyTWFwID0gbmV3IG9sLmxheWVyLlRpbGUoe3NvdXJjZTogbmV3IG9sLnNvdXJjZS5PU00oKX0pXG4gICAgY29uc3Qgc291cmNlRmVhdHVyZXMgPSBuZXcgb2wuc291cmNlLlZlY3RvcigpXG4gICAgY29uc3QgbGF5ZXJGZWF0dXJlcyA9IG5ldyBvbC5sYXllci5WZWN0b3Ioe3NvdXJjZTogc291cmNlRmVhdHVyZXN9KVxuICAgIC8vIGNyZWF0ZSBuZXcgTWFwXG4gICAgY29uc3QgbWFwID0gbmV3IG9sLk1hcCh7XG4gICAgICB0YXJnZXQ6ICdtYXAnLFxuICAgICAgbGF5ZXJzOiBbbGF5ZXJNYXAsIGxheWVyRmVhdHVyZXNdLFxuICAgICAgdmlldzogbmV3IG9sLlZpZXcoeyBjZW50ZXI6IG9sLnByb2oudHJhbnNmb3JtKFsyLjQxLCAxNS44Ml0sICdFUFNHOjQzMjYnLCAnRVBTRzozODU3JyksIHpvb206IDMgfSlcbiAgICB9KVxuICAgIC8vIE1hcmtlciBzdHlsZVxuICAgIGNvbnN0IHN0eWxlTWsgPSBbXG4gICAgICBuZXcgb2wuc3R5bGUuU3R5bGUoe1xuICAgICAgICBpbWFnZTogbmV3IG9sLnN0eWxlLkljb24oKHtcbiAgICAgICAgICBhbmNob3I6IFswLjUsIDFdLFxuICAgICAgICAgIHNjYWxlOiAxLFxuICAgICAgICAgIHNyYzogJ2h0dHA6Ly9pbWFnZS5pYmIuY28vZkxFYW5jL21hcHNfYW5kX2ZsYWdzXzEucG5nJ1xuICAgICAgICB9KSksXG4gICAgICAgIHpJbmRleDogNVxuICAgICAgfSlcbiAgICBdXG4gICAgLy8gdG9vbHRpcHNcbiAgICBjb25zdCB0b29sdGlwID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Rvb2x0aXAnKVxuICAgIGNvbnN0IG92ZXJsYXkgPSBuZXcgb2wuT3ZlcmxheSh7XG4gICAgICBlbGVtZW50OiB0b29sdGlwLFxuICAgICAgb2Zmc2V0OiBbMTAsIDBdLFxuICAgICAgcG9zaXRpb25pbmc6ICdib3R0b20tbGVmdCdcbiAgICB9KVxuICAgIG1hcC5hZGRPdmVybGF5KG92ZXJsYXkpXG5cbiAgICAvLyBldmVudCBoYW5kbGVyc1xuICAgIG1hcC5vbigncG9pbnRlcm1vdmUnLCBkaXNwbGF5VG9vbHRpcClcbiAgICBtYXAub24oJ2NsaWNrJywgc2hvd01vZGFsKVxuXG4gICAgJCgnI25ldHdvcmtTZWxlY3QnKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpXG4gICAgICB2YXIgZGF0YSA9ICQoJyNzZXJ2aWNlX3VybCcpLnZhbCgpO1xuICAgICAgJC5hamF4KHtcbiAgICAgICAgdHlwZTogJ1BVVCcsXG4gICAgICAgIHVybDogJy9hcGkvdjEvZGh0L2NkbicsXG4gICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICQudG9hc3Qoe1xuICAgICAgICAgICAgaGVhZGluZzogXCJDRE4gQ2hhbmdpbmdcIixcbiAgICAgICAgICAgIHRleHQ6IFwiWW91ciBjZG4gc3VjY2Vzc2Z1bGx5IGNoYW5nZWQhXCIsXG4gICAgICAgICAgICBzaG93SGlkZVRyYW5zaXRpb246IFwiZmFkZVwiLFxuICAgICAgICAgICAgYWxsb3dUb2FzdENsb3NlOiB0cnVlLFxuICAgICAgICAgICAgaGlkZUFmdGVyOiAyNTAwLFxuICAgICAgICAgICAgYmdDb2xvcjogXCJyZ2JhKDg5LCAxMTYsIDE2NSwgMC45MSlcIixcbiAgICAgICAgICAgIHRleHRDb2xvcjogXCIjZmZmXCIsXG4gICAgICAgICAgICBwb3NpdGlvbjogXCJ0b3AtcmlnaHRcIixcbiAgICAgICAgICAgIGFmdGVyU2hvd246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvdWknIH0sMjQwMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pXG4gICAgJCgnI21vZGFsLW5ldHdvcmsnKS5vbignaGlkZS5icy5tb2RhbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICQoJyNwZWVyLWxpc3QnKS5odG1sKCcnKVxuICAgIH0pXG4gICAgLy8gc3RhcnQgdXBkYXRlIGNoYWluXG4gICAgZnVuY3Rpb24gc3RhcnRDaGFpbiAoaSkge1xuICAgICAgaWYgKGkgPT09IDEpIHtcbiAgICAgICAgY3JlYXRlTWFya2Vycyh1cmxzQXJyKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY3JlYXRlTWFya2Vycyh1cmxzQXJyKVxuICAgICAgICB9LCBpbnRlcnZhbClcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBjcmVhdGluZyBNYXJrZXJzIG9uIE1hcFxuICAgIGZ1bmN0aW9uIGNyZWF0ZU1hcmtlcnMgKHVybEFycmF5KSB7XG4gICAgICBsZXQgZ2VvRGF0YVxuICAgICAgLy8gbG9vcCBhcnJheSB3aXRoIHVybCdzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHVybEFycmF5Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGxldCB1cmwgPSB1cmxBcnJheVtpXVxuICAgICAgICAvLyBnZXQgZGF0YVxuICAgICAgICAkLmdldCh1cmwsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgLy8gY2hlY2sgaWYgbm90IGVtcHR5XG4gICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGdlb0RhdGEgPSBKU09OLnBhcnNlKGRhdGEpXG4gICAgICAgICAgfVxuICAgICAgICB9KS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBsZXQgZmVhdHVyZSA9IG5ldyBvbC5GZWF0dXJlKHtcbiAgICAgICAgICAgIHNlcnZpY2VfdXJsOiBnZW9EYXRhLmh0dHAuc2VydmljZV91cmwsXG4gICAgICAgICAgICBnZW86IGdlb0RhdGEuaHR0cC5nZW8sXG4gICAgICAgICAgICBpcDQ6IGdlb0RhdGEuaHR0cC5pcDQsXG4gICAgICAgICAgICBjb3VudHJ5OiBnZW9EYXRhLmh0dHAuZ2VvLmNvdW50cnlfbmFtZSxcbiAgICAgICAgICAgIGdlb21ldHJ5OiBuZXcgb2wuZ2VvbS5Qb2ludChvbC5wcm9qLnRyYW5zZm9ybShbZ2VvRGF0YS5odHRwLmdlby5sb25naXR1ZGUsIGdlb0RhdGEuaHR0cC5nZW8ubGF0aXR1ZGVdLCAnRVBTRzo0MzI2JywgJ0VQU0c6Mzg1NycpKVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLy8gYXBwZW5kIE1hcmtlciBvbiBtYXBcbiAgICAgICAgICBmZWF0dXJlLnNldFN0eWxlKHN0eWxlTWspXG4gICAgICAgICAgc291cmNlRmVhdHVyZXMuYWRkRmVhdHVyZShmZWF0dXJlKVxuICAgICAgICB9KVxuICAgICAgfVxuICAgICAgLy8gY2xlYXJlIE1hcmtlciBsYXllcnNcbiAgICAgIHNvdXJjZUZlYXR1cmVzLmNsZWFyKClcbiAgICAgIHN0YXJ0Q2hhaW4oMilcbiAgICB9XG5cbiAgICAvLyBzaG93IG1vZGFsIG9uIGNsaWNrXG4gICAgZnVuY3Rpb24gc2hvd01vZGFsIChldnQpIHtcbiAgICAgIGxldCBmZWF0dXJlID0gbWFwLmZvckVhY2hGZWF0dXJlQXRQaXhlbChldnQucGl4ZWwsIGZ1bmN0aW9uIChmZWF0dXJlKSB7XG4gICAgICAgIHJldHVybiBmZWF0dXJlXG4gICAgICB9KVxuICAgICAgaWYgKGZlYXR1cmUpIHtcbiAgICAgICAgJCgnI3BlZXItbGlzdCwgI3BlZXItbGlzdC1jZG4nKS5lbXB0eSgpO1xuICAgICAgICBsZXQgaW5mbyA9IGZlYXR1cmUuTi5nZW8uY2l0eSArICcsICcgKyBmZWF0dXJlLk4uZ2VvLmNvdW50cnlfbmFtZVxuICAgICAgICAkKCcjc2VydmljZV91cmwnKS52YWwoZmVhdHVyZS5OLnNlcnZpY2VfdXJsKVxuICAgICAgICAkKCcjbW9kYWwtbmV0d29yaycpLmZpbmQoJy5udHctY291bnRyeScpLnRleHQoaW5mbylcbiAgICAgICAgJCgnI21vZGFsLW5ldHdvcmsnKS5maW5kKCcubnR3LWlwJykudGV4dChmZWF0dXJlLk4uaXA0KS5hdHRyKCdkYXRhLWlwJywpXG4gICAgICAgIGxldCBwZWVyTGlzdCA9IGZlYXR1cmUuTi5zZXJ2aWNlX3VybCArICcvYXBpL3YxL2RodC9wZWVycydcbiAgICAgICAgY29uc29sZS5sb2cocGVlckxpc3QpXG4gICAgICAgIGxldCBwZWVyRGF0YVxuICAgICAgICAkLmdldChwZWVyTGlzdCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAvLyBjaGVjayBpZiBub3QgZW1wdHlcbiAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgcGVlckRhdGEgPSBKU09OLnBhcnNlKGRhdGEpXG4gICAgICAgICAgfVxuICAgICAgICB9KS5kb25lKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBwZWVyRGF0YS5sZW5ndGg7IGkrKyApIHtcbiAgICAgICAgICAgIHZhciBpbWdfc3JjXG4gICAgICAgICAgICB2YXIgYmxvY2tcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBlZXJEYXRhW2ldWydwcm9maWxlJ10uaXNfY2RuKTtcbiAgICAgICAgICAgIGlmICghcGVlckRhdGFbaV1bJ3Byb2ZpbGUnXS5pc19jZG4pIHtcbiAgICAgICAgICAgICAgICBpbWdfc3JjID0gJ2h0dHA6Ly8nICsgZmVhdHVyZS5OLmlwNCArICc6NTY3OC9hcGkvY2RuL3YxL3Jlc291cmNlP2hrZXk9JyArIHBlZXJEYXRhW2ldWydwcm9maWxlJ10ucHJvZmlsZVBpY3R1cmUgKyAnJnRodW1iPTEnXG4gICAgICAgICAgICAgICAgdmFyIGZpcnN0TmFtZSA9IHBlZXJEYXRhW2ldWydwcm9maWxlJ10ubmFtZS5maXJzdDtcbiAgICAgICAgICAgICAgICB2YXIgbGFzdE5hbWUgPSBwZWVyRGF0YVtpXVsncHJvZmlsZSddLm5hbWUubGFzdDtcbiAgICAgICAgICAgICAgICBibG9jayA9IGA8ZGl2IGNsYXNzPVwiaWNvbi1ib3hcIj48aW1nIHNyYz1cIiR7aW1nX3NyY31cIi8+JHtmaXJzdE5hbWV9ICR7bGFzdE5hbWV9PC9kaXY+YFxuICAgICAgICAgICAgICAgICQoJyNwZWVyLWxpc3QnKS5hcHBlbmQoYmxvY2spXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBibG9jayA9IGA8ZGl2IGNsYXNzPVwiaWNvbi1ib3hcIj48aW1nIHNyYz1cIi4uL2Rpc3QvaW1nL2Nkbi5zdmdcIiAvPkNETjwvZGl2PmBcbiAgICAgICAgICAgICAgICAkKCcjcGVlci1saXN0LWNkbicpLmFwcGVuZChibG9jaylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgICQoXCJbZGF0YS10YXJnZXQ9JyNtb2RhbC1uZXR3b3JrJ11cIikudHJpZ2dlcignY2xpY2snKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgdGFyZ2V0ID0gbWFwLmdldFRhcmdldCgpXG4gICAgbGV0IGpUYXJnZXQgPSB0eXBlb2YgdGFyZ2V0ID09PSBcInN0cmluZ1wiID8gJChcIiNcIit0YXJnZXQpIDogJCh0YXJnZXQpXG4gICAgLy8gc2hvdyB0b29sdGlwIG9uIGhvdmVyXG4gICAgZnVuY3Rpb24gZGlzcGxheVRvb2x0aXAgKGV2dCkge1xuICAgICAgbGV0IGZlYXR1cmUgPSBtYXAuZm9yRWFjaEZlYXR1cmVBdFBpeGVsKGV2dC5waXhlbCwgZnVuY3Rpb24gKGZlYXR1cmUpIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmVcbiAgICAgIH0pXG4gICAgICB0b29sdGlwLnN0eWxlLmRpc3BsYXkgPSBmZWF0dXJlID8gJycgOiAnbm9uZSdcbiAgICAgIGlmIChmZWF0dXJlKSB7XG4gICAgICAgIGxldCBpbmZvID0gZmVhdHVyZS5OLmdlby5jaXR5ICsgJywgJyArIGZlYXR1cmUuTi5nZW8uY291bnRyeV9uYW1lXG4gICAgICAgIG92ZXJsYXkuc2V0UG9zaXRpb24oZXZ0LmNvb3JkaW5hdGUpXG4gICAgICAgICQodG9vbHRpcCkudGV4dChpbmZvKVxuICAgICAgICBqVGFyZ2V0LmNzcyhcImN1cnNvclwiLCAncG9pbnRlcicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBqVGFyZ2V0LmNzcyhcImN1cnNvclwiLCAnJylcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIHJldHVybiB7XG4gICAgb25pbml0TmV0d29yazogZnVuY3Rpb24gKCkge1xuICAgICAgcmV0dXJuIGluaXROZXR3b3JrKClcbiAgICB9XG4gIH1cbn0pKClcblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ25ldHdvcmstcGFnZScpKSB7XG4gICAgbmV0d29ya1BhZ2VNb2R1bGUub25pbml0TmV0d29yaygpXG4gIH1cbn0pXG4iLCIvLyBTbWFydCBTZWFyY2ggRGVjbGFyYXRpbmdcbndpbmRvdy5wcm9maWxlUGFnZU1vZHVsZSA9IChmdW5jdGlvbigpIHtcblxuICAgIHZhciBnaWdfY3R4ID0gJChcIltkYXRhLXRhcmdldD0nI2dpZ01vZGFsJ1wiKVxuICAgIHZhciBlbCA9IGdpZ19jdHgucmVtb3ZlKDApO1xuXG4gICAgZnVuY3Rpb24gaW5pdFByb2ZpbGUoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG5cbiAgICAgICAgLyogUkVTRVQgQU5EIEdFVCBORVcgUFJPRklMRSBJRCBIQVNIICovXG4gICAgICAgIHdpbmRvdy5wcm9maWxlSUQgPSBudWxsO1xuXG4gICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICAgICAgd2luZG93LnByb2ZpbGVJRCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnNsaWNlKDEpO1xuICAgICAgICAgICAgdXBkYXRlUHJvZmlsZSgpO1xuICAgICAgICAgICAgZ2V0R2lncyh3aW5kb3cucHJvZmlsZUlEKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoJy5yZWRlc2lnbmVkLWdpZy1tb2RhbCcpLmFkZENsYXNzKCduby1idXR0b24tb3JkZXInKTtcbiAgICAgICAgICAgICQoJy5lZGl0QnRuUHJvZmlsZScpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIGdldE5vZGVEYXRhKGZ1bmN0aW9uKG5vZGVEYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBKU09OLnBhcnNlKG5vZGVEYXRhKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cucHJvZmlsZUlEID0gZGF0YS5ndWlkO1xuICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoKTtcbiAgICAgICAgICAgICAgICBnZXRHaWdzKGRhdGEuZ3VpZCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBnZXRHaWdzKGd1aWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coZ3VpZCk7XG4gICAgICAgIGdldFByb2ZpbGVHaWdzKGd1aWQsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBwcm9maWxlX2dpZ3MgPSBKU09OLnBhcnNlKGRhdGEpO1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcm9maWxlX2dpZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAkLmFqYXgoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IFwiL2FwaS92MS9kaHQvaGtleS8/aGtleT1cIiArIHByb2ZpbGVfZ2lnc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgaGs6IHByb2ZpbGVfZ2lnc1tpXSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogXCJHRVRcIixcbiAgICAgICAgICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihqc19kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoanNfZGF0YSAhPSAnbnVsbCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnX28gPSBKU09OLnBhcnNlKGpzX2RhdGEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdlbmVyYXRlR2lnc01vZHVsZS5nZW5lcmF0ZSh0aGlzLmhrLCBnaWdfbywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQoJy5wcmVsb2FkZXItY2FyZCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVuZGVyT25lR2lnKGdpZ2lkLCBvbmUpIHtcbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogXCIvYXBpL3YxL2RodC9oa2V5Lz9oa2V5PVwiICsgZ2lnaWQsXG4gICAgICAgICAgICBoazogZ2lnaWQsXG4gICAgICAgICAgICB0eXBlOiBcIkdFVFwiLFxuICAgICAgICAgICAgcHJvY2Vzc0RhdGE6IGZhbHNlLFxuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24oanNfZGF0YSkge1xuICAgICAgICAgICAgICAgIGlmIChqc19kYXRhICE9ICdudWxsJykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZ2lnX28gPSBKU09OLnBhcnNlKGpzX2RhdGEpO1xuICAgICAgICAgICAgICAgICAgICBnZW5lcmF0ZUdpZ3NNb2R1bGUuZ2VuZXJhdGUodGhpcy5oaywgZ2lnX28sIHRydWUsIG9uZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJCgnLnByZWxvYWRlci1jYXJkJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFUlInLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBvbmluaXQ6IGluaXRQcm9maWxlLFxuICAgICAgICBnZXRBbGxHaWdzOiBnZXRHaWdzLFxuICAgICAgICByZW5kZXJPbmVHaWc6IHJlbmRlck9uZUdpZ1xuICAgIH1cbn0pKCk7XG5cblxuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJ2JvZHknKS5oYXNDbGFzcygncHJvZmlsZS1wYWdlJykpIHtcbiAgICAgICAgcHJvZmlsZVBhZ2VNb2R1bGUub25pbml0KCk7XG4gICAgfVxufSk7IiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cucHJvZmlsZXNQYWdlTW9kdWxlID0gKGZ1bmN0aW9uKCkge1xuXG4gICAgdmFyIGdpZ19jdHggPSAkKFwiW2RhdGEtdGFyZ2V0PScjZ2lnTW9kYWwnXCIpXG4gICAgdmFyIGVsID0gZ2lnX2N0eC5yZW1vdmUoMCk7XG5cbiAgICBmdW5jdGlvbiBpbml0UHJvZmlsZXMoKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyAubmF2LWxpbmsnKS5yZW1vdmVDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgICQoJy5uYXYtdGFicyAucHJvZmlsZXMnKS5hZGRDbGFzcygnYWN0aXZlJyk7XG4gICAgICAgIG1haW5fcHJvZmlsZV9jYXJkcygpO1xuICAgIH1cblxuICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuanNMb2FkTW9yZVByb2ZpbGVzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGxpbWl0ID0gbGltaXQgKyA5O1xuICAgICAgICBtYWluX3Byb2ZpbGVfY2FyZHMoKTtcbiAgICB9KTtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgb25pbml0cHJvZmlsZXM6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIGluaXRQcm9maWxlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpO1xuXG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCdib2R5JykuaGFzQ2xhc3MoJ3Byb2ZpbGVzLXBhZ2UnKSkge1xuICAgICAgICBwcm9maWxlc1BhZ2VNb2R1bGUub25pbml0cHJvZmlsZXMoKTtcbiAgICB9XG59KTtcbiIsIndpbmRvdy5uZXdHaWdSYW5nZVNsaWRlciA9IChmdW5jdGlvbigpIHtcblx0dmFyIHJhbmdlU2xpZGVyID0gZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNsaWRlciA9ICQoXCIucmFuZ2Utc2xpZGVyXCIpLFxuXHRcdFx0cmFuZ2UgPSAkKFwiLnJhbmdlLXNsaWRlcl9fcmFuZ2VcIiksXG5cdFx0XHR2YWx1ZSA9ICQoXCIucmFuZ2Utc2xpZGVyX192YWx1ZVwiKTtcblxuXHRcdHNsaWRlci5lYWNoKGZ1bmN0aW9uKCkge1xuXHRcdFx0dmFsdWUuZWFjaChmdW5jdGlvbigpIHtcblx0XHRcdFx0dmFyIHZhbHVlID0gJCh0aGlzKVxuXHRcdFx0XHRcdC5wcmV2KClcblx0XHRcdFx0XHQuYXR0cihcInZhbHVlXCIpO1xuXHRcdFx0XHQkKHRoaXMpLmh0bWwodmFsdWUpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJhbmdlLm9uKFwiaW5wdXRcIiwgZnVuY3Rpb24oKSB7XG5cdFx0XHRcdCQodGhpcylcblx0XHRcdFx0XHQubmV4dCh2YWx1ZSlcblx0XHRcdFx0XHQuaHRtbCh0aGlzLnZhbHVlKTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9O1xuXG5cdHJhbmdlU2xpZGVyKCk7XG59KSgpO1xuIiwiLy8gU21hcnQgU2VhcmNoIERlY2xhcmF0aW5nXG53aW5kb3cuc21hcnRTZWFyY2hNb2R1bGUgPSAoZnVuY3Rpb24oKSB7XG4gICAgLy8gR2xvYmFsIHZhcmlhYmxlcyBmb3IgU21hcnQgU2VhcmNoXG5cbiAgICB2YXIgc2VhcmNoQXJyYXkgPSBuZXcgQXJyYXkoKTtcbiAgICB2YXIga2V5dXBUaW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgZGF0YUxlbmd0aCA9IDBcblxuICAgIHZhciBzZWFyY2hBID0gJyc7XG5cbiAgICBmdW5jdGlvbiBzbWFydFNlYXJjaCgpIHtcbiAgICAgICAgdmFyIHVybCA9IGFwaV9pZHhfY2RuX3VybCgpO1xuICAgICAgICAvLyBidWlsZCB1cmwgZm9yIHNlYXJjaGluZ1xuICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAkLmVhY2goc2VhcmNoQXJyYXksIGZ1bmN0aW9uKGksIGl0ZW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgc2VhcmNoUSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RleHQnICYmIGl0ZW0udmFsdWUgPT0gJycgJiYgc2VhcmNoQXJyYXkubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnYWxsJztcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICdhbGwnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICd0ZXh0JyAmJiBpdGVtLnZhbHVlID09ICcnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCAhPSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHVybCArPSAnJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGl0ZW0udHlwZSA9PSAndGFncycgJiYgaXRlbS52YWx1ZSA9PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJyc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnICYmIGl0ZW0udmFsdWUgPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9ICcnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS50eXBlID09ICdjYXRlZ29yeScgJiYgaXRlbS52YWx1ZSA9PSAnYWxsJykge1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gJ2FsbCc7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnICYmIHNlYXJjaEFycmF5Lmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaFEgKz0gJ2FsbCYnICsgaXRlbS50eXBlICsgJz0nICsgaXRlbS52YWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgdXJsICs9IHNlYXJjaFE7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoUSArPSAnJicgKyBpdGVtLnR5cGUgKyAnPScgKyBpdGVtLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB1cmwgKz0gc2VhcmNoUTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCArPSAnYWxsJztcbiAgICAgICAgfVxuXG4gICAgICAgICQuYWpheCh7XG4gICAgICAgICAgICB0eXBlOiAnR0VUJyxcbiAgICAgICAgICAgIHVybDogdXJsICsgJyZsaW1pdD0xMDAwJyxcbiAgICAgICAgICAgIHFyeTogc2VhcmNoQSxcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgaWYgKGRhdGEgPT0gJ251bGwnKSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEgPSBKU09OLnN0cmluZ2lmeSh7IHJlc3VsdDogYE5vIHJlc3VsdHMgZm9yIHRoaXMgc2VhcmNoYCB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZXZlbnRfb25fc2VhcmNoX2dpZ19kYXRhKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBTZWFyY2ggRXZlbnRzXG5cbiAgICAvLyBTdWJtaXQgc2VhcmNoIGZvciB0ZXh0IGZpZWxkXG4gICAgJChkb2N1bWVudCkub24oJ2tleXVwJywgJ2lucHV0I3NlYXJjaC1oZWFkZXInLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmICh0aGlzLnZhbHVlLmxlbmd0aCA8IDIgJiYgdGhpcy52YWx1ZS5sZW5ndGggPiAwKSByZXR1cm47XG4gICAgICAgIGxpbWl0ID0gOTtcbiAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgZGVsYXkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgb3V0cHV0U3RyaW5nID0gJChlLnRhcmdldCkudmFsKCkuc3BsaXQoXCIgXCIpLmpvaW4oXCIlMjBcIik7XG4gICAgICAgICAgICBpZiAoc2VhcmNoQXJyYXkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRleHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXRlbS50eXBlID09ICd0ZXh0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RleHQnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHRleHQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0ZXh0JywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGV4dCcsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhzZWFyY2hBcnJheSk7XG4gICAgICAgICAgICBzbWFydFNlYXJjaE1vZHVsZS5zZWFyY2goKTtcbiAgICAgICAgfSwgNTAwKTtcbiAgICB9KTtcblxuICAgIC8vIFN1Ym1pdCBzZWFyY2ggZm9yIGRyb3Bkb3duIGV4cGVydGlzZVxuICAgICQoZG9jdW1lbnQpLm9uKCdjaGFuZ2UnLCAnI2RvbWFpbi1leHBlcnRpc2Utc2VsZWN0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlbCA9ICQodGhpcykuZHJvcGRvd24oJ2dldCB2YWx1ZScpO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3RhZ3MnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5zcGxpY2Uoc2VhcmNoQXJyYXkuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIHZhciBjYXRlZ29yeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ2NhdGVnb3J5Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2F0ZWdvcnkgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChjYXRlZ29yeSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ2NhdGVnb3J5JywgdmFsdWU6IGVsIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdjYXRlZ29yeScsIHZhbHVlOiBlbCB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgICAgICAgICAgaWYgKGVsICE9ICdhbGwnKSBsb2FkX3RhZ3NfcGVyX2RvbWFpbihlbCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignY2hhbmdlJywgJyNza2lsbHMtdGFncycsIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZWwgPSAkKHRoaXMpLmRyb3Bkb3duKCdnZXQgdmFsdWUnKTtcbiAgICAgICAgY29uc29sZS5sb2coZWwpO1xuICAgICAgICBpZiAoZWwgPT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJCgnLmdpZ3MtY29udGFpbmVyJykuZW1wdHkoKTtcbiAgICAgICAgICAgIHZhciBvdXRwdXRTdHJpbmcgPSBlbC5qb2luKFwiJTIwXCIpO1xuICAgICAgICAgICAgY29uc29sZS5sb2cob3V0cHV0U3RyaW5nKVxuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciB0YWdzID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAndGFncycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhZ3MgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICd0YWdzJywgdmFsdWU6IG91dHB1dFN0cmluZyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmICh0YWdzID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnB1c2goeyB0eXBlOiAndGFncycsIHZhbHVlOiBvdXRwdXRTdHJpbmcgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWFyY2hBcnJheS5wdXNoKHsgdHlwZTogJ3RhZ3MnLCB2YWx1ZTogb3V0cHV0U3RyaW5nIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cbiAgICAkKGRvY3VtZW50KS5vbignbW91c2V1cCB0b3VjaGVuZCcsICcjc2xpZGVyLXJhbmdlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB2YWx1ZXMgPSAkKHRoaXMpLnNsaWRlcihcInZhbHVlc1wiKTtcbiAgICAgICAgaWYgKHZhbHVlc1swXSA9PSAwICYmIHZhbHVlc1sxXSA9PSAyMDAwKSB7XG4gICAgICAgICAgICBzZWFyY2hBcnJheS5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgICAgIGlmIChpdGVtLnR5cGUgPT0gJ3ExcmFuZ2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlYXJjaEFycmF5LnNwbGljZShzZWFyY2hBcnJheS5pbmRleE9mKGl0ZW0pLCAxKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsaW1pdCA9IDk7XG4gICAgICAgICQoJy5naWdzLWNvbnRhaW5lcicpLmVtcHR5KCk7XG4gICAgICAgIGRlbGF5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlYXJjaEFycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHZhciBxMXJhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGl0ZW0udHlwZSA9PSAncTFyYW5nZScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHExcmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkuc3BsaWNlKHNlYXJjaEFycmF5LmluZGV4T2YoaXRlbSksIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHExcmFuZ2UgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VhcmNoQXJyYXkucHVzaCh7IHR5cGU6ICdxMXJhbmdlJywgdmFsdWU6IHZhbHVlc1swXSArICclMjAnICsgdmFsdWVzWzFdIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc21hcnRTZWFyY2hNb2R1bGUuc2VhcmNoKCk7XG4gICAgICAgIH0sIDIwMCk7XG4gICAgfSk7XG5cblxuXG5cbiAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnLmpzTG9hZE1vcmVTZWFyY2gnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgbGltaXQgPSBsaW1pdCArIDk7XG4gICAgICAgIHNtYXJ0U2VhcmNoTW9kdWxlLnNlYXJjaCgpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2VhcmNoOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiBzbWFydFNlYXJjaCgpO1xuICAgICAgICB9XG4gICAgfVxuXG59KSgpOyJdfQ==
