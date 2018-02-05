// Smart Search Declarating
window.profilesPageModule = (function() {

    var gig_ctx = $("[data-target='#gigModal'")
    var el = gig_ctx.remove(0);

    function initProfiles() {
        $('.nav-tabs .nav-link').removeClass('active');
        $('.nav-tabs .profiles').addClass('active');
        main_profile_cards();
    }

    return {
        oninit: function() {
            return initProfiles();
        }
    }

})();


$(document).ready(function() {
    if ($('body').hasClass('profiles-page')) {
        profilesPageModule.oninit();
    }
});