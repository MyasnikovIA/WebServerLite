//Глобальные вспомогательные функции
if(window.history && !window.history.pushState)
{
    window.history.constructor.prototype.pushState = function(){};
}
D3Api.globalClientData = new function()
{
    var prefix = 'D3:' + location.pathname + ':';
    this.storage = {};
    var checkStorage = function(_storageName){
        try {
            if (window[_storageName]){
                window[_storageName].getItem(prefix+':Exception');
                return true;
            }
        }catch (e){}
        return false;
    };
    if(checkStorage('localStorage')){
        this.storage = window.localStorage;
    }else if(checkStorage('globalStorage')){
        this.storage = window.globalStorage[document.domain];
    }

    this.get = function(name,defaultValue){
        if(this.storage[prefix+name] === undefined)
            return defaultValue;
        return String(this.storage[prefix+name]);
    };
    this.set = function(name,value){
        if(value === undefined)
        {
            this.storage[prefix+name] = undefined;
            delete this.storage[prefix+name];
            return;
        }
        this.storage[prefix+name] = value;
    }
};

if (!("console" in window) || !("log" in console))
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {};
}else
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    for (var i = 0; i < names.length; ++i)
        if (!(names[i] in console))
            window.console[names[i]] = function() {};
}
if(!Array.prototype.indexOf){
    Array.prototype.indexOf=function(value,offset){
        for(var i=(offset||0),j=this.length;i<j;i++){
            if(this[i]==value){return i;}
        }
        return -1;
    }
}

D3Api.getPageWindowSize = function(parent)
{
	parent = parent || document.body;
    var windowWidth, windowHeight;
    var pageHeight, pageWidth;
    if (parent != document.body) {
      windowWidth = parent.getWidth();
      windowHeight = parent.getHeight();
      pageWidth = parent.scrollWidth;
      pageHeight = parent.scrollHeight;
    }
    else {
      var xScroll, yScroll;

      if (window.innerHeight && window.scrollMaxY) {
        xScroll = document.body.scrollWidth;
        yScroll = window.innerHeight + window.scrollMaxY;
      } else if (document.body.scrollHeight > document.body.offsetHeight){ // all but Explorer Mac
        xScroll = document.body.scrollWidth;
        yScroll = document.body.scrollHeight;
      } else { // Explorer Mac...would also work in Explorer 6 Strict, Mozilla and Safari
        xScroll = document.body.offsetWidth;
        yScroll = document.body.offsetHeight;
      }


      if (self.innerHeight) {  // all except Explorer
        windowWidth = self.innerWidth;
        windowHeight = self.innerHeight;
      } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
        windowWidth = document.documentElement.clientWidth;
        windowHeight = document.documentElement.clientHeight;
      } else if (document.body) { // other Explorers
        windowWidth = document.body.clientWidth;
        windowHeight = document.body.clientHeight;
      }

      // for small pages with total height less then height of the viewport
      if(yScroll < windowHeight){
        pageHeight = windowHeight;
      } else {
        pageHeight = yScroll;
      }

      // for small pages with total width less then width of the viewport
      if(xScroll < windowWidth){
        pageWidth = windowWidth;
      } else {
        pageWidth = xScroll;
      }
    }
    return {pageWidth: pageWidth ,pageHeight: pageHeight , windowWidth: windowWidth, windowHeight: windowHeight};
}

D3Api.getAbsoluteSize = function(element){
    if(!element) return;
    var display = element.style.display;
    if (display != 'none' && display != null) // Safari bug
    return {width: element.offsetWidth, height: element.offsetHeight};

    // All *Width and *Height properties give 0 on elements with display none,
    // so enable the element temporarily
    var els = element.style;
    var originalVisibility = els.visibility;
    var originalPosition = els.position;
    var originalDisplay = els.display;
    els.visibility = 'hidden';
    els.position = 'absolute';
    els.display = 'block';
    var originalWidth = element.clientWidth;
    var originalHeight = element.clientHeight;
    els.display = originalDisplay;
    els.position = originalPosition;
    els.visibility = originalVisibility;
    return {width: originalWidth, height: originalHeight};
}
D3Api.getAbsoluteRect = function(element,scrollNeed){
        if(!element) return;
        var pos=D3Api.getAbsolutePos(element);
        var size=D3Api.getAbsoluteSize(element);
        if (scrollNeed)
        {
        	pos.x -= D3Api.getBodyScrollLeft();
        	pos.y -= D3Api.getBodyScrollTop();
        }
        return {x:pos.x, y:pos.y, width:size.width, height:size.height};
}
D3Api.getAbsoluteClientRect = function(elem,xScroll,yScroll) {
    var rect = elem.getBoundingClientRect();

    var scrollTop = D3Api.getBodyScrollTop();
    var scrollLeft = D3Api.getBodyScrollLeft()

    var coordy  = rect.top + ((yScroll === false)?0:scrollTop);
    var coordx = rect.left + ((xScroll === false)?0:scrollLeft);

    return {y: Math.round(coordy), x: Math.round(coordx), width: rect.width || (rect.right-rect.left),height: rect.height || (rect.bottom-rect.top)};
}
D3Api.getBodyScrollTop = function()
{
  return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}

