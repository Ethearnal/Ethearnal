// Smart Search Declarating
window.gigsPageModule = (function() {

    var gig_ctx = $("[data-target='#gigModal'")
    var el = gig_ctx.remove(0);

    function initGigs() {
        $('.nav-tabs .nav-link').removeClass('active');
        $('.nav-tabs .gigs').addClass('active');
        getListOfGigs();
    }

    return {
        oninitGigs: function() {
            return initGigs();
        }
    }

})();


$(document).ready(function() {
    if ($('body').hasClass('gigs-page')) {
        gigsPageModule.oninitGigs();
    }
});