// Collects GIG /EDIT /CREATE data.
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

                    // Deletes GIG if not EDIT modal
                    if( $content.closest('.modal-box').hasClass('edit') ) {
                        $gigID = $currentlyClosestLEdiv.attr('gigID');
                        deleteGig($gigID);
                    }

                    // AND CREATE A NEW ONE
                    $data = {
                        imageHash: data,
                        ownerAvatar: $avatarImage,
                        ownerReputation: $reputation,
                        ownerName: $ownerName,
                        categoryName: $categoryName,
                        general_domain_of_expertise: $categoryName,
                        title: $title,
                        category: $category,
                        required_ert: $reputationCost,
                        reputationCost: $reputationCost,
                        description: $description,
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
                            createGig(gigID);

                            $.ajax({
                                url: "/api/v1/dht/hkey/?hkey=" + gigID,
                                type: "GET",
                                processData: false,
                                success: function(gigData) {
                                    $data = JSON.parse(gigData);
                                    createGigToProfile($data, gigID);
                                },
                                error: function(error) {
                                    return;
                                }
                            });
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
                    createGig(gigID);

                    $.ajax({
                        url: "/api/v1/dht/hkey/?hkey=" + gigID,
                        type: "GET",
                        processData: false,
                        success: function(gigData) {
                            $data = JSON.parse(gigData);
                            createGigToProfile($data, gigID);
                        },
                        error: function(error) {
                            return;
                        }
                    });
                }
            });
        }
    }
    return;
}