


var load_content = function(target_id, template_id){
  var e = document.getElementById(template_id);
  var html = e.innerHTML;
  var $e = $(e);
  var target = "#"+target_id;
  //console.log('html',html);
  $(target).html("");
  $(target).html($e.html());

};

var init_top_nav = function(){
      // fix main menu to page on passing
//      $('.main.menu').visibility({
//        type: 'fixed'
//      });
      // show dropdown on hover
      $('.main.menu  .ui.dropdown').dropdown({
        on: 'hover'
      });

      $('#nav-my-profile').click(function(){
        console.log('#nav-my-profile.click()');
        load_content('main-content','view-profile-template');
        $('#top-search-sticky').css('display','none');
      });

      $('#nav-people').click(function(){
        console.log('#nav-my-profile.click()');
        load_content('main-content','view-people-template');
        $('#top-search-sticky').css('display','block');
      });

      $('#nav-gigs').click(function(){
        console.log('#nav-my-profile.click()');
        load_content('main-content','view-gigs-template');
        $('#top-search-sticky').css('display','block');
      });


      $('#nav-create-gig').click(function(){
        console.log('CREATE GIG');
        $('#create-gig-modal').modal('show');

      });

      $('.ui.accordion').accordion();
      $('.ui.selection.dropdown').dropdown();
      $('.ui.accordion.accordion').accordion();
      $('.ui.selection.accordion.dropdown').dropdown();

//      $('.ui.accordion').accordion('behavior', argumentOne, argumentTwo...);


};





$(document).ready(function() {
 init_top_nav();
});