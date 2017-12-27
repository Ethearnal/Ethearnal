// Collects GIG /EDIT /CREATE data.
function collectPortfolioData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $title = $form.find('#title').val();
    $description = $form.find('textarea#description').val();
    $tags = $form.find('.portfolio-tags').dropdown('get value');

    var avatarImage = getBase64Image(document.getElementById("avatar-img"));
    var objFormData = new FormData();
    var fileObj = document.getElementById($imgInputID).files[0];

    objFormData.append('ufile', fileObj);

    if(fileObj != undefined) {
        if(!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: "http://localhost:5678/api/cdn/v1/resource",
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(data){

                    $data = {
                        imageHash: data,
                        title: $title,
                        description: $description,
                        tags: $tags
                    }

                    createPortfolio($data);
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (fileObj == undefined) {
        // do nothing
    }
    return;
}