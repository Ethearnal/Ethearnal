// handlers



function init_handlers(){


    $(window).scroll(function(){
    if ($(window).scrollTop() >= 300) {
       $('nav').addClass('fixed-header');
    }
    else {
       $('nav').removeClass('fixed-header');
    }
});





    $(".mdl-menu__item").click(function(){
        console.log("was clicked");
       var id = $(this).attr("id");
       console.log(id+"was clicked");
        });

}




// UI ENTRY POINT
var ert = {
    init:function(){
        console.log('app init');
        init_handlers();



    },
    dummy_content(){
        for(var i=0;i<100;i++){
          $('#main-segment').append('test<br>');
        }
    },
    foo:"end of object"
};


