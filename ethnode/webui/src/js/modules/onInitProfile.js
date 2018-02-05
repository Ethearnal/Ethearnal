// Smart Search Declarating
window.profilePageModule = (function() {

    var gig_ctx = $("[data-target='#gigModal'")
    var el = gig_ctx.remove(0);

    function initProfile() {
        getNodeData(function(node_data) {
            var node = $.parseJSON(node_data);
            getProfileGigs(node.guid, function(data) {
                var profile_gigs = JSON.parse(data);
                for (var i = 0; i < profile_gigs.length; i++) {
                    var id = profile_gigs[i];
                    $.ajax({
                        url: "/api/v1/dht/hkey/?hkey=" + profile_gigs[i],
                        hk: profile_gigs[i],
                        type: "GET",
                        processData: false,
                        success: function(js_data) {
                            var gig_o = JSON.parse(js_data);
                            console.log("SOSO")
                            console.log(id);
                            console.log(this.hk);
                            generateGigsModule.generate(this.hk, gig_o);
                        },

                        error: function(error) {
                            console.log('ERR', error);

                            return;
                        }
                    });
                }
            });
        });
    }

    return {
        oninit: function() {
            return initProfile();
        }
    }

})();


$(document).ready(function() {
    profilePageModule.oninit();
});