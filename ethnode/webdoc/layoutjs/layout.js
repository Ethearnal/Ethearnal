/* author hardc0d3 */

function Layoutjs(){
};

Layoutjs.prototype.bind = function (func, thisVal) {
    return function () {
        return func.apply(thisVal, arguments);
    }
};


Layoutjs.prototype.evaljson =  function (jsonstr){
    return eval('('+jsonstr+')');
}


Layoutjs.prototype.load = function (method,urijs,async,onready){
     if(window.XMLHttpRequest){
         req = new XMLHttpRequest();
      }
    else{
        return null;
     }
    req.onreadystatechange = function(){
       if (req.readyState === 4) {
       //TODO: implement more different statuses and err handling 
       if (req.status === 200 ){
                 onready(req.responseText);
        } else {
              //;
              }
     } else
     { /*not ready */; }
    }
    req.open(method,urijs,async);
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
    req.open(method,urijs,async);
    req.send();
};



Layoutjs.prototype.include = function(method,urixml,urijs,target,async){
    var req = new XMLHttpRequest();
     req.onreadystatechange = function(){ 
       if (req.readyState != 4){
          return false;
       }
       if (req.status === 200 ){
                 document.getElementById(target).innerHTML = req.responseText;
                  if(urijs != null){
                    Layoutjs_ajaxjs('GET',urijs,async);
                  }
          }
      }
    req.open(method,urixml,async);
    req.send();
};



Layoutjs.prototype.text = function(method,urixml,urijs,target,async){
     if(window.XMLHttpRequest){
         req = new XMLHttpRequest();
      }
    else{
        return null;
     }
    req.onreadystatechange = function(){
       if (req.readyState === 4) {
       //TODO: implement more different statuses and handling 
       if (req.status === 200 ){
                 e = document.getElementById(target);
                 if ('textContent' in e) { 
                     e.textContent = req.responseText;
                 }
                 else { //ie7,8 
                     e.innerText = req.responseText;
                 }
                 if( urijs != null){
                     Layoutjs_ajaxjs(method, urijs, async);
                 }
                 req = null;

        } else {
              //;
              }
     } else
     { /*not ready todo*/;
     }
    }
    req.open(method,urixml,async);
    req.send();
};
 


