function resetImage(content, type) {
    $content = content;

    if ( type == "job" ) {
        $content.find('input#input-image-job').removeAttr('value');
        $content.find('img#input-image-job').removeAttr('src');
        $content.find('img.img-job').removeClass('active');
        $content.find('label[for="input-image-job"]').text("Add Company's Logo").removeClass('active');

    } else if ( type == "education" ) {
        $content.find('input#input-image-education').removeAttr('value');
        $content.find('img#input-image-education').removeAttr('src');
        $content.find('img.img-education').removeClass('active');
        $content.find('label[for="input-image-education"]').text('Add Educational Institution Logo').removeClass('active');
    }
}