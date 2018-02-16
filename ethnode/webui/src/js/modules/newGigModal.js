window.createNewGig = (function() {
  $("#add-gig").find("#newGigexpire").datepicker();
    $("#add-gig").on("hidden.bs.modal", function(e) {
      $(this).find(".gig-tags").find(".delete").click();
      $(this)
        .find("img#input-image-gig").hide().addClass("empty").end()
        .find(".img-label").show().removeClass("active").text('').end()
        .find("#cropper-wrap-gig").hide().end()
        .find($(".btns-wrap").find(".btn-success")).hide();
      $(this)
        .find("input,textarea,select").val("").end()
        .find(".range-slider")
        .find("input").val("0").end()
        .find(".range-slider__value").text("0");
        $(this).find("#new-gig-category").parent().find(".text").text("All Categories");
    });
    

})();
