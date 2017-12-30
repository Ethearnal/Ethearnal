// Collects GIG /EDIT /CREATE data.
function collectBackgroundImagesData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    var objFormData = new FormData();
    var fileObj = document.getElementById($imgInputID).files[0];

    objFormData.append('ufile', fileObj);

    if(fileObj != undefined) {
        if(!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: defaultIMGPostCDN,
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(data){
                    setProfileValue('backgroundImage', data);
                    console.log(data);
                    console.log('works');
                    $('section.background-image').find('.items .item.first img').attr('src', defaultIMGLoadCDN + data);
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