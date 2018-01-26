/* @author: hardc0d3 */



//function render_gig_box(hkey){
//    var $box= $($('#prototype-gig-box').html());
//    $box.attr('id','box'+hkey);
//    $box.addClass('gig-box');
//    return $box;
//}



//
//function render_main_container() {
//     var $ctx= $($('#prototype-main-container').html());
//    $ctx.attr('id','main-container');
//    //$box.addClass('sticky-navbar');
//    return $ctx;
//}
//
//function render_nav_bar(){
//    var $box= $($('#prototype-sticky-navbar').html());
//    $box.attr('id','sticky-navbar');
//    //$box.addClass('sticky-navbar');
//    //$box['navbar_top_spacing_px'] = 25;
//    return $box;
//}

//function render_search_accordion() {
//    var $box= $($('#prototype-search-accordion').html());
//    $box.attr('id','search-accordion');
//    return $box;
//}

//function test_render_gig_boxes(cnt){
//    for(var i=0; i<cnt; i++){
//        render_gig_box('test-box'+i);
//        $('#main-ctx-inner').append(render_gig_box('test-box'+i));
//    }
//}





function test_render_container(ui) {

    var $main_container = $($('#prototype-main-container').html())
    //$test.addClass('lefty');
    //$test.addClass('wide');
    //$test.addClass('pink');
    //$test.attr('id','test-container');
//    $test.html('test container instance');

    //$('body').append(ui.$navbar);
    //$('body').append($main_container);


    //ui.$search_bar = render_search_accordion();
    //$('div#search-bar').html(ui.$search_bar);
    //$('.ui.accordion').accordion();
   // $navbar = render_nav_bar();

    //console.log(ui)


    //test_render_gig_boxes(12);
}
//
//function test_render_main(ui){
//
//    test_render_container(ui);
//
//}

// gigs
var gigs = {
    hkey_cache:{},

    push_in_hkey_cache: function( hkey ) {
        if (hkey in gigs.hkey_cache) {
                //
                // on_exist
           } else {
                // on_push
                this.hkey_cache[hkey]=null;
           }
    },
    //

    //
    end_of_gigs_object:'end_of_gigs_object'
};


// cdn
var cdn = {
    gigs:gigs,

    GET:"GET",
    scheme:"http://",
    host:"127.0.0.1",
    port:"5678",
    base:"/api/cdn/v1/",

    endpoints:{
        idx:"idx/"
    },

    uri_base: function(){
        base_uri = this.scheme + this.host + ":" + this.port + this.base;
        return base_uri;
    },

    uri_idx_all:function(){
        uri = this.uri_base() + this.endpoints.idx + '?all';
        return uri;
    },

    ajax_get: function( uri, on_success, on_error,) {
         $.ajax({
            fun_parse:function( js_data){
                try {
                    return JSON.parse(js_data);
                }
                catch(error) {
                    console.log('ERR while parsing...',error);
                }
            },
            var_uri:uri,
            var_gigs:this.gigs,
            evt_on_error: on_error,
            evt_on_success:on_success,
            method: this.GET,
            url:this.uri_idx_all(),
            success:function(js_data){
                // todo sanitize here;
                var sanitized_js_data = js_data;
                // parse
                var jso = this.fun_parse(sanitized_js_data);
                this.evt_on_success(this.var_uri, jso, gigs);
            }
            // todo on error
        });

    },

    // ajax events
    on_get_all_gigs_success:function(uri, jso, gigs){
        console.log(gigs);
        for(var i=0; i<jso.length; i++) {
           console.log(jso[i]);
           gigs.push_in_hkey_cache(jso[i]);
        }
    },

    // ajax
    get_all_gigs:function(){
        this.ajax_get(this.uri_idx_all(), this.on_get_all_gigs_success, null);
    },
    //

    //
    end_of_cdn_object:'end_of_cdn_object'
};



