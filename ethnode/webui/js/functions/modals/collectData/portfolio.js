// Collects GIG /EDIT /CREATE data.
function collectPortfolioData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $title = $form.find('#title').val();
    $description = $form.find('textarea#description').val();
    $tags = $form.find('.portfolio-tags').dropdown('get value');

    var avatarImage = getBase64Image(document.getElementById("avatar-img"));
    var input = document.getElementById($imgInputID);
    file = input.files[0];

    if(file != undefined) {
        if(!!file.type.match(/image.*/)) {
            $.ajax({
                url: "/api/v1/my/img",
                type: "POST",
                data: file,
                contentType: 'image/jpeg',
                processData: false,
                success: function(data){

                    $data = {
                        imageHash: data,
                        title: $title,
                        description: $description,
                        tags: $tags
                    }

                    console.log($data);

                    createPortfolio($data);
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (file == undefined) {
        // do nothing
    }
    return;
}