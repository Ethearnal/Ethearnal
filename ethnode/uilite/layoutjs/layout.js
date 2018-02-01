/* author hardc0d3 */
/* todo dry & test this code ! */

var Layoutjs_sanitize = function(data){
    console.log('PLEASE SET SANITEZER!')
    return new Error('PLEASE SET DOM SANITIZER!');
}



function Layoutjs(sanitizer){
    if (sanitizer != undefined){
        if (sanitizer != null){
            Layoutjs_sanitize = sanitizer;
        }
        {
            Layoutjs_sanitize('err');
        }
    }
    else{
      
        Layoutjs_sanitize('err');
        
    }
};



Layoutjs.prototype.bind = function (func, thisVal) {
    return function () {
        return func.apply(thisVal, arguments);
    }
};


Layoutjs.prototype.evaljson =  function (jsonstr){
    return eval('('+jsonstr+')');
}


Layoutjs.prototype.load_raw = function (method, uri, onready ) {
    var req = null;
    if(window.XMLHttpRequest) {
         req = new XMLHttpRequest();
    } else { return null; }

    req.onreadystatechange = function() {
        if (req.readyState === 4) {
                if (req.status === 200 ) {
                     onready(req.responseText);
                }

            }
            else {
                  //no ready//;
            }
        }
    /* always async */
    req.open(method, uri, true);
    req.send();
}


Layoutjs_ajaxjs = function(method,urijs,async){
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(){
       if (req.readyState != 4){
          return false;
       }
       if (req.status === 200 ){
                 //document.getElementById(target).innerHTML = req.responseText;
                 eval(  req.responseText ) ;
       }
      }
      /* always async*/
    req.open(method,urijs,true);
    req.send();
};


// Layoutjs.prototype.load_html = function(method,urixml,target, on_html_load){
    
//     var req = new XMLHttpRequest();
//      req.onreadystatechange = function(){ 
//        if (req.readyState != 4){
//           return false;
//        }
//        if (req.status === 200 ){
//                 html = Layoutjs_sanitize(req.responseText);
//                 on_html_load(html);       
//       }
//     /* always async*/
//     req.open(method,urixml,true);
//     req.send();
// };


Layoutjs.prototype.include = function(method,urixml,target){
    
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(){ 
       if (req.readyState != 4){
          return false;
       }
       if (req.status === 200 ){
                html = Layoutjs_sanitize(req.responseText);
                document.getElementById(target).innerHTML = html;
                return html;
          }
      }
    /* always async*/
    req.open(method,urixml,true);
    req.send();
};

Layoutjs.prototype.include_eval = function(method,urixml,urijs,target,sanitize_xml){
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(){ 
       if (req.readyState != 4){
          return false;
       }
       if (req.status === 200 ){
                 content = req.responseText;
                 if(sanitize_xml){
                    content = Layoutjs_sanitize(content);
                 }
                 document.getElementById(target).innerHTML = content;
                  if(urijs != null){
                      /* always async*/
                    Layoutjs_ajaxjs('GET',urijs,true);
                  }
          }
      }
    /* always async*/
    req.open(method,urixml,true);
    req.send();
};


Layoutjs.prototype.text_content =  function(id,text){
    try {
        var e = document.getElementById(id);
        if ('textContent' in e) {
            e.textContent = Layoutjs_sanitize(text);
        }
        else { //ie7,8
            e.innerText = Layoutjs_sanitize(text);
        }
    } catch(err) {
        console.log('ERR in when load text:  ' + html + ' into: '+ id, ' err:'+ err);
    }
};

Layoutjs.prototype.html_content =  function(id, html){
    try {
        document.getElementById(id).innerHTML=Layoutjs_sanitize(html);
    } catch(err) {
        console.log('ERR in when load html:  ' + html + ' into: '+ id, ' err:'+ err);
    }
};
