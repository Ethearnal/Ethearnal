// FCollects GIG /EDIT /CREATE data.
function collectGigData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');
    $title = $form.find('#gig-title').val();
    $category = $form.find('#category').dropdown('get value');
    $lock = $form.find('#reputationCost').val();
    $reputation = $('header').find('a#reputation-dropdown .round-number span').text();
    $ownerName = $form.closest('body').find('li#settings-dropdown span').text();
    $categoryName = $form.find('#category').dropdown('get text');
    $description = $form.find('textarea#description').val();
    $price = $form.find('input#amount').val();
    $dateExpire = $form.find('input.date-started').val();
    $tags = $form.find('.gig-tags').dropdown('get value');
    $avatarImage = $('#avatar-img').attr('src');

    var objFormData = new FormData();
    var fileObj = undefined
    if ($imgInputID == 'input-image-gig') {
        if (window.$uploadCropBlob) {
            fileObj = window.$uploadCropBlob;
        }
    } else {
        fileObj = document.getElementById($imgInputID).files[0];
    }

    objFormData.append('ufile', fileObj);
    var api_cdn_post = api_post_cdn_url();
    var api_cdn = api_get_cdn_url();

    if (fileObj != undefined) {
        if (!!fileObj.type.match(/image.*/)) {
            $.ajax({
                url: api_cdn_post,
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(data) {
                    if ($content.closest('.modal-box').hasClass('edit')) {
                        $gigID = $currentlyClosestLEdiv.attr('gigID');
                        deleteGig($gigID);
                    }
                    $data = {
                        image_hash: data,
                        category: $category,
                        general_domain_of_expertise: category,
                        title: $title,
                        required_ert: $lock,
                        lock: $lock,
                        description: $description,
                        price: $price,
                        tags: $tags,
                    }

                    $.ajax({
                        url: "/api/v1/dht/gigs/",
                        type: "POST",
                        data: JSON.stringify($data),
                        contentType: 'application/json; charset=utf-8',
                        processData: false,
                        success: function(gigID) {
                            $.toast({
                                heading: "New Gig Created",
                                text: "Your new gig just created!",
                                showHideTransition: "fade",
                                allowToastClose: true,
                                hideAfter: 2500,
                                bgColor: "rgba(89, 116, 165, 0.91)",
                                textColor: "#fff",
                                position: "top-right",
                                afterShown: function () {
                                    $('#addgig-close').click();
                                    // $('body').removeClass('modal-open');
                                    // $('body').find('.modal-backdrop').remove();
                                    $('#addNewGigSend').prop('disabled', false);
                                }
                            });
                            profilePageModule.renderOneGig(gigID, true);
                        }
                    });
                }
            });
        } else {
            console.log('Not a valid image!');
        }

        // IF YOU EDIT GIG
    } else if (fileObj == undefined) {

        // Checks if the GIG already has image and re-use image hash.
        if ($content.find('img.show-image').attr('src') != null) {
            $imageSrc = $content.find('img.show-image').attr('src');
            $imageHash = $imageSrc.split('/api/v1/my/img/?q=')[1];

            $data = {
                image_hash: data,
                category: $category,
                general_domain_of_expertise: category,
                title: $title,
                required_ert: $lock,
                lock: $lock,
                description: $description,
                price: $price,
                tags: $tags,
            }

            $.ajax({
                url: "/api/v1/dht/gigs/",
                type: "POST",
                data: JSON.stringify($data),
                contentType: 'application/json; charset=utf-8',
                processData: false,
                success: function(gigID) {
                    $.toast({
                        heading: "New Gig Created",
                        text: "Your new gig just created!",
                        showHideTransition: "fade",
                        allowToastClose: true,
                        hideAfter: 2500,
                        bgColor: "rgba(89, 116, 165, 0.91)",
                        textColor: "#fff",
                        position: "top-right",
                        afterShown: function () {
                            $('#addgig-close').click();
                            // $('body').removeClass('modal-open');
                            // $('body').find('.modal-backdrop').remove();
                            $('#addNewGigSend').prop('disabled', false);
                        }
                    });
                    profilePageModule.renderOneGig(gigID, true);
                }
            });
        }
        else {
            $('#addNewGigSend').prop('disabled', false);
        }
    }
    else {
        $('#addNewGigSend').prop('disabled', false);
    }
    return;
}