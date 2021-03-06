window.$uploadCrop = $("#cropper-wrap-gig").croppie({
  viewport: {
    width: 450,
    height: 150
  },
  enableZoom: true,
  enableResize: true
});

window.$uploadCropProfile = $("#cropper-wrap-profile").croppie({
  viewport: {
    width: 150,
    height: 150,
    type: "circle"
  },
  enableZoom: true,
  enableResize: true
});

$(document).ready(function(){
    /* BUTTON INIT CLICK ON INPUT TYPE FILE */
    $(document).on('click','.jsCropUpload',function(){
      var $content = $(this).closest('.content');
      $content.find('input#input-image-gig').click();
    });

    $(document).on("click", ".jsCropUploadProfile", function() {
      var $content = $(this).closest(".content");
      $content.find("input#input-image-profile").click();
    });

    /* BUTTON FOR GETTING CROP RESUlt */
    $(document).on('click','.jsCropResult',function(e){
      e.preventDefault();
      var $content = $(this).closest('.content');
      window.$uploadCrop.croppie('result','base64').then( function(base64) {
        $content.find('img#input-image-gig').attr('src', base64).show(500).removeClass('empty');
        $content.find($("#cropper-wrap-gig")).show(500);
        $content.find($(".btns-wrap").find(".btn-success")).show();
      });
      window.$uploadCrop.croppie('result','blob').then( function(blob) {
        window.$uploadCropBlob = blob;
        $content.find($("#cropper-wrap-gig")).hide(400);
        $content.find($(".btns-wrap").find(".btn-success")).hide();
      });
    })

    $(document).on("click", ".jsCropResultProfile", function(e) {
      e.preventDefault();
      var $content = $(this).closest(".content");
      window.$uploadCropProfile.croppie("result", "base64").then(function(base64) {
          $content.find("span#input-image-profile").css("background-image", 'url('+ base64 +')').show(500).removeClass("empty");
          $content.find($("#cropper-wrap-profile")).show(500);
          $content.find($(".btns-wrap").find(".btn-success")).show();
        });
      window.$uploadCropProfile.croppie("result", "blob").then(function(blob) {
        window.$uploadCropBlobProfile = blob;
        $content.find($("#cropper-wrap-profile")).hide(400);
        $content.find($(".btns-wrap").find(".btn-success")).hide();
      });
    });
});
