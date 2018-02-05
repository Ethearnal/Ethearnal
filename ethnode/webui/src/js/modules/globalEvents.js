// Global Events
$(document).click(function(e) {
    if (!$(e.target).closest('.dropdown').length) {
        $('#settings-dropdown').parents('.dropdown').removeClass('show');
    }
});
// Dropdown show in header
$(document).on('click', '#settings-dropdown', function(e) {
    e.preventDefault();
    e.stopPropagation();
    $(this).parents('.dropdown').toggleClass('show');
    // .siblings('[data-labelledby=settings-dropdown]').
});

// OPEN GIG BIG MODAL ON MENU click
$('body').delegate('li.js-open-gig-modal', 'click', function(e) {
  $(this).closest('.gig').trigger('click');
});
