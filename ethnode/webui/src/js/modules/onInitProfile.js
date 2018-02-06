// Smart Search Declarating
window.profilePageModule = (function() {

    var gig_ctx = $("[data-target='#gigModal'")
    var el = gig_ctx.remove(0);

    function initProfile() {
        $('.nav-tabs .nav-link').removeClass('active');
        getNodeData(function(node_data) {
            console.log(node_data);
            var node = $.parseJSON(node_data);
            getProfileGigs(node.guid, function(data) {
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
            $('.preloader-card').remove();
        });
    }

    return {
        oninit: function() {
            return initProfile();
        }
    }
})();


$(document).ready(function() {
    if ($('body').hasClass('profile-page')) {
      profilePageModule.oninit();
    }
});
