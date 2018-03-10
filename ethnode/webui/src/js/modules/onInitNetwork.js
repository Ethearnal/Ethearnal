// Network
window.networkPageModule = (function () {
  $('.nav-tabs .nav-link').removeClass('active')
  $('.nav-tabs .network').addClass('active')
  // update data interval
  const interval = 1000 * 60 * 5
  
  function initNetwork () {
    // array of CDN's
    let urlsArr = []
    let listData
    $.get('api/v1/dht/cdn-list', function (data) {
      // check if not empty
      if (data) {
        listData = JSON.parse(data)
      }
    }).done(function () {
      for (let i = 0; i < listData.length; i++) {
        let apiList = listData[i] + '/api/cdn/v1/info'
        urlsArr.push(apiList)
      }
      // start refresh chain
      startChain(1)
    })
    //  Map layers
    const layerMap = new ol.layer.Tile({source: new ol.source.OSM()})
    const sourceFeatures = new ol.source.Vector()
    const layerFeatures = new ol.layer.Vector({source: sourceFeatures})
    // create new Map
    const map = new ol.Map({
      target: 'map',
      layers: [layerMap, layerFeatures],
      view: new ol.View({ center: ol.proj.transform([2.41, 15.82], 'EPSG:4326', 'EPSG:3857'), zoom: 3 })
    })
    // Marker style
    const styleMk = [
      new ol.style.Style({
        image: new ol.style.Icon(({
          anchor: [0.5, 1],
          scale: 1.5,
          //src: 'http://image.ibb.co/fLEanc/maps_and_flags_1.png'
          src: '/imgs/places.svg'
        })),
        zIndex: 5
      })
    ]
    // tooltips
    const tooltip = document.getElementById('tooltip')
    const overlay = new ol.Overlay({
      element: tooltip,
      offset: [10, 0],
      positioning: 'bottom-left'
    })
    map.addOverlay(overlay)

    // event handlers
    map.on('pointermove', displayTooltip)
    map.on('click', showModal)

    $('#networkSelect').on('click', function (e) {
      e.preventDefault()
      var data = $('#service_url').val();
      $.ajax({
        type: 'PUT',
        url: '/api/v1/dht/cdn',
        data: data,
        success: function() {
          $.toast({
            heading: "CDN Changing",
            text: "Your cdn successfully changed!",
            showHideTransition: "fade",
            allowToastClose: true,
            hideAfter: 2500,
            bgColor: "rgba(89, 116, 165, 0.91)",
            textColor: "#fff",
            position: "top-right",
            afterShown: function() {
              // setTimeout(function() { window.location.href = '/ui' },2400);
            }
          });
        }
      });
    })
    $('#modal-network').on('hide.bs.modal', function () {
      $('#peer-list').html('')
    })
    // start update chain
    function startChain (i) {
      if (i === 1) {
        createMarkers(urlsArr)
      } else {
        setTimeout(() => {
          createMarkers(urlsArr)
        }, interval)
      }
    }

    // creating Markers on Map
    function createMarkers (urlArray) {
      let geoData
      // loop array with url's
      for (let i = 0; i < urlArray.length; i++) {
        let url = urlArray[i]
        // get data
        $.get(url, function (data) {
          // check if not empty
          if (data) {
            geoData = JSON.parse(data)
          }
        }).done(function () {
          let feature = new ol.Feature({
            service_url: geoData.http.service_url,
            geo: geoData.http.geo,
            ip4: geoData.http.ip4,
            country: geoData.http.geo.country_name,
            geometry: new ol.geom.Point(ol.proj.transform([geoData.http.geo.longitude, geoData.http.geo.latitude], 'EPSG:4326', 'EPSG:3857'))
          })
          // append Marker on map
          feature.setStyle(styleMk)
          sourceFeatures.addFeature(feature)
        })
      }
      // cleare Marker layers
      sourceFeatures.clear()
      startChain(2)
    }

    // show modal on click
    function showModal (evt) {
      let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature
      })
      if (feature) {
        $('#peer-list, #peer-list-cdn').empty();
        let info = feature.N.geo.city + ', ' + feature.N.geo.country_name
        $('#service_url').val(feature.N.service_url)
        $('#modal-network').find('.ntw-country').text(info)
        $('#modal-network').find('.ntw-ip').text(feature.N.ip4).attr('data-ip',)
        let peerList = feature.N.service_url + '/api/v1/dht/peers'
        console.log(peerList)
        let peerData
        $.get(peerList, function (data) {
          // check if not empty
          if (data) {
            peerData = JSON.parse(data)
          }
        }).done(function () {
          for ( var i = 0; i < peerData.length; i++ ) {
            var img_src
            var block
            console.log(peerData[i]['profile'].is_cdn);
            if (!peerData[i]['profile'].is_cdn) {
                img_src = 'http://' + feature.N.ip4 + ':5678/api/cdn/v1/resource?hkey=' + peerData[i]['profile'].profilePicture + '&thumb=1'
                var firstName = 'DD';//peerData[i]['profile'].name.first;
                var lastName = 'SS';//peerData[i]['profile'].name.last;
                block = `<div class="icon-box"><img src="${img_src}"/>${firstName} ${lastName}</div>`
                $('#peer-list').append(block)
            }
            else {
                block = `<div class="icon-box"><img src="../dist/img/cdn.svg" />CDN</div>`
                $('#peer-list-cdn').append(block)
            }
          }
        })
        $("[data-target='#modal-network']").trigger('click');
      }
    }

    let target = map.getTarget()
    let jTarget = typeof target === "string" ? $("#"+target) : $(target)
    // show tooltip on hover
    function displayTooltip (evt) {
      let feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        return feature
      })
      tooltip.style.display = feature ? '' : 'none'
      if (feature) {
        let info = feature.N.geo.city + ', ' + feature.N.geo.country_name
        overlay.setPosition(evt.coordinate)
        $(tooltip).text(info)
        jTarget.css("cursor", 'pointer')
      } else {
        jTarget.css("cursor", '')
      }
    }
  }


  return {
    oninitNetwork: function () {
      return initNetwork()
    }
  }
})()

$(document).ready(function() {
  if ($('body').hasClass('network-page')) {
    networkPageModule.oninitNetwork()
  }
})