D3Api.getBodyScrollLeft = function()
{
  return self.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || (document.body && document.body.scrollLeft);
}
D3Api.getPageEventCoords = function(evt)
{
	var coords = {left:0, top:0};
	if(evt.pageX)
	{
		coords.left = evt.pageX;
		coords.top = evt.pageY;
	}
	else if(evt.clientX)
	{
		coords.left = evt.clientX + document.body.scrollLeft - document.body.clientLeft;
		coords.top  = evt.clientY + document.body.scrollTop - document.body.clientTop;

		if (document.body.parentElement && document.body.parentElement.clientLeft)
		{
		var bodParent = document.body.parentElement;
			coords.left += bodParent.scrollLeft - bodParent.clientLeft;
			coords.top  += bodParent.scrollTop - bodParent.clientTop;
		}
	}
	return coords;
}
D3Api.returnGET = function(notlower)
{
    var keyVal = (window.location.search.substr(1)).split('&');
    var resGet = {};
    var p= -1;
    var key= '';
    for(var i=0; i < keyVal.length; i++)
    {
      p = keyVal[i].search('=');
      key = keyVal[i].substr(0,p);
      resGet[notlower?key:key.toLowerCase()] = decodeURIComponent(keyVal[i].substr(p+1));
    }
    return resGet;
}
D3Api.getControlPropertyByDom = function(controlDom,nameProperty,noGetEvent)
{
    var ct = D3Api.getProperty(controlDom,'cmptype');
    if (!ct)
    {
        //D3Api.debug_msg('У объекта нет API');
        return;
    }
    var objProp = false;
    if(nameProperty.indexOf('.') != -1)
    {
        nameProperty = nameProperty.split('.');
        objProp = nameProperty[1];
        nameProperty = nameProperty[0];
    }
    if (!D3Api.controlsApi[ct] || !D3Api.controlsApi[ct][nameProperty] || !D3Api.controlsApi[ct][nameProperty].get)
    {
        D3Api.debug_msg('Нет метода получения свойства "'+nameProperty+'" для компонента с типом: '+ct);
        return;
    }

    var ref = {value: D3Api.controlsApi[ct][nameProperty].get.call(this, controlDom)};
    if(objProp && ref.value)
        ref.value = ref.value[objProp];
    if(noGetEvent !== true && controlDom.D3Base)
    {
        controlDom.D3Base.callEvent('onget_property',nameProperty,ref);
    }
    return ref.value;
}
D3Api.setControlPropertyByDom = function(controlDom,nameProperty,value,noChangeEvent,isUserEvent)
{
    var ct = D3Api.getProperty(controlDom,'cmptype');
    if (!ct)
    {
        D3Api.debug_msg('У объекта нет API');
        return;
    }
    if (!D3Api.controlsApi[ct] || !D3Api.controlsApi[ct][nameProperty] || !D3Api.controlsApi[ct][nameProperty].set)
    {
        D3Api.debug_msg('Нет метода установки свойства "'+nameProperty+'" для компонента с типом: '+ct);
        return;
    }

    var usEv = D3Api.__isUserEvent__;
    D3Api.__isUserEvent__ = isUserEvent;
    var resValue = {value: value, forceOnChange: false};
    var res = D3Api.controlsApi[ct][nameProperty].set.call(this, controlDom, value, resValue);

    controlDom.D3Store._properties_ = controlDom.D3Store._properties_ || {};
    if(resValue.forceOnChange || (noChangeEvent !== true && controlDom.D3Base && (res === undefined || res === true) && ((controlDom.D3Store._properties_[nameProperty] === undefined && resValue.value !== undefined) || (controlDom.D3Store._properties_[nameProperty] !== undefined && controlDom.D3Store._properties_[nameProperty] !== resValue.value))))
    //if(noChangeEvent !== true && controlDom.D3Base && (res === undefined || res === true) && controlDom.D3Store._properties_[nameProperty] !== value)
    {
        var oldVal = controlDom.D3Store._properties_[nameProperty];
        controlDom.D3Store._properties_[nameProperty] = resValue.value;
        controlDom.D3Base.callEvent('onchange_property',nameProperty,resValue.value,oldVal);
    }
    D3Api.__isUserEvent__ = usEv;
    return res;
}
D3Api.getControlAPIByDom = function(controlDom)
{
    var ct = D3Api.getProperty(controlDom,'cmptype');
    if (!ct)
    {
        D3Api.debug_msg('У объекта нет API');
        return;
    }
    return D3Api.controlsApi[ct]._API_;
}
D3Api.addControlEventByDom = function(controlDom, eventName, listener)
{
    if(!controlDom.D3Base)
        return;

    if(controlDom.D3Form && controlDom.D3Form.execDomEvents[eventName] && !controlDom.D3Store._setEvents_[eventName])
    {
        //Найти точку монтирования события
        var uid = controlDom.D3Store._uid_;
        var doms = D3Api.getAllDomBy(controlDom, '[events'+uid+'*="'+eventName+'"]');
        doms.length==0 && (doms = [controlDom]);
        var attrEventName = eventName;
        if(D3Api.BROWSER.msie)
        {
            attrEventName = '_'+eventName+'_';
        }
        for(var i = 0, c = doms.length; i < c; i++)
        {
            if(doms[i].D3Store._setEvents_[eventName])
                continue;
            doms[i].D3Store._setEvents_[eventName] = true;
            doms[i][eventName]=doms[i].D3Form.execDomEventFunc(doms[i],'if(callControlEvent(D3Api.getControlByDom(this),\''+eventName+'\',event)===false)return;'+D3Api.getProperty(doms[i],attrEventName,''),eventName);
        }

    }
    return controlDom.D3Base.addEvent(eventName, listener);
}
D3Api.callControlEventByDom = function(controlDom, eventName)
{
    if(!controlDom.D3Base)
        return;
    var args = Array.prototype.slice.call(arguments,1);
    return controlDom.D3Base.callEvent.apply(controlDom.D3Base,args);
}
D3Api.removeControlEventByDom = function(controlDom, eventName, uniqid)
{
    if(!controlDom.D3Base)
        return;

    return controlDom.D3Base.removeEvent(eventName, uniqid);
}
D3Api.getControlByDom = function(dom,cmptype,deep)
{
    deep = deep || 100;
    while(dom && dom.getAttribute && dom.nodeName.toUpperCase() != 'HTML' && (deep == undefined || deep-- > 0))
    {
        if(dom.getAttribute('cmptype') && (!cmptype || dom.getAttribute('cmptype') == cmptype))
            return dom;
        dom = dom._parentDOM_ || dom.parentNode;
    }
    return null;
}
D3Api.getDomByDomAttr = function(dom,attr,value,deep)
{
    while(dom && dom.getAttribute && dom.nodeName.toUpperCase() != 'HTML' && (deep == undefined || deep-- > 0))
    {
        if(dom.getAttribute(attr) && (!value || dom.getAttribute(attr) == value))
            return dom;
        dom = dom._parentDOM_ || dom.parentNode;
    }
    return null;
}
D3Api.scrollTo = function(dom)
{
    if(dom.scrollIntoView)
        dom.scrollIntoView();
}
D3Api.setStyle = function(dom,property,value)
{
    dom.style[property] = value;
}
D3Api.showDom = function(dom,state)
{
    dom.style.display = (state)?'':'none';
}
D3Api.showDomBlock = function(dom)
{
    dom.style.display = 'block';
}
D3Api.setDomDisplayDefault = function(dom)
{
    dom.style.display = '';
}
D3Api.hideDom = function(dom)
{
    dom.style.display = 'none';
}
D3Api.showedDom = function(dom)
{
    return dom.style.display != 'none';
}
D3Api.isChildOf = function(child,container)
{
    var c = child.parentNode;
    while (c != undefined && c != document.body && c != container)
    {
        c = c.parentNode;
    }
    return (c == container);
}
D3Api.debug_msg = function()
{
    if(D3Api.getOption('debug', 0) > 0)
        console.log.apply(console, arguments);
}
D3Api.alert_msg = function(msg,force)
{
    var res = msg.match(/(?:MESSAGE_TEXT:)([\s\S]+?)(?:PG_EXCEPTION_DETAIL:|$)/);
    if(!res)
        res = msg.match(/(?:ERROR:|ОШИБКА:|ORA\-20103:)([\s\S]+?)(?:CONTEXT:|КОНТЕКСТ:|\[!\]|$)/);
    if(res)
    {
        res = res[1].replace(/\n/g, '<br/>');
        D3Api.notify('Сообщение сервера',res,{modal: true});
        //alert(res[1]);
    }else if(force)
        alert(msg);
    //console.trace();
}
D3Api.clearDom = function(dom)
{
    while(dom.childNodes.length > 0)
        dom.removeChild(dom.childNodes[0]);
}
D3Api.createDom = function(text)
{
    var dom = document.createElement('div');
    try
    {
        dom.innerHTML = text;
        var res = dom.removeChild(dom.firstChild);
        dom = null;
        return res;
    }catch(e)
    {
        return null;
    }
}
D3Api.addDom = function(dom,newDom)
{
    return dom.appendChild(newDom);
}
D3Api.insertBeforeDom = function(dom,newDom)
{
    return dom.parentNode.insertBefore(newDom,dom);
}
D3Api.insertAfterDom = function(dom, newDom)
{
    return dom.parentNode.insertBefore(newDom, dom.nextSibling);
}
D3Api.removeDom = function(dom)
{
    if (dom && dom.parentNode)
        dom.parentNode.removeChild(dom);
}
D3Api.mixin = function (dst)
{
    for(var i = 1, c = arguments.length; i < c; i++)
    {
        if(!arguments[i]) continue;
        var obj = arguments[i];
        for(var key in obj)
        {
            if(obj.hasOwnProperty(key)){
                if(obj[key] instanceof Array){
                    dst[key] = D3Api.mixin([],obj[key]);
                } else if(obj[key] instanceof Function){
                    dst[key] = obj[key];
                } else if(obj[key] instanceof Object){
                    var isInstanceOf = false;
                    for(var func in D3Api){
                        if(D3Api[func] instanceof Function){
                            if(obj[key] instanceof D3Api[func]){
                                isInstanceOf = true;
                                break;
                            }
                        }
                    }
                    if(isInstanceOf){
                        dst[key] = obj[key];
                    }else{
                        dst[key] = D3Api.mixin({},obj[key]);
                    }

                }else{
                    dst[key] = obj[key];
                }

            }
        }
    }
    return dst;
}
D3Api.clone = function(o,deep,cdr)
{
    if (!cdr)
        cdr = 0;
    cdr++;
 	if(typeof o !== 'object')
 	{
   		return o;
 	}
    var c = {};
    if (o instanceof Array)
        c = [];
 	var v;
    if (cdr > deep)
        return c;
 	for(var p in o)
 	{
        if(o.hasOwnProperty(p))
        {
            v = o[p];
            if(v && typeof v === 'object' && !v.appendChild)
            {
                c[p] = D3Api.clone(v,deep,cdr);
            }else
            {
                c[p] = v;
            }
        }
	}
 	return c;
}
D3Api.getProperty = function getProperty(dom,name,def)
{
    var p = dom.getAttribute(name);
    if(p || dom.attributes[name])
        return (p)?p:dom.attributes[name].value;
    else
        return def;
}
D3Api.setProperty = function setProperty(dom,name,value)
{
    if (value == null)
        value = '';
    return dom.setAttribute(name,value);
}
D3Api.hasProperty = function(dom,name)
{
    return (dom.attributes && dom.attributes[name] && dom.getAttribute(name)!=undefined);
}
D3Api.removeProperty = function(dom,name)
{
    return dom.removeAttribute(name);
}
D3Api.getTextContent = function(dom)
{
    function textContent(dom)
    {
        var _result = "";
        if (dom == null) {
            return _result;
        }
        var childrens = dom.childNodes;
        var i = 0;
        while (i < childrens.length) {
            var child = childrens.item(i);
            switch (child.nodeType) {
                case 1: // ELEMENT_NODE
                case 5: // ENTITY_REFERENCE_NODE
                    _result += textContent(child);
                    break;
                case 3: // TEXT_NODE
                case 2: // ATTRIBUTE_NODE
                case 4: // CDATA_SECTION_NODE
                    _result += child.nodeValue;
                    break;
                case 6: // ENTITY_NODE
                case 7: // PROCESSING_INSTRUCTION_NODE
                case 8: // COMMENT_NODE
                case 9: // DOCUMENT_NODE
                case 10: // DOCUMENT_TYPE_NODE
                case 11: // DOCUMENT_FRAGMENT_NODE
                case 12: // NOTATION_NODE
                // skip
                break;
            }
            i++;
        }
        return _result;
    }
    return dom.text || dom.textContent || textContent(dom);
}
D3Api.getChildTag = function(dom,tagName,index)
{
    if(dom.nodeName.toUpperCase() == tagName.toUpperCase())
        return dom;
    return dom.getElementsByTagName(tagName)[index];
}
D3Api.getDomBy = function(dom,selector)
{
    return dom.querySelector(selector);
}
D3Api.getAllDomBy = function(dom,selector)
{
    return dom.querySelectorAll(selector);
}
D3Api.getDomByAttr = function(dom,attr,value)
{
    if (dom.getAttribute(attr) == value)
        return dom;
    return D3Api.getDomBy(dom,'['+attr+'="'+value+'"]');
}
D3Api.getDomByName = function(dom,name)
{
    if (dom.getAttribute('name') == name)
        return dom;
    return D3Api.getDomBy(dom,'[name="'+name+'"]');
}
D3Api.bindThis = function (func, thisObj)
{
    return function(){return func.apply(thisObj,arguments)};
}
D3Api.onContextMenuBody = function(event)
{
    var target = D3Api.getEventTarget(event);

    return (target.value != undefined);
}
D3Api.addEvent = function(dom,eventName,func,capture)
{
    if(dom.addEventListener)
    {
        dom.addEventListener(eventName,func,(capture == undefined)?false:capture);
    }else
    {
        dom.attachEvent('on'+eventName,func);
    }
    return func;
}
D3Api.removeEvent = function(dom,eventName,func,capture)
{
    if(dom.removeEventListener)
    {
        dom.removeEventListener(eventName,func,(capture == undefined)?false:capture);
    }else
    {
        dom.detachEvent('on'+eventName,func);
    }
}
D3Api.__isUserEvent__ = false;
D3Api.execDomEvent = function(dom,eventName)
{
    if (dom[eventName] instanceof Function)
    {
        var args = Array.prototype.slice.call(arguments,2);
        return dom[eventName].apply(null,args);
    }
}
D3Api.isUserEvent = function()
{
    return D3Api.__isUserEvent__;
}
D3Api.isEvent = function(e)
{
    return (e instanceof Object) && (e instanceof Event || e.target || e.currentTarget || e.srcElement);
}
D3Api.getEvent = function(e)
{
    return D3Api.isEvent(e) ? e : window.event || D3Api._event_;
}
D3Api.setEvent = function(event)
{
    D3Api._event_ = event || window.event;
    if (!D3Api.isEvent(D3Api._event_))
        D3Api._event_ = null;
}
D3Api.getEventTarget = function(e)
{
    var ev = D3Api.getEvent(e);
    if (!ev)
        return null;
    return ev.target || ev.srcElement;
}
D3Api.getEventCurrentTarget = function(e)
{
    var ev = D3Api.getEvent(e);
    if (!ev)
        return null;
    return ev.currentTarget || ev.srcElement;
}
D3Api.stopEvent = function(e,preventDefault)
{
    var ev = D3Api.getEvent(e);
    if(!ev)
        return;
    if (ev.stopPropagation) {
        ev.stopPropagation();
    } else {
        ev.cancelBubble = true;
        ev.returnValue = false;
    }
    if(ev.preventDefault && preventDefault !== false)
    {
        ev.preventDefault();
    }
    return false;
}
D3Api.charCodeEvent = function(e)
{
    if (e.charCode)
    {
            return e.charCode;
    }
    else if (e.keyCode)
    {
            return e.keyCode;
    }
    else if (e.which)
    {
            return e.which;
    }
    else
    {
            return 0;
    }
}
D3Api.getBoolean = function(v)
{
    if(typeof v === 'string') {
        v = v.trim();
    }
    return v !== 'false' && v !== '0' && !!v;
}
D3Api.empty = function(v,object)
{
    if(object && v instanceof Object)
    {
        var res = true;
        for(var p in v)
        {
            if(v.hasOwnProperty(p)){
                res = res && D3Api.empty(v[p],object);
            }
        }
        return res;
    }
    return v == undefined || v == null || v == '';
}
D3Api.isUndefined = function(v)
{
    return v === undefined || v === null;
}
D3Api.stringTrim = function(str,charlist)
{
    charlist = !charlist ? ' \\s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
    var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
    return str.replace(re, '');
}
//dom Class attribute
D3Api.addClass = function(c,className)
{
    if(!D3Api.empty(className)){
        className = className.replaceAll(/[()]+/g,'');
    }
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
    if (c.className == undefined)
    {
        c.className = className;
        return;
    }
    if (re.test(c.className)) return;
    c.className = (c.className + " " + className).replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}
