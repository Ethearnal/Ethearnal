// Making sure that #gigModal won't appear if you click on a edit gig dropdown.
$('body').delegate('button.dropdown-gig, li.open-modal, ul.mdl-menu, .mdl-menu__container', 'click', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

$('body').delegate('.gig', 'click', function(e) {
    var gigID = $(this).attr('id');

    function createGigInner(data) {
        // null everything
        $(".modal#gigModal .modal-content").html('');

        // set variables
        $data = data;
        $reputationCost = $data.reputationCost;

        // Get expire date
        $expiresIn = 'ISO'
        /*$($data.date).each(function(i, dates) {
            if (dates.expiresIn == undefined || dates.expiresIn == null) {
                $expiresIn = ''
            } else {
               $expiresIn = 'expires ' + dates.expiresIn;
            }
        });*/

        if ($reputationCost == undefined || $reputationCost == null) $reputationCost = 0;

        // dropdown button
        var dropdownButton = '<button id="dropdowngiginner'+ iGig +'" class="mdl-button mdl-js-button mdl-button--icon dropdown-button dropdown-gig"><i class="material-icons">more_vert</i></button>';

        // dropdown UL
        var dropdownUL = '<ul class="mdl-menu mdl-menu--bottom-right mdl-js-menu mdl-js-ripple-effect" for="dropdowngiginner'+ iGig +'"><li class="mdl-menu__item open-modal" open-modal="#edit-gig" data-dismiss="modal" aria-label="Close">Edit</li><li class="mdl-menu__item delete">Delete</li></ul>';

        // TITLE
        var title = '<h2 class="title">' + $data.title + '</h2>';

        // OWNER INFO DIV
        var ownerAvatar = '<img src="'+$data.ownerAvatar+'" alt="Avatar" />';
        var ownerName = '<h5>' + $data.ownerName + '</h5>';
        var ownerReputation = '<h4><i class="material-icons">polymer</i> ' + $data.ownerReputation + ' <span>'+$expiresIn+'</span></h4>';
        var ownerInfo = '<div class="owner-info">' + ownerAvatar + ownerName + ownerReputation + '</div>';

        // .image DIV
        var imageItem = '<div class="item"><img src="http://localhost:5678/api/cdn/v1/resource?hkey='+$data.image_hash+'" /></div>';
        var buttonPrev = '<div class="button-prev"><i class="material-icons">keyboard_arrow_left</i></div>';
        var buttonNext = '<div class="button-next"><i class="material-icons">keyboard_arrow_right</i></div>';
        var items = '<div class="items">' + imageItem + '</div>';
        var images = '<div class="image">' + buttonPrev + buttonNext + items + '</div>';

        // DESCRIPTION
        var description = '<p class="gig-description">' + $data.description + '</p>';

        // EXTRAS BOX
        var extrasBox ='';
        //var extrasBox = '<div class="extras-box"><h3>BOX FOR EXTRAS</h3></div>';

        // FOOTER
        var closeButton = '<button data-dismiss="modal" class="mdl-button mdl-js-button close-button">Close</button>';
        var orderButton = '<button class="mdl-button mdl-js-button buy"><span><i class="material-icons">polymer</i> ' + $reputationCost + '</span> Order</button>';
        var footer = '<div class="footer">' + closeButton + orderButton + '</div>';


        $innerContent = $('<div class="modal-body">' + dropdownButton + dropdownUL + title + ownerInfo + images + description + extrasBox + footer + '</div>');


        // Rendering div
        var divToRender = $innerContent.get(0).outerHTML;

        // Appending GIG
        $(".modal#gigModal .modal-content").append(divToRender);

        // Upgrading the DOM so you can use the dropdown, edit and delete the div.
        componentHandler.upgradeDom();
    }

    $.ajax({
        url: "/api/v1/dht/hkey/?hkey=" + gigID,
        type: "GET",
        processData: false,
        success: function(gigData) {
            $data = JSON.parse(gigData);
            createGigInner($data);
        }
    });
})