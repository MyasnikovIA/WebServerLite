//Глобальные вспомогательные функции
 /**
       loadScript("/engine/classes/js/jquery.pickmeup.min.js").then(function(){
           console.log("js ready");
       },function(error){
           console.log(error);
       })

       loadCSS("/engine/classes/css/pickmeup.min.css").then(function(){
           console.log("css ready");
       },function(error){
           console.log(error);
       })
 */

    window.loadScript = function(src,_timeout) {
           return new Promise(function(resolve, reject){
               if(!src){
                   reject(new TypeError("filename is missing"));
                   return;
               }

               var script=document.createElement("script"),
                   timer,
                   head=document.getElementsByTagName("head")[0];


               head.appendChild(script);

               function leanup(){
                   clearTimeout(timer);
                   timer=null;
                   script.onerror=script.onreadystatechange=script.onload=null;
               }

               function onload(){
                   leanup();
                   if(!script.onreadystatechange||(script.readyState&&script.readyState=="complete")){
                       resolve(script);
                   }
               }

               script.onerror=function(error){
                   leanup();
                   head.removeChild(script);
                   script=null;
                   reject(new Error("network"));
               };

               if (script.onreadystatechange === undefined) {
                   script.onload = onload;
               } else {
                   script.onreadystatechange = onload;
               }

               timer=setTimeout(script.onerror,_timeout||30000);
               script.setAttribute("type", "text/javascript");
               script.setAttribute("src", src);
           });
       }
      function loadCSS (src, _timeout) {
           var css = document.createElement('link'), c = 1000;
           document.getElementsByTagName('head')[0].appendChild(css);
           css.setAttribute("rel", "stylesheet");
           css.setAttribute("type", "text/css");


           return new Promise(function(resolve, reject){
               var c=(_timeout||10)*100;
               if(src) {
                   css.onerror = function (error) {
                       if(timer)clearInterval(timer);
                       timer = null;

                       reject(new Error("network"));
                   };

                   var sheet, cssRules, timer;
                   if ('sheet' in css) {
                       sheet = 'sheet';
                       cssRules = 'cssRules';
                   }
                   else {
                       sheet = 'styleSheet';
                       cssRules = 'rules';
                   }
                   timer = setInterval(function(){
                       try {
                           if (css[sheet] && css[sheet][cssRules].length) {
                               clearInterval(timer);
                               timer = null;
                               resolve(css);
                               return;
                           }
                       }catch(e){}

                       if(c--<0){
                           clearInterval(timer);
                           timer = null;
                           reject(new Error("timeout"));
                       }
                   }, 10);

                   css.setAttribute("href", src);
               }else{
                   reject(new TypeError("filename is missing"));
               }
           });
       }

function ClassGlobalClientData(){
    this.storage = {};
    if (window['localStorage'])
    {
        this.storage = window.localStorage;
    }else if (window['globalStorage'])
    {
        this.storage = window.globalStorage[document.domain];
    }

    this.get = function(name){
        return String(this.storage[name]);
    };
    this.set = function(name,value){
        this.storage[name] = value;
    }
}
var globalClientData = new ClassGlobalClientData();

