// Collects 'CREATE JOB / EDIT JOB' data.
function collectJobData(form) {
    $form = form; $endDateVal = null;
    $content = $form.closest('.content');

    // IMG
    $imgSrc = $content.find('img#input-image-job').attr('src');
    if($imgSrc == "#") $imgData = null;
    if($imgSrc !== "#") $imgData = $imgSrc;

    if($form.find('input.date-ended').val() == '') {
        $endDateVal = 'Present';
    } else {
        $endDateVal = $form.find('input.date-ended').val();
    }

    $data = {
        image: $imgData,
        company: $form.find('input#company-name').val(),
        position: $form.find('input#position-name').val(),
        description: $form.find('textarea#description').val(),
        time: [
            { from: $form.find('input.date-started').val(), to: $endDateVal }
        ]
    }

    console.log($data);

    return $data;
}

// Collects 'CREATE EDUCATION / EDIT EDUCATION' data.
function collectEducationData(form) {
    $form = form; $endDateVal = null;
    $content = $form.closest('.content');
    if($form.find('input.date-ended').val() == '') {
        $endDateVal = 'Present';
    } else {
        $endDateVal = $form.find('input.date-ended').val();
    }

    $data = {
        image: $content.find('img#input-image-education').attr('src'),
        institution: $form.find('input#education-name').val(),
        course: $form.find('input#study-field').val(),
        description: $form.find('textarea#description').val(),
        time: [
            { from: $form.find('input.date-started').val(), to: $endDateVal }
        ]
    }
    return $data;
}


// Collects 'CREATE LANGUAGE / EDIT LANGUAGE' data.
function collectLanguageData(form) {
    $form = form; $endDateVal = null;
    if($form.find('input.date-ended').val() == '') {
        $endDateVal = 'Present';
    } else {
        $endDateVal = $form.find('input.date-ended').val();
    }

    $data = {
        language: $form.find('#language-name').dropdown('get text'),
        level: $form.find('#level').dropdown('get text'),
        levelValue: $form.find('#level').dropdown('get value'),
        iconClass: $form.find('#language-name').dropdown('get value'),
        description: $form.find('textarea#description').val(),
        time: [
            { from: $form.find('input.date-started').val(), to: $endDateVal }
        ]
    }
    return $data;
}


function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}


// Collects 'CREATE LANGUAGE / EDIT LANGUAGE' data.
function collectGigData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $title = $form.find('#gig-title').val();
    $category = $form.find('#category').dropdown('get value');
    $reputation = $('header').find('a#reputation-dropdown .round-number span').text();
    $ownerName = $form.closest('body').find('li#settings-dropdown span').text();
    $experienceLevel = $form.find('#experience-level').dropdown('get value');
    $experienceName = $form.find('#experience-level').dropdown('get text');
    $categoryName = $form.find('#category').dropdown('get text');
    $description = $form.find('textarea#description').val();
    $price = $form.find('input#price').val();
    $dateExpire = $form.find('input.date-started').val();

    // getting expire date's difference in text.
    $expireDateClear = $dateExpire.replace(/\//g, '-');
    $expireDateDifference = moment($expireDateClear, "DDMMYYYY").fromNow();

    var avatarImage = getBase64Image(document.getElementById("avatar-img"));
    var input = document.getElementById($imgInputID);
    file = input.files[0];

    if (file == undefined) {
        if($content.find('img.show-image').attr('src') != null) {

        }
    }

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
                        experienceName: $experienceName,
                        title: $title,
                        category: $category,
                        experienceLevel: $experienceLevel,
                        description: $description,
                        price: $price,
                        date: [
                            { expire: $dateExpire, expiresIn: $expireDateDifference }
                        ]
                    }

                    $.ajax({
                        url: "/api/v1/my/gig",
                        type: "POST",
                        data: JSON.stringify($data),
                        contentType: 'application/json; charset=utf-8',
                        processData: false,
                        success: function(gigID){
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
                experienceName: $experienceName,
                title: $title,
                category: $category,
                experienceLevel: $experienceLevel,
                description: $description,
                price: $price,
                date: [
                    { expire: $dateExpire, expiresIn: $expireDateDifference }
                ]
            }

            $.ajax({
                url: "/api/v1/my/gig",
                type: "POST",
                data: JSON.stringify($data),
                contentType: 'application/json; charset=utf-8',
                processData: false,
                success: function(gigID){
                    createGig(gigID);
                }
            });
        }
    }
    return;
}




// Collects PROFILE data.
function collectProfileData(form) {
    $form = form;

    $firstname = $form.find('input#first-name').val();
    $lastname = $form.find('input#last-name').val();
    $country = $form.find('#country').dropdown('get text');
    $city = $form.find('input#city').val();
    $countryClass = $form.find('#country').dropdown('get value');
    $description = $form.find('textarea#description').val();
    $hourlyRate = $form.find('input#hourly-rate').val();
    $title = $form.find('input#title').val();

    $data = {
        name: [{ first: $firstname, last: $lastname }],
        location: [{ country: $country, city: $city, countryClass: $countryClass }],
        description: $description,
        hourlyRate: $hourlyRate,
        title: $title
    }
    return $data;
}