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

                    // Deletes GIG if not EDIT modal
                    if( $content.closest('.modal-box').hasClass('edit') ) {
                        $gigID = $currentlyClosestLEdiv.attr('gigID');
                        deleteGig($gigID);
                    }

                    // AND CREATE A NEW ONE
                    $data = {
                        imageHash: data,
                        ownerAvatar: avatarImage,
                        ownerReputation: $reputation,
                        ownerName: $ownerName,
                        categoryName: $categoryName,
                        title: $title,
                        category: $category,
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
                            createGigToProfile(gigID);
                            createGig(gigID);
                        }
                    });
                }
            });
        } else {
            console.log('Not a valid image!');
        }

    // IF YOU EDIT GIG
    } else if (file == undefined) {

        // Checks if the GIG already has image and re-use image hash.
        if($content.find('img.show-image').attr('src') != null) {
            $imageSrc = $content.find('img.show-image').attr('src');
            $imageHash = $imageSrc.split('/api/v1/my/img/?q=')[1];

            $gigID = $currentlyClosestLEdiv.attr('gigID');
            deleteGig($gigID);

            $data = {
                imageHash: $imageHash,
                ownerAvatar: avatarImage,
                ownerReputation: $reputation,
                ownerName: $ownerName,
                categoryName: $categoryName,
                title: $title,
                category: $category,
                description: $description,
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
                    createGigToProfile(gigID);
                    createGig(gigID);
                }
            });
        }
    }
    return;
}