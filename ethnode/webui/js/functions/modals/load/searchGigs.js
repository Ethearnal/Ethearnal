$category = '';
$jobType = '';
$experienceLevel = '';
$budget = '';
var searchQuery = '';

function formatSearchQuery() {
    // Function variables
    $filter = $('.filters .filter');

    // Search variables
    $search = $('input#search-header').val().replace(/ /g,"%20").toLowerCase();
    $search == '' ? $search = '' : $search = 'text=' + $search;

    // SEARCH QUERY VARIABLES
    $categoryParent = $filter.parent().find('.filter.category');
    $categoryText = $categoryParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    $jobTypeParent = $filter.parent().find('.filter.job-type');
    $jobTypeText = $jobTypeParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    $experienceLevelParent = $filter.parent().find('.filter.experience-level');
    $experienceLevelText = $experienceLevelParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    $budgetParent = $filter.parent().find('.filter.budget');
    $budgetText = $budgetParent.find('.is-checked span.mdl-checkbox__label').text().replace(/ /g,"_").toLowerCase();

    if ($categoryText !== '') $category = '&category=' + $categoryText;
    if ($jobTypeText !== '') $jobType = '&job_type=' + $jobTypeText;
    if ($experienceLevelText !== '') $experienceLevel = '&experience_level=' + $experienceLevelText;
    if ($budgetText !== '') $budget = '&budget=' + $budgetText;

    // FORMING SEARCH QUERY
    //var search = 'http://london.ethearnal.com:5678/api/cdn/v1/idx/?';
    var search = 'http://london.ethearnal.com:5678/api/cdn/v1/idx/?' + $search + $category + $jobType + $experienceLevel + $budget;
    searchQuery = search.replace('/api/v1/my/idx/query/guids/?&', '/api/v1/my/idx/query/guids/?');

    // null every filter
    $category = ''; $jobType = ''; $experienceLevel = ''; $budget = '';
}


// SEARCH QUERY MAIN FUNCTION
function searchQueryDo() {

    // FORMATING SEARCH QUERY
    formatSearchQuery();

//    if (searchQuery == "http://london.ethearnal.com:5678/api/cdn/v1/idx/?text=" || searchQuery == "/api/v1/my/idx/query/guids/?" || searchQuery == false) {
//        $('.gig').remove();
//        //$('.gigs-container').empty();
//        console.log('SEARCHING');
//        $('input#search-header, button#search-button').removeClass('wrong');
//        loadGigs();
//        return false;
//    }

    /*$.ajax({
        url: searchQuery,
        type: "GET",
        processData: false,
        success: function(data) {
            loadGigsOnAjaxSuccess(data, true);

            $('input#search-header, button#search-button').removeClass('wrong');
            $filter.children().stop(true, true).removeClass('is-wrong');
        },
        error: function(error) {
            $('.gig').remove();
            $filter.find('.is-checked').stop(true, true).addClass('is-wrong');
            $('input#search-header, button#search-button').addClass('wrong');
        }
    });*/

    console.log('searchQuery',searchQuery);
    $('.gigs-container').empty();
    $.ajax({
        url: searchQuery,
        type: "GET",
        processData: false,
        success: function(data) {
            //;
            console.log('searchQuery SUC', data);
            profile_gigs = JSON.parse(data);
            for (var i = 0; i < profile_gigs.length; i++) {
                console.log("profile_gig", profile_gigs[i])
               $.ajax({
                        url: "/api/v1/dht/hkey/?hkey=" + profile_gigs[i],
                        hk: profile_gigs[i],
                        type: "GET",
                        processData: false,
                        success: function(js_data){

                                   console.log('hkey',this.hk);
                                   console.log('data:',js_data);
                                   gig_o = JSON.parse(js_data);
                                   //console.log('data:',gig_o);
                                   createGigToFound(this.hk, gig_o);
                                   // $('.gig').remove();


                            },

                        error: function(error) {
                                console.log('ERR',error);

                                return;
                            }
                    });

                    //var gig_hk = profile_gigs[i];
                    //console.log('GIG HK:',gig_hk);

                    /**/
                }
        },
        error: function(error) {
           //;
           console.log("searchQuery ERR", error);
        }
    });

}



// Search query based on filters
$('label.mdl-checkbox').click(function(e) {
    e.preventDefault();
    $label = $(this);
    $labelParent = $(this).parent();

    // IF USER UNSELECTS THE FILTER, THEN THIS HAPPENS
    if ($(this).hasClass('is-checked')) {
        $(this).stop(true, true).removeClass('is-checked is-wrong');

        searchQueryDo();

        return false;
    }


    // Making sure you can select only one checkbox per filter
    $labelParent.find('.is-checked').not($(this)).stop(true, true).removeClass('is-checked is-wrong');
    $(this).stop(true, true).toggleClass('is-checked');

    searchQueryDo();
});

// Also a search query based on filters, but this function works only when you click on a button that's right next to search input
$('button#search-button').click(function(e) {
    e.preventDefault();
    searchQueryDo();
})

// When you press enter while in search box input, it will run search query function too.
$('input#search-header').keypress(function (e) {
    if (e.which == 13) {
        e.preventDefault();

        searchQueryDo();

        return false;
    }
});