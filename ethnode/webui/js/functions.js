// --- MISC FUNCTIONS --- \\

// MATERIAL DESIGN DATE PICKER
$(function() {
    $datePickers = 15;
});

// Checks if there's a word in a string.
function wordInString(s, word){
  return new RegExp( '\\b' + word + '\\b', 'i').test(s);
}


// Validate FORM function
function validateForm(form) {
  var isValid = true;
  $form = form; $content = $form.closest('.content');
  $form.each(function() {

    // GET EVERY INPUT VALUE, IF NULL, THEN NOT VALID.
    if ( $(this).find('input:not(.date-ended):not(.search):not([name="language"]), textarea').filter(function() {
        return $.trim($(this).val()).length == 0
    }).length == 0 ) {
        isValid = true;
    } else {
        isValid = false;
    }
  });

  // CHECKS EVERY DROPDOWN, IF NULL, THEN IT IS NOT VALID
  $form.find('.ui.dropdown').each(function() {
    if($(this).dropdown('get value').length == 0) isValid = false;
  });

  // Checks if image is added and if its not an EDIT modal.
  if($content.find('img.show-image').hasClass('empty') && !$content.closest('.modal-box').hasClass('edit')) isValid = false;

  return isValid;
}

// Clears the form.
function clearForm(form) {
    $form = form; $content = $form.closest('.content');
    $form[0].reset();

    // REMOVING CLASSES
    $form.find('.is-dirty').removeClass('is-dirty');
    $form.find('.is-focused').removeClass('is-focused');

    // MAKING INPUTS EMPTY
    $form.find('.is-dirty').children().val('');
    $form.find('.is-focused').children().val('');

    // MAKING DROPDOWN EMPTY
    $form.find('.ui.dropdown').dropdown('clear');

    // CLEARING IMAGE
    $content.find('img.show-image').attr('src', '').addClass('empty');
    $content.find('label.img-label').text('Add Photo').removeClass('active');
    $content.find('img.file-input-first-image').removeClass('active');
}


















// This is a seeMoreJobs function where if you click a "SEE MORE" button in your profile's work or education fields it'll load more jobs or educations.
// function seeButtons() {
//     // Show jobs and education divs on the page when it's loaded.
//     $("#jobs .job:lt("+$showJobs+")").show();
//     $("#jobs .education:lt("+$showJobs+")").show();

//     $countJobs = $("#jobs .jobs-container .job").length;
//     $countEdu = $("#jobs .education-container .education").length;

//     if( $countJobs <= 2 && $countEdu <= 2 ) {
//         $(".see-less, .see-more").hide();
//         return;
//     } else if ( $countEdu <= 2 && $countJobs > 2 ) {
//         $(".educations-see").hide();
//     } else if ( $countJobs <= 2 && $countEdu > 2 ) {
//         $(".jobs-see").hide();
//     }

//     // When you click on .see-less button, it will disappear 3 tabs out of the tablist every time, until reaching the minimum limit of 3 tabs that needs to show all the time.
//     $(".see-less").click(function() {

//         // Checks if the X is smaller than 3, if true, it would stop disappearing tabs.
//         $showJobs = ($showJobs - $appearOnClick <= 0 ) ? $appearOnClick : $showJobs - $appearOnClick;
//         $(this).parent().find(".life-experience").not(":lt("+$showJobs+")").stop(true, true).slideUp();

//         // Hides .see-less and adds .see-more button.
//         if( $showJobs <= 2 ) {

//             $(this).parent().find(".see-more").stop(true, true).show();
//             $(this).stop(true, true).hide();
//         }
//     });

//     // When you click on .see-more button, it will appear 3 tabs in the tablist every time, until reaching the maximum limit, which is defined by how many tabs is created, so if you have experience in 10 jobs, it will appear 3 tabs until reaching the limit of 10.
//     $(".see-more").click(function() {

//         // Defines the size limit of the tabs and checks if it's bigger, then it would not show anymore tabs and process a function below. If it's smaller, it would add 3 additional tabs.
//         $sizePanels = $(this).parent().find(".life-experience").length;
//         $showJobs = ($showJobs <= $sizePanels) ? $showJobs+$appearOnClick : $sizePanels;
//         $(this).parent().find(".life-experience:lt("+$showJobs+")").stop(true, true).slideDown();

//         // Checks if X is bigger or equal to the size of tabs, if it's true, it would hide the .see-more button and appear .see-less button.
//         if( $showJobs >= $sizePanels ) {

//             $(this).parent().find(".see-less").stop(true, true).show();
//             $(this).stop(true, true).hide();
//         }
//     });
// }