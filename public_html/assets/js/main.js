var APPLICATION = (function(){

})();


/******************************************
TASKS
*******************************************/
(function (w, d, n, $) {
//parameter
var sleepTime = 500;
//preloadする画像の取得
var uris = (function getImagesUrl(){
	var i = 0,len = $('img').length;
	var imgArray = [];
	for(i = 0; i < len; i++)imgArray.push($('img')[i].src);
	//cssで使うimageのロード
	if(APPLICATION.slideParams.images){
		for(var i = 0;i<APPLICATION.slideParams.images.length;i++){
			imgArray.push(APPLICATION.slideParams.images[i]);
		}
	}
	return imgArray;
})();

//マウスホイールイベント　
APPLICATION.mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';
//cssアニメーション終了
APPLICATION.transitionEventEnd = 'oTransitionEnd mozTransitionEnd webkitTransitionEnd transitionend';
APPLICATION.DEVICE_TYPE = (function(){
	var ua = navigator.userAgent;
    var r = new Array(3);
    if (ua.search(/iphone/i) > -1) {
        r = ['smart', 'iphone', 'ios'];
    } else if (ua.search(/ipod/i) > -1) {
        r = ['smart', 'ipod', 'ios'];
    } else if (ua.search(/ipad/i) > -1) {
        r = ['tablet', 'ipad', 'ios'];
    } else if (ua.search(/android/i) > -1 && ua.search(/webkit/i) > -1) {
        if (ua.search(/mobile/i) > -1) {
            r = ['smart', 'androidmobile', 'android'];
        } else {
            r = ['tablet', 'androidtablet', 'android'];
        }
    } else if (ua.search(/blackberry/i) > -1 && ua.search(/webkit/i) > -1 && ua.search(/mobile/i) > -1) {
        r = ['smart', 'blackberry', 'ohter'];
    } else if (ua.search(/windows phone/i) > -1 && ua.search(/msie/i) > -1) {
        r = ['other', 'windowsphone', 'other'];
    } else if (ua.search(/^docomo/i) > -1) {
        r = ['mobile', 'imode', 'other'];
    } else if (ua.search(/^kddi/i) > -1 || ua.search(/^up\.browser/i) > -1) {
        r = ['mobile', 'ezweb', 'other'];
    } else if (ua.search(/^softbank/i) > -1 || ua.search(/^vodafone/i) > -1 || ua.search(/^mot/i) > -1) {
        r = ['mobile', 'sb', 'other'];
    } else {
        r = ['other', 'other', 'other'];
    }
    return r;
})();

// Touch Event
var isTouchTimeout = false;
var isTouchTimer = 300;
var isTouchStartPos = 0;
var isTouchEndPos = 0;
var isTouchGap = 5;
var isSP = (APPLICATION.DEVICE_TYPE == 'smart') ? true : false;
var isTablet = (APPLICATION.DEVICE_TYPE == 'tablet') ? true : false;
//--------------------------------------------
APPLICATION.Event = {};
APPLICATION.Event.isTouchAvailable = true;
APPLICATION.Event.TouchStart = (isSP || isTablet) ? 'touchstart' : 'mousedown';
APPLICATION.Event.TouchMove = (isSP || isTablet) ? 'touchmove' : 'mousemove';
APPLICATION.Event.TouchEnd = (isSP || isTablet) ? 'touchend ' : 'mouseup';
APPLICATION.Event.Click = (isSP || isTablet) ? 'click' : 'click';
//--------------------------------------------
// isTouchAvailable
$(document).on(APPLICATION.Event.TouchStart, function(e) {
    APPLICATION.Event.isTouchAvailable = true;
    clearTimeout(isTouchTimeout);
    isTouchTimeout = false;
    isTouchStartPos = (APPLICATION.isSP || APPLICATION.isTablet) ? e.originalEvent.touches[0].pageY : e.pageY;
    isTouchTimeout = setTimeout(function() {
        APPLICATION.Event.isTouchAvailable = false;
    }, isTouchTimer);
});

$(document).on(APPLICATION.Event.TouchMove, function(e) {
    if (APPLICATION.Event.isTouchAvailable) {
        isTouchEndPos = (APPLICATION.isSP || APPLICATION.isTablet) ? e.originalEvent.touches[0].pageY : e.pageY;
        var _gap = Math.abs(isTouchEndPos - isTouchStartPos);
        if (_gap > isTouchGap) {
            APPLICATION.Event.isTouchAvailable = false;
        }
    }
});

///////////////////////////////////////
//init functions
///////////////////////////////////////
//dom
function dom () {
  var dfr = $.Deferred();
  $(d).ready(dfr.resolve);
  return dfr.promise();
}
//img preload
function img (uri) {
  var dfr = $.Deferred(), $img = $(d.createElement('img'));
  $img.on('error', function (ev) {
    $(ev.target).remove();
    $(ev.target).off(ev.type);
    dfr.reject(new Error(uri));
  });
  $img.on('load', function (ev) {
    $(ev.target).off(ev.type);
    dfr.resolve($(ev.target));
  });
  $img.attr('src', uri);
  return dfr.promise();
}

//preloads
function preloads (uris, type) {
  var i = 0, len = uris.length, dfr = $.Deferred(), promises = [];
  for (i = 0; i < len; i++) promises.push(type(uris[i]));
  $.when(promises).fail(dfr.reject).done(dfr.resolve);
  return dfr.promise();
}

//show loading time
function sleep (millisec) {
  var id, dfr = $.Deferred();
  	id = w.setTimeout(function () {
	    w.clearTimeout(id);
	    dfr.resolve();
	  }, millisec);
  return dfr.promise();
}

//init
(function init(){
	google.setOnLoadCallback(function(){
		$.when(dom(), preloads(uris, img), sleep(sleepTime)).fail(function () {
		// error
		}).done(function () {
		});
	});//google.setOnLoadCallback
})();

})(window, document, navigator, jQuery);