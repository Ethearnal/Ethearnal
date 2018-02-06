function filterProfileCards(query, $input) {
  /* CHECK FOR QUERY MATCH WITH NAME */
  $('.profile-user-card').each(function(i,item) {
    var name = $(item).find('.user-name').text().toLowerCase();
    name.match(query.toLowerCase()) ? $(item).removeClass('hidden') : $(item).addClass('hidden')
  });
  /* ADD RED BORDER TO INPUT IF NO SEARCH MATCHED */
  $('.profile-user-card').length == $('.profile-user-card.hidden').length ? $input.addClass('error') : $input.removeClass('error');
}

$(document).ready(function(){
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

  /* FILTER PROFILE CARDS */
  if ( $('body').hasClass('profiles-page') ) {
    $(document).on('input', '.profiles-page #search-header', function() {
      filterProfileCards( $(this).val(), $(this) );
    });
  }
})
