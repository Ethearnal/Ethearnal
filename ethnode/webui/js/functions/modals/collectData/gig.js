// FCollects GIG /EDIT /CREATE data.
function collectGigData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $title = $form.find('#gig-title').val();
    $category = $form.find('#category').dropdown('get value');
    $reputation = $('header').find('a#reputation-dropdown .round-number span').text();
    $ownerName = $form.closest('body').find('li#settings-dropdown span').text();
    $categoryName = $form.find('#category').dropdown('get text');
    $description = $form.find('textarea#description').val();
    $price = $form.find('input#amount').val();
    $reputationCost = $form.find('input#reputationCost').val();
    $dateExpire = $form.find('input.date-started').val();
    $tags = $form.find('.gig-tags').dropdown('get value');

    // getting expire date's difference in text.
    $expireDateClear = $dateExpire.replace(/\//g, '-');
    $expireDateDifference = moment($expireDateClear, "DDMMYYYY").fromNow();

    $avatarImage = $('#avatar-img').attr('src');
    console.log($avatarImage);
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
    //var api_cdn_post="http://london.ethearnal.com:5678/api/cdn/v1/resource/";
    // var api_cdn="http://london.ethearnal.com:5678/api/cdn/v1/resource?hkey=";
    var api_cdn_post = api_post_cdn_url();
    var api_cdn = api_get_cdn_url();

    if(fileObj != undefined) {
        if(!!fileObj.type.match(/image.*/)) {
            alert('hurra1')
            $.ajax({
                url: api_cdn_post,
                type: "POST",
                data: objFormData,
                processData: false,
                contentType: false,
                success: function(data){
                    alert('hurra2')

                    // Deletes GIG if not EDIT modal
                    if( $content.closest('.modal-box').hasClass('edit') ) {
                        $gigID = $currentlyClosestLEdiv.attr('gigID');
                        deleteGig($gigID);
                    }

                    // AND CREATE A NEW ONE
                    $data = {
                        image_hash: data,
                        //ownerAvatar: $avatarImage,
                        // ownerReputation: $reputation,
                        // ownerName: $ownerName,
                        // categoryName: $categoryName,
                        general_domain_of_expertise: $categoryName,
                        title: $title,
                        //category: $category,
                        required_ert: $reputationCost,
                        // reputationCost: $reputationCost,
                        description: $description,
                        price: $price,
                        tags: $tags,
//                        date: [
//                            { expire: $dateExpire, expiresIn: $expireDateDifference }
//                        ]
                    }
                    console.log($data);
                    
                    $.ajax({
                        url: "/api/v1/dht/gigs/",
                        type: "POST",
                        data: JSON.stringify($data),
                        contentType: 'application/json; charset=utf-8',
                        processData: false,
                        success: function(gigID){

//                            getDHTData(gigID, function(gigData) {
//                                $data = JSON.parse(gigData);
//                                createGigToProfile($data, gigID);
//                            });

//                            getDHTData(gigID, function(gigData) {
//                                $data = JSON.parse(gigData);
//                                createGigBox($data, gigID);
//                            });
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
        console.log('Are we here?');
        if($content.find('img.show-image').attr('src') != null) {
            $imageSrc = $content.find('img.show-image').attr('src');
            $imageHash = $imageSrc.split('/api/v1/my/img/?q=')[1];

            $gigID = $currentlyClosestLEdiv.attr('gigID');
            deleteGig($gigID);

            $data = {
                imageHash: $imageHash,
                ownerAvatar: $avatarImage,
                ownerReputation: $reputation,
                ownerName: $ownerName,
                categoryName: $categoryName,
                general_domain_of_expertise: $categoryName,
                title: $title,
                category: $category,
                description: $description,
                required_ert: $reputationCost,
                reputationCost: $reputationCost,
                price: $price,
                tags: $tags,
                date: [
                    { expire: $dateExpire, expiresIn: $expireDateDifference }
                ]
            }

            $.ajax({
                url: "/api/v1/dht/gigs/",
                type: "POST",
                data: JSON.stringify($data),
                contentType: 'application/json; charset=utf-8',
                processData: false,
                success: function(gigID){

//                    getDHTData(gigID, function(gigData) {
//                        $data = JSON.parse(gigData);
//                        createGigToProfile($data, gigID);
//                    });
//
//                    getDHTData(gigID, function(gigData) {
//                        $data = JSON.parse(gigData);
//                        createGigBox($data, gigID);
//                    });
                }
            });
        }
    }
    return;
}
