function filterProfileCards(query, $input) {
  /* CHECK FOR QUERY MATCH WITH NAME */
  $('.profile-user-card').each(function(i,item) {
    var name = $(item).find('.user-name').text().toLowerCase();
    name.match(query.toLowerCase()) ? $(item).removeClass('hidden') : $(item).addClass('hidden')
  });
  /* ADD RED BORDER TO INPUT IF NO SEARCH MATCHED */
  $('.profile-user-card').length == $('.profile-user-card.hidden').length ? $input.addClass('error') : $input.removeClass('error');
  /* REMOVE LOAD MORE */
  if ( query.length > 0 ) {
    $('.jsProfilesLoadMore').hide();
    $('.postLoad').toggleClass('removedLoad postLoad')
  } else {
    if ( $('.removedLoad').length ) {
      $('.removedLoad').toggleClass('removedLoad postLoad')
      $('.jsProfilesLoadMore').show();
    }
  }
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
    /* FILTER PROFILE CARDS */
    $(document).on('input', '.profiles-page #search-header', function() {
      filterProfileCards( $(this).val(), $(this) );
    });

    /* OPEN INTERNAL PROFILE PAGE */
    $(document).on('click','.profile-user-card',function(){
      window.location.href = '/ui/profile/#' + $(this).attr('id');
    });

    // CLICK ON LOAD-MORE COUNTER:
    $(document).on('click','.jsProfilesLoadMore',function() {
      if ( $('.postLoad').length ) {
        $('.postLoad').prev().nextAll().slice(0,6).removeClass('postLoad');
      }
      if ( $('.postLoad').length == 0 ) $('.jsProfilesLoadMore').hide();
    });
  }

  // REDIRECT TO PROFILE PAGE ON CLICK ON USERS PROFILE
  $(document).on('click','.jsOpenGigOwnerProfile',function() {
    window.location.href = '/ui/profile/#' + $(this).attr('data-id');
  });
})
