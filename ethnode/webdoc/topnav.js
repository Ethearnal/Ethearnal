/* test git flow */
console.log('TOP NAV APP')
var on_click = function (html_to) {
    // include with sanitize only xml content
    i('GET',html_to, null,'main-content',true);
    l.include('GET',html_to,'main-content')
  };

  var on_click_js =  function (html_to, js_to ) {
    l.include_eval('GET',html_to, js_to, 'main-content', false);
  };


l.include_eval('GET','me.html','me.js','main-content', false);
  /* initial page here */
  // l.include_eval('GET','me.html','me.js','main-content', false);
 //  l.include_eval('GET','post_job.html','post_job.js','main-content', false);
