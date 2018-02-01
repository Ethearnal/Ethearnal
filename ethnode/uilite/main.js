
/* functions */

var len = function(o) {
    return Object.keys(o).length;
}
var get_gigs = function(ls){
    for(var i=0;i<ls.length;i++){
        get_gig(ls[i]);
    }
};

var get_gig = function(hkey){
    //var arg = ert.gigs_all_hkeys[i];
    var uri = '/api/v1/dht/hkey/?hkey=' + hkey;
    var hkey = hkey;
    if(ert.gigs.hasOwnProperty(hkey)){ return; }
    ert.l.load_raw('GET',uri, function(raw) {
        k = uri.split('=')[1];
        ert.gigs[k]=JSON.parse(raw);
    });
};


var update_gigs_listing = function(ert, qry) {
    uri = ert.cdn_default + '/api/cdn/v1/idx?'+qry;
     ert.l.load_raw('GET',uri,function(raw){
        ert.gigs_all_hkeys=JSON.parse(raw);
        ert.update_gigs_listing(ert);
    });
};

/* data */

var ert = {
    cdn_default: 'http://127.0.0.1:5678',
    l:null,
    gigs:{},
    gigs_all_hkeys:null,
    update_gigs_listing: function(ert) {
        get_gigs(ert.gigs_all_hkeys.slice(0,20));
    },
    //gig_boxes:[],

    __end:null
}

/* boot */

var main = function() {
    console.log('APP STARTED');
    ert.l = new Layoutjs(DOMPurify.sanitize);
//    var main_ctx = Document.getElementById('main-content');
//    var html = "";
//    for(var i=0, i<9; i++) {
//     html += '<div>test'+i+'</div>';
//
//    };
    //main_ctx.innerHTML=html;
    //ert.gig_boxes
    //console.log(main_ctx);
   // update_gigs_listing(ert,'all&limit=500');
};