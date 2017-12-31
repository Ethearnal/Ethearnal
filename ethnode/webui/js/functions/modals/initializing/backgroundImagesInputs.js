function loadBackgroundImagesInputs() {
    $form = $('#edit-background-images.modal-box').find('form');
    $content = $form.closest('.content');
    $pictures = [];

    $('section.background-image').find('.items .item').each(function(i, item) {
        $src = $(item).find('img').attr('src');
        $pictures.push($src);
    });

    // IMAGE 1
    $content.find('img#input-image-background').attr('src', $pictures[0]);
    $content.find('img.img-background').removeClass('active');
    $content.find('label[for="input-image-background"]').text('Click to change FIRST background image').removeClass('active');

    // IMAGE 2
    $content.find('img#input-image-background-2').attr('src', $pictures[1]);
    $content.find('img.img-background-2').removeClass('active');
    $content.find('label[for="input-image-background-2"]').text('Click to change SECOND background image').removeClass('active');

    // IMAGE 3
    $content.find('img#input-image-background-3').attr('src', $pictures[2]);
    $content.find('img.img-background-3').removeClass('active');
    $content.find('label[for="input-image-background-3"]').text('Click to change THIRD background image').removeClass('active');
}

