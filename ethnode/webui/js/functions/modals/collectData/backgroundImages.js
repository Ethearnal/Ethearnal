// Collects GIG /EDIT /CREATE data.
function collectBackgroundImagesData(form) {
    $form = form;
    $content = $form.closest('.content');

    $bg1 = $content.find('input.input-file-1').attr('id');
    $bg2 = $content.find('input.input-file-2').attr('id');
    $bg3 = $content.find('input.input-file-3').attr('id');

    var objFormData = new FormData();
    var fileObj = document.getElementById($bg1).files[0];

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
                    setProfileValue('backgroundImage1', data);
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


    var objFormData2 = new FormData();
    var fileObj2 = document.getElementById($bg2).files[0];

    objFormData2.append('ufile', fileObj2);

    if(fileObj2 != undefined) {
        if(!!fileObj2.type.match(/image.*/)) {
            $.ajax({
                url: defaultIMGPostCDN,
                type: "POST",
                data: objFormData2,
                processData: false,
                contentType: false,
                success: function(data){
                    setProfileValue('backgroundImage2', data);
                    $('section.background-image').find('.items .item.second img').attr('src', defaultIMGLoadCDN + data);
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (fileObj2 == undefined) {
        // do nothing
    }


    var objFormData3 = new FormData();
    var fileObj3 = document.getElementById($bg3).files[0];

    objFormData3.append('ufile', fileObj3);

    if(fileObj3 != undefined) {
        if(!!fileObj3.type.match(/image.*/)) {
            $.ajax({
                url: defaultIMGPostCDN,
                type: "POST",
                data: objFormData3,
                processData: false,
                contentType: false,
                success: function(data){
                    setProfileValue('backgroundImage3', data);
                    $('section.background-image').find('.items .item.third img').attr('src', defaultIMGLoadCDN + data);
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (fileObj3 == undefined) {
        // do nothing
    }






    return;
}