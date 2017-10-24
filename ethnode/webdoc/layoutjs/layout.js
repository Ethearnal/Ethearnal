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


Layoutjs.prototype.load_parse_json = function (method,urijs,onready){
     if(window.XMLHttpRequest){
         req = new XMLHttpRequest();
      }
    else{load_json
        return null;
     }
    req.onreadystatechange = function(){
       if (req.readyState === 4) {
       //TODO: implement more different statuses and err handling 
       if (req.status === 200 ){
                 onready(JSON.parse(req.responseText));
        } else {
              //;
              }
     } else
     { /*not ready */; }
    }
    /* always async */
    req.open(method,urijs,true);
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



Layoutjs.prototype.include = function(method,urixml,target){
    
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(){ 
       if (req.readyState != 4){
          return false;
       }
       if (req.status === 200 ){
                document.getElementById(target).innerHTML = Layoutjs_sanitize(req.responseText);
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
    var e = document.getElementById(id);
    if ('textContent' in e) { 
        e.textContent = Layoutjs.sanitizer(text);
    }
    else { //ie7,8 
        e.innerText = Layoutjs.sanitizer(text);
    }
};

Layoutjs.prototype.html_content =  function(id,html){
    document.getElementById(id).innerHTML=Layoutjs_sanitize(html);
};



// Layoutjs.prototype.text = function(method,urixml,urijs,target){
//      if(window.XMLHttpRequest){
//          req = new XMLHttpRequest();
//       }
//     else{
//         return null;
//      }
//     req.onreadystatechange = function(){
//        if (req.readyState === 4) {
//        //TODO: implement more different statuses and handling 
//        if (req.status === 200 ){
//                  e = document.getElementById(target);
//                  if ('textContent' in e) { 
//                      e.textContent = req.responseText;
//                  }
//                  else { //ie7,8 
//                      e.innerText = Layoutjs_sanitize(req.responseText);
//                  }
//                  if( urijs != null){
//                      /* always async*/
//                      Layoutjs_ajaxjs(method, urijs, true);
//                  }
//                  req = null;
//         } else {
//               //;
//               }
//      } else
//      { /*not ready todo*/;
//      }
//     }
//     /* always async*/
//     req.open(method,urixml,true);
//     req.send();
// };
 

