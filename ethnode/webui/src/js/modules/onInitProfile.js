// Smart Search Declarating
window.profilePageModule = (function() {

    var gig_ctx = $("[data-target='#gigModal'")
    var el = gig_ctx.remove(0);

    function initProfile() {
        $('.nav-tabs .nav-link').removeClass('active');

        /* RESET AND GET NEW PROFILE ID HASH */
        window.profileID = null;

        if ( window.location.hash ) {
          window.profileID = window.location.hash.slice(1);
          updateProfile();
          getGigs(window.profileID);
        } else {
          $('.editBtnProfile').removeClass('hidden');
          getNodeData(function(nodeData) {
              $data = JSON.parse(nodeData);
              window.profileID = $data.guid;
              $('.preloader-card').remove();
              updateProfile();
              getGigs($data.guid);
          });
        }
    };

    function getGigs(guid) {
      getProfileGigs(guid, function(data) {
          var profile_gigs = JSON.parse(data);
          for (var i = 0; i < profile_gigs.length; i++) {
              $.ajax({
                  url: "/api/v1/dht/hkey/?hkey=" + profile_gigs[i],
                  hk: profile_gigs[i],
                  type: "GET",
                  processData: false,
                  success: function(js_data) {
                      if (js_data != 'null') {
                          var gig_o = JSON.parse(js_data);
                          generateGigsModule.generate(this.hk, gig_o);
                      } else {
                          $('.preloader-card').remove();
                      }
                  },
                  error: function(error) {
                      console.log('ERR', error);
                      return;
                  }
              });
          }
      });
    }

    return {
      oninit: initProfile
    }
})();


$(document).ready(function() {
    if ($('body').hasClass('profile-page')) {
      profilePageModule.oninit();
    }
});
