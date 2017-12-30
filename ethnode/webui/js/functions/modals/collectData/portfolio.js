// Collects GIG /EDIT /CREATE data.
function collectPortfolioData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $title = $form.find('#title').val();
    $description = $form.find('textarea#description').val();
    $tags = $form.find('.portfolio-tags').dropdown('get value');

    var objFormData = new FormData();
    var fileObj = document.getElementById($imgInputID).files[0];
    var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    objFormData.append('ufile', fileObj);

    if(fileObj != undefined) {
        if(!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: api_cdn_post,
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

                    $.ajax({
                        url: "/api/v1/dht/portfolios/",
                        type: "POST",
                        data: JSON.stringify($data),
                        contentType: 'application/json; charset=utf-8',
                        processData: false,
                        success: function(portfolioID){
                            createPortfolio($data, portfolioID)
                        }
                    });
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