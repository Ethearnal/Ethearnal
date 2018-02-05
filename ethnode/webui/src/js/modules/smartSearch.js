// Smart Search Declarating
window.smartSearchModule = (function() {
  // Global variables for Smart Search

  var searchArray = new Array();

  function smartSearch() {
      var url = api_idx_cdn_url();
      var searchQ = '';
      // build url for searching
      if (searchArray.length) {
          $.each(searchArray, function(i, item) {
              if (item.type == 'text' && item.value == '') {
                  searchQ += 'all';
                  url += 'all';
              } else {
                  searchQ += item.type + '=' + item.value;
                  url += item.type + '=' + item.value;
              }
          });
      }

      $.ajax({
          type: 'GET',
          url: url,
          qry: searchQ,
          success: function(data) {
              console.log(data);
              if (data == 'null') {
                  data = JSON.stringify({ result: "No results" });
              }
              event_on_search_gig_data(searchQ, data);
          }
      });
  }

  // Search Events

  // Submit search for text field
  $(document).on('keypress', 'input#search-header', function(e) {
      if (e.which == 13) {
          var outputString = $(e.target).val().split(" ").join("%20");
          if (searchArray.length) {
              searchArray.filter(function(item) {
                  if (item.type == 'text') {
                      searchArray.splice(searchArray.indexOf(item), 1);
                      searchArray.push({ type: 'text', value: outputString });
                  }
              });
          } else {
              searchArray.push({ type: 'text', value: outputString });
          }
          smartSearchModule.search();
      }
  });

  // Submit search for dropdown expertise
  $(document).on('change', '#domain-expertise-select', function() {
      var el = $(this).dropdown('get value');
      load_tags_per_domain(el);
      search_event();
  });

  return {
      search: function() {
          return smartSearch();
      }
  }
})();
