// Making sure that #gigModal won't appear if you click on a edit gig dropdown.
$('body').delegate('button.dropdown-gig, li.open-modal, ul.mdl-menu, .mdl-menu__container', 'click', function(e) {
    e.preventDefault();
    e.stopPropagation();
});

$('body').delegate('.gig', 'click', function(e) {
    var gigID = $(this).attr('gigID');

    function createGigInner(data) {
        // null everything
        $(".modal#gigModal .modal-content").html('');

        $data = data;
        var picture = '<div class="picture"><img src="data:image/png;base64,'+$data.ownerAvatar+'" /></div>';
        var texts = '<h5 class="name">'+$data.ownerName+'</h5><h5 class="date">count time difference</h5><h5 class="year-happend">date posted (2017/11/28)</h5><h5 class="company">Gig type: '+$data.jobTypeText+'</h5>';

        // .image DIV
        var imageItem = '<div class="item"><img src="/api/v1/my/img/?q='+$data.imageHash+'" /></div>';

        var buttonPrev = '<div class="button-prev"><i class="material-icons">keyboard_arrow_left</i></div>';
        var buttonNext = '<div class="button-next"><i class="material-icons">keyboard_arrow_right</i></div>';

        var items = '<div class="items">' + imageItem + '</div>';

        var images = '<div class="image">' + buttonPrev + buttonNext + items + '</div>';


        // GIG description
        var description = '<p class="timeline-text">' + $data.description + '</p>';

        var post = '<div class="post">' + texts + images + description + '</div>'


        $innerContent = $('<div class="modal-body">' + picture + post + '</div>');


        // Rendering div
        var divToRender = $innerContent.get(0).outerHTML;

        // Appending GIG
        $(".modal#gigModal .modal-content").append(divToRender);

        // Upgrading the DOM so you can use the dropdown, edit and delete the div.
        componentHandler.upgradeDom();
    }


    $.ajax({
        url: "/api/v1/my/gig/" + gigID,
        type: "GET",
        processData: false,
        success: function(gigData) {
            $data = JSON.parse(gigData);
            createGigInner($data);
        }
    });
})