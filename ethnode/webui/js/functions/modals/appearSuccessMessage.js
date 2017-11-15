// Appear .success-message DIV when you click PUBLISH/UPDATE buttons.
function appearSuccessMessage(content) {
    $content = content;
    $successMessage = $content.find('.success-message');
    $successMessageThings = $successMessage.find('h1.title, .success-content, .buttons');

    $successMessageThings.toggleClass('active');
    // Creates SVG if it's not created yet.
    if($content.find('.success-message svg')) {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="154px" height="154px"> <g fill="none" stroke="#5CAB7D" stroke-width="2"> <circle cx="77" cy="77" r="72" style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"></circle> <circle id="colored" fill="#5CAB7D" cx="77" cy="77" r="72" style="stroke-dasharray:480px, 480px; stroke-dashoffset: 960px;"></circle> <polyline stroke="#FFF" stroke-width="8" points="43.5,77.8 63.7,97.9 112.2,49.4" style="stroke-dasharray:100px, 100px; stroke-dashoffset: 200px;" class="st0"></polyline> </g> </svg>'
        $(svg).insertBefore('.success-message h1');
    }
    $successMessage.fadeIn(300);
}