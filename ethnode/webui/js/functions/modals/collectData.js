// // Collects 'CREATE JOB / EDIT JOB' data.
// function collectJobData(form) {
//     $form = form; $endDateVal = null;
//     $content = $form.closest('.content');

//     // IMG
//     $imgSrc = $content.find('img#input-image-job').attr('src');
//     if($imgSrc == "#") $imgData = null;
//     if($imgSrc !== "#") $imgData = $imgSrc;

//     if($form.find('input.date-ended').val() == '') {
//         $endDateVal = 'Present';
//     } else {
//         $endDateVal = $form.find('input.date-ended').val();
//     }

//     $data = {
//         image: $imgData,
//         company: $form.find('input#company-name').val(),
//         position: $form.find('input#position-name').val(),
//         description: $form.find('textarea#description').val(),
//         time: [
//             { from: $form.find('input.date-started').val(), to: $endDateVal }
//         ]
//     }

//     console.log($data);

//     return $data;
// }

// // Collects 'CREATE EDUCATION / EDIT EDUCATION' data.
// function collectEducationData(form) {
//     $form = form; $endDateVal = null;
//     $content = $form.closest('.content');
//     if($form.find('input.date-ended').val() == '') {
//         $endDateVal = 'Present';
//     } else {
//         $endDateVal = $form.find('input.date-ended').val();
//     }

//     $data = {
//         image: $content.find('img#input-image-education').attr('src'),
//         institution: $form.find('input#education-name').val(),
//         course: $form.find('input#study-field').val(),
//         description: $form.find('textarea#description').val(),
//         time: [
//             { from: $form.find('input.date-started').val(), to: $endDateVal }
//         ]
//     }
//     return $data;
// }


// // Collects 'CREATE LANGUAGE / EDIT LANGUAGE' data.
// function collectLanguageData(form) {
//     $form = form; $endDateVal = null;
//     if($form.find('input.date-ended').val() == '') {
//         $endDateVal = 'Present';
//     } else {
//         $endDateVal = $form.find('input.date-ended').val();
//     }

//     $data = {
//         language: $form.find('#language-name').dropdown('get text'),
//         level: $form.find('#level').dropdown('get text'),
//         levelValue: $form.find('#level').dropdown('get value'),
//         iconClass: $form.find('#language-name').dropdown('get value'),
//         description: $form.find('textarea#description').val(),
//         time: [
//             { from: $form.find('input.date-started').val(), to: $endDateVal }
//         ]
//     }
//     return $data;
// }


function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0);
  var dataURL = canvas.toDataURL("image/png");
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}