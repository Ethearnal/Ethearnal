window.$uploadCrop = $('#cropper-wrap-gig').croppie({
    viewport: {
        width: 450,
        height: 150
    },
    enableZoom: true
});

$(document).ready(function(){
    /* BUTTON INIT CLICK ON INPUT TYPE FILE */
    $(document).on('click','.jsCropUpload',function(){
      var $contetnt = $(this).closest('.content');
      $content.find('input#input-image-gig').click();
    });

    /* BUTTON FOR GETTING CROP RESUlt */
    $(document).on('click','.jsCropResult',function(e){
      e.preventDefault();
      var $content = $(this).closest('.content');
      window.$uploadCrop.croppie('result','base64').then( function(base64) {
        $content.find('img#input-image-gig').attr('src',base64).show().removeClass('empty');
      });
      window.$uploadCrop.croppie('result','blob').then( function(blob) {
        window.$uploadCropBlob = blob;
      });
    })
});
