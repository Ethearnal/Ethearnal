// Network
window.networkPageModule = (function () {

  function initNetwork () {

    var json1 = [
      {
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
      },
      {
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
      },
      {
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
      }
    ]

    var sourceFeatures = new ol.source.Vector(),
        layerFeatures = new ol.layer.Vector({source: sourceFeatures})

    var map = new ol.Map({
      target: 'map',
      layers: [
        new ol.layer.Tile({source: new ol.source.OSM()}),
        layerFeatures
      ],
      view: new ol.View({ center: [0, 0], zoom: 2 })
    })

    var style1 = [
      new ol.style.Style({
        image: new ol.style.Icon(({
          rotateWithView: false,
          anchor: [0.5, 1],
          anchorXUnits: 'fraction',
          anchorYUnits: 'fraction',
          opacity: 1,
          scale: 0.7,
          // src: '//cdn.rawgit.com/jonataswalker/ol3-contextmenu/master/examples/img/pin_drop.png'
          src: '//raw.githubusercontent.com/jonataswalker/map-utils/master/images/marker.png'
        })),
        zIndex: 5
      }),
      new ol.style.Style({
        image: new ol.style.Circle({
          radius: 5,
          fill: new ol.style.Fill({color: 'rgba(255,255,255,1)'}),
          stroke: new ol.style.Stroke({color: 'rgba(0,0,0,1)'})
        })
      })
    ]

    for (var i = 0; i < json1.length; i++) {
      var count = 0
      console.log(json1[i].geo.latitude)
      console.log(json1[i].geo.longitude)

      var feature = new ol.Feature({
        type: 'click',
        ip4: json1[i].ip4,
        country: json1[i].geo.country_name,
        geometry: new ol.geom.Point(ol.proj.transform([json1[i].geo.longitude, json1[i].geo.latitude], 'EPSG:4326', 'EPSG:3857'))
      })
      feature.setStyle(style1);
      sourceFeatures.addFeature(feature);
    }

    map.on('click', function(evt) {
      var f = map.forEachFeatureAtPixel(evt.pixel, function(ft, layer) { return ft })
      if (f && f.get('type') === 'click') {
        var geometry = f.getGeometry()
        var coord = geometry.getCoordinates()
        $('#modal-network').find('.ntw-country').text(f.N.country)
        $('#modal-network').find('.ntw-ip').text(f.N.ip4)
        $("[data-target='#modal-network']").trigger('click')
      }
    })
  }

  return {
    oninitNetwork: function () {
      return initNetwork()
    }
  }
})()

$(document).ready(function() {
    if ($('body').hasClass('network-page')) {
        networkPageModule.oninitNetwork();
    }
});
