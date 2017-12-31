// Global variables for modals
$currentlyOpenModalID = null;
$currentlyClosestLEdiv = null;

$('body').delegate('.open-modal', 'click', function(e) {
    e.preventDefault();
    $contentBlock = $(this).closest('.content-block, .modal-body');
    $modalID = $(this).attr('open-modal');

    // Other variables
    $content = $($modalID).find('.modal-box-content .content');
    $form = $content.find('form');

    $currentlyOpenModalID = $modalID;
    $currentlyClosestLEdiv = $contentBlock;

    // Dates inputs
    $inputDateFrom = $form.find('input.date-started');
    $inputDateTo = $form.find('input.date-ended');

    // Removing .success-message SVG
    $content.find('.success-message svg').remove();

    // Open modal
    openModal($modalID);

    // Functions for particular modals.
    if($($modalID).attr('id') == "edit-profile") loadProfileInputs();
    if($($modalID).attr('id') == "edit-background-images") loadBackgroundImagesInputs();
    if($($modalID).hasClass('edit') && $($modalID).attr('id') !== "edit-profile" && $($modalID).attr('id') !== "edit-background-images") loadInputsText($form, $contentBlock);

    if($($modalID).hasClass('add')) {
        if($modalID == "#add-gig") {
            datePickerInitGig($inputDateFrom, $inputDateTo);
        } else {
            datePickerInit($inputDateFrom, $inputDateTo);
        }
    }

    if($modalID == "#edit-profile") loadProfileInputs();
});