if (!("console" in window) || !("log" in console))
{
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0; i < names.length; ++i)
        window.console[names[i]] = function() {}
}
if(!Array.indexOf){
    Array.indexOf=function(inArray,value,offset){
        for(var i=(offset||0),j=inArray.length;i<j;i++){
            if(inArray[i]==value){return i;}
        }
        return -1;
    }
}
function getStyle(oElm, strCssRule){
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

function indexOf(_name){
    for(var index=0;index<this.length;index++){
        if(this[index]==_name)return index;
    }
    return -1;
}
function onEnter(_callBackMethod,_callBackObject,_value){
    var evt=arguments.callee.caller.arguments[0]||window.event;
    if(evt.keyCode==13)(new DEvent(_callBackMethod,_callBackObject)).call(evt,_value);
}
function onEscape(_callBackMethod,_callBackObject,_value){
    var evt=arguments.callee.caller.arguments[0]||window.event;
    if(evt.keyCode==27)(new DEvent(_callBackMethod,_callBackObject)).call(evt,_value);
}
function GetConteiner(_domObject, _cmptype)
{
    if (hasProperty(_domObject, 'cmptype'))
    if (_domObject.attributes['cmptype'].value == _cmptype)
        return _domObject;

        return  GetConteiner(_domObject.parentNode, _cmptype);
}
function GetArrayToStringWithSlashes(_array,_slash)
{
    showError('РџРѕРїСЂР°РІРёР» Р±Р°Рі[edit by snifer] - С„СѓРЅРєС†РёСЏ GetArrayToStringWithSlashes РЅРµ РЅСѓР¶РЅР°!!! - РѕРЅР° Р±СѓРґРµС‚ СѓРґР°Р»РµРЅР° !!! РІРјРµСЃС‚Рѕ РЅРµРµ РЅСѓР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ СЃРёС€РЅС‹Р№ РѕР±СЂР°Р±РѕС‚С‡РёРє Р° РёРјРµРЅРЅРѕ[String=array.join(<separator>);]!');
    return _array.join(_slash);
}
function strParsToArr(_str, _separator)/*РёР· СЃС‚СЂРѕРєРё СЃ СЂР°Р·РґРµР»РёС‚РµР»СЏРјРё _separator С„РѕСЂРјРёСЂСѓРµС‚ РјР°СЃСЃРёРІ РќР°РїСЂРёРјРµСЂ СЃС‚СЂРѕРєР°= "РѕРґРёРЅ;РґРІР°;С‚СЂРё;" СЃС„РѕСЂРјРёСЂСѓРµС‚ РјР°СЃСЃСЃРёРІ array(1=>'РѕРґРёРЅ', 2=>'РґРІР°', 3=>'С‚СЂРё')*/
{
    //showError('(Edit by snifer)this is not correct use documentation for javascript(function is strParsToArr) this action run by this primer[String.split(separator)] this function must be deleted!!!');
    return _str.split(_separator);
}

function GetEnabled(_dom)
{
    var _check = getProperty(_dom, 'enabled', 'true');
    if (_check=='true') return true;
    return false;
}

function GetLinesCount(_Text)
{
    var l_Arr = _Text.split(String.fromCharCode(10));
    return l_Arr.length + 1;
}

//С„СѓРЅРєС†РёСЏ СѓСЃС‚Р°РЅРѕРІРєРё РІС‹СЃРѕС‚С‹ С‚РµРєСЃС‚РѕРІРѕР№ РѕР±Р»Р°СЃС‚Рё РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ РІС‹СЃРѕС‚С‹ СЃРѕРґРµСЂР¶РёРјРѕРіРѕ.
function GetLinesTextArea(textarea)
{
    if (textarea.nodeName == "TABLE")
    {
        var ta = getChildTag(textarea,'textarea',0);
        var dif = ta.scrollHeight - ta.clientHeight;
        if (isNaN(parseInt(textarea.style.height))){
            textarea.style.height = ta.scrollHeight + 6 + "px";
        }else{
            textarea.style.height = parseInt(ta.style.height) + dif + 6 + "px";
        }
    }else
    {
        var dif = textarea.scrollHeight - textarea.clientHeight;
        if (isNaN(parseInt(textarea.style.height))){
            textarea.style.height = textarea.scrollHeight + 6 + "px";
        }else{
            textarea.style.height = parseInt(textarea.style.height) + dif + 6 + "px";
        }
    }
}


//---------Absolute Size and MouseCoord------------------------------------

function GetPageWindowSize(parent)
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

function getAbsoluteSize(element){
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
function getAbsoluteRect(element,scrollNeed){
        if(!element) return;
        var pos=getAbsolutePos(element);
        var size=getAbsoluteSize(element);
        if (scrollNeed)
        {
            pos.x -= getBodyScrollLeft();
            pos.y -= getBodyScrollTop();
        }
        return {x:pos.x, y:pos.y, width:size.width, height:size.height};
}
function getAbsoluteClientRect(elem,xScroll,yScroll) {
    var rect = elem.getBoundingClientRect();

    var scrollTop = getBodyScrollTop();
    var scrollLeft = getBodyScrollLeft()

    var coordy  = rect.top + ((yScroll === false)?0:scrollTop);
    var coordx = rect.left + ((xScroll === false)?0:scrollLeft);

    return {y: Math.round(coordy), x: Math.round(coordx), width: rect.width,height: rect.height};
}
function getBodyScrollTop()
{
  return self.pageYOffset || (document.documentElement && document.documentElement.scrollTop) || (document.body && document.body.scrollTop);
}

function getBodyScrollLeft()
{
  return self.pageXOffset || (document.documentElement && document.documentElement.scrollLeft) || (document.body && document.body.scrollLeft);
}
function getPageEventCoords(evt,fixed)
{
    var coords = {left:0, top:0};
        if(fixed && evt.clientX)
        {
            coords.left = evt.clientX;
            coords.top  = evt.clientY;
        }else if(evt.pageX)
    {
        coords.left = evt.pageX;
        coords.top = evt.pageY;
                if(fixed)
                {
                    coords.left -= getBodyScrollLeft();
                    coords.left -= getBodyScrollTop();
                }
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

function hasstr_dataset(_value)
{
    return /\w_dataset$/.test(_value);
}

//----РЅРµ РїСѓСЃС‚РѕРµ Р·РЅР°С‡РµРЅРёРµ--------------

 function blank(_value)
 {
     return /^\s*$/.test(_value);
 }

 function empty(_value)
 {
     if(_value==null || _value=='null' || blank(_value) || _value=="" || _value=='undefined' || _value==undefined || _value=='NaN')return true;
     return false;
 }

 function toUpperFirstCase(_str)
 {
    if(empty(_str)) return '';
    var first = _str.substr(0,1);
    var last = _str.substring(1,_str.length);
    return first.toUpperCase() + last.toLowerCase();
 }
  function toUpperCase(_Name)
 {
    var _dom = getControlByName(_Name);
    var val = getControlValue(_dom);
    setControlValue(_dom,val.toUpperCase());
 }
 //----СЃСЂР°РІРЅРµРЅРёРµ 2С… РґР°С‚, РµСЃР»Рё РїРµСЂРІР°СЏ РјРµРЅСЊС€Рµ РїСЂРµРІРµРґСѓС‰РµР№ Рё РѕРЅРё РЅРµ СЂР°РІРЅС‹ РІРѕР·РІСЂР°С‰Р°РµС‚ true (!СЂР°Р±РѕС‚Р°РµС‚ РµСЃР»Рё РЅР° С„РѕСЂРјРµ РµСЃС‚СЊ РєРѕРјРїР°РЅРµРЅС‚ РєР°Р»РµРЅРґР°СЂСЊ)
 // Р·Р°РјРµС‡Р°РЅРёРµ: РѕР±Р° РєРѕРЅС‚СЂРѕР»Р° Рґ.Р±. РґРѕСЃС‚СѓРїРЅС‹ РґР»СЏ РёР·РјРµРЅРµРЅРёСЏ
 function getDateCompare(_str_date1,_str_date2)
 {
    var _str_date1 = new Date(Date.parseDate(_str_date1,'%d.%m.%Y')).getTime();
    var _str_date2 = new Date(Date.parseDate(_str_date2,'%d.%m.%Y')).getTime();
    if(_str_date1 > _str_date2) return false;
    else return true;
 }

 function CheckDatesBeginEnd(_DateB_ctrlname,_DateE_ctrlname)
 {
        base().ChangeBeginDate = function(_DomElement,_ControlName,_PropName,_PropValue)
        {
            if(_PropName != 'value') return;
            var endDate = getValue(_DateE_ctrlname);
            if(!empty(_PropValue) && !empty(endDate))
            {
                if(getDateCompare(_PropValue,endDate)==false)
                {
                    setControlProperty(_DateB_ctrlname,'value','');
                    alert('Р”Р°С‚Р° РЅР°С‡Р°Р»Р° РїРµСЂРёРѕРґР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РјРµРЅСЊС€Рµ, С‡РµРј РґР°С‚Р° РєРѕРЅС†Р° РїРµСЂРёРѕРґР°');
                }
            }
        }

        getPage(0).addListener('onchangeproperty'+_DateB_ctrlname,base().ChangeBeginDate,false,false);

        base().ChangeBeginDate_1 = function ()
        {
            if (getControlProperty(_DateE_ctrlname, 'enabled') == false && getControlProperty(_DateB_ctrlname, 'enabled') == false) return;
            var beginDate = getValue(_DateB_ctrlname);
            var endDate = getValue(_DateE_ctrlname);
            if(!empty(beginDate) && !empty(endDate))
            {
                if(getDateCompare(beginDate,endDate)==false)
                {
                    setControlProperty(_DateB_ctrlname,'value','');
                    alert('Р”Р°С‚Р° РЅР°С‡Р°Р»Р° РїРµСЂРёРѕРґР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РјРµРЅСЊС€Рµ, С‡РµРј РґР°С‚Р° РєРѕРЅС†Р° РїРµСЂРёРѕРґР°');
                }
            }
        }
        addEvent(getControlByName(_DateB_ctrlname).firstChild,'blur',base().ChangeBeginDate_1);


        base().ChangeEndDate = function(_DomElement,_ControlName,_PropName,_PropValue)
        {
            if(_PropName != 'value') return;
            var beginDate = getControlProperty(_DateB_ctrlname,'value');
            if(!empty(_PropValue) && !empty(beginDate))
            {
                if(getDateCompare(beginDate,_PropValue)==false)
                {
                    setControlProperty(_DateE_ctrlname,'value','');
                    alert('Р”Р°С‚Р° РєРѕРЅС†Р° РїРµСЂРёРѕРґР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ, С‡РµРј РґР°С‚Р° РЅР°С‡Р°Р»Р° РїРµСЂРёРѕРґР°');
                }
            }
        }
        getPage(0).addListener('onchangeproperty'+_DateE_ctrlname,base().ChangeEndDate,false,false);

        base().ChangeEndDate_1 = function ()
        {
            if (getControlProperty(_DateE_ctrlname, 'enabled') == false && getControlProperty(_DateB_ctrlname, 'enabled') == false) return;
            var beginDate = getValue(_DateB_ctrlname);
            var endDate = getValue(_DateE_ctrlname);
            if(!empty(beginDate) && !empty(endDate))
            {
                if(getDateCompare(beginDate,endDate)==false)
                {
                    setControlProperty(_DateE_ctrlname,'value','');
                    alert('Р”Р°С‚Р° РєРѕРЅС†Р° РїРµСЂРёРѕРґР° РґРѕР»Р¶РЅР° Р±С‹С‚СЊ Р±РѕР»СЊС€Рµ, С‡РµРј РґР°С‚Р° РЅР°С‡Р°Р»Р° РїРµСЂРёРѕРґР°');
                }
            }
        }
        addEvent(getControlByName(_DateE_ctrlname).firstChild,'blur',base().ChangeEndDate_1);
 }

/*Р”Р»СЏ РїСЂРµРѕР±СЂР°Р·РѕРІР°РЅРёРµ С‚РёРїРѕРІ С‡РёСЃРµР» РїРѕР»СѓС‡Р°РµРјС‹С… РёР· Р±Р°Р·С‹
РќР°РїСЂРёРјРµСЂ: РёР· Р±Р°Р·С‹ РїСЂРёС€Р»Рѕ С‡РёСЃР»Рѕ 9,89 РґР»СЏ JS - СЌС‚Рѕ С‚РµРєСЃС‚ РёР»Рё С‡РёСЃР»Рѕ 9
Р§С‚РѕР±С‹ РєРѕСЂСЂРµРєС‚РЅРѕ РµРіРѕ СЂР°Р·РѕР±СЂР°С‚СЊ Рё РїСЂРёРІРµСЃС‚Рё Рє Float
        parseToJSFloat('9,89'); РІРµСЂРЅРµС‚ 9.89
Рё РѕР±СЂР°С‚РЅРѕ     parseToOracleFloat(9.89); РІРµСЂРЅРµС‚ '9,89'
*/
function parseToJSFloat(Num){
    Num = String(Num);
    if(Num.indexOf(',')!=-1) Num=Num.replace(',','.');
    return Number(Num);
}
function parseToOracleFloat(Num){
    Num = String(Num);
    if(Num.indexOf('.')!=-1) Num=Num.replace('.',',');
    return Num;
}

function getFirstAndLastDaysOfMonth(_dateStr, _dateFormat)
{
    var currDate = null;

    if (typeof(_dateStr) == 'undefined')
    {
        currDate = new Date();
    }
    else
    {
        if (typeof(_dateFormat) == 'undefined') _dateFormat = '%d.%m.%Y';
        currDate = Date.parseDate(_dateStr, _dateFormat);
    }

    var month = currDate.getMonth() + 1;
    var year  = currDate.getYear() + 1900;

    var nextMonth = new Date(year, month, 1);
    var lastDayOfMonth = new Date(nextMonth - 1);

    if (month < 10) month = '0' + month;

    return { 'first': '01.' + month + '.' + year, 'last': lastDayOfMonth.getDate() + '.' + month + '.' + year};
}

function getPrevMonth(_dateStr, _dateFormat)
{
    var currDate = null;

    if (typeof(_dateStr) == 'undefined')
    {
        currDate = new Date();
    }
    else
    {
        if (typeof(_dateFormat) == 'undefined') _dateFormat = '%d.%m.%Y';
        currDate = Date.parseDate(_dateStr, _dateFormat);
    }

    var day = currDate.getDate();
    var result = new Date(currDate - day * 24 * 60 * 60 * 1000);

    var datesFirstLast = getFirstAndLastDaysOfMonth(result.getDate() + '.' + (result.getMonth() + 1) + '.' + (1900 + result.getYear()), '%d.%m.%Y');
    var lastDay = Number(datesFirstLast.last.split('.')[0]);
    if (day > lastDay ) day = lastDay ;

    var month = result.getMonth() + 1;
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    return day + '.' + month + '.' + (1900 + result.getYear());
}

function getNexMonth(_dateStr, _dateFormat)
{
    var currDate = null;

    if (typeof(_dateStr) == 'undefined')
    {
        currDate = new Date();
    }
    else
    {
        if (typeof(_dateFormat) == 'undefined') _dateFormat = '%d.%m.%Y';
        currDate = Date.parseDate(_dateStr, _dateFormat);
    }

    var day = currDate.getDate();
    var result = new Date(currDate.getYear() + 1900, currDate.getMonth() + 1, 1);

    var datesFirstLast = getFirstAndLastDaysOfMonth(result.getDate() + '.' + (result.getMonth() + 1) + '.' + (1900 + result.getYear()), '%d.%m.%Y');
    var lastDay = Number(datesFirstLast.last.split('.')[0]);
    if (day > lastDay ) day = lastDay ;

    var month = result.getMonth() + 1;
    if (month < 10) month = '0' + month;
    if (day < 10) day = '0' + day;

    return day + '.' + month + '.' + (1900 + result.getYear());
}
function getFullDays(_firstDate, _secondDate, _dateFormat)
{
    if (typeof(_dateFormat) == 'undefined') _dateFormat = '%d.%m.%Y';
    _firstDate = Date.parseDate(_firstDate, _dateFormat);
    _secondDate = Date.parseDate(_secondDate, _dateFormat);

    if(_firstDate < _secondDate)
        return Math.round(Math.abs((_firstDate.getTime() - _secondDate.getTime())/(24*60*60*1000)));

    return 0;
}
//parseToRussianFormat РІРѕР·РІСЂР°С‰Р°РµС‚ СЃС‚СЂРѕРєСѓ
function parseToRussianFormat(Number,fractNum) {
    var triadSeparator=' '; //СЂР°Р·РґРµР»РёС‚РµР»СЊ С‚С‹СЃСЏС‡РЅС‹С…
    var decSeparator=','; //СЂР°Р·РґРµР»РёС‚РµР»СЊ Р·Р°РїСЏС‚С‹С…
     if (typeof(fractNum)=='undefined') fractNum = 2;
    Number = Number.toFixed(fractNum);
    var num = parseInt(Number).toString();
    var numd = Number.toString();
    numd = numd.toString().substr(numd.indexOf('.')+1, fractNum);
    while (numd.length<fractNum)
    numd += '0';
    var regEx = /(-?\d+)(\d{3})/;
    while (regEx.test(num)) {num = num.replace(regEx,"$1"+triadSeparator+"$2");}
    if (numd)
    {num += decSeparator+numd;}
    return num;
}
function checkNumbToOracle(_CompName){
    if(!empty(getValue(_CompName)))
    {
        setValue(_CompName,parseToOracleFloat(getValue(_CompName)));
    }
}
//-------------------------------------
/**
* РћР±СЊРµРєС‚ С‡РµСЂРµР· РєРѕС‚РѕСЂС‹Р№ РјС‹ Рё Р±СѓРґРµРј СЂР°Р±РѕС‚Р°С‚СЊ СЃ С‚РµРєСЃС‚РѕРІС‹РјРё РїРѕР»СЏРјРё.
* РЎРѕРґРµСЂР¶РёС‚ РІСЃРµ РЅРµРѕР±С…РѕРґРёРјС‹Рµ РїРѕР»СЏ, Р»РµРіРєРѕ СЂР°СЃС€РёСЂСЏРµРј РїРѕ РІРєСѓСЃСѓ =)
* @argument  obj  HTMLElment  - С‚РµРєСЃС‚РѕРІРѕРµ РїРѕР»Рµ, СЃ РєС‚РѕСЂС‹Рј РїСЂРµРґСЃС‚РѕРёС‚ СЂР°Р±РѕС‚Р°С‚СЊ
*
* Author: Sardar <Sardar@vingrad.ru>
*/
function TextAreaSelectionHelper(obj) {
  var self = this;
  this.target=obj;
  this.target.carretHandler=this; //СЃСЃС‹Р»РєР° СЃР°РјРѕРіРѕ РЅР° СЃРµР±СЏ РґР»СЏ С‚РµРєСЃС‚РѕРІРѕРіРѕ РїРѕР»СЏ
  /**
  * РџРѕРјРЅРёРј, С‡С‚Рѕ СЃРѕР±С‹С‚РёСЏ РјРѕРіСѓС‚ Р±С‹С‚СЊ СѓР¶Рµ РѕРїСЂРµРґР»РµРµРЅРЅС‹, С‚РѕРіРґР° РЅСѓР¶РЅРѕ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ
  * РѕС‡РµСЂРµРґРё. РљРѕРЅРµС‡РЅРѕ, СЂРµР°Р»РёР·Р°С†РёСЏ РґР»СЏ РР• Рё РњРѕР·РёР»Р»С‹ РІ РєРѕСЂРЅРµ СЂР°Р·Р»РёС‡Р°СЋС‚СЃСЏ, РїРѕС‡РёС‚Р°С‚СЊ
  * Рё РґРѕСЃС‚Р°С‚СЊ РіРѕС‚РѕРІС‹Р№ РєРѕРґ РјРѕР¶РЅРѕ Р·РґРµСЃСЊ: http://forum.vingrad.ru/index.php?showtopic=32350
  */
  /*this.target.onchange=_textareaSaver;
  this.target.onclick=_textareaSaver;
  this.target.onkeyup=_textareaSaver;
  this.target.onfocus=_textareaSaver;
  if(!document.selection) this.target.onSelect=_textareaSaver; //РґР»СЏ РњРѕР·РёР»Р»С‹*/
  addEvent(this.target, 'change', _textareaSaver);
  addEvent(this.target, 'click', _textareaSaver);
  addEvent(this.target, 'keyup', _textareaSaver);
  addEvent(this.target, 'focus', _textareaSaver);
  if(!document.selection) addEvent(this.target, 'select', _textareaSaver); //РґР»СЏ РњРѕР·РёР»Р»С‹

  this.start=-1;
  this.end=-1;
  this.scroll=-1;
  this.iesel=null; //РґР»СЏ РР•

  if(obj.getAttribute('max_length'))
    setInputLimit(obj, obj.getAttribute('max_length'));
}
/**
* Р”РѕСЃС‚Р°С‚СЊ РѕС‚СЃРµР»РµРєС‚РёСЂРѕРІР°РЅРЅС‹Р№ С‚РµРєСЃС‚
*/
TextAreaSelectionHelper.prototype.getSelectedText=function() {
   return this.iesel? this.iesel.text: (this.start>=0&&this.end>this.start)? this.target.value.substring(this.start,this.end): "";
}
/**
* Р’СЃС‚Р°РІРёС‚СЊ РєРѕРґ РїРѕРґ РєСѓСЂСЃРѕСЂРѕРј. Р•СЃР»Рё С‚РµРєСЃС‚ РЅРµ РѕС‚СЃРµР»РµРєС‚РёСЂРѕРІР°РЅ(РЅРµ С„РѕРєСѓСЃР°) Рё
* РїРѕР·РёС†РёСЏ РЅРµ РІР·СЏС‚Р°, С‚Рѕ РІСЃС‚Р°РІРёС‚СЊ РІ РєРѕРЅРµС† С‚РµРєСЃС‚РѕРІРѕРіРѕ РїРѕР»СЏ.
*
* @argument text String - Р·Р°РјРµРЅРёС‚СЊ СЃРµР»РµРєС†РёСЋ РЅР° СЌС‚РѕС‚ С‚РµРєСЃС‚
* @argument secondtag String - РµСЃР»Рё Р·Р°РґР°РЅ, С‚Рѕ СЃРµР»РµРєС†РёСЏ РЅРµ Р·Р°РјРµРЅСЏРµС‚СЃСЏ, Р° РѕР±СЂР°РјР»СЏРµС‚СЃСЏ СЌС‚РёРјРё С‚РµРіР°РјРё
*/
TextAreaSelectionHelper.prototype.setSelectedText=function(text, secondtag) {
  if(this.iesel) {
    if(typeof(secondtag)=="string") {
   var l=this.iesel.text.length;
      this.iesel.text=text+this.iesel.text+secondtag;
   this.iesel.moveEnd("character", -secondtag.length);
    this.iesel.moveStart("character", -l);
    } else {
   this.iesel.text=text;
    }
    this.iesel.select();
  } else if(this.start>=0&&this.end>=this.start) {
     var left=this.target.value.substring(0,this.start);
     var right=this.target.value.substr(this.end);
  var scont=this.target.value.substring(this.start, this.end);
  if(typeof(secondtag)=="string") {
    this.target.value=left+text+scont+secondtag+right;
    this.end=this.target.selectionEnd=this.start+text.length+scont.length;
    this.start=this.target.selectionStart=this.start+text.length;
  } else {
       this.target.value=left+text+right;
    this.end=this.target.selectionEnd=this.start+text.length;
    this.start=this.target.selectionStart=this.start+text.length;
  }
  this.target.scrollTop=this.scroll;
  this.target.focus();
  } else {
    this.target.value+=text + ((typeof(secondtag)=="string")? secondtag: "");
    if(this.scroll>=0) this.target.scrollTop=this.scroll;
  }
}
/**
* РџСЂРёРІР°С‚РЅР°СЏ С„СѓРєРЅРєС†РёСЏ, Р·Р°РїРёСЃС‹РІР°СЋС‰Р°СЏ РїРѕР·РёС†РёСЋ РєСѓСЂСЃРѕСЂР°
*/
function _textareaSaver() {
  if(document.selection) {
    this.carretHandler.iesel = document.selection.createRange().duplicate();
  } else if(typeof(this.selectionStart)!="undefined") {
    this.carretHandler.start=this.selectionStart;
    this.carretHandler.end=this.selectionEnd;
    this.carretHandler.scroll=this.scrollTop;
  } else {this.carretHandler.start=this.carretHandler.end=-1;}
}
function _setHint(_domObject,_hint){
    _domObject.setAttribute('title',_hint,false);
}
function _getHint(_domObject){
    return getProperty(_domObject,'title','');
}
function _setFocus(_domObject){
    _domObject.querySelector('input,textarea').focus();
}
//Р¤СѓРЅРєС†РёСЏ РІС‹Р·РѕРІР° СЃС‚Р°РЅРґР°СЂС‚РЅРѕРіРѕ РґРµР№СЃС‚РІРёСЏ РЈРґР°Р»РµРЅРёСЏ Р·Р°РїРёСЃРё
/*
_componentName - РёРјСЏ РєРѕРјРїРѕРЅРµРЅС‚Р°
_actionName - РёРјСЏ РґРµР№СЃС‚РІРёСЏ
_datasetName - РёРјСЏ Р”Р°С‚Р°РЎРµС‚Р°
_varName - РёРјСЏ РїРµСЂРµРјРµРЅРЅРѕР№ РІ РєРѕС‚РѕСЂСѓСЋ СЃРѕС…СЂР°РЅСЏРµС‚СЃСЏ ID СѓРґР°Р»СЏРµРјРѕР№ Р·Р°РїРёСЃРё
*/
function standartDeleteAction(_componentName,_actionName,_datasetName,_varName){
    if(empty(_varName)) _varName = 'DEL_ID';
    var str='СЊ';
    setVar(_varName,getValue(_componentName));
    if (isExistsControlByName(_componentName+'_SelectList'))
    {
     if(!empty(getValue(_componentName+'_SelectList'))){
        setVar(_varName,getValue(_componentName+'_SelectList'));
        str = 'Рё';
     }
    }
    if (confirm('Р’С‹ РґРµР№СЃС‚РІРёС‚РµР»СЊРЅРѕ С…РѕС‚РёС‚Рµ СѓРґР°Р»РёС‚СЊ Р·Р°РїРёСЃ'+str+'?'))
    {
            executeAction(_actionName,
                    function(){
                        refreshDataSet(_datasetName);
                        if(isExistsControlByName(_componentName+'_SelectList'))
                        {
                            if(!empty(getValue(_componentName+'_SelectList')))
                                SelectList_uncheckItems(_componentName+'_SelectList');
                        }
                        setVar(_varName,null);
                    }
            );
    }
}

//РћС‡РёСЃС‚РёС‚СЊ Р·РЅР°С‡РµРЅРёРµ РєРѕРЅС‚СЂРѕР»Р°
function clearCTRL (_Name)
{
    setValue(_Name,null);
    setCaption(_Name,'');
}
function onShowTextAreaInVisit(_Dom,_ctrlName,_repeaterName){
        if(!hasProperty(getControlByName(_repeaterName),'clone')) return false;
    var repeater=getCloneObjectsByRepeaterName(_repeaterName, _ctrlName);
    for (var i = 0; i < repeater.length; i++)
    {
            var d=document.createElement('DIV');
            d.innerHTML=getControlValue(repeater[i]).replace(/\r\n|\r|\n/g,'<br/>');
            d.style.fontFamily = 'Tahoma';
            d.style.fontSize = repeater[i].style.fontSize;
            d.style.fontSizeAdjust= repeater[i].style.fontSizeAdjust;
            d.style.fontVariant= repeater[i].style.fontVariant;
            d.style.fontWeight= repeater[i].style.fontWeight;
            repeater[i].parentNode.insertBefore(d, repeater[i]);
            repeater[i].style.display='none';
    }
}
function replaceTextAreaToDiv(_Dom)
{
            var d=document.createElement('DIV');
            d.innerHTML=getControlValue(_Dom).replace(/\r\n|\r|\n/g,'<br/>');
            d.style.fontFamily = 'Tahoma';
            d.style.fontSize = _Dom.style.fontSize;
            d.style.fontSizeAdjust= _Dom.style.fontSizeAdjust;
            d.style.fontVariant= _Dom.style.fontVariant;
            d.style.fontWeight= _Dom.style.fontWeight;
            _Dom.parentNode.insertBefore(d, _Dom);
            _Dom.style.display='none';
}
function onShowBlockInVisit(_blockName,_labelName){
   if (getControlProperty(_labelName, 'caption') == 1 && !hasProperty(getControlByName(_blockName),'sample'))
   {
      getControlByName(_blockName).style.display='';
   }
}
function makeGridStripeForm(_domObject) //РёРјРёС‚Р°С†РёСЏ makeGridStripe РєРѕРјРїРѕРЅРµРЅС‚Р° Grid
{
  var tbodies = _domObject.getElementsByTagName("tbody");
  for (var h = 0; h < tbodies.length; h++) {
    var _tr = tbodies[h].getElementsByTagName("tr");
      if (!_tr) return;
      var _flag=1;
      for(var i=0; i<_tr.length; i++)
      {
         if(getProperty(_tr[i],'cmptype')=='GridRow' && _tr[i].style.display != 'none')
          {
               if(_tr[i].className!='activdata')_tr[i].className = ((_flag%2)==0 ? "data" : "even");
            _flag++;
          }
      }
  }
}
function removerChilds(obj)
{
    try {
        if(obj.childNodes) {
            while(obj.firstChild)
                obj.removeChild(obj.firstChild);
        }
    }catch(e){}
}

function returnGET() {
    var keyVal = (window.location.search.substr(1)).split('&');
    var resGet = {};
    var p= -1;
    for(var i=0; i < keyVal.length; i++)
    {
      p = keyVal[i].search('=');
      resGet[keyVal[i].substr(0,p).toLowerCase()] = keyVal[i].substr(p+1);
    }
    return resGet;
}

//Р”Р»СЏ СЂСѓС‡РЅРѕРіРѕ РІС‹Р·РѕРІР° СЃРѕР±С‹С‚РёСЏ РґРѕРј РѕР±СЉРµРєС‚Р°
function execDomEvent(dom,eventName)
{
    if (dom[eventName] && dom[eventName] instanceof Function)
    {
            dom[eventName].call(dom);
    }else if(dom.attributes[eventName] && dom.attributes[eventName].value)
        eval('(function(){'+dom.attributes[eventName].value+'}).call(dom)');
}
function getPageByDom(dom)
{
    var i=0;
    while(dom && dom.nodeName.toUpperCase() != 'HTML' && i < 100)
    {
        if('DForm' in dom && dom.DForm.page){
            return dom.DForm.page;
        }
        if(dom.jsParent && dom.jsParent.page){
            return dom.jsParent.page;
        }
        if(dom.clone && dom.clone.form && dom.clone.form.page){
            return dom.clone.form.page;
        }
        dom = dom.parentNode;
        i++;
    }
    var p = getPage();
    if (p)
        return p;
    showError('РћС€РёР±РєР°. РќРµ СѓРґР°Р»РѕСЃСЊ РѕРїСЂРµРґРµР»РёС‚СЊ С„РѕСЂРјСѓ.');
}
function getControlByCmptype(dom,cmptype,onlycmptype)
{
    var i=0;
    while(dom.nodeName.toUpperCase() != 'HTML' && i < 100)
    {
        if((dom.jsParent && quickGetProperty(dom,'cmptype') == cmptype)||(onlycmptype && getProperty(dom,'cmptype') == cmptype))
            return dom;
        dom = dom.parentNode;
        i++;
    }
    return false;
}
function getControlContainer(dom)
{
    var i=0;
    while(dom.nodeName.toUpperCase() != 'HTML' && i < 100)
    {
        if(hasProperty(dom,'cmptype'))
            return dom;
        dom = dom.parentNode;
        i++;
    }
    return false;
}
/**
 * РЎРІРѕР№СЃС‚РІРѕ
 * get - С„СѓРЅРєС†РёСЏ РїРѕР»СѓС‡РµРЅРёСЏ Р·РЅР°С‡РµРЅРёСЏ СЃРІРѕР№СЃС‚РІР°, РµСЃР»Рё null С‚Рѕ Р±РµСЂРµС‚СЃСЏ Р°С‚СЂРёР±СѓС‚
 * set - С„СѓРЅРєС†РёСЏ СѓСЃС‚Р°РЅРѕРІРєРё Р·РЅР°С‡РµРЅРёСЏ СЃРІРѕР№СЃС‚РІР°, РµСЃР»Рё null С‚Рѕ СѓСЃС‚Р°РЅР°РІР»РёРІР°РµС‚СЃСЏ Р°С‚СЂРёР±СѓС‚
 * type - С‚РёРї СЃРІРѕР№СЃС‚РІР°: property, event
 * value_type - С‚РёРї Р·РЅР°С‡РµРЅРёСЏ СЃРІРѕР№СЃС‚РІР°: string(РїРѕСѓРјРѕР»С‡Р°РЅРёСЋ),number,boolean,list
 * value_list - РјР°СЃСЃРёРІ Р·РЅР°С‡РµРЅРёР№, РµСЃР»Рё value_type: list
 * value_default - Р·РЅР°С‡РµРЅРёРµ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
 */
ControlBaseProperties = {
    width:{get: null, set: null},
    height:{get: null, set: null},
    value:{}
};

function getBaseProperties()
{
    function cloneObj(obj)
    {
     if(typeof obj !== 'object')
     {
           return obj;
     }
        var ncl = {};
        if (obj instanceof Array)ncl = new Array();
     var nv;
     for(var prName in obj)
     {
            if(obj.hasOwnProperty(prName))
            {
                nv = obj[prName];
                if(nv && typeof v === 'object') ncl[prName] = cloneObj(nv); else ncl[prName] = nv;
            }
    }
     return ncl;
    }

    return cloneObj(ControlBaseProperties);
}

function russianLetterToQWERTY(charCode) {
    var map = {
            "Р№": "q", "Р™": "Q",
            "С†": "w", "Р¦": "W",
            "Сѓ": "e", "РЈ": "E",
            "Рє": "r", "Рљ": "R",
            "Рµ": "t", "Р•": "T",
            "РЅ": "y", "Рќ": "Y",
            "Рі": "u", "Р“": "U",
            "С€": "i", "РЁ": "I",
            "С‰": "o", "Р©": "O",
            "Р·": "p", "Р—": "P",
            "С„": "a", "Р¤": "A",
            "С‹": "s", "Р«": "S",
            "РІ": "d", "Р’": "D",
            "Р°": "f", "Рђ": "F",
            "Рї": "g", "Рџ": "G",
            "СЂ": "h", "Р ": "H",
            "Рѕ": "j", "Рћ": "J",
            "Р»": "k", "Р›": "K",
            "Рґ": "l", "Р”": "L",
            "СЏ": "z", "РЇ": "Z",
            "С‡": "x", "Р§": "X",
            "СЃ": "c", "РЎ": "C",
            "Рј": "v", "Рњ": "V",
            "Рё": "b", "Р": "B",
            "С‚": "n", "Рў": "N",
            "СЊ": "m", "Р¬": "M"
        },
        letter = String.fromCharCode(charCode);
    return (letter in map) ? map[letter] : false;
}

function MKB10Input(input)
{
    if (input && input.value == undefined) {
        input = getChildTag(input, 'input', 0);
    }
    if (!input) {
        return;
    }
    function onkeyPress(e) {
        if (e.keyCode == 13) {
            return false;
        }
        var value = input.value,
            isDigit = e.charCode > 47 && e.charCode < 58,/*РІРІРµРґРµРЅРѕ С‡РёСЃР»Рѕ*/
            isEnglish = e.charCode > 96 && e.charCode < 123 || e.charCode > 64 && e.charCode < 91,/*РІРІРµРґРµРЅ Р°РЅРіР»РёР№СЃРєР°СЏ Р±СѓРєРІР°*/
            letter = String.fromCharCode(e.charCode).toUpperCase();

        if (e.keyCode != 0 && e.keyCode != e.charCode) {
            return true;
        }
        if (value.length > 6 || isDigit && !value || value.length && !isDigit) {
            if('D3Form' in e.target){
                D3Api.stopEvent(e,true);
            }else{
                stopEvent(e);
            }
            return false;
        }
        if (!isEnglish && !isDigit) {
            var convertedLetter = russianLetterToQWERTY(e.charCode);
            if (convertedLetter) {
                letter = convertedLetter.toUpperCase();
            }
        }
        if (letter) {
            if (value.length === 3) {
                input.value += '.';
            }
            if('D3Form' in e.target){
                if(!isDigit){
                    input.value += letter;
                    D3Api.stopEvent(e,true);
                }
            }else{
                input.value += letter;
                stopEvent(e);
            }
            return false;
        }
    }

    input.addEventListener('keypress', onkeyPress, true);
    setAttribute(input, 'mkb10_check', 'true');
}
function importTableGroupByCode(_code)
{
    openWindow({name:'ImpTables/do_import_tables',vars:{IMP_CODE:_code}},true);
}

function getTextContent(dom)
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
function mixinObjects(dst)
{
    for(var i = 1, c = arguments.length; i < c; i++)
    {
        if(!arguments[i]) continue;
        var obj = arguments[i];
        for(var key in obj)
        {
            dst[key] = obj[key];
        }
    }
    return dst;
}
function getDomBy(dom,selector)
{
    return dom.querySelector(selector);
}

var dateFormat = function () {
    var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    return function (date, mask, utc) {
        var dF = dateFormat;

        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var    _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

dateFormat.i18n = {
    dayNames: [
        "Р’СЃ", "РџРЅ", "Р’С‚", "РЎСЂ", "Р§С‚", "РџС‚", "РЎР±",
        "Р’РѕСЃРєСЂРµСЃРµРЅСЊРµ",
                "РџРѕРЅРµРґРµР»СЊРЅРёРє",
                "Р’С‚РѕСЂРЅРёРє",
                "РЎСЂРµРґР°",
                "Р§РµС‚РІРµСЂРі",
                "РџСЏС‚РЅРёС†Р°",
                "РЎСѓР±Р±РѕС‚Р°"
    ],
    monthNames: [
        "РЇРЅРІ",
                "Р¤РµРІ",
                "РњР°СЂ",
                "РђРїСЂ",
                "РњР°Р№",
                "РСЋРЅ",
                "РСЋР»",
                "РђРІРі",
                "РЎРµРЅ",
                "РћРєС‚",
                "РќРѕСЏ",
                "Р”РµРє",
        "РЇРЅРІР°СЂСЊ",
                "Р¤РµРІСЂР°Р»СЊ",
                "РњР°СЂС‚",
                "РђРїСЂРµР»СЊ",
                "РњР°Р№",
                "РСЋРЅСЊ",
                "РСЋР»СЊ",
                "РђРІРіСѓСЃС‚",
                "РЎРµРЅС‚СЏР±СЂСЊ",
                "РћРєС‚СЏР±СЂСЊ",
                "РќРѕСЏР±СЂСЊ",
                "Р”РµРєР°Р±СЂСЊ"
    ]
};

Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};

function showDomBlock(dom)
{
    dom.style.display = 'block';
}
function showedDom(dom)
{
    return dom.style.display != 'none';
}
function getEvent(e)
{
    return e || window.event;
}
function getEventCurrentTarget(e)
{
    var ev = getEvent(e);
    if (!ev)
        return null;
    return ev.currentTarget || ev.srcElement;
}
function setInputLimit(_domObject, _max_length)
{
    addEvent(_domObject, 'keypress', function(e){
        var el = getEventCurrentTarget(e),
            ev = getEvent(e);
        if (!el.value.substring(el.selectionStart, el.selectionEnd)
            && !(ev.which == 8 || ev.which == 0) && el.value.length + 1 > _max_length)
        {
            if(!ev.ctrlKey) stopEvent(ev);
            return false;
        }
    });
    addEvent(_domObject, 'input', function(e){
        var el = getEventCurrentTarget(e);
        el.value = el.value.substring(0, _max_length);
    });
}
function escapeXml(str)
{
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}
function unescapeXML(str)
{
    return str.replace(/&amp;/g, '&')
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .replace(/&quot;/g, '"')
              .replace(/&apos;/g, '\'');
}

var QueryString = function () {
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    var arr;
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = decodeURIComponent(pair[1]);
        } else if (typeof query_string[pair[0]] === "string") {
            arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
            query_string[pair[0]] = arr;
        } else {
            query_string[pair[0]].push(decodeURIComponent(pair[1]));
        }
    }
    return query_string;
}();

function openCodeEditor(DOM, params) {
    var ctrl = D3Api.getControlByDom(DOM),
        isD3 = !!ctrl.D3Form;
    openD3Form('System/code_editor', true, {
        vars: {
            VALUE: (isD3 ? D3Api.getValue(ctrl) : _getControlProperty(ctrl, 'value')),
            PARAMS: params
        },
        width: 800,
        height: 600,
        onclose: [function (mod) {
            if (mod && +mod.ModalResult) {
                isD3 ? D3Api.setValue(ctrl, mod['value']) : _setControlProperty(ctrl, 'value', mod['value']);
            }
        }]
    });
}

function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last,
        deferTimer;
    return function () {
        var context = scope || this;

        var now = +new Date,
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}