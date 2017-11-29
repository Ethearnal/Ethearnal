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
    $search == '' ? $search = '' : $search = 'title=' + $search;

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
    var search = '/api/v1/my/idx/query/guids/?' + $search + $category + $jobType + $experienceLevel + $budget;
    searchQuery = search.replace('/api/v1/my/idx/query/guids/?&', '/api/v1/my/idx/query/guids/?');
}


// SEARCH QUERY MAIN FUNCTION
function searchQueryDo() {

    // FORMATING SEARCH QUERY
    formatSearchQuery();

    if (searchQuery == "/api/v1/my/idx/query/guids/?title=" || searchQuery == "/api/v1/my/idx/query/guids/?" || searchQuery == false) {
        $('.gig').remove();
        $('input#search-header, button#search-button').removeClass('wrong');
        loadGigs();
        return false;
    }

    $.ajax({
        url: searchQuery,
        type: "GET",
        processData: false,
        success: function(data) {
            var gigIDS = JSON.parse(data); var gigsToLoad = 10;
            if (data == '' || data == null || gigIDS.length == null) return false;

            // SEARCHING...
            $('.gig').remove();

            $gigsLoaded = $('.gig').length;

            if (gigIDS.length > $gigsLoaded) {
                gigsToLoad = $gigsLoaded + gigsToLoad;

                // LOADING MORE GIGS
                for(i = $gigsLoaded; i < gigsToLoad; i++) {
                    createGig(gigIDS[i]);
                }
            }

            $('input#search-header, button#search-button').removeClass('wrong');
            $filter.children().stop(true, true).removeClass('is-wrong');




            // console.log(result);
            // $result = JSON.parse(result);
            // if (result == '' || result == null || $result.length == null) return false;

            // $('.gig').remove();

            // for(i = 0; i < $result.length; i++) {
            //     createGig($result[i]);
            // }

            // $('input#search-header, button#search-button').removeClass('wrong');
            // $filter.children().stop(true, true).removeClass('is-wrong');
        },
        error: function(error) {
            $('.gig').remove();
            $filter.find('.is-checked').stop(true, true).addClass('is-wrong');
            $('input#search-header, button#search-button').addClass('wrong');
        }
    });

    // null every filter
    $category = ''; $jobType = ''; $experienceLevel = ''; $budget = '';
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