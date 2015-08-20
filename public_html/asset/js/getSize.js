/**
 * @author PILSSALGI
 * 2012.02.23
 */



var WindowSize = function(){};

WindowSize.width = function(){
    var size = 0;
    
    if(document.documentElement.clientWidth){
      size = document.documentElement.clientWidth;
     }else if(document.body.clientWidth){
      size = document.body.clientWidth;
     }else if(window.innerWidth){
      size = window.innerWidth;
     }
     
    return size;
}

WindowSize.height = function(){
    var size = 0;
    
    if(document.documentElement.clientHeight){
      size = document.documentElement.clientHeight;
     }else if(document.body.clientHeight){
      size = document.body.clientHeight;
     }else if(window.innerHeight){
      size = window.innerHeight;
     }
     
    return size;
}