D3Api.removeClass = function(c,className)
{
    if(!D3Api.empty(className)){
        className = className.replaceAll(/[()]+/g,'');
    }
    var re = new RegExp("(^|\\s)" + className + "(\\s|$)", "g");
    if (c.className == undefined)
        return;
    c.className = c.className.replace(re, "$1").replace(/\s+/g, " ").replace(/(^ | $)/g, "");
}
D3Api.toggleClass = function(c,className1,className2,firstOnly)
{
    if(D3Api.hasClass(c,className1))
    {
        D3Api.removeClass(c,className1);
        D3Api.addClass(c,className2);
    }else if (!firstOnly)
    {
        D3Api.removeClass(c,className2);
        D3Api.addClass(c,className1);
    }
}
D3Api.hasClass = function(c,className)
{
    if(!D3Api.empty(className)){
        className = className.replaceAll(/[()]+/g,'');
    }
    if (!className)
        return c.className != '' && c.className != undefined;
    return (c.className && c.className.search('\\b' + className + '\\b') != -1);
}
D3Api.addTextNode = function(dom,string,clear)
{
    if(clear)
        dom.innerHTML = '';
    dom.appendChild(document.createTextNode(string));
}
D3Api.htmlSpecialChars = function(string)
{
    var t = document.createElement('span');
    t.appendChild(document.createTextNode(string));

    string = t.innerHTML;
    t = null;
    return string;
}
D3Api.htmlSpecialCharsDecode = function(string, quote_style)
{
    string = string.toString();

    // Always encode
    string = string.replace('/&/g', '&');
    string = string.replace('/</g', '<');
    string = string.replace(/>/g, '>');

    if (quote_style == 'ENT_QUOTES') {
        string = string.replace('/"/g', '"');
        string = string.replace('/\'/g', '\'');
    } else if (quote_style != 'ENT_NOQUOTES') {
        string = string.replace('/"/g', '"');
    }

    return string;
}
D3Api.getStyle = function(oElm,strCssRule)
{
    var strValue = "";
    if(document.defaultView && document.defaultView.getComputedStyle){
        strValue = document.defaultView.getComputedStyle(oElm, "").getPropertyValue(strCssRule);
    }
    else if(oElm.currentStyle){
        strCssRule = strCssRule.replace(/\-(\w)/g, function (strMatch, p1){
            return p1.toUpperCase();
        });
        strValue = oElm.currentStyle[strCssRule];
    }
    return strValue;
}
D3Api.runCalcSize = function(calc_dom,size_dom)
{
    calc_dom = calc_dom || document;
    size_dom = size_dom || document;

    if (!calc_dom.querySelector || !calc_dom.querySelectorAll)
        return;

    var cH = D3Api.getAllDomBy(calc_dom,'[calc_height]');
    var cW = D3Api.getAllDomBy(calc_dom,'[calc_width]');

    var scR = D3Api.getAllDomBy(calc_dom,'[scrollable]'),
        scrollsArr = [];
    for (var scRi = 0, scR_len = scR.length; scRi < scR_len; scRi++) {
        if (scR[scRi].scrollTop > 0 || scR[scRi].scrollLeft > 0)
        {
            scrollsArr.push({
                dom: scR[scRi],
                top: scR[scRi].scrollTop,
                left: scR[scRi].scrollLeft
            });
        }
    }

    if (!cH.length && !cW.length)
        return;

    var cacheSelect = {};
    function stateBlocks(cacheBlocks,block,selfCheck)
    {
        if (!block)
        {
            for(var i = 0, c = cacheBlocks.length; i < c; i++)
                cacheBlocks[i].style.display = 'none';
            cacheBlocks = [];
            return;
        }
        if (!selfCheck)
            block = block.parentNode;
        while (block)
        {
            if (block.style && block.style.display == 'none')
            {
                block.style.display = 'block';
                cacheBlocks.push(block);
            }
            block = block.parentNode;
        }
    }
    function getS(cssSel,wh)
    {
        var blks = new Array();
        cacheSelect[cssSel] = (cacheSelect[cssSel])?cacheSelect[cssSel]:D3Api.getDomBy(size_dom,cssSel);
        stateBlocks(blks,cacheSelect[cssSel],true);
        var r = (!cacheSelect[cssSel])?0:((wh=='w')?cacheSelect[cssSel].offsetWidth:cacheSelect[cssSel].offsetHeight);
        stateBlocks(blks);
        return r;
    }

    for(var i = 0; i < cH.length; i++)
    {
        cH[i]._style_display_h_ = cH[i].style.display;
        cH[i].style.display = 'none';
    }
    var div = document.createElement('div');
    var blocks = new Array();
    for(var i = 0; i < cH.length; i++)
    {
        stateBlocks(blocks,cH[i]);
        var h = cH[i].getAttribute('calc_height');
        var parent = cH[i].parentNode.offsetHeight;
        parent = parent - (parseInt(D3Api.getStyle(cH[i].parentNode,'padding-top')) || 0)
                        - (parseInt(D3Api.getStyle(cH[i].parentNode,'padding-bottom')) || 0)
                        - (parseInt(D3Api.getStyle(cH[i].parentNode,'border-top')) || 0)
                        - (parseInt(D3Api.getStyle(cH[i].parentNode,'border-bottom')) || 0);
        if (h!='')
            cH[i].style.height = Math.abs(eval(h.replace(/#(.+?)#/gi,'getS("$1","h")')))+'px';
        stateBlocks(blocks);
    }

    for(var i = 0; i < cW.length; i++)
    {
        cW[i]._style_display_w_ = cW[i].style.display;
        cW[i].style.display = 'none';
        stateBlocks(blocks,cW[i]);
        var w = cW[i].getAttribute('calc_width');
        cW[i].parentNode.insertBefore(div,cW[i].parentNode.firstChild);
        var parent = div.offsetWidth;
        if (w!='')
            cW[i].style.width = Math.abs(eval(w.replace(/#(.+?)#/gi,'getS("$1","w")')))+'px';
        stateBlocks(blocks);
    }

    for(var i = 0; i < cW.length; i++)
        cW[i].style.display = cW[i]._style_display_w_?cW[i]._style_display_w_:'';
    for(var i = 0; i < cH.length; i++)
        cH[i].style.display = cH[i]._style_display_h_?cH[i]._style_display_h_:'';

    for (var scRi = 0, scR_len = scrollsArr.length; scRi < scR_len; scRi++)
    {
        if (scrollsArr[scRi].top > 0) {
            scrollsArr[scRi].dom.scrollTop = scrollsArr[scRi].top;
        }
        if (scrollsArr[scRi].left > 0) {
            scrollsArr[scRi].dom.scrollLeft = scrollsArr[scRi].left;
        }
    }
    scrollsArr = null;
    if (div.parentNode)
        div.parentNode.removeChild(div);

}

/**
 * Дополняем строку до нужной длины слева
 * @param nr - исходная строка
 * @param n - итоговая длина
 * @param str - чем дополнять (по умолчанию '0')
 * @returns {string}
 */
D3Api.padLeft = function (nr, n, str){
    if ((nr = nr + "").length < n )
        return new Array(++n - nr.length).join(str||'0') + nr;
    else
        return nr;
}

/**
 * Преобразует количество часов в строку со временем в формате ЧЧ:ММ
 * @param interval float - количество часов, например 1.5 = 1ч. 30 мин
 * @param withSeconds boolean - нужно ли отображать секунды
 * @returns {string}
 */
D3Api.hours2time = function (interval, withSeconds) {
    var hours = Math.floor(interval);
    var minuts =  withSeconds ? Math.floor((interval % 1)* 60+0.0001) : Math.round((interval % 1)*60);
    var seconds = withSeconds ? Math.round(((interval % 1) - minuts/60) * 3600) : null;
    var time = (hours ? (D3Api.padLeft(hours,2)) : '00') + (minuts ? (':' +D3Api.padLeft(minuts,2) ) : ':00');

    if (withSeconds){
        time += (seconds ? (':' +D3Api.padLeft(seconds,2) ) : ':00');
    }
    return time;
}

D3Api.parseDate = function ( format, timestamp )
{
	var a, jsdate = (timestamp === undefined)?(new Date()):(new Date(timestamp * 1000));
	var txt_weekdays = ["Sunday","Monday","Tuesday","Wednesday",
		"Thursday","Friday","Saturday"];
	var txt_ordin = {1:"st",2:"nd",3:"rd",21:"st",22:"nd",23:"rd",31:"st"};
	var txt_months =  ["", "January", "February", "March", "April",
		"May", "June", "July", "August", "September", "October", "November",
		"December"];

	var f = {
		// Day
			d: function(){
				return D3Api.padLeft(f.j(), 2);
			},
			D: function(){
				var t = f.l(); return t.substr(0,3);
			},
			j: function(){
				return jsdate.getDate();
			},
			l: function(){
				return txt_weekdays[f.w()];
			},
			N: function(){
				return f.w() + 1;
			},
			S: function(){
				return txt_ordin[f.j()] ? txt_ordin[f.j()] : 'th';
			},
			w: function(){
				return jsdate.getDay();
			},
			z: function(){
				return (jsdate - new Date(jsdate.getFullYear() + "/1/1")) / 864e5 >> 0;
			},

		// Week
			W: function(){
				var a = f.z(), b = 364 + f.L() - a;
				var nd2, nd = (new Date(jsdate.getFullYear() + "/1/1").getDay() || 7) - 1;

				if(b <= 2 && ((jsdate.getDay() || 7) - 1) <= 2 - b){
					return 1;
				} else{

					if(a <= 2 && nd >= 4 && a >= (6 - nd)){
						nd2 = new Date(jsdate.getFullYear() - 1 + "/12/31");
						return date("W", Math.round(nd2.getTime()/1000));
					} else{
						return (1 + (nd <= 3 ? ((a + nd) / 7) : (a - (7 - nd)) / 7) >> 0);
					}
				}
			},

		// Month
			F: function(){
				return txt_months[f.n()];
			},
			m: function(){
				return D3Api.padLeft(f.n(), 2);
			},
			M: function(){
				var t = f.F(); return t.substr(0,3);
			},
			n: function(){
				return jsdate.getMonth() + 1;
			},
			t: function(){
				var n;
				if( (n = jsdate.getMonth() + 1) == 2 ){
					return 28 + f.L();
				} else{
					if( n & 1 && n < 8 || !(n & 1) && n > 7 ){
						return 31;
					} else{
						return 30;
					}
				}
			},

		// Year
			L: function(){
				var y = f.Y();
				return (!(y & 3) && (y % 1e2 || !(y % 4e2))) ? 1 : 0;
			},
			//o not supported yet
			Y: function(){
				return jsdate.getFullYear();
			},
			y: function(){
				return (jsdate.getFullYear() + "").slice(2);
			},

		// Time
			a: function(){
				return jsdate.getHours() > 11 ? "pm" : "am";
			},
			A: function(){
				return f.a().toUpperCase();
			},
			B: function(){
				// peter paul koch:
				var off = (jsdate.getTimezoneOffset() + 60)*60;
				var theSeconds = (jsdate.getHours() * 3600) +
								 (jsdate.getMinutes() * 60) +
								  jsdate.getSeconds() + off;
				var beat = Math.floor(theSeconds/86.4);
				if (beat > 1000) beat -= 1000;
				if (beat < 0) beat += 1000;
				if ((String(beat)).length == 1) beat = "00"+beat;
				if ((String(beat)).length == 2) beat = "0"+beat;
				return beat;
			},
			g: function(){
				return jsdate.getHours() % 12 || 12;
			},
			G: function(){
				return jsdate.getHours();
			},
			h: function(){
				return D3Api.padLeft(f.g(), 2);
			},
			H: function(){
				return D3Api.padLeft(jsdate.getHours(), 2);
			},
			i: function(){
				return D3Api.padLeft(jsdate.getMinutes(), 2);
			},
			s: function(){
				return D3Api.padLeft(jsdate.getSeconds(), 2);
			},
			//u not supported yet

		// Timezone
			//e not supported yet
			//I not supported yet
			O: function(){
			   var t = D3Api.padLeft(Math.abs(jsdate.getTimezoneOffset()/60*100), 4);
			   if (jsdate.getTimezoneOffset() > 0) t = "-" + t; else t = "+" + t;
			   return t;
			},
			P: function(){
				var O = f.O();
				return (O.substr(0, 3) + ":" + O.substr(3, 2));
			},
			//T not supported yet
			//Z not supported yet

		// Full Date/Time
			c: function(){
				return f.Y() + "-" + f.m() + "-" + f.d() + "T" + f.h() + ":" + f.i() + ":" + f.s() + f.P();
			},
			//r not supported yet
			U: function(){
				return Math.round(jsdate.getTime()/1000);
			}
	};

	return format.replace(/[\\]?([a-zA-Z])/g, function(t, s){
                var ret;
		if( t!=s ){
			// escaped
			ret = s;
		} else if( f[s] ){
			// a date function exists
			ret = f[s]();
		} else{
			// nothing special
			ret = s;
		}

		return ret;
	});
}
D3Api.dateToNum = function(_timestamp/*дата dd.mm.yyyy hh24:mi:ss можно без времени или только без секунд */, _format/*количество дней: d - с точностью до дня, h - до часа, m - до минуты, s - до секунды, ms - до миллисекунды*/){
    if(_timestamp === 'systemdate'){
         var _d = new Date();
        switch (_format){
            case 'd': _d.setHours(0,0,0,0);
                break;
            case 'h': _d.setMinutes(0,0,0);
                break;
            case 'm': _d.setSeconds(0,0);
                break;
            case 's': _d.setMilliseconds(0);
                break;
        }
    }else if(_timestamp){
       var _a = _timestamp.match(/^(\d{2})\.(\d{2})\.(\d{4})(?:\s(\d{2})(?::(\d{2})(?::(\d{2})(?::(\d{3}))?)?)?)?/);
        var _h = ['h','m','s','ms'],
            _m = ['m','s','ms'],
            _s = ['s','ms'];
        var _d = new Date(_a[3], _a[2] - 1, _a[1], (_h.indexOf(_format)+1)?_a[4]:0, (_m.indexOf(_format) + 1)?_a[5]:0, (_s.indexOf(_format) + 1)?_a[6]:0, (_format == 'ms')?_a[7]:0);
    } else{
        return 0;
    }

    return _d.getTime()/(1000*24*60*60);
}
D3Api.downloadFile = function(id,filename,deleteFile,fileType,fileView,returnPath)
{
    var file = D3Api.getOption('path','')+'request.php?type=file&file='+id+'&filename='+filename+((deleteFile)?'&delete=1':'')+((fileType)?'&filetype='+fileType:'')+((fileView)?'&fileview=1':'');
    if(returnPath)
        return file;
    window.open(file);
}

D3Api.setCookie = function(name, value, expires, path, domain, secure) {
	if (!name) return false;
	var str = name + '=' + encodeURIComponent(value);

	if (expires) str += '; expires=' + expires.toGMTString();
	if (path)    str += '; path=' + path;
	if (domain)  str += '; domain=' + domain;
	if (secure)  str += '; secure';

	document.cookie = str;
	return true;
}

D3Api.getCookie = function getCookie(name) {
	var pattern = "(?:; )?" + name + "=([^;]*);?";
	var regexp  = new RegExp(pattern);

	if (regexp.test(document.cookie))
	return decodeURIComponent(RegExp["$1"]);

	return false;
}

D3Api.deleteCookie = function deleteCookie(name, path, domain) {
	D3Api.setCookie(name, null, new Date(0), path, domain);
	return true;
}
D3Api.reloadLocation = function()
{
    document.location.reload();
}
D3Api.xPathEvaluate = function(xpathExpression, contextNode, ResultType, isReturnArray)
{
    contextNode = contextNode || document.body;
    ResultType = ResultType || 'node';
    isReturnArray = (isReturnArray === undefined)?true:isReturnArray;
    switch(ResultType)
    {
        case 'attribute':
        case 'node':
                ResultType = XPathResult.ORDERED_NODE_SNAPSHOT_TYPE;
            break;
        case 'number':
                isReturnArray = false;
                ResultType = XPathResult.NUMBER_TYPE;
            break;
        case 'string':
                isReturnArray = false;
                ResultType = XPathResult.STRING_TYPE;
            break;
        case 'boolean':
                isReturnArray = false;
                ResultType = XPathResult.BOOLEAN_TYPE;
            break;
    }

    var iterator = document.evaluate(xpathExpression, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    if(!isReturnArray)
        return iterator;
    var res = [];
    for (var i = 0, c = iterator.snapshotLength; i < c; i++)
    {
        var item = iterator.snapshotItem(i);
        res.push(item);
    }
    return res;
}
D3Api.includeStaticJs = function(path,callback,cache)
{
    var theme = this.current_theme;
    cache = !this.isUndefined(cache)?cache:this.getOption('cache',false);
    path += '?ctype=text/javascript';
    if(!cache)
    {
        path += '&nocache='+(new Date()).getTime();
    }
    this.include_js('~Static/'+path,callback);
    this.current_theme = theme;
}
D3Api.includeStaticCss = function(path,cache)
{
    var theme = this.current_theme;
    cache = !this.isUndefined(cache)?cache:this.getOption('cache',false);
    path += '?ctype=text/css';
    if(!cache)
    {
        path += '&nocache='+(new Date()).getTime();
    }
    this.include_css('~Static/'+path);
    this.current_theme = theme;
}
D3Api.confirm = function(text,okCallback,cancelCallback,thisObject)
{
    if(confirm(text))
    {
        okCallback && okCallback.call(thisObject);
    }else
        cancelCallback && cancelCallback.call(thisObject);
}
D3Api.extends = function(obj,funcName,funcPrefix,funcPostfix)
{

    if(!(obj[funcName] instanceof Function))
        return;
    var funcBase = obj[funcName];
    obj[funcName] = function()
    {
        var args = Array.prototype.slice.call(arguments);
        args.push(arguments);
        funcPrefix && funcPrefix.apply(this,args);
        funcBase.apply(this,arguments);
        funcPostfix && funcPostfix.apply(this,arguments);
    }
}

/**
 * Разыменование записи раздела функцией core.f_unitlist8show_info
 * @param dom
 * @param unit - раздел системы
 * @param primary - ID либо 'ID;ID;ID'
 * @param onSuccess
 */
D3Api.unitShowInfo = function(dom, unit, primary, onSuccess)
{
    D3Api.requestServer({
        url: 'request.php',
        method: 'POST',
        urlData:{ type: 'module', code: 'UnitData/showinfo', unitcode:unit, id: primary },
        contextObj:dom,
        onSuccess: function(resp) {
            r = JSON.parse(resp);
            if (typeof onSuccess === 'function') onSuccess.call(dom, r);
        }
    });
}

/**
 * Изменение DOM-дерева через определенное время
 * @param elapsedMilliseconds миллисекунды
 */
D3Api.requestAnimation = function(elapsedMilliseconds) {
    return new Promise(function(resolve, reject) {
        try {
            var start;
            requestAnimationFrame(function animation(timestamp) {
                if (start === undefined) {
                    start = timestamp;
                }
                const elapsed = timestamp - start;
                if (elapsed < elapsedMilliseconds) {
                    requestAnimationFrame(animation);
                } else {
                    resolve();
                }
            });
        } catch (err) {
            reject(err);
        }
    });
}
