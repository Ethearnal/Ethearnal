// Global Events

// Dropdown show in header
$(document).on('click', '#settings-dropdown', function(e) {
    e.preventDefault();
    $(this).parents('.dropdown').toggleClass('show');
    // .siblings('[data-labelledby=settings-dropdown]').
});