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

    // $dataToPost = JSON.stringify($data);

    // formData= new FormData();
    // formData.append("json_str", "profile.json");
    // $.ajax({
    //     url: "/api/v1/uploadjson",
    //     type: "POST",
    //     data: formData,
    //     contentType: 'multipart/form-data',
    //     processData: false,
    //     success: function(data){
    //         alert('success');
    //     }
    // });

    // uploadFile();

    console.log($data);

    return $data;
}


function uploadFile(inputID){
  var input = document.getElementById(inputID);
  file = input.files[0];
  if(file != undefined){
    formData= new FormData();
    if(!!file.type.match(/image.*/)){
      formData.append("ufile", file);
      $.ajax({
        url: "/api/v1/my/img",
        type: "POST",
        data: formData,
        contentType: 'image/jpeg',
        processData: false,
        success: function(data){
            return data;
        }
      });
    }else{
      console.log('Not a valid image!');
    }
  }else{
    console.log('Input something!');
  }
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


// Collects 'CREATE LANGUAGE / EDIT LANGUAGE' data.
function collectGigData(form) {
    $form = form;
    $content = $form.closest('.content');
    $imgInputID = $content.find('input.input-file').attr('id');

    $title = $form.find('#gig-title').val();
    $category = $form.find('#category').dropdown('get value');
    $ownerName = $form.closest('body').find('li#settings-dropdown span').text();
    $experienceLevel = $form.find('#experience-level').dropdown('get value');
    $description = $form.find('textarea#description').val();
    $price = $form.find('input#price').val();
    $dateExpire = $form.find('input.date-started').val();

    var input = document.getElementById($imgInputID);
    file = input.files[0];
    if(file != undefined) {
        formData= new FormData();
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
                        category: $category,
                        ownerName: $ownerName,
                        experienceLevel: $experienceLevel,
                        description: $description,
                        price: $price,
                        date: [
                            { expire: $dateExpire }
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

    } else {
        console.log('Input something!');
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