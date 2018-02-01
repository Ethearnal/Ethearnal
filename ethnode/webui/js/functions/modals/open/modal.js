// Function to open modal
function openModal(modal) {
    $(modal).css({ display: 'flex' });
    $(modal).find('.modal-box-content .inner-modal').animate({ height: '100vh' }, 400, "easeInSine");
    $(modal).find('.modal-box-content .inner-modal .content').css({ opacity: 1, transitionDelay: '.5s' });
}


// Function to close modal
function closeModal(modalID) {
    $modalBox = $('#' + modalID);
    $modalBox.find('.modal-box-content .inner-modal .content').css({ transitionDelay: '0s' });

    $modalBox.find('.modal-box-content .inner-modal .content').animate({ opacity: 0 }, 400, "easeOutCubic", function() {
        $modalBox.find('.modal-box-content .inner-modal').animate({ width: 0, height: 0 }, 400, "easeOutSine", function() {
            $modalBox.css({ display: 'none' });
        });
    });
}