// Network
window.networkPageModule = (function () {
  $('.nav-tabs .nav-link').removeClass('active')
  $('.nav-tabs .network').addClass('active')
  // update data interval
  const interval = 1000 * 60 * 5
  function initNetwork () {
    // array of CDN's
    let listData
    let urlsArr = []
    $.get('http://159.65.56.140:4567/api/v1/dht/cdn-list', function (data) {
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
          scale: 1,
          src: 'http://image.ibb.co/fLEanc/maps_and_flags_1.png'
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
      console.log()
      let str = $(this).closest('.cdn-details').find('#service_url').val()
      str = str.substring(0, str.length - 4)
      let url = str + '4567/ui'

      window.location.href = url
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
        let info = feature.N.geo.city + ', ' + feature.N.geo.country_name
        $('#service_url').val(feature.N.service_url)
        $('#modal-network').find('.ntw-country').text(info)
        $('#modal-network').find('.ntw-ip').text(feature.N.ip4)
        let peerList = feature.N.service_url + '/api/v1/dht/peers'
        console.log(peerList)
        let peerData
        $.get(peerList, function (data) {
          // check if not empty
          if (data) {
            peerData = JSON.parse(data)
          }
        }).done(function () {
          console.log(peerData)
          for (let peer in peerData) {
            var img_src
            var block
            console.log(peerData[peer].profile.profilePicture);
            if (!peerData[peer].profile.is_cdn) {
                img_src = feature.N.ip4 + ':5678/api/cdn/v1/resource?hkey=' + peerData[peer].profile.profilePicture + '&thumb=1'
                block = `<div><img src="${img_src}"/>Test test</div>`
                $('#peer-list').append(block)
            }
            else {
                block = `<div><img src="${img_src}"/>Test test</div>`
                $('#peer-list').append(block)
            }
          }
        })

        $("[data-target='#modal-network']").trigger('click')
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