// ert
var ert = {
    //
    ui:{
        render_proto: function (hash_id, inst_id) {
            return $($(hash_id).html()).attr('id', inst_id );
        },
        nav_now_showing: null,
        nav_bar: null,
        nav_bar_offset: null,
        $nav_bar: null,
        $main_container: null,
        $inner_container: null,
        //
        init_particles: function () {
             Particles.init({
                selector:'.intro-canvas',
                color: "#92a8d1",
                sizeVariations: 12,
                minDistance: 150,
                connectParticles: true,
                maxParticles: 100
                });
            },
        //
        scrolling_handler: function(ui){
            if (window.pageYOffset >= ui.nav_bar_offset ) {
                     ui.nav_bar.classList.add("ert-sticky");
                  } else {
                        ui.nav_bar.classList.remove("ert-sticky");
                  }
            },
        //
        resize_handler: function(e){

             if( e.data.ui.nav_now_showing == '#myprofile'){
                console.log('not rsz',w);
                return;
             }

             $e = $('#main-container > div');
             var card_width = 222 + 3 + 3;
             var card_cnt = Math.ceil( $(window).width() / card_width )-1;
             var w = card_width * card_cnt;
             if(w < card_width ) {
                w = card_width;
             }
             $e.width(w);

        }
        // end ui obj
    },
    cdn:cdn,
    // bootstrap on document ready
    init:function(){
        console.log('app init');

        $(window).on('resize', {ui:this.ui}, this.ui.resize_handler);
        // this.ui.resize_handler();

        this.ui.$nav_bar = this.ui.render_proto('#prototype-sticky-navbar','sticky-navbar');
        this.ui.$main_container = this.ui.render_proto('#prototype-main-container','main-container');
        this.ui.$intro_headline = this.ui.render_proto('#prototype-intro-headline','intro-headline');
        this.ui.$box_spacer = this.ui.render_proto('#prototype-box-spacer','box-spacer');
        //this.ui.$main_search = this.ui.render_proto('#prototype-main-search','main-search');

        this.ui.$nav_bar.css('opacity',0.0);
        this.ui.$main_container.css('opacity',0.0);
        this.ui.$nav_bar.animate({ opacity: 1.0 }, 'slow');
        this.ui.$main_container.animate({ opacity: 1.0 }, 'slow');
        $('body').append(this.ui.$intro_headline);
        $('body').append(this.ui.$nav_bar);
        $('body').append(this.ui.$main_container);

        //this.ui.init_particles();



        this.ui.nav_bar = document.getElementById("sticky-navbar");
        this.ui.nav_bar_offset = this.ui.nav_bar.offsetTop;
        var ui = this.ui;

        window.onscroll = function() {
                ui.scrolling_handler(ui);
        };

         //this.ui.init_particles();


         $('a[href="#top"]').on('click',{ui:this.ui}, function(e){
            e.data.ui.nav_now_showing = '#top';
         });

        $('a[href="#gigs"]').on('click',{ui:this.ui}, function(e){
              e.data.ui.nav_now_showing = '#gigs';
        });

         $('a[href="#people"]').on('click',{ui:this.ui}, function(e){
              e.data.ui.nav_now_showing = '#people';
        });

        $('a[href="#myprofile"]').on('click',{ui:this.ui}, function(e){
              console.log('this.ui',e.data.ui);
              e.data.ui.nav_now_showing = '#myprofile';
              //$('html, body').animate({ scrollTop: 340 }, 'slow',
        });
        //
        for(var i=0; i<120; i++){
            $ee = this.ui.render_proto('#prototype-gig-box','gig-box'+i);
            $ee.css('opacity',0.0);
            $('#main-container > div').append(this.ui.render_proto('#prototype-gig-box','gig-box'+i))
            $ee.animate({ opacity: 1.0 }, 'fast');
        }
    },
    dummy_content(){
        for(var i=0;i<100;i++){
          //$('#main-segment').append('test<br>');
        }
    },
    //

    //
    end_of_ert_object:"end of object"
};
