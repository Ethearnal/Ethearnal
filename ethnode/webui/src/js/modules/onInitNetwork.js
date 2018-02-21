// Smart Search Declarating
window.networkPageModule = (function () {
  function initNetwork () {

    var map;
    // var icon = "http://path/to/icon.png";
    // var json = "http://path/to/universities.json";
    var infowindow = new google.maps.InfoWindow();
    function initialize() {

        var mapProp = {
            center: new google.maps.LatLng(52.4550, -3.3833), //LLANDRINDOD WELLS
            zoom: 7,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        map = new google.maps.Map(document.getElementById("map"), mapProp);



        //  $.getJSON(json, function(json1) {
        var json1 = {
            // "universities": [
            //     {
            //         "title": "Aberystwyth University",
            //         "web": "www.aber.ac.uk",
            //         "phone": "+44 (0)1970 623 111",
            //         "lat": 52.415524,
            //         "lng": -4.063066},
            //     {
            //         "title": "Bangor University",
            //         "web": "www.bangor.ac.uk",
            //         "phone": "+44 (0)1248 351 151",
            //         "lat": 53.229520,
            //         "lng": -4.129987},
            //     {
            //         "title": "Cardiff Metropolitan University",
            //         "website": "www.cardiffmet.ac.uk",
            //         "phone": "+44 (0)2920 416 138",
            //         "lat": 51.482708,
            //         "lng": -3.165881}
            // ]

          "geoJSON": [
              {
                "geo": {
                  "zip_code": "EC2V",
                  "latitude": 51.482708,
                  // "latitude": 51.5142,
                  "country_name": "United Kingdom",
                  "region_name": "England",
                  "ip": "178.62.22.110",
                  "longitude": -3.165881,
                  // "longitude": -0.0931,
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
              }
            ]
        };

        $.each(json1.geoJSON, function (key, data) {
          // console.log(data.geo);
          console.log(data.geo.longitude);
          // console.log(data.geo.country_name);
          // var latLng = new google.maps.LatLng(data.lat, data.lng);
          var latLng = new google.maps.LatLng(data.geo.latitude, data.geo.longitude);
          console.log(latLng);
          var marker = new google.maps.Marker({
              position: latLng,
              map: map,
              // icon: icon,
              title: data.geo.country_name
          });

          // var details = data.title + ", " + data.website + ".";
          var details = data.geo.zip_code + ", " + data.geo.country_name + ".";

          bindInfoWindow(marker, map, infowindow, details);

          //    });

        });

    }

    function bindInfoWindow(marker, map, infowindow, strDescription) {
        google.maps.event.addListener(marker, 'click', function () {
            infowindow.setContent(strDescription);
            infowindow.open(map, marker);
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
