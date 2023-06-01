/**
 * Определение браузера.
 * @constructor
 */
D3BROWSERAPI = function () {
    var agt = navigator.userAgent.toLowerCase();
    this.name = '';
    this.suported = true;
    this.msie = (agt.indexOf("msie") != -1 && agt.indexOf("opera") == -1 && (this.name = 'msie')) ? true : false;
    this.opera = (agt.indexOf("opera") != -1 && (this.name = 'opera')) ? true : false;
    this.firefox = (agt.indexOf('firefox') != -1 && (this.name = 'firefox')) ? true : false;
    this.chrome = (agt.indexOf('chrome') != -1 && (this.name = 'chrome')) ? true : false;
    this.safari = (agt.indexOf('safari') != -1 && agt.indexOf('chrome') == -1 && (this.name = 'safari')) ? true : false;
    var ver = agt.match(this.name + '[\/ ](([0-9]+)[0-9\.]*)');
    var ver2 = agt.match('version\/(([0-9]+)[0-9\.]*)');

    if (ver && ver2)
        ver = (+ver[2] > +ver2[2]) ? ver : ver2;
    else
        ver = ver || ver2;

    this.versionMajor = ver ? +ver[2] : null;
    this.version = ver ? ver[1] : null;
}
/**
 * Эксемпляр класса D3BROWSERAPI
 * @type {Object}
 * @see {@link D3BROWSERAPI}
 */
D3BROWSER = new D3BROWSERAPI();
switch (true) {
    case D3BROWSER.msie && D3BROWSER.versionMajor < 8:
    case D3BROWSER.firefox && D3BROWSER.versionMajor < 13:
    case D3BROWSER.chrome && D3BROWSER.versionMajor < 15:
    case D3BROWSER.safari && D3BROWSER.versionMajor < 5:
    case D3BROWSER.opera && D3BROWSER.versionMajor < 11:
        D3BROWSER = false;
        break;
    default:
        break;
}
/**
 * Главные объект D3Api
 * @class
 * @type Object
 * @name D3Api
 * @this {D3Api}
 */
D3Api = new function () {
    var GLOBAL_VARS = {};
    var CONFIG = {};
    this.openFormByUnitModifiers = []; // массив функций модификаторов для метода openFormByUnit
    this.BROWSER = D3BROWSER;
    this.forms = {};
    this.threads = {};
    this.controlsApi = {};
    this.current_theme = '';
    this.GLOBAL_CONTEXT_FORM = null;
    this.platform = "windows";
    var uniq = 0;
    var SYSREQUEST = ''; // Не обновляет активность пользователя при обращении к серверу
    /**
     * @property {Function} Инициализация проекта
     * @returns void
     */
    this.init = function () {
        D3Api.MainDom = document.body;
        D3Api.D3MainContainer = D3Api.MainDom;
        D3Api.mixin(CONFIG, D3Api.SYS_CONFIG || {});
        D3Api.SYS_CONFIG = undefined;
        delete D3Api.SYS_CONFIG;
        D3Api.init = undefined;
        delete D3Api.init;
    }
    /**
     * преобразует значение в строку JSON
     * @param obj {Object}
     * @param unCyclic {boolean}
     * @param except {string}
     * @returns {string}
     */
    this.JSONstringify = function (obj, unCyclic, except) {
        if (D3Api.isUndefined(obj))
            return obj;
        var cyclObj = [];
        return JSON.stringify(obj, function (k, v) {
            if (except && String(k).match(except))
                return undefined;
            if (unCyclic && typeof(v) == 'object') {
                if (cyclObj.indexOf(v) > -1)
                    return undefined;
                cyclObj.push(v);
            }
            return (v === '') ? '' : v;
        });
        cyclObj = null;
    }
    /**
     * разбирает строку JSON
     * @param json {string}
     * @returns {Object}
     */
    this.JSONparse = function (json) {
        if (!json)
            return json;
        return JSON.parse(json);
    }
    /**
     * Генерация уникального значения.
     *
     * @example
     * var i = 1;
     * var b= 123;
     * var str = 'fvvgg';
     *
     * @param prefix {string} - префикс
     * @returns {string}

     */
    this.getUniqId = function (prefix) {
        if (uniq > 9999999) //fix
            uniq = 0;
        prefix = prefix || '';
        return prefix + (uniq++) + (new Date()).getTime();
    }

    /**
     * Полечение кэш формы
     * @param data {Object}
     * @returns {string}
     */
    function calcFormHash(data) {
        return data.Form + '.' + MD5.hex_md5(D3Api.JSONstringify(data));
    }

    /**
     * Установка переменной
     * @param name {string} - Имя переменной
     * @param value {string} - значение.
     */
    this.setVar = function (name, value) {
        GLOBAL_VARS[name] = value;
    }
    /**
     * Получение значений от имени переменной
     * @param name {string} - Имя переменной
     * @param defValue {string} - значение по умолчанию
     * @returns {string}
     */
    this.getVar = function (name, defValue) {
        return GLOBAL_VARS[name] || defValue;
    }
    /**
     * @property {Function} Получение значения в свойстве объекта
     * @param name {string} - имя свойства
     * @param obj {Object} - объект
     * @param defValue {string} - значение по умолчанию
     * @returns {string}
     */
    this.getValueInObj = function (name, obj, defValue) {
        var value = defValue;
        if (name.indexOf('.') > -1) { // для объекта
            var arr = name.split('.');
            if (obj && obj[arr[0]] && obj[arr[0]][arr[1]])
                value = obj[arr[0]][arr[1]];
        }
        else {
            if (obj && obj[name])
                value = obj[name];
        }
        return value;
    }
    /**
     *
     * @param name
     * @param defaultValue
     * @returns {*}
     */
    this.getOption = function (name, defaultValue) {
        if (CONFIG[name] === undefined)
            return defaultValue;
        return CONFIG[name];
    }
    function calcThreadHash(data) {
        return data.Form + '.' + MD5.hex_md5(D3Api.JSONstringify(data));
    }

    function getNewThread(name) {
        //Новая нить
        if (D3Api.threads[name])
            name = name + D3Api.getUniqId('.thread:');

        D3Api.threads[name] = new D3Api.D3ThreadForms(name);
        D3Api.threads[name].name = name;//нужно для вкладок
        return name;
    }

    /**
     * Находит компонент по всему документу
     * @param name {string} - Имя кмпонента
     * @returns {Object|boolean}
     */
    this.getControlInAllForms = function (name) {
        if (!name) {
            return false;
        }
        var ctrl = D3Api.getDomBy(document,'div [name="'+name+'"]');
        if (ctrl && ctrl.getAttribute('cmptype')) {
            return ctrl;
        } else {
            D3Api.debug_msg('Компонент не найден: ' + name);
            return false;
        }
    };

    /**
     * Копирование в буфер обмена.
     * @param data {String} - что скопировать.
     * @param notify_caption {string} - Заголовок сообщения
     * @param notify_text {string} - текст сообщения
     */
    this.buferCopy = function (data,notify_caption,notify_text) {
        if (data) {
            var clipboard = new Clipboard('body', {
                text: function () {
                    return String(data)
                }
            });
            clipboard.on('success', function(e) {
                e.clearSelection();
                clipboard.destroy();
            });

            clipboard.on('error', function(e) {
                clipboard.destroy();
            });
            if (notify_caption && notify_text) {
                D3Api.notify(notify_caption,notify_text,{'expires': 2000});
            }
        } else {
            D3Api.notify('Ошибка','Нет данных для копирования', {'expires': 2000});
        }
    };
    /**
     * закрытие модальной формы.
     */
    this.close_modal_form = function () {
        D3Api.confirm('Вы действительно хотите закрыть текущее окно?', function(){
            var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
            if(open_modal_cont && D3Api.showedDom(open_modal_cont) && open_modal_cont.childNodes.length > 1){
                if(open_modal_cont.childNodes[0].D3Form){
                    open_modal_cont.childNodes[0].D3Form.close();
                };
            }
        });
    };
    /**
     * открытие формы
     * @param name {string} - имя формы
     * @param dom {Object} - дом куда будет вставлена форма
     * @param data {Object} - параметры
     * @param contextForm {Object} - Контекст
     * @returns {string|D3Api.D3Form}
     */
    this.showForm = function (name, dom, data, contextForm) {
        var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
        /*если окно открывается в модальном режиме*/
        if((data && String(data.modal_form)=='true')){
            /*и контейнера для модалки нет, то создаем его*/
            if(!open_modal_cont){
                var open_modal       = document.createElement("div"),
                    close_open_modal = document.createElement("div");
                open_modal.id               = 'open_modal';
                open_modal.style.cssText    = 'position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; display: none;background: #f9f9f9aa;z-index: 3;';
                close_open_modal.className  = 'close_open_modal fa-times fas';
                open_modal.appendChild(close_open_modal);
                open_modal_cont = D3Api.MainDom.appendChild(open_modal);
                close_open_modal.onclick = function() {
                    D3Api.close_modal_form();
                };
                D3Api.showDomBlock(open_modal_cont);
            }else if(!D3Api.showedDom(open_modal_cont)){
                /*если есть контейнер для модалки, то просто показываем его*/
                D3Api.showDomBlock(open_modal_cont);
            }
        }
        /*если показано модальное окно - открываем окна только в модальном режиме*/
        if(open_modal_cont && D3Api.showedDom(open_modal_cont)){
            dom = (dom == D3Api.MainDom?(open_modal_cont):(dom || open_modal_cont));
        }else{
            dom = dom || D3Api.MainDom;
        }
        data = data || {};
        if (data.request)
            data.request.Form = name;
        else
            data.request = {Form: name};

        if(data.modal_form){
            data.request['modal'] = '1'
        }
        var hname = calcFormHash(data.request);

        data._contextForm_ = contextForm;
        data._currentContext_ = contextForm ? contextForm.currentContext : null;

        D3Api.Base.callEvent('onShowForm', name, dom, data, hname);

        if (!data.notthread) {
            //Новая нить принудительно
            if (data.newthread) {
                data.newthread = getNewThread(calcThreadHash(data.request));
            } else if (data.thread) //Форма начала потока
            {
                var tname = calcThreadHash(data.request);
                //Ищем среди нитей
                if (D3Api.threads[tname]) {
                    //Открываем нить
                    D3Api.threads[tname].activate();
                    return;
                } else
                    data.newthread = getNewThread(tname);
            }
        }
        var fobj = D3Api.forms[hname];
        if (fobj) {
            if (fobj.status == 'ready' && D3Api.getOption('formCache', true)) {
                var form = fobj.form;
                if (form instanceof D3Api.D3Form) {
                    if (fobj.form.isShowed)
                        form = new D3Api.D3Form(form.name, fobj.content);
                    form.show(data, dom);
                    return form;
                }
            } else
            {
                if(fobj.status != 'load')
                    fobj.status = null;
                D3Api.forms[hname].onReadyObj.push({formData: data, showDom: dom});
            }
        }else{
            D3Api.forms[hname] = {onReadyObj: [
                {formData: data, showDom: dom}
            ]};
        }
        D3Api.loadForm(data);
        return hname;
    }
    /**
     * Загрузка Формы по его имени
     * @param name {string} - Имя формы
     */
    this.loadFormByName = function (name) {
        this.loadForm({request: {Form: name}});
    }
    /**
     * Загрузка Формы
     * @param data {Object} - параметры
     * @returns {string}
     */
    this.loadForm = function openForm(data) {
        if (!data.request.Form) {
            D3Api.debug_msg('Не указано имя формы.');
            return;
        }
        var hname = calcFormHash(data.request);
        D3Api.forms[hname] = D3Api.forms[hname] || {onReadyObj: []};
        if (D3Api.forms[hname].status)
            return hname;
        else
            D3Api.forms[hname].status = 'load';

        D3Api.requestServer({
            url: 'getform.php',
            method: 'POST',
            urlData: data.request,
            onSuccess: parseForm,
            onError: function () {},
            contextObj: {name: data.request.Form, hash: hname, thread: data.newthread},
            responseXml: false
        });
        return hname;
    };
    /**
     * Функция парса формы можно вызвать локально D3Api.parseForm.call(dataForm,xml), где dataForm данные формы (name и тд.); xml - строка дом модели с одним корневым узлом.
     * @param xml {xmlHttp}
     * @param _peq {XMLHttpRequest}
     */
    function parseForm(xml,_peq) {
        if (this.name.indexOf('.') != -1) {
             var fragArr = this.name.split('.');
             // Модифицируем HTML в формат FRM
             // Выредзаем содержимое <body> и вставляем в блоки <div>
             // Необходимо написать полнноценный конвертор на  регулярных вырожениях
             if ((fragArr[fragArr.length-1]).toLowerCase() == 'html') {
                var sysinfo = xml.split("</html>")[1];
                var bodyText = "<div"+xml.split("<body")[1];
                bodyText = bodyText.split("</body>")[0]+"</div>"
                xml = bodyText+sysinfo;
             }
        }
        var formCache = "";
        if(_peq) {
           formCache = _peq.getResponseHeader('FormCache');
        }
        var fobj = D3Api.forms[this.hash];
        fobj.content = xml;
        fobj.status = 'ready';
        fobj.form = new D3Api.D3Form(this.name, xml);
        fobj.form.callEvent('onload');
        var form = fobj.form;
        for (var i = 0, c = fobj.onReadyObj.length; i < c; i++) {
            if (i > 0){
                form = new D3Api.D3Form(this.name, xml);
            }
            form.show(fobj.onReadyObj[i].formData, fobj.onReadyObj[i].showDom);
            form.formCache = formCache;
        }
        fobj.onReadyObj = [];
    };

    /**
     * Открытие формы по разделу
     * @param dom - DOM формы
     * @param unit string - раздел
     * @param primary int - ID записи раздела
     * @param params {} - параметры
     */
    this.openFormByUnit = function(dom, unit, primary, params){
        params = params || {};
        var form;
        var data  = {
            isView: params.isView ? params.isView : undefined
        };
        var vars = {
            IS_VIEW : params.isView ? params.isView : undefined
        };
        var request = {
            unit: unit,
            method: params.method || 'default'
        };

        if (params.composition){
            form = 'System/composition';
            request.composition = params.composition;
            request.show_buttons = params.isView ? false : true;
            data.id  = primary;
            vars.PRIMARY = primary;
            vars.LOCATE = primary ? primary : undefined;
        }
        else{
            form = 'UniversalEditForm/UniversalEditForm';
            data.id  = primary;
            data.isCopy = params.isCopy ? params.isCopy : undefined;
            vars.PRIMARY = primary;
            vars.SHOW_BUTTON_OK = params.isView ? 0 : 1;
        }
        vars.data = data;

        // прокидываем доп. переменные из params
        if (params.vars){
            for (var key in params.vars){
                if(!params.vars.hasOwnProperty(key)){
                    continue;
                }
                if (typeof(params.vars[key]) == "object"){
                    vars[key] = vars[key] || {};
                    for (var k in params.vars[key]){
                        if(params.vars[key].hasOwnProperty(k)){
                            vars[key][k] = params.vars[key][k];
                        }
                    }
                }
                else vars[key] = params.vars[key];
            }
        }
        if (params.request){
            for (var key in params.request){
                if(params.request.hasOwnProperty(key)){
                    request[key] = params.request[key];
                }
            }
        }

        // функции-модификаторы параметров. Расширяются через модули в файле MODULE/System/js/common.js
        if (D3Api.openFormByUnitModifiers.length > 0){
            D3Api.openFormByUnitModifiers.forEach(function (item){
                if (item instanceof Function) item.call(this, { unit:unit, primary:primary, params:params, vars:vars, request:request });
            })
        }

        dom.openForm(form, {
            request: request,
            vars: vars,
            thread:params.thread,
            newthread:params.newthread,
            oncreate:params.oncreate,
            onclose:params.onclose
        }, params.container)
    };

    /**
     * Показать отчет
     * @param name {string}
     * @param data {Object}
     */
    this.showReport = function (name, data) {
        data = data || {};
        data.vars = data.vars || {};
        data.vars._reportName = name;
        this.showForm('report', undefined, data);
    }
    /**
     * Установить слеующий запрос как системный
     */
    this.setSysRequest = function () {
        SYSREQUEST = '&SYSREQUEST=1';
    }
    /**
     * Паралельные Запроы к веб серверу
     * @param params {Object} - параметры запроса
     * @returns {XMLHttpRequest | any | null}
     */
    this.requestThreadServer = function (params){
        /*
         * Пробежимся по параметрам если нет навигации то установим для DataSet-ов
         */
       // var datasets = {};
        var infoThread = D3Api.MULTI_REQUEST;//информация об отправляемых запросах(потоках)
        if (!infoThread) {
            infoThread = {"MAX_THREAD": "10", "MAX_REQUEST": "10", "MAX_DATA_COUNT": "6000"};
        }
        if(!('ENABLED' in infoThread)){
            infoThread.ENABLED = false;
        }
        var isDataSetTheads = false;
        if(('data' in params) && ('request' in params.data) && infoThread.ENABLED == true){
            params.data.requestThread = true;
            var copyParams = D3Api.mixin({}, params);

            var onSuccess = null;
            if(('onSuccess' in copyParams) && typeof copyParams.onSuccess == 'function'){
                onSuccess = copyParams.onSuccess;
            }

            var onError = null;
            if(('onError' in copyParams) && typeof copyParams.onError == 'function'){
                onError = copyParams.onError;
            }

            var recCount = +infoThread.MAX_DATA_COUNT || 6000;

            copyParams.data.request = D3Api.JSONparse(copyParams.data.request);
            var request = copyParams.data.request;

            for(var _cmpname in request){
                if(request.hasOwnProperty(_cmpname) && (('type' in request[_cmpname]) && request[_cmpname]['type'] == "DataSet")){


                    if(!('params' in request[_cmpname])){
                        request[_cmpname]['params'] = {};
                    }
                    if(!('_ext_' in request[_cmpname]['params'])){
                        request[_cmpname]['params']['_ext_'] = {};
                    }
                    if(!('range' in request[_cmpname]['params']['_ext_'])){
                        isDataSetTheads = true;
                        request[_cmpname]['params']['_ext_']['range'] = {
                            amount: recCount,
                            count: true,
                            keyfield: 1,
                            page: 0
                        };
                    }

                }
            }


            if(isDataSetTheads == true){
                var _reqObj = null;
                var results = {}
                var currThread = 0;
                function requestDataSetsTreadServer(){

                    // Собираем данные


                    if(D3Api.Equals({},copyParams.data.request)){
                        /* все записи получили */

                        if(currThread > 0){
                            return
                        }
                        for(var cmpname in results){
                            if(results.hasOwnProperty(cmpname) && typeof results[cmpname] == 'object'){
                                var base = results[cmpname][0];
                                for(var i = 1 ; i < results[cmpname].length; i++){
                                    base.data = base.data.concat(results[cmpname][i].data);
                                }
                                results[cmpname] = base;
                            }
                        }
                        if(onSuccess != null){
                            onSuccess.call(params.contextObj, D3Api.JSONstringify(results), _reqObj);
                        }
                        return;
                    }else{
                        if (currThread >= +infoThread['MAX_THREAD']) {
                            return;
                        }


                        for(var dataset in copyParams.data.request){
                            if(copyParams.data.request.hasOwnProperty(dataset)){
                                var ext = copyParams.data.request[dataset].params['_ext_'];
                                ext.range.page += 1;
                                if(ext.range.page > ext.countpage){
                                    /* удаляем DataSet если все данные пришли */
                                    delete copyParams.data.request[dataset];
                                }
                            }
                        }
                        if(!D3Api.Equals({},copyParams.data.request)){
                            ++currThread;
                            requestMultiServer(function(_response,_reqObj){
                                --currThread;
                                var response = D3Api.JSONparse(_response);
                                for(var cmptype in response){
                                    if(typeof response[cmptype] != 'object'){
                                        continue;
                                    }
                                    if(!(cmptype in results)){
                                        results[cmptype] = [];
                                    }
                                    results[cmptype][response[cmptype].page] = response[cmptype];
                                }
                                requestDataSetsTreadServer();
                            },function(_response,_reqObj){
                                --currThread;
                                if(onError != null){
                                    onError.call(params.contextObj,_response, _reqObj);
                                }
                            })
                        }

                    }
                    requestDataSetsTreadServer();
                }
                function requestMultiServer(_callBack,_callErrBack){
                    copyParams.onSuccess = _callBack;
                    copyParams.onError = _callErrBack;
                    copyParams.data.request = D3Api.JSONstringify(copyParams.data.request);
                    D3Api.requestServer(copyParams);
                    copyParams.data.request = D3Api.JSONparse(copyParams.data.request);

                }
                _reqObj = requestMultiServer(function(_response,_reqObj){
                    try {
                        // собираем информацию об кол-ве записей
                        var response = D3Api.JSONparse(_response);
                        for(var cmptype in response){
                            if(response.hasOwnProperty(cmptype)){
                                if(typeof response[cmptype] != 'object'){
                                    continue;
                                }
                                if(!(cmptype in results)){
                                    results[cmptype] = [];
                                }
                                results[cmptype].push(response[cmptype]);
                                if(response[cmptype].type == 'DataSet'){
                                    copyParams.data.request[cmptype]['params']['_ext_'].rowcount = response[cmptype].rowcount;
                                    copyParams.data.request[cmptype]['params']['_ext_'].countpage = Math.ceil( copyParams.data.request[cmptype]['params']['_ext_'].rowcount / recCount) - 1;
                                }else{
                                    /* удаляем не датасеты */
                                    delete copyParams.data.request[cmptype];
                                }
                            }
                        }
                        requestDataSetsTreadServer();

                    } catch (e) {
                        D3Api.debug_msg('В ответе сервера: ' + e.message);
                        return;
                    }


                },function(_response,_obj){

                })
            }else{
                return D3Api.requestServer(params);
            }
        }else {
            return D3Api.requestServer(params);
        }


    }
    /**
     * Запрос к веб серверу
     * @param params {Object} - параметры запроса
     * @returns {XMLHttpRequest | any | null}
     */
    this.requestServer = function (params) {
        var default_ctype = "application/x-www-form-urlencoded; charset=UTF-8";
        var reqObj = getRequestObject();
        var requestData = '';
        var postData = '';
        var _param = ''
        if('cache_enabled' in D3Api){
            _param += 'cache_enabled='+D3Api.cache_enabled;
        }
        if('session_cache' in D3Api){
            if(_param != ''){
                _param += "&";
            }
            _param += 'session_cache='+D3Api.session_cache;
        }
        if(_param != ''){
            _param += "&";
        }
        if (params.async == undefined){
            params.async = true;
        }
        if(params.content_type == undefined)
            params.content_type = default_ctype;
        if (params.method == 'POST') {
            postData += parseDataToUrl(params.data);
            reqObj.open('POST', D3Api.getOption('path', '') + params.url + '?' + _param + parseDataToUrl(params.urlData) + 'cache=' + D3Api.SYS_CACHE_UID + SYSREQUEST, params.async);
            reqObj.setRequestHeader("Method", "POST " + D3Api.getOption('path', '') + params.url + " HTTP/1.1");
            reqObj.setRequestHeader("Content-Type", params.content_type);
            if(params.content_type == default_ctype){
                postData += parseDataToUrl(params.data);
            }
            else{
                postData = '' + params.data;
            }
        } else {
            requestData += parseDataToUrl(params.data);
            postData = null;
            reqObj.open('GET', D3Api.getOption('path', '') + params.url + '?' + _param + parseDataToUrl(params.urlData) + requestData + 'cache=' + D3Api.SYS_CACHE_UID + SYSREQUEST, params.async);
        }
        var isSysRequest = SYSREQUEST != '';
        SYSREQUEST = '';
        if (params.requestHeaders) {
            for (var rh in params.requestHeaders) {
                if(params.requestHeaders.hasOwnProperty(rh)){
                    reqObj.setRequestHeader(rh, params.requestHeaders[rh]);
                }
            }
        }
        if('headers' in params){
            for(var key in params.headers){
                if(params.headers.hasOwnProperty(key)){
                    reqObj.setRequestHeader(key, params.headers[key]);
                }
            }
        }
        var systemUserToken = D3Api.globalClientData.get('systemUserToken');
        if (systemUserToken) {
            reqObj.setRequestHeader('X-User-Token', systemUserToken);
        }

        var reqUid = D3Api.getUniqId('req');
        var func = function () {
            if (reqObj.readyState != 4) return;
            try {
                if (reqObj.status == 200) {
                    if (checkErrorRequest(reqObj, params) && params.onSuccess instanceof Function)
                        params.onSuccess.call(params.contextObj, ((params.responseXml) ? reqObj.responseXML : reqObj.responseText),reqObj);
                    if (reqObj.responseText[0] === '{') {
                        var reqObjJson = JSON.parse(reqObj.responseText);
                        for (var keySub in reqObjJson) {
                            if (typeof(reqObjJson[keySub]['eval']) === 'string' ){
                                eval(reqObjJson[keySub]['eval']);
                                break;
                            }
                        }
                    }
                } else if (params.onError instanceof Function) {
                    checkErrorRequest(reqObj, params);
                    params.onError.call(params.contextObj, (params.responseXml) ? reqObj.responseXML : reqObj.responseText, reqObj);
                }
            } catch (e) {
                D3Api.debug_msg(e);
            }
            D3Api.Base.callEvent('onRequestServerEnd', reqObj, reqUid, isSysRequest);
            delete reqObj;
        }
        if (params.async)
            reqObj.onreadystatechange = func;
        D3Api.Base.callEvent('onRequestServerBegin', reqObj, reqUid, isSysRequest);
        reqObj.send(postData);
        if (!params.async) func();
        return reqObj;
    };
    /**
     * Ошибка авторизации
     */
    this.AuthError = function() {
        D3Api.showForm.apply(this, Array.prototype.slice.call(arguments))
    }

    function checkErrorRequest(req, params) {
        var error = req.getResponseHeader('D3RequestError');
        if (!error)
            return true;

        if (params.contextObj && params.contextObj.hash) {
            D3Api.forms[params.contextObj.hash] = null;
            delete D3Api.forms[params.contextObj.hash];
            if (params.contextObj.thread)
                D3Api.threads[params.contextObj.thread].close();
        }
        var code, ind = error.indexOf(':');
        if (ind > -1) {
            code = error.substr(0, ind);
            error = error.substr(ind + 1);
        }

        switch (code) {
            case 'AuthErrorLogin':
            case 'AuthErrorLpu':
            case 'AuthErrorPass':
                var f = error.split('|');
                if (f[1]) {
                    D3Api.debug_msg(f[1]);
                } else {
                    D3Api.AuthError(f[0], D3Api.D3MainContainer, {vars: {onlyLPU: code == 'AuthErrorLpu', onlyPass: code == 'AuthErrorPass'}});
                }
                break;
            case 'DBConnectError':
                alert('Ошибка при подключении к БД: ' + error);
                break;
            default:
                D3Api.alert_msg('Неизвестная ошибка ответа: ' + error);
                break;
        }
        return false;
    };
    function isObject(_object) {
        return (_object instanceof Object) || (window['Node'] && _object instanceof window['Node']);
    };
    function parseDataToUrl(_Data, _PropName) {
        if (_PropName == undefined) _PropName = null;
        if (_Data == undefined) return '';

        var urlData = '';

        for (var _propertyName in _Data) {
            if(!_Data.hasOwnProperty(_propertyName)){
                continue;
            }
            if (isObject(_Data[_propertyName])) {
                var l_PropName = _PropName != null ? _PropName + '[' + _propertyName + ']' : _propertyName;
                urlData += parseDataToUrl(_Data[_propertyName], l_PropName);
            }
            else {
                if (_PropName != null) urlData += _PropName + '[' + _propertyName + ']=' + encodeURIComponent(_Data[_propertyName]) + '&';
                else urlData += _propertyName + '=' + encodeURIComponent(_Data[_propertyName]) + '&';
            }
        }
        return urlData;
    };
    function getRequestObject() {
        if (window.XMLHttpRequest) {
            try {
                return new XMLHttpRequest();
            } catch (e) {
            }
        } else if (window.ActiveXObject) {
            try {
                return new ActiveXObject('MSXML2.XMLHTTP.3.0');
            } catch (e) {
            }
            try {
                return new ActiveXObject('Msxml2.XMLHTTP');
            } catch (e) {
            }
            try {
                return new ActiveXObject('Microsoft.XMLHTTP');
            } catch (e) {
            }
        }
        return null;
    };
    /**
     *
     * @param text
     * @returns {ChildNode|null|*}
     */
    this.parseXML = function parseXML(text) {
        try {
            if (window.DOMParser) {
                var parser = new DOMParser();
                return parser.parseFromString(text, "text/xml").childNodes[0];
            } else if (window.ActiveXObject) {
                var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                xmlDoc.async = "false";
                xmlDoc.loadXML(text);
                return xmlDoc.childNodes[0];
            }
        } catch (e) {
        }
        return null;
    };
    this.including_js = {};
    /**
     * подключение js файла
     * @param filename {string} - путь до файла
     * @param callback {Function|any|null} - колбэк
     * @returns {boolean}
     */
    this.include_js = function (filename, callback) {
        var path = filename.split('?');
        filename = path[0];
        if (this.including_js[filename] == true) {
            if (callback instanceof Function)
                callback.call(this, filename);
            return true;
        }
        this.including_js[filename] = false;
        var objHead = document.getElementsByTagName('head')[0];
        var objScript = document.createElement('script');
        objScript.type = 'text/javascript';
        objScript.src = filename.replace('.js', '') + ((this.current_theme != '') ? '_' : '') + this.current_theme + '.js' + ((path[1]) ? '?' + path[1] : '');
        objScript.onload = function () {
            D3Api.including_js[filename] = true;
            if (callback instanceof Function)
                callback.call(this, filename);
            this.onload = undefined;
            this.onreadystatechange = undefined;
        }
        objScript.onreadystatechange = function () {
            if (this.readyState == 'loaded' || this.readyState == 'complete') {
                D3Api.including_js[fileName] = true;
                if (callback instanceof Function)
                    callback.call(this, filename);
                this.onload = undefined;
                this.onreadystatechange = undefined;
            }
        }
        objHead.appendChild(objScript);
        return true;
    }
    this.including_css = {};
    /**
     * подключение css файла
     * @param filename {string} - путь до файла
     * @returns {boolean}
     */
    this.include_css = function (filename) {
        var path = filename.split('?');
        filename = path[0];
        if (this.including_css[filename] == true)
            return true;
        this.including_css[filename] = true;
        var objHead = document.getElementsByTagName('head')[0];
        var objStyle = document.createElement('link');
        objStyle.rel = 'stylesheet';
        objStyle.type = 'text/css';
        objStyle.href = filename.replace('.css', '') + ((this.current_theme != '') ? '_' : '') + this.current_theme + '.css' + ((path[1]) ? '?' + path[1] : '');

        objHead.appendChild(objStyle);
        return true;
    }
    var lastWidth = 0;
    var lastHeight = 0;
    /**
     * Изменение размера окна
     * @param force
     */
    this.resize = function (force) {
        force = force === undefined ? true : force;
        if (force || document.body.offsetWidth != lastWidth || document.body.offsetHeight != lastHeight) {
            lastWidth = document.body.offsetWidth;
            lastHeight = document.body.offsetHeight;
            this.Base.callEvent('onResize');
        }
    }
    document.onkeydown = function(e){

        var e = e || D3Api.getEvent();
        var focus_control = D3Api.getControlByDom(document.activeElement);
        if(!focus_control || !focus_control.D3Form)
            return;

        if (e.keyCode == 9 ){
            D3Api.setVar('KeyDown_shiftKey', e.shiftKey);
        } else {
            if('D3Form' in focus_control && 'callControlMethod' in focus_control.D3Form){
                focus_control.D3Form.callControlMethod(focus_control, 'CtrlKeyDown', e);
            }
        }
    }
}();
/**
 * Базовый объект D3Base
 * @class
 * @param thisObj {Object}
 * @constructor
 */
D3Api.D3Base = function (thisObj) {
    this.events = {};
    this.currentEventName = '';
    this.removedEvents = [];
    /**
     * Добавить событие
     * @param eventName {string} - Имя события
     * @param listener {Function} - колбэк вызова.
     * @returns {string}
     */
    this.addEvent = function (eventName, listener) {
        if (!(listener instanceof Function))
            return null;
        if (!this.events[eventName])
            this.events[eventName] = {};
        var uniqid = D3Api.getUniqId('event_');
        this.events[eventName][uniqid] = {func: listener, once: false};
        return uniqid;
    }
    /**
     * Добавить событие
     * @param eventName {string} - Имя события
     * @param listener {Function} - колбэк вызова.
     * @returns {string}
     */
    this.addEventOnce = function (eventName, listener) {
        var uniqid = this.addEvent(eventName, listener);
        if (!uniqid)
            return null;
        this.events[eventName][uniqid].once = true;
        return uniqid;
    }
    /**
     * Вызвать событие
     * @param eventName {string} - Имя события
     * @returns {boolean}
     */
    this.callEvent = function (eventName) {
        if (!this.events[eventName])
            return;
        this.currentEventName = eventName;
        var args = Array.prototype.slice.call(arguments, 1);
        var onces = new Array();
        var res = true;
        for (var e in this.events[eventName]) {
            if(!('events' in this)){
                continue;
            }
            if(!this.events[eventName].hasOwnProperty(e)){
                continue;
            }
            if (this.events[eventName][e].func.apply(thisObj || this, args) === false)
                res = false;
            if (this.events && this.events[eventName][e].once)
                onces.push(e);
        }
        this.currentEventName = '';
        onces = onces.concat(this.removedEvents);
        for (var i = 0, c = onces.length; i < c; i++) {
            this.removeEvent(eventName, onces[i]);
        }
        this.removedEvents = [];
        onces = null;
        return res;
    }
    /**
     * Очистить Событие по имени
     * @param eventName {string} - Имя события
     */
    this.clearEvents = function (eventName) {
        this.events[eventName] = {};
    }
    /**
     * Удалить событие по uid
     * @param eventName {string} - Имя события
     * @uniqid uniqid {string} - уникальный идентификатор события
     * @returns {boolean}
     */
    this.removeEvent = function (eventName, uniqid) {
        if (!this.events[eventName] || !this.events[eventName][uniqid])
            return false;
        if (eventName == this.currentEventName) {
            this.removedEvents.push(uniqid);
            return true;
        }
        this.events[eventName][uniqid] = null;
        delete this.events[eventName][uniqid];
        return true;
    }
    /**
     * Удалить событие
     * @param eventName {string} - Имя события
     * @returns {boolean}
     */
    this.removeEvents = function (eventName) {
        if (!this.events[eventName])
            return false;

        if (eventName == this.currentEventName) {
            for (var uid in this.events[eventName]){
                if(this.events[eventName].hasOwnProperty(uid)){
                    this.removedEvents.push(uid);
                }

            }
            return true;
        }
        this.events[eventName] = null;
        delete this.events[eventName];
        return true;
    }
    /**
     * Удалить все событие
     * @returns {boolean}
     */
    this.removeAllEvents = function () {
        this.events = [];
        return true;
    }
    /**
     * Деструктор
     */
    this.destructorBase = function () {
        this.destroyed = true;
        this.events = null;
        delete this.events;
    }
}
D3Api.Base = {};
D3Api.D3Base.call(D3Api.Base);

/**
 * Базовый объект D3Form
 * @class
 * @param name {string} - путь формы
 * @param xml {Object} - Дом объект
 * @constructor
 */
D3Api.D3Form = function (name, xml) {
    D3Api.D3Base.call(this);
    this.destroyed = false;
    this.isActive = false;
    this.isShowed = false;
    this.isCreated = false; // метка отработки пользовательского события onCreate
    this.leftForm = null;
    this.rightForm = null;
    this.formUid = D3Api.getUniqId('f');
    this.name = name;
    this.formData = {};
    this.formEditMode = false;
    this.formCheckPrivs = null; // нужно ли проверять на форме права
    this.formCheckCreated = null; // нужно ли дожитаться завершения работы onCreate
    this.formSkipRefresh = null; // пропуск системной проверки D3Api.D3Form.onRefreshForm при открытии формы
    this.formUnit = null; // привязанный к форме раздел системы
    this.formPrimary = null; // имя PRIMARY переменной на форме
    this.currentContext = null;
    this.vars = {};
    this.container = null;
    var dataSets = {};
    this.dataSets = dataSets;
    var repeaters = {};
    this.repeaters = repeaters;
    var activateDataSets = new Array();
    var modules = {};
    var actions = {};
    this.actions = actions;
    var sysinfo = {};
    this.sysinfo = sysinfo;
    var MainForm = this;
    var resizeEventUid = D3Api.Base.addEvent('onResize', resizeForm);
    var resizeTimer = null;
    this.scrollDoms = [];
    function resizeForm(DOM, resize) {
        if(!MainForm){
            return
        }
        if (!D3Api.showedDom(MainForm.DOM))
            return;
        DOM = DOM || MainForm.DOM;
        D3Api.runCalcSize(DOM, DOM);
        MainForm.callEvent('onResize');
        if (_modalBorders_.top) {
            D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', false);
            D3Api.MainDom.D3FormHelp && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormHelp, 'visible', false);
            D3Api.hideDom(_modalBorders_.top);
            D3Api.hideDom(_modalBorders_.right);
            D3Api.hideDom(_modalBorders_.bottom);
            D3Api.hideDom(_modalBorders_.left);
            var md = D3Api.getAbsoluteClientRect(D3Api.MainDom);
            var fs = D3Api.getAbsoluteClientRect(MainForm.DOM);
            _modalBorders_.top.style.top = md.y + 'px';
            _modalBorders_.top.style.left = fs.x + 'px';
            _modalBorders_.top.style.width = fs.width + 'px';
            _modalBorders_.top.style.height = (fs.y - md.y) + 'px';

            _modalBorders_.right.style.top = md.y + 'px';
            _modalBorders_.right.style.left = (fs.x + fs.width) + 'px';
            _modalBorders_.right.style.width = (md.x + md.width - fs.x - fs.width) + 'px';
            _modalBorders_.right.style.height = md.height + 'px';

            _modalBorders_.bottom.style.top = (fs.y + fs.height) + 'px';
            _modalBorders_.bottom.style.left = fs.x + 'px';
            _modalBorders_.bottom.style.width = fs.width + 'px';
            _modalBorders_.bottom.style.height = (md.y + md.height - fs.y - fs.height) + 'px';

            _modalBorders_.left.style.top = md.y + 'px';
            _modalBorders_.left.style.left = md.x + 'px';
            _modalBorders_.left.style.width = (fs.x - md.x) + 'px';
            _modalBorders_.left.style.height = md.height + 'px';

            D3Api.setDomDisplayDefault(_modalBorders_.top);
            D3Api.setDomDisplayDefault(_modalBorders_.right);
            D3Api.setDomDisplayDefault(_modalBorders_.bottom);
            D3Api.setDomDisplayDefault(_modalBorders_.left);

        }
    }

    function resizeOnlyForm() {
        if (!MainForm) {
            return;
        }
        D3Api.runCalcSize(MainForm.DOM, MainForm.DOM);
    }

    /**
     * Изменение размер текущей формы
     */
    this.resize = function () {
        if (resizeTimer) {
            clearTimeout(resizeTimer);
            resizeTimer = null;
        }
        resizeTimer = setTimeout(resizeOnlyForm, 100);
    }
    var _modalBorders_ = {top: null, right: null, bottom: null, left: null};
    var fDOM = document.createElement('DIV');
    fDOM.innerHTML = xml;

    this.DOM = fDOM.children[0];
    var div_first = document.createElement("div");
    div_first.innerHTML = '<div cmptype="Base" tabindex="0" name="firstControl" oncreate="D3Api.BaseCtrl.init_focus(this);"/>';
    this.DOM.insertBefore(div_first, this.DOM.children[0]);

    // Дубликат дива ()
    //var div_last = document.createElement("div");
    //div_last.innerHTML = '<div cmptype="Base" tabindex="0" name="lastControl" oncreate="D3Api.BaseCtrl.init_focus(this);"/>';
    //this.DOM.appendChild(div_last);

    if (!this.DOM.getAttribute) {
        D3Api.notify('Информация', 'Ошибка синтаксиса при создании формы "' + name + '"', {modal: true});
        this.DOM = document.createElement('DIV');
    }
    this.DOM.D3Form = this;

    //Пространство скрипта формы
    var Form = {
        _DOM_: MainForm.DOM,
        _pushHistory_: function (container) {
            return container.DOM == D3Api.MainDom;
        },
        //Объект для проброса в onclose
        _onCloseResult_: undefined
        //_withParams_: false
    };

    this.formParams = null;
    this.formParamsHash = [];
    this.formParamsSettings = {};
    var formParamsHash = this.formParams;
    var getParamsAction = createAction('get_form_params');
    getParamsAction.requestParams['form'] = 'System/FormParams/get_form_params';
    getParamsAction.addSysInfoParam({get: 'ps_form', srctype: 'var', src: 'ps_form'});
    getParamsAction.addSysInfoParam({put: 'ps_params', srctype: 'var', src: 'ps_params'});

    var setParamsAction = createAction('set_form_params');
    setParamsAction.requestParams['form'] = 'System/FormParams/set_form_params';
    setParamsAction.addSysInfoParam({get: 'ps_form', srctype: 'var', src: 'ps_form'});
    setParamsAction.addSysInfoParam({get: 'ps_params', srctype: 'var', src: 'ps_params'});


    // var CacheSessDelete = createModule('CacheSessDelete');
    // CacheSessDelete.requestParams['form'] = 'System/CacheSessDelete/CacheSessDelete';
    // CacheSessDelete.addSysInfoParam({get: 'formCache', srctype: 'var', src: 'formCache'});

    //События, которые оборачиваются внутренним обработчиком
    /*this.execDomEvents = new Array(
     'onclick',
     'ondblclick',
     //'onchange',
     'onfocus',
     'onblur',
     'onmousemove',
     'onmousedown',
     'onmouseup',
     'onkeydown',
     'onkeyup',
     'onkeypress',
     'onmouseover',
     'onmouseout',
     'onselect',
     'onsubmit',
     'onreset');*/
    this.execDomEvents = {
        'onclick': true,
        'ondblclick': true,
        //'onchange'     : true,
        'onfocus': true,
        'onblur': true,
        'onmousemove': true,
        'onmousedown': true,
        'onmouseup': true,
        'onkeydown': true,
        'onkeyup': true,
        'onkeypress': true,
        'onmouseover': true,
        'onmouseout': true,
        'onselect': true,
        'onsubmit': true,
        'onreset': true,
        'onmouseleave':true,
        'onmouseenter':true,
        'oncontextmenu':true
    };
    if (D3Api.BROWSER.msie) {
        this.execDomEventsIE = {};
        for (var en in this.execDomEvents) {
            if(this.execDomEvents.hasOwnProperty(en)){
                this.execDomEventsIE['_' + en + '_'] = en;
            }
        }
    }
    var notCheckEnabledEvents = {
        'dummy': true,
        'onload': true,
        'onshow': true,
        'onprepare': true,
        'oncreate': true,
        'oninit': true,
        'onformactivate': true,
        'onclose': true,
        'onrefresh': true,
        'onbefore_refresh': true,
        'onafter_refresh': true
    };
    ////////////////////////////////////////////////////////
    //Функция для замыкания
    function execEventFunc(funcBody, argumentsObj) {
        var res = null;
        var args = Array.prototype.slice.call(argumentsObj);
        var argsNames = '';
        if ((args[0] instanceof Object) && (args[0] instanceof Event))
            argsNames = 'event';
        if (funcBody instanceof Object) {
            argsNames = funcBody['args'] || argsNames;
            funcBody = funcBody['func'];
        }
        eval('try{ res = (function(' + argsNames + '){' + funcBody + '}).apply(this,args); }catch(e){D3Api.debug_msg(e);}');
        return res;
    };
    /**
     * Вызвать фукнциою текущей формы
     * @param funcName {string} - имя формы
     * @returns {null}
     */
    this.callFunction = function (funcName) {
        var args = Array.prototype.slice.call(arguments, 1);
        res = null;
        try {
            var res = Form[funcName].apply(this, args);
        } catch (e) {
            D3Api.debug_msg(e);
        }
        ;
        return res;
    }
    /**
     * Проверить на существование функции
     * @param funcName {string} - имя функции
     * @returns {boolean}
     */
    this.existsFunction = function (funcName) {
        return Form[funcName] instanceof Function;
    }
    this.execScript = execEventFunc;

    /**ы
     * Для дом событий, замыкает функцию в пространство формы
     * @param dom
     * @param funcBody
     * @param eventName
     * @param context
     * @returns {function(): null}
     */
    this.execDomEventFunc = function (dom, funcBody, eventName, context) {
        eventName = eventName || 'dummy';
        context = context || MainForm.currentContext;
        return function () {
            var ev = D3Api.getEvent(arguments[0]);
            D3Api.setEvent(arguments[0]);
            var cC = MainForm.currentContext;
            MainForm.currentContext = context || MainForm.currentContext;

            var notCheckEnabledEventsControl = []; // события компонента, на которые не должно влиять enabled
            if (D3Api.getProperty(dom, 'not_check_enabled_events'))
                notCheckEnabledEventsControl = D3Api.getProperty(dom, 'not_check_enabled_events','').split(";");
            if (!notCheckEnabledEvents[eventName] && notCheckEnabledEventsControl.indexOf(eventName) == -1) {
                if (getControlProperty(dom, 'enabled') === false) {
                    D3Api.setEvent(ev);
                    return;
                }
            }
            var res = execEventFunc.call(dom, funcBody, arguments);
            //Форму могли закрыть
            if (MainForm)
                MainForm.currentContext = cC;

            D3Api.setEvent(ev);
            return res;
        };
    }
    ///////////////////////////////////////////////////////
    /**
     * Парсер формы
     * @param dom
     * @param dataset
     * @param repeatersStack
     * @param currentUid
     */
    this.parse = function (dom, dataset, repeatersStack, currentUid) {
        var rStack = repeatersStack && repeatersStack.length > 0;
        if (D3Api.hasProperty(dom, 'noparse'))
            return;
        repeatersStack = repeatersStack || new Array();
        var dsName = D3Api.getProperty(dom, 'dataset');
        var rep = D3Api.getProperty(dom, 'repeat');
        if (dsName || rep) {
            if (rStack) {
                D3Api.setProperty(dom, 'isrepeat', repeatersStack[repeatersStack.length - 1].uniqId);
            }
            if (dsName) {
                if (!dataSets[dsName])
                    dataSets[dsName] = new D3Api.D3DataSet(this, dsName);
                dataset = dataSets[dsName];
                if (!rStack) {
                    var prop = null;
                    if (prop = D3Api.getProperty(dom, 'onbefore_refresh'))dataset.addEvent('onbefore_refresh', this.execDomEventFunc(dom, prop));
                    if (prop = D3Api.getProperty(dom, 'onrefresh'))dataset.addEvent('onrefresh', this.execDomEventFunc(dom, prop));
                    if (prop = D3Api.getProperty(dom, 'onafter_refresh'))dataset.addEvent('onafter_refresh', this.execDomEventFunc(dom, prop));
                }
            }
            //Это повторитель

            if (rep) {
                var parent = null;
                if (repeatersStack.length > 0)
                    parent = repeatersStack[repeatersStack.length - 1];

                var repeater = new D3Api.D3Repeater(this, dom, parent, dataset);
                if (repeater.name)
                    repeaters[repeater.name] = repeater;
            }
        }
        var cmptype = D3Api.getProperty(dom, 'cmptype');
        var p = '';
        if (cmptype) {
            if (rStack) {
                D3Api.setProperty(dom, 'isrepeat', repeatersStack[repeatersStack.length - 1].uniqId);
            }
            switch (cmptype.toLowerCase()) {
                case 'sysinfo':
                    sysinfo_parse(dom);
                    break;
                case 'script':
                    script_parse.call(this, dom);
                    break;
                default:
                    currentUid = MainForm.default_parse(dom, true, undefined, currentUid);
                    var find = false;
                    if (dsName) {
                        if(rep){
                            repeater.addControl(dom);
                            find = true;
                        }else {
                            for (var c = repeatersStack.length - 1; c >= 0; c--) {
                                if (repeatersStack[c].dataSet && repeatersStack[c].dataSet.name == dsName) {
                                    repeatersStack[c].addControl(dom);
                                    find = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!find)
                        if (repeatersStack.length > 0 && !dsName)
                            repeatersStack[repeatersStack.length - 1].addControl(dom);
                        else if (dataset)
                            dataset.addControl(dom);
                    break;
            }
        } else if (p = D3Api.getProperty(dom, 'cmpparse', false)) {
            if (rStack) {
                D3Api.setProperty(dom, 'isrepeat', repeatersStack[repeatersStack.length - 1].uniqId);
            }
            MainForm.default_parse(dom, true, undefined, currentUid);
        }
        if (repeater) repeatersStack.push(repeater);
        if (dom.children) {
            for (var i = 0, c = dom.children.length; i < c; i++) {
                this.parse(dom.children[i], dataset, repeatersStack, currentUid);
            }
        }

        if (repeater) repeatersStack.pop();
    }
    var scriptsLoad = 0;
    var sysinfo_types =
    {
        'dataset': function (dom) {
            var dsName = D3Api.getProperty(dom, 'name');
            if (!dsName) {
                D3Api.debug_msg('Не указано имя DataSet');
                return;
            }
            if (!dataSets[dsName])
                dataSets[dsName] = new D3Api.D3DataSet(MainForm, dsName, dom);
            else {
                dataSets[dsName].init(dom);
            }
            sysinfo_load(sysinfo, dom, {type: 'dataset', name: '', activateoncreate: 'true', showerror: 'true'}, new Array('get', 'srctype', 'src', 'parent', 'property', 'global'), dataSets[dsName]);
            if (sysinfo[dsName].properties.activateoncreate == 'true')
                activateDataSets.push(dsName);
        },
        'action': function (dom) {
            var actName = D3Api.getProperty(dom, 'name');
            if (!actName) {
                D3Api.debug_msg('Не указано имя Action');
                return;
            }
            if (!actions[actName])
                actions[actName] = new D3Api.D3Action(MainForm, actName, dom);
            else {
                actions[actName].init(dom);
            }
            sysinfo_load(sysinfo, dom, {type: 'action', name: '', activateoncreate: 'true', showerror: 'true', mode: 'get'}, new Array('get', 'put', 'srctype', 'src', 'property', 'global'), actions[actName]);
        },
        'module':function(dom){
            var actName = D3Api.getProperty(dom, 'name');
            if (!actName) {
                D3Api.debug_msg('Не указано имя Module');
                return;
            }
            if (!modules[actName]){
                modules[actName] = new D3Api.D3Module(MainForm, actName, dom);
            }else{
                modules[actName].init(dom);
            }
            sysinfo_load(sysinfo, dom, {type: 'module', name: '', activateoncreate: 'true', showerror: 'true', mode: 'get'}, new Array('get', 'put', 'srctype', 'src', 'property', 'global'), modules[actName]);
        },
        'subaction': function (dom, params, postObject) {
            var subActName = D3Api.getProperty(dom, 'name');
            if (!subActName) {
                D3Api.debug_msg('Не указано имя SubAction');
                return;
            }
            var subActPO = sysinfo_load(postObject.childs, dom, {type: 'subaction', name: '', repeatername: '', showerror: 'true', mode: 'get', execon: 'upd'}, new Array('get', 'put', 'srctype', 'src', 'property', 'global'));

            if (subActPO.properties.repeatername != '') {
                var rep = MainForm.getRepeater(subActPO.properties.repeatername);
                if (rep) {
                    rep.actionData = true;
                } else {
                    D3Api.debug_msg('SubAction "' + subActName + '" ссылается на несуществующий Repeater ("' + subActPO.properties.repeatername + '").');
                    return;
                }
            }
            //Переопределяем функцию получения данных для запроса
            subActPO.getChildData = function () {
                var rep = MainForm.getRepeater(this.properties.repeatername);
                var cC = MainForm.currentContext;
                params = [];
                if (rep && this.properties.execon) {
                    var chData = rep.getChangedData(this.properties.execon);
                    for (var chD in chData) {
                        if(!chData.hasOwnProperty(chD)){
                            continue;
                        }
                        MainForm.currentContext = chData[chD];
                        MainForm.setVar('_clonedata_', chData[chD].clone.data);
                        params.push(this.getParams());
                    }
                    MainForm.setVar('_clonedata_', undefined);
                } else
                    params.push(this.getParams());

                MainForm.currentContext = cC;
                return params;
            }
            subActPO.setParams = function (data) {
                for (var i = 0, ip = this.params.length; i < ip; i++) {
                    if (this.params[i].put != undefined) {
                        switch (this.params[i].srctype) {
                            case 'var':
                                var DESTOBJ = MainForm;
                                if (this.params[i].global === 'true')
                                    DESTOBJ = D3Api;
                                if (this.params[i].property) {
                                    var obj = DESTOBJ.getVar(this.params[i].src) || {};
                                    obj[this.params[i].property] = data[this.params[i].put];
                                    DESTOBJ.setVar(this.params[i].src, obj);
                                } else
                                    DESTOBJ.setVar(this.params[i].src, data[this.params[i].put]);
                                break;
                            case 'ctrl':
                                D3Api.BaseCtrl.callMethod(MainForm.getControl(this.params[i].src), 'stopWait');
                                MainForm.setControlProperty(this.params[i].src, this.params[i].prop, data[this.params[i].put]);
                                break;
                        }
                    }
                }
            }
        },
        'var': function (dom, params, postObject) {
            var pObj = {ignorenull: false};

            for (var i = 0, c = params.length; i < c; i++) {
                var attr = D3Api.getProperty(dom, params[i]);
                if (attr != null)
                    pObj[params[i]] = attr;
            }
            if (postObject.properties.type == 'action') {
                actions[postObject.properties.name].addSysInfoParam(pObj);
            } else if (postObject.properties.type == 'dataset') {
                dataSets[postObject.properties.name].addSysInfoParam(pObj);
            } else if(postObject.properties.type == 'module'){
                modules[postObject.properties.name].addSysInfoParam(pObj);
            } else
                postObject.params.push(pObj);
        },
        'scriptfile': function (dom) {
            scriptsLoad++;
            if (!D3Api.include_js(dom.textContent || dom.text, function () {
                scriptsLoad--;
            }))
                scriptsLoad--;
        },
        'cssfile': function (dom) {
            D3Api.include_css(dom.textContent || dom.text);
        },
        'formgetparam': function (dom) {
            MainForm.formParamsHash.push(D3Api.getTextContent(dom));
        },
        'formparam': function (dom) {
            var t = D3Api.getTextContent(dom);
            t = t.split(':');
            MainForm.formParamsSettings[t[0]] = t[1] || true;
        }
    }

    function postObject(defProperties) {
        this.properties = defProperties || {};
        this.params = new Array();
        this.childs = {};

        this.getParams = function () {
            var params = {};
            for (var i = 0, c = this.params.length; i < c; i++) {
                var par = this.params[i];
                if (par['get'] && par['srctype'] && par['src']) {
                    var value = '';
                    switch (par['srctype']) {
                        case 'ctrl':
                            var pf = par['src'].split(':');
                            if(par['property'])
                            {
                                value = MainForm.getControlProperty(pf[0], par['property']);
                            }else if (pf.length > 1)
                            {
                                value = MainForm.getControlProperty(pf[0], pf[1]);
                            }else{
                                value = MainForm.getControlProperty(pf[0], 'value');
                            }
                            break;
                        case 'var':
                            var SRCOBJ = MainForm;
                            if (par['global'] === 'true')
                                SRCOBJ = D3Api;
                            if (par['property'])
                                value = SRCOBJ.getVar(par['src'])[par['property']];
                            else
                                value = SRCOBJ.getVar(par['src']);
                            break;
                    }
                    params[par['get']] = par[par['get']] || value;
                }
            }
            for (var ch in this.childs) {
                if(!this.childs.hasOwnProperty(ch)){
                    continue;
                }
                params['_childs_'] = params['_childs_'] || {};
                params['_childs_'][ch] = this.childs[ch].getChildData();
            }
            return params;
        }
        this.setParams = function () {
        };
        this.getChildData = function () {
            //Переопределить
            return this.getParams();
        }
    }
    /**
     *
     * @param defProperties
     */
    this.postObject = function(defProperties){
        postObject.call(this,defProperties);
    }
    function sysinfo_load(sys_array, dom, defProperties, params, obj) {
        var name = D3Api.getProperty(dom, 'name');
        if (!name) {
            D3Api.debug_msg('Загрузка sysinfo. Имя объекта не указано.');
            return;
        }
        sys_array[name] = new postObject(D3Api.mixin(defProperties));
        if (obj)
            obj.sysinfo = sys_array[name];

        for (var i = 0, c = dom.attributes.length; i < c; i++) {
            sys_array[name].properties[dom.attributes[i].name] = dom.attributes[i].value;
        }
        for (var i = 0, c = dom.childNodes.length; i < c; i++) {
            var ch = dom.childNodes[i];
            var nodeName = ch.nodeName.toLowerCase();
            if (nodeName === '#text') continue;
            if (sysinfo_types[nodeName] instanceof Function) {
                sysinfo_types[nodeName](ch, params, sys_array[name]);
            }
        }
        return sys_array[name];
    }

    function sysinfo_parse(dom) {
        var xml = D3Api.parseXML('<sysinfo>' + dom.innerHTML + '</sysinfo>');
        for (var i = 0, c = xml.childNodes.length; i < c; i++) {
            var ch = xml.childNodes[i];
            var nodeName = ch.nodeName.toLowerCase();
            if (nodeName === '#text') continue;
            if (sysinfo_types[nodeName] instanceof Function) {
                sysinfo_types[nodeName](ch);
            }
        }
    }

    function script_parse(dom) {
        try {
            eval(dom.value);
        } catch (e) {
            D3Api.debug_msg(e);
            D3Api.debug_msg(dom.value);
        }
    }

    /**
     * Парсер
     * @param dom
     * @param systemEvents
     * @param context
     * @param currentUid
     * @returns {*}
     */
    this.default_parse = function (dom, systemEvents, context, currentUid) {
        var p = '';
        var thisDom = dom;
        if (p = D3Api.getProperty(dom, 'cmptype', false)) {
            if (!dom.id)
                dom.id = D3Api.getUniqId('d3ctrl');

            dom.D3Base = new D3Api.D3Base(dom);
            p = 'cmptype';
        } else if (p = D3Api.getProperty(dom, 'cmpparse', false)) {
            if (p != 'true') {
                thisDom = D3Api.getControlByDom(dom, p);
            }
            thisDom = thisDom || dom;
            dom.D3NotCmp = true;
        } else
            return;

        dom.D3Form = MainForm;
        dom.D3Store = {_setEvents_: {}};
        var attrs = null;
        if (systemEvents) {
            var attrsNeed = {onload: true, onshow: true, oncreate: true, onprepare: true, onclose: true, onformactivate: true};
            for (var i = 0, c = dom.attributes.length; i < c; i++) {
                if (this.execDomEvents[dom.attributes[i].name] === true) {
                    attrs = attrs || {};
                    attrs[dom.attributes[i].name] = dom.attributes[i].value;
                }
                if (!dom.attributes[i] || attrsNeed[dom.attributes[i].name] !== true) continue;
                MainForm.addEvent(dom.attributes[i].name, MainForm.execDomEventFunc(thisDom, dom.attributes[i].value, dom.attributes[i].name));
            }
        }
        if (!attrs) {
            attrs = {};
            for (var i = 0, c = dom.attributes.length; i < c; i++) {
                if (this.execDomEvents[dom.attributes[i].name] === true)
                    attrs[dom.attributes[i].name] = dom.attributes[i].value;
            }
        }
        for (var name in attrs) {
            if(!attrs.hasOwnProperty(name)){
                continue;
            }
            dom.D3Store._setEvents_[name] = true;
            dom[name] = MainForm.execDomEventFunc(thisDom, 'if(callControlEvent(D3Api.getControlByDom(this),\'' + name + '\',event)===false)return;' + attrs[name], name, context);
            if (D3Api.BROWSER.msie) {
                D3Api.setProperty(dom, '_' + name + '_', attrs[name]);
            }
        }
        if (D3Api.BROWSER.msie) {
            attrs = {};
            for (var i = 0, c = dom.attributes.length; i < c; i++) {
                if (this.execDomEventsIE[dom.attributes[i].name] !== undefined)
                    attrs[this.execDomEventsIE[dom.attributes[i].name]] = dom.attributes[i].value;
            }
            for (var name in attrs) {
                if(attrs.hasOwnProperty(name)){
                    dom[name] = MainForm.execDomEventFunc(thisDom, attrs[name], name, context);
                }
            }
        }
        if (p == 'cmptype' && !D3Api.hasProperty(dom, 'isrepeat', false)) {
            MainForm.addEvent('oninit', function () {
                D3Api.BaseCtrl.callMethod(dom, 'init')
            });
            if (D3Api.hasProperty(dom, 'cmpext'))
                MainForm.addEvent('oninit', function () {
                    var ct = D3Api.getProperty(dom,'cmptype');
                    D3Api.setProperty(dom,'cmptype',D3Api.getProperty(dom,'cmpext'));
                    D3Api.BaseCtrl.callMethod(dom, 'init');
                    D3Api.setProperty(dom,'cmptype',ct);
                });
            dom.D3Store._uid_ = D3Api.getUniqId('uid');
        }
        if (D3Api.hasProperty(dom, 'events')) {
            D3Api.setProperty(dom, 'events' + currentUid, D3Api.getProperty(dom, 'events'));
        }
        return dom.D3Store._uid_;
    }
    /**
     * Получить значение переменной
     * @param name {string} - имя переменной
     * @returns {*}
     */
    this.getVar = function (name) {
        var objProp = false;
        if(name.indexOf('.') != -1)
        {
            name = name.split('.');
            objProp = name[1];
            name = name[0];
        }
        if (!this.vars.hasOwnProperty(name))
            D3Api.debug_msg('Переменная "' + name + '" на форме не определенна.');
        return objProp?this.vars[name][objProp]:this.vars[name];
    }
    /**
     * устанвить переменную
     * @param name {string} - имя переменной
     * @param value {*} - значение
     */
    this.setVar = function (name, value) {
        this.vars[name] = value;
        if (value === undefined)
            delete this.vars[name];
    }
    /**
     * Получить свойство контрола
     * @param control {string|Object} - котрол
     * @param nameProperty {string} - Свойство
     * @returns {*}
     */
    this.getControlProperty = function (control, nameProperty) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        return D3Api.getControlPropertyByDom(control, nameProperty);
    }
    /**
     * Установить свойство контрола
     * @param control {string|Object} - котрол
     * @param nameProperty {string} - Свойство
     * @param value {string} - значение
     * @returns {*}
     */
    this.setControlProperty = function (control, nameProperty, value) {
        if (!Array.isArray(control)) {
            control = [control];
        }

        // Возвращаем 0ой элемент чтобы случайно не сломать интерфейс, по старой логике!
        return control.map(function (control) {
            if (typeof control === 'string') {
                control = getControl(control);

                if (!control) {
                    return;
                }
            }

            return D3Api.setControlPropertyByDom(control, nameProperty, value);
        })[0];
    }
    /**
     * Добавить событие для контрола.
     * @param control {string|Object} - контрол
     * @param eventName {string} - имя эвента
     * @param listener {Function} - колбэк функция
     */
    this.addControlEvent = function (control, eventName, listener) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        D3Api.addControlEventByDom(control, eventName, listener);
    }

    /**
     * Вызвать событие для контрола.
     * @param control {string|Object} - контрол
     * @param eventName {string} - имя эвента
     * @returns {*}
     */
    this.callControlEvent = function (control, eventName) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        arguments[0] = control;
        return D3Api.callControlEventByDom.apply(this, arguments);
    }
    /**
     * Удалить событие для контрола.
     * @param control {string|Object} - контрол
     * @param eventName {string} - имя эвента
     * @param uniqid
     */
    this.removeControlEvent = function (control, eventName, uniqid) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        D3Api.removeControlEventByDom(control, eventName, uniqid);
    }

    /**
     * Удалить все событие для контрола
     * @param control {string|Object} - контрол
     * @param eventName {string} - имя эвента
     */
    this.removeControlEvents = function (control, eventName) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        D3Api.removeControlEventsByDom(control, eventName);
    }
    /**
     * Получить невидимое значение
     * @param control {string|Object} - контрол
     * @returns {*}
     */
    this.getValue = function (control) {
        return this.getControlProperty(control, 'value');
    }

    /**
     * Установить невидимое значение
     * @param control {string|Object} - Контрол
     * @param value {*} - Значение
     * @returns {*}
     */
    this.setValue = function (control, value) {
        return this.setControlProperty(control, 'value', value);
    }

    /**
     * Получить видимое значение
     * @param control {string|Object} - Контрол
     * @returns {*}
     */
    this.getCaption = function (control) {
        return this.getControlProperty(control, 'caption');
    }

    /**
     * Установить видимое значение
     * @param control {string|Object} - Контрол
     * @param value {*} - Значение
     * @returns {*}
     */
    this.setCaption = function (control, value) {
        return this.setControlProperty(control, 'caption', value);
    }

    /**
     * Доступен  ли элемент
     * @param control {string|Object} - Контрол
     * @returns {*}
     */
    this.getEnabled = function (control) {
        return this.getControlProperty(control, 'enabled');
    }
    /**
     * установка доступности
     * @param control {string|Object} - Контрол
     * @param value {boolean}
     * @returns {*}
     */
    this.setEnabled = function (control, value) {
        return this.setControlProperty(control, 'enabled', value);
    }

    /**
     * Видимый ли элемент
     * @param control {string|Object} - Контрол
     * @returns {*}
     */
    this.getVisible = function (control) {
        return this.getControlProperty(control, 'visible');
    }

    /**
     * Установить видимость элемента
     * @returns {*}
     */
    this.setVisible = function () {
        var ctrls = Array.prototype.concat.apply([], arguments);
        var value = ctrls.pop();

        return this.setControlProperty(ctrls, 'visible', value);
    };

    /**
     * Получить дом контрола
     * @param name {string} - Имя контрола
     * @returns {Object}
     */
    this.getControl = function (name) {
        var ctrl = this.controlExist(name);
        if (!ctrl)
            D3Api.debug_msg('Компонент не найден: ' + name);

        return ctrl;
    }

    /**
     * Удалить контрол
     * @param name {string} - Имя контрола
     */
    this.removeControl = function (name) {
        var ctrl = this.getControl(name);
        if (ctrl)
            D3Api.removeDom(ctrl);
    }

    /**
     * Существует ли контрол
     * @param name {string} - Имя контрола
     * @returns {boolean|*}
     */
    this.controlExist = function (name) {
        var ctrl = false;
        var sel = '[cmptype][name="' + name + '"]';

        if (this.currentContext) {
            ctrl = D3Api.getDomBy(this.currentContext, sel);
            if (!ctrl && D3Api.hasProperty(this.currentContext, 'cmptype') && D3Api.getProperty(this.currentContext, 'name') == name) {
                ctrl = this.currentContext;
            }
        }
        if (!ctrl) {
            var ctrls = D3Api.getAllDomBy(this.DOM, sel);

            for (var i = 0; i < ctrls.length; i++) {
                if (ctrls[i].D3Form == this) {
                    return ctrls[i];
                }
            }
            return false;
        }
        if (ctrl && ctrl.D3Form && ctrl.D3Form != this)
            ctrl = false;
        return ctrl;
    };

    /**
     * Вызвать метод контрола
     * @param control {string|Object} - Имя контрола
     * @param method {string} - Имя метода
     * @returns {*}
     */
    this.callControlMethod = function (control, method) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        return D3Api.BaseCtrl.callMethod.apply(D3Api.BaseCtrl, arguments);
    }
    /**
     *
     * @param control
     * @returns {undefined}
     */
    this.controlAPI = function (control) {
        if (typeof(control) == 'string') {
            var control = getControl(control);
            if (!control) return;
        }
        return D3Api.getControlAPIByDom(control);
    }

    /**
     * Установить значение формы
     * @param caption {string} - значение.
     */
    this.setFormCaption = function (caption) {
        if (caption === undefined)
            caption = D3Api.getProperty(this.DOM, 'caption', '');
        else
            D3Api.setProperty(this.DOM, 'caption', caption);

        this.callEvent('onformcaption',caption);
        if (!this.container.DOM.D3FormCaption)
            return;

        this.container.DOM.D3FormCaption._setCaption(caption);
        this.container.DOM.D3FormCaption._setIcon(D3Api.getProperty(this.DOM, 'icon', ''));
        this.container.DOM.D3FormCaption.onclick = showFormMenu;
        if (caption)
            this.container.DOM.D3FormCaption._show();
        else
            this.container.DOM.D3FormCaption._hide();
    }

    /**
     * Установить подсказку
     * @param hint {string} - значение.
     */
    this.setFormHint = function (hint) {
        if (!this.container.DOM.D3FormCaption)
            return;
        this.container.DOM.D3FormCaption._setHint(hint);
    }

    /**
     * Получить значение формы
     * @returns {string}
     */
    this.getFormCaption = function () {
        return D3Api.getProperty(this.DOM, 'caption', '');
    }

    /**
     * получить иконку формы
     * @returns {*}
     */
    this.getFormIcon = function () {
        return D3Api.getProperty(this.DOM, 'icon', '');
    }
    /**
     * Замыкание функции
     * @param func {Function} - функция
     * @returns {Function}
     */
    this.closure = function (func) {
        var clC = this.currentContext;
        var self = this;
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            if (self == null)return;
            var curC = self.currentContext;
            self.currentContext = clC;
            func.apply(this, Array.prototype.slice.call(arguments).concat(args));
            if (self == null)return;
            self.currentContext = curC;
        }
    }
    var deepContext = [];

    /**
     * Установить контекст
     * @param contextDom {Object} - дом объект для замыкания
     */
    this.closureContext = function (contextDom) {
        deepContext.push(this.currentContext);
        this.currentContext = contextDom;
    }

    /**
     * убрать контекст
     */
    this.unClosureContext = function () {
        this.currentContext = deepContext.pop();
    }

    /**
     * Переоткрыть
     * @param closeBefore {boolean}
     */
    this.reload = function (closeBefore) {
        var name = this.name;
        var data = this.formData;
        var dom = this.container.DOM;
        if (closeBefore) {
            this.close();
            D3Api.showForm(name, dom, data);
        } else {
            D3Api.showForm(name, dom, data);
            this.close();
        }
    }

    /**
     * Показать пользовательский отчет
     * @param code
     * @param primary
     * @param unit
     * @param vars
     * @param request
     */
    this.showUserReport = function(code,primary,unit,vars,request)
    {
        var vars = vars || {};
        if(primary && controlExist(primary))
        {
            vars.PRIMARY = getValue(primary);
            if(controlExist(primary+'_SelectList'))
                vars.PRIMARY_SelectList = getValue(primary+'_SelectList');
        }else if(primary)
            vars.PRIMARY = primary;
        if(unit)
            vars.UNIT = unit;
        vars.vars = this.vars;

        request = request || {};
        request.report = code;

        openForm('UniversalReportParamForm/UniversalReportParamForm', {request:request, vars:vars});
    }

    /**
     * Показать меню формы
     * @param event
     */
    function showFormMenu(event) {
        var menu = D3Api.getProperty(MainForm.DOM, 'menu', false);
        if (!menu)
            return;

        var menu = MainForm.getControl(menu);
        if (menu) {
            var cap = MainForm.container.DOM.D3FormCaption;
            var coords = {left: cap.offsetLeft, top: cap.offsetTop + cap.offsetHeight};
            D3Api.PopupMenuCtrl.show(menu, coords);
        }
    }

    /**
     * скрыть значение формы.
     */
    this.hideFormCaption = function () {
        if (!this.container.DOM.D3FormCaption)
            return;
        this.container.DOM.D3FormCaption.onclick = null;
        this.container.DOM.D3FormCaption._hide();
    }
    var dataRequests = [];

    /**
     * Начать устанавливать вызовы в стэк
     */
    this.beginRequest = function () {
        dataRequests[dataRequests.length] = {};
    }

    /**
     * Прекратить установку вызовов стэка и вызвать запрос.
     * @param immediately
     * @param sync
     * @param onsuccess
     * @param onerror
     */
    this.endRequest = function (immediately, sync, onsuccess, onerror) {
        var num = dataRequests.length -1;
        if(!immediately && dataRequests.length > 1){
            //добавляем вызов к предыдущему вызову
            var requests = dataRequests.splice(num, 1);//вытаскиваю стэк из общего вызова
            if(requests && requests.length > 0){
                requests = requests[0];
            }
            if(requests instanceof Object){
                dataRequests[dataRequests.length - 1] = Object.assign(dataRequests[dataRequests.length - 1],requests);
            }else{
                D3Api.debug_msg("Ошибка типа в переменной requests");
                return;
            }
            if (onsuccess instanceof Function){
                onsuccess.call(this);
            }
            return;
        }
        if(dataRequests.length  == 0){
            return;
        }
        var async = !sync;
        var requests = dataRequests.splice(num, 1);//вытаскиваю стэк из общего вызова
        if(requests && requests.length > 0){
            requests = requests[0];
        }
        if(requests instanceof Object){
            if(Object.keys(requests).length == 0){
                if (onsuccess instanceof Function){
                    onsuccess.call(this);
                }
                return;
            }
        }else{
            D3Api.debug_msg("Ошибка типа в переменной requests");
            return;
        }
        //Собираем все события
        onsuccess = {
            _: onsuccess
        };
        onerror = {
            _: onerror
        };
        for (var n in requests) {
            if(!requests.hasOwnProperty(n)){
                continue;
            }
            if (requests[n]._.onsuccess instanceof Function)
                onsuccess[n + '_' + requests[n].type] = requests[n]._.onsuccess;
            if (requests[n]._.onerror instanceof Function)
                onerror[n + '_' + requests[n].type] = requests[n]._.onerror;
            requests[n]._ = null;
            delete requests[n]._;
        }
        var res = [];
        var error = null;
        var errObj = null;
        var that = this;

        var promise = new Promise(function(resolve,reject){
            var infoThread = D3Api.MULTI_REQUEST;//информация об отправляемых запросах(потоках)
            if(!infoThread){
                infoThread = {"MAX_THREAD":"","MAX_REQUEST":""};
            }
            var currThread = 0;
            var nResult = 0;
            requests = D3Api.DataChunk(requests,+infoThread['MAX_REQUEST']);
            var cnt = requests.length;
            if(!infoThread['MAX_THREAD']){
                infoThread['MAX_THREAD'] = cnt;
            }
            function requestServerThread() {
                if(!error){
                    if(currThread >= +infoThread['MAX_THREAD']){
                        return;
                    }
                    var remove;
                    if(requests){
                        remove = requests.splice(0, 1);
                    }
                    if(remove && remove.length > 0){
                        ++currThread;
                        if(Array.isArray(remove)){
                            remove = remove[0];
                        }
                        var headers = {};
                        if('formCache' in that && this.formCache){
                            that.formData.request['FormCache'] = that.formCache;
                        }
                        D3Api.requestThreadServer({
                            url: 'request.php',
                            async: async,
                            method: 'POST',
                            urlData: that.formData.request,
                            data: {request: D3Api.JSONstringify(remove)},
                            onSuccess: function(r){
                                --currThread;
                                ++nResult;
                                res.push(r);
                                requestServerThread();
                            },
                            onError: function(r, rObj){
                                error = r;
                                errObj = rObj;
                                --currThread;
                                ++nResult;
                                requestServerThread();
                            },
                            contextObj: that,
                            headers: headers
                        });
                        requestServerThread();
                    }else{
                        if(nResult >= cnt){
                            resolve(res);
                        }
                    }
                }else{
                    reject({
                        'error': error,
                        'errObj':errObj
                    });
                }
            }
            requestServerThread();
        });
        promise.then(function(_result){
                that.closure(function () {
                    var _arr = [];
                    for(var i = 0, len = _result.length ; i < len ; i++){
                        _arr[i] = JSON.parse(_result[i]);
                    }
                    _result = D3Api.mixin.apply(that,_arr);
                    _result = JSON.stringify(_result);
                    that.acceptRequest(_result, onsuccess, onerror);
                })();
            },
            function(_obj){
                that.closure(function(){
                    that.errorRequest(_obj['error'], _obj['errObj'], onerror);
                })();
            }
        );
    }

    /**
     * ОТправить запрос
     * @param name
     * @param data
     * @param sync
     * @param onsuccess
     * @param onerror
     * @param repeatersRefresh
     */
    this.sendRequest = function (name, data, sync, onsuccess, onerror, repeatersRefresh) {
        var async = !sync;
        if (async && dataRequests.length > 0) {
            dataRequests[dataRequests.length - 1][name] = data || {};
            dataRequests[dataRequests.length - 1][name]._ = {
                onsuccess: onsuccess,
                onerror: onerror
            };
        } else {
            var reqObj = {};
            reqObj[name] = data;
            var headers = {};
            if('formCache' in this && this.formCache){
                this.formData.request['FormCache'] = this.formCache;
            }

            D3Api.requestThreadServer({
                url: 'request.php',
                async: async,
                method: 'POST',
                urlData: this.formData.request,
                data: {request: D3Api.JSONstringify(reqObj)},
                onSuccess: this.closure(function (r) {
                    this.acceptRequest(r, onsuccess, onerror, repeatersRefresh);
                }),
                onError: this.closure(function (r, rObj) {
                    this.errorRequest(r, rObj, onerror);
                }),
                contextObj: this,
                headers: headers
            });
        }
    }

    /**
     * колбэк после вызова запроса
     * @param res
     * @param onsuccess
     * @param onerror
     * @param repeatersRefresh
     */
    this.acceptRequest = function (res, onsuccess, onerror, repeatersRefresh) {
        //Долго данные шли, форму уже прикрыли
        if (MainForm == null)
            return;
        var onerrorFunc = null;
        var onsuccessFunc = null;
        try {
            var resObj = JSON.parse(res);
        } catch (e) {
            onerrorFunc = (onerror) ? (onerror._ || onerror) : null;
            if (onerrorFunc instanceof Function)
                onerrorFunc.call(this, res, e);
            D3Api.debug_msg('В ответе сервера: ' + e.message);
            return;
        }
        for (var name in resObj) {
            if(!resObj.hasOwnProperty(name)){
                continue;
            }
            switch (resObj[name].type) {
                case 'DataSet':
                    var ds = dataSets[name];
                    if (!ds) {
                        resObj[name].breakStep = true;
                        break;
                    }
                    if (!ds.allResponse && ds.requestUid != resObj[name].uid && ds.sendRequest == true) {
                        resObj[name].breakStep = true;
                        break;
                    }

                    ds.dataHash = resObj[name].hash;
                    break;
                case 'Action':
                    var act = actions[name];
                    if (!act) {
                        resObj[name].breakStep = true;
                        break;
                    }
                    break;
                case 'Module':
                    var mod = modules[name];
                    if(!mod){
                        resObj[name].breakStep = true;
                        break;
                    }
            }
        }
        var isError = [];
        for (var name in resObj) {
            if(!resObj.hasOwnProperty(name)){
                continue;
            }
            if (resObj[name].breakStep || D3Api.isUndefined(resObj[name].type))
                continue;
            switch (resObj[name].type) {
                case 'DataSet':
                    if (!D3Api.empty(resObj[name].error)) {
                        var shnot = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }

                    var ds = dataSets[name];
                    ds.setResponse(resObj[name], repeatersRefresh);
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
                case 'Action':
                    var errorCall = false;
                    if (!D3Api.empty(resObj[name].error)) {
                        errorCall = true;
                        var shnot = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            console.log(resObj[name].error);
                            // D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }
                    var pCh = function (postObj, childs, errorOnly) {
                        for (var c in childs) {
                            if(!childs.hasOwnProperty(c)){
                                continue;
                            }
                            for (var i = 0, ic = childs[c].length; i < ic; i++) {
                                if (childs[c][i].error !== undefined && (!errorCall || errorOnly)) {
                                    errorCall = true;
                                    var shnot = true;
                                    onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                                    if (onerrorFunc instanceof Function)
                                        shnot = onerrorFunc.call(this, res, resObj[name].error);
                                    if (shnot !== false)
                                    {
                                        isError.push(name);
                                        D3Api.alert_msg(childs[c][i].error);
                                    }
                                    D3Api.debug_msg(childs[c][i].error);
                                    return false;
                                } else if (!errorOnly) {
                                    postObj.childs[c].setParams(childs[c][i].data);
                                    if (!pCh(postObj.childs[c], childs[c][i]._childs_))
                                        return false;
                                }
                            }
                        }
                        return true;
                    }
                    if (!pCh(sysinfo[name], resObj[name]._childs_, true))
                        break;
                    var act = actions[name];
                    act.setData(resObj[name].data);
                    if (!pCh(sysinfo[name], resObj[name]._childs_))
                        break;
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
                case 'Module':
                    var errorCall = false;
                    if (!D3Api.empty(resObj[name].error)) {
                        var shnot = true;
                        errorCall = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }
                    var act = modules[name];
                    act.setData(resObj[name].data);
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
                    break;
                default:
                    if (!D3Api.empty(resObj[name].error)) {
                        var shnot = true;
                        onerrorFunc = (onerror) ? (onerror[name + '_' + resObj[name].type] || onerror) : null;
                        if (onerrorFunc instanceof Function)
                            shnot = onerrorFunc.call(this, res, resObj[name].error);
                        if (shnot !== false)
                        {
                            isError.push(name);
                            D3Api.alert_msg(resObj[name].error);
                        }
                        D3Api.debug_msg(resObj[name].error);
                        break;
                    }
                    onsuccessFunc = (onsuccess) ? (onsuccess[name + '_' + resObj[name].type] || onsuccess) : null;
                    if (onsuccessFunc instanceof Function)
                        onsuccessFunc.call(this, res, resObj);
                    break;
            }
        }
        onerrorFunc = (onerror) ? (onerror._) : null;
        if(isError.length > 0 && onerrorFunc instanceof Function)
        {
            onerrorFunc.call(this, res, resObj, isError);
            return;
        }
        onsuccessFunc = (onsuccess) ? (onsuccess._) : null;
        if (isError.length == 0 && onsuccessFunc instanceof Function)
            onsuccessFunc.call(this, res, resObj);
    }
    /**
     * коллбэк после после неудачного вызова
     * @param res
     * @param resObj
     * @param onerror
     */
    this.errorRequest = function (res, resObj, onerror) {
        if (onerror instanceof Function)
            onerror.call(this, res, resObj);
        else if(onerror)
        {
            for (var n in onerror) {
                if(!onerror.hasOwnProperty(n)){
                    continue;
                }
                if (n != '_' && onerror[n] instanceof Function)
                    onerror[n].call(this, res, resObj);
            }
            if(onerror._ instanceof Function)
            {
                onerror._.call(this, res, resObj);
            }
        }
    }

    /**
     * JSONRPC вызов
     * @param httpmethod
     * @param unit
     * @param method
     * @param data
     * @param onsuccess
     * @param onerror
     */
    this.rpcCall = function(httpmethod, unit, method, data, onsuccess, onerror) {
        var search = decodeURIComponent(window.location.search);
        var arrSearch = search.split(/[?&]/);
        var urlData = {};

        if (!data || typeof data !== 'object') {
            data = {};
        }

        for (var i = 0; i < arrSearch.length; i++) {
            var arrItem = arrSearch[i].split('=');

            if (!arrItem[0] || httpmethod === 'GET' && arrItem[0] in data) {
                continue;
            }
            urlData[arrItem[0]] = arrItem[1] || '';
        }

        D3Api.requestServer({
            url: 'rpc/' + unit + '/' + method,
            async: true,
            method: httpmethod,
            content_type: 'application/text+json',
            urlData: urlData,
            data: (httpmethod === 'POST') ? D3Api.JSONstringify(data) : data,
            onSuccess: this.closure(function (response) {
                try {
                    response = D3Api.JSONparse(response);
                    if (response.status === 'error') {
                        throw new Error(response.message);
                    }
                    if (typeof onsuccess === 'function') {
                        onsuccess.call(this, response.response);
                    }
                } catch(e) {
                    if (typeof onerror === 'function') {
                        onerror.call(this, e.message);
                    } else {
                        D3Api.alert_msg('ОШИБКА: ' + e.message);
                    }
                }
            }),
            onError: this.closure(function (response, reqObj) {
                if (typeof onerror === 'function') {
                    onerror.call(this, 'Сервер временно недоступен!');
                } else {
                    D3Api.alert_msg('ОШИБКА: Сервер временно недоступен!');
                }
            }),
            contextObj: this
        });
    };

    /**
     *
     * @param unit
     * @param method
     * @param data
     * @param onsuccess
     * @param onerror
     */
    this.rpcGet = function (unit, method, data, onsuccess, onerror) {
        this.rpcCall('GET', unit, method, data, onsuccess, onerror);
    };

    /**
     *
     * @param unit
     * @param method
     * @param data
     * @param onsuccess
     * @param onerror
     */
    this.rpcPost = function (unit, method, data, onsuccess, onerror) {
        this.rpcCall('POST', unit, method, data, onsuccess, onerror);
    };
    /**
     * Экспорт данных из DataSet
     * @param param
     * @param onsuccess
     * @param onerror
     */
    this.exportDataSetToExcel = function(param, onsuccess, onerror){
        var obj = {
            name: param['name'],
            repeatersRefresh: false
        }
        this.refreshDataSet(obj, function(res, obj){
            if((param['name'] in obj) && ('data' in obj[param['name']])){
                var _param = {
                    data: obj[param['name']].data,
                    Columns: param['Columns']
                }
                D3Api.exportDataToExcel({
                    data: obj[param['name']].data,
                    body: param['body'],
                    header: param['header'],
                    groups: param['groups'],
                    filename: param['filename'],
                    show_number: param['show_number'],
                    title: param['title'],
                    footer: param['footer']
                },onsuccess, onerror);
            }
        }, onerror);
    }
    /**
     * Экспорт данных
     * @param param
     * @param onsuccess
     * @param onerror
     */

    /**
     * Вызвать компонент DataSet
     * @param name
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     * @param details
     */
    this.refreshDataSet = function (name, onsuccess, onerror, sync, force, details) {
        var dsName = null
        var repeatersRefresh = true;
        if(typeof name == 'object'){
            dsName = name['name'];
            if('repeatersRefresh' in name){
                repeatersRefresh = name['repeatersRefresh'];
            }
        }else{
            dsName = name;
        }

        var ds = dataSets[dsName];
        if (!ds) {
            D3Api.debug_msg('DataSet с именем "' + dsName + '" не найден на форме "' + this.name + '"');
            return;
        }
        ds.refresh(onsuccess, onerror, sync, force, details, repeatersRefresh);
    }

    /**
     * Вызвать компонент DataSet по его типу
     * @param name
     * @param mode
     * @param data
     * @param onsuccess
     * @param onerror
     * @param sync
     */
    this.refreshDataSetByMode = function (name, mode, data, onsuccess, onerror, sync) {
        var ds = dataSets[name];
        if (!ds) {
            D3Api.debug_msg('DataSet с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        ds.refreshByMode(mode, data, onsuccess, onerror, sync);
    }
    /**
     * получить D3DataSet
     * @param name {string} - Имя DataSet
     * @returns {D3Api.D3DataSet}
     */
    this.getDataSet = function (name) {
        return dataSets[name];
    }

    /**
     * Получить клон
     * @param dom
     * @param repeaterName
     * @returns {null|{clone}|*}
     */
    this.getRepeater = function (name) {
        return repeaters[name];
    }

    /**
     * Вызвать компонент Module
     * @param name
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     */
    this.getClone = function (dom, repeaterName) {
        while (dom && dom.nodeName.toUpperCase() != 'HTML') {
            if (dom.clone && (!repeaterName || D3Api.getProperty(dom, 'repeatername') == repeaterName))
                return dom;
            dom = dom.parentNode;
        }
        return null;
    }

    /**
     * Вызвать компонент Module
     * @param name
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     */
    this.executeModule = function(name,onsuccess,onerror,sync,force){
        var mod = modules[name];
        if(!mod){
            D3Api.debug_msg('Module с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        mod.execute(onsuccess,onerror,sync,force)
    }

    /**
     * Вызвать компонент Action
     * @param name
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     */
    this.executeAction = function (name, onsuccess, onerror, sync, force) {
        var act = actions[name];
        if (!act) {
            D3Api.debug_msg('Action с именем "' + name + '" не найден на форме "' + this.name + '"');
            return;
        }
        act.execute(onsuccess, onerror, sync, force);
    }

    /**
     * Получить объект Экшен
     * @param name
     * @returns {D3Api.D3Action}
     */
    this.getAction = function (name) {
        return actions[name];
    }

    /**
     * Открыть форму
     * @param name
     * @param data
     * @param container
     * @returns {undefined}
     */
    this.openForm = function (name, data, container) {
        container = container || this.container.DOM;
        var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
        /*если окно открывается в модальном режиме*/
        if((data && String(data.modal_form)=='true')){
            /*и контейнера для модалки нет, то создаем его*/
            if(!open_modal_cont){
                var open_modal       = document.createElement("div"),
                    close_open_modal = document.createElement("div");
                open_modal.id               = 'open_modal';
                open_modal.style.cssText    = 'position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; display: none;background: #f9f9f9aa;z-index: 3;';
                close_open_modal.className  = 'close_open_modal fa-times fas';
                open_modal.appendChild(close_open_modal);
                open_modal_cont = D3Api.MainDom.appendChild(open_modal);
                close_open_modal.onclick = function() {
                    D3Api.close_modal_form();
                };
                D3Api.showDomBlock(open_modal_cont);
            }else if(!D3Api.showedDom(open_modal_cont)){
                /*если есть контейнер для модалки, то просто показываем его*/
                D3Api.showDomBlock(open_modal_cont);
            }
            container = open_modal_cont;
        }

        return D3Api.showForm(name, container, data, _GCF());
    }

    /**
     * Получить контекст формы
     * @returns {D3Api.D3Form}
     * @private
     */
    function _GCF() {
        return D3Api.GLOBAL_CONTEXT_FORM || MainForm;
    }

    /* Глобальные функции для использования внутри пространства скрипта формы */
    function getVar(name) {
        return _GCF().getVar(name);
    }

    function setVar(name, value) {
        return _GCF().setVar(name, value);
    }

    function getControlProperty(controlName, nameProperty) {
        return _GCF().getControlProperty(controlName, nameProperty);
    }

    function setControlProperty(controlName, nameProperty, value) {
        return _GCF().setControlProperty(controlName, nameProperty, value);
    }

    function addControlEvent(control, eventName, listener) {
        return _GCF().addControlEvent(control, eventName, listener)
    }

    function callControlEvent(control, eventName) {
        return _GCF().callControlEvent.apply(_GCF(), arguments);
    }

    function removeControlEvent(control, eventName, uniqid) {
        return _GCF().removeControlEvent(control, eventName, uniqid);
    }

    function removeControlEvents(control, eventName) {
        return _GCF().removeControlEvents(control, eventName);
    }

    function getValue(control) {
        return _GCF().getValue(control);
    }

    function setValue(control, value) {
        return _GCF().setValue(control, value);
    }

    function getCaption(control) {
        return _GCF().getCaption(control);
    }

    function setCaption(control, value) {
        return _GCF().setCaption(control, value);
    }

    function getEnabled(control) {
        return _GCF().getEnabled(control);
    }

    function setEnabled(control, value) {
        return _GCF().setEnabled(control, value);
    }

    function getVisible(control) {
        return _GCF().getVisible(control);
    }

    function setVisible() {
        var ctx = _GCF();

        return ctx.setVisible.apply(ctx, arguments);
    }

    function getControl(name) {
        return _GCF().getControl(name);
    }

    function controlExist(name) {
        return _GCF().controlExist(name);
    }

    function getDataSet(name) {
        return _GCF().getDataSet(name);
    }

    function getRepeater(name) {
        return _GCF().getRepeater(name);
    }

    function getClone(dom, repeaterName) {
        return _GCF().getClone(dom, repeaterName);
    }

    function getAction(name) {
        return _GCF().getAction(name);
    }

    function beginRequest() {
        return _GCF().beginRequest();
    }

    function endRequest(immediately, sync, onsuccess, onerror) {
        return _GCF().endRequest(immediately, sync, onsuccess, onerror);
    }

    function refreshDataSet(name, onsuccess, onerror, sync, force, details) {
        return _GCF().refreshDataSet(name, onsuccess, onerror, sync, force, details);
    }
    function exportDataSetToExcel(param, onsuccess, onerror){
        return _GCF().exportDataSetToExcel(param, onsuccess, onerror);
    }
    function exportDataToExcel(param, onsuccess, onerror){
        return _GCF().exportDataToExcel(param, onsuccess, onerror);
    }

    function refreshDataSetByMode(name, mode, data, onsuccess, onerror, sync) {
        return _GCF().refreshDataSetByMode(name, mode, data, onsuccess, onerror, sync);
    }

    function executeModule(name,onsuccess,onerror,sync,force){
        return _GCF().executeModule(name,onsuccess,onerror,sync,force)
    }
    function executeAction(name, onsuccess, onerror, sync, force) {
        return _GCF().executeAction(name, onsuccess, onerror, sync, force);
    }

    function rpcPost(unit,method,data,onsuccess,onerror) {
        return _GCF().rpcPost(unit,method,data,onsuccess,onerror);
    }

    function rpcGet(unit,method,data,onsuccess,onerror) {
        return _GCF().rpcGet(unit,method,data,onsuccess,onerror);
    }

    function openForm(name, data, container) {
        return _GCF().openForm(name, data, container);
    }

    function close() {
        return _GCF().close.apply(_GCF(), arguments);
    }

    function reload(closeBefore) {
        return _GCF().reload(closeBefore);
    }

    function closure(func) {
        return _GCF().closure.apply(_GCF(), arguments);
    }

    function closureContext(contextDom) {
        return _GCF().closureContext(contextDom);
    }

    function unClosureContext() {
        return _GCF().unClosureContext();
    }

    function empty(v) {
        return D3Api.empty(v);
    }

    function setFormCaption(caption) {
        return _GCF().setFormCaption(caption);
    }

    function setFormHint(hint) {
        return _GCF().setFormHint(hint);
    }

    function getFormCaption() {
        return _GCF().getFormCaption();
    }

    function callControlMethod(control, method) {
        return _GCF().callControlMethod.apply(_GCF(), arguments);
    }

    function controlAPI(control) {
        return _GCF().controlAPI(control);
    }

    function cancelActivateDataSet(ds) {
        var dts = ds.split(';');
        var ind = -1;
        for (var i = 0, c = dts.length; i < c; i++) {
            ind = activateDataSets.indexOf(dts[i]);
            if (ind >= 0)
                activateDataSets.splice(ind, 1);
        }
    }

    function notify(text, title, modal) {
        title = title || 'Сообщение';
        modal = (modal === undefined) ? false : modal;

        D3Api.notify(title, text, {modal: modal});
    }
    function showUserReport(code,primary,unit,vars,request)
    {
        return _GCF().showUserReport(code,primary,unit,vars,request);
    }
    /**********************************************************************/
    /**
     *
     * @param data
     * @param dom
     */
    this.showAfterCheck = function (data, dom) {
        if (data.newthread) {
            D3Api.threads[data.newthread].addForm(this);
            data.newthread = undefined;
            delete data.newthread;
        } else if (!data.notthread && dom == D3Api.MainDom && D3Api.MainDom.D3Container && D3Api.MainDom.D3Container.currentForm && D3Api.MainDom.D3Container.currentForm.D3Thread) {
            //Проверим если открывается в основном контейнере и если это нить, то добавляем форму в стек нити
            D3Api.MainDom.D3Container.currentForm.D3Thread.addForm(this);
        } else {
            //Надо сделать ссылку на нить, для замыкания событий
            var cCD = dom;
            while (cCD && cCD != D3Api.MainDom) {
                if (cCD.D3Container && cCD.D3Container.currentForm && cCD.D3Container.currentForm.D3Thread) {
                    this.D3Thread = cCD.D3Container.currentForm.D3Thread;
                    break;
                }
                if (cCD.D3Form && cCD.D3Form.D3Thread) {
                    this.D3Thread = cCD.D3Form.D3Thread;
                    break;
                }
                cCD = cCD.parentNode;
            }
        }
        if (data.oncreate) {
            if (data.oncreate instanceof Function) {
                var dataOnCreate = data.oncreate;
                this.addEvent('oncreate', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnCreate.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.oncreate instanceof Array) {
                for (var i = 0, ic = data.oncreate.length; i < ic; i++) {
                    if (data.oncreate[i] instanceof Function)
                        this.addEvent('oncreate', function (dataOnCreate) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnCreate.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.oncreate[i]));
                }
            }
            delete data['oncreate'];
        }
        if (data.onprepare) {
            if (data.onprepare instanceof Function) {
                var dataOnPrepare = data.onprepare;
                this.addEvent('onprepare', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnPrepare.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onprepare instanceof Array) {
                for (var i = 0, ic = data.onprepare.length; i < ic; i++) {
                    if (data.onprepare[i] instanceof Function)
                        this.addEvent('onprepare', function (dataOnPrepare) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnPrepare.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.onprepare[i]));
                }
            }
            delete data['onprepare'];
        }
        if (data.onshow) {
            if (data.onshow instanceof Function) {
                var dataOnShow = data.onshow;
                this.addEvent('onshow', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnShow.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onshow instanceof Array) {
                for (var i = 0, ic = data.onshow.length; i < ic; i++) {
                    if (data.onshow[i] instanceof Function)
                        this.addEvent('onshow', function (dataOnShow) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnShow.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.onshow[i]));
                }
            }
            delete data['onshow'];
        }
        if (data.onclose) {
            if (data.onclose instanceof Function) {
                var dataOnClose = data.onclose;
                var dataCC = data._currentContext_;
                var dataCF = data._contextForm_;
                this.addEvent('onclose', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = dataCF;
                    closureContext(dataCC);
                    try {
                        var res = dataOnClose.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    unClosureContext();
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onclose instanceof Array) {
                for (var i = 0, ic = data.onclose.length; i < ic; i++) {
                    if (data.onclose[i] instanceof Function)
                        this.addEvent('onclose', data.onclose[i]);
                }
            }
            delete data['onclose'];
        }
        if (data.onformactivate) {
            if (data.onformactivate instanceof Function) {
                var dataOnFormActivate = data.onformactivate;
                this.addEvent('onformactivate', function () {
                    var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                    D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                    try {
                        var res = dataOnFormActivate.apply(this, arguments);
                    } catch (e) {
                        D3Api.debug_msg(e);
                    }
                    D3Api.GLOBAL_CONTEXT_FORM = GCF;
                    return res;
                });
            }
            else if (data.onformactivate instanceof Array) {
                for (var i = 0, ic = data.onformactivate.length; i < ic; i++) {
                    if (data.onformactivate[i] instanceof Function)
                        this.addEvent('onformactivate', function (dataOnFormActivate) {
                            return function () {
                                var GCF = D3Api.GLOBAL_CONTEXT_FORM;
                                D3Api.GLOBAL_CONTEXT_FORM = MainForm;
                                try {
                                    var res = dataOnFormActivate.apply(this, arguments);
                                } catch (e) {
                                    D3Api.debug_msg(e);
                                }
                                D3Api.GLOBAL_CONTEXT_FORM = GCF;
                                return res;
                            }
                        }(data.onformactivate[i]));
                }
            }
            delete data['onformactivate'];
        }
        if (data.vars) {
            for (var v in data.vars) {
                if(!data.vars.hasOwnProperty(v)){
                    continue;
                }
                this.vars[v] = data.vars[v];
            }
        }
        if (data.icon) {
            D3Api.setProperty(this.DOM, 'icon', data.icon);
        }
        if (data.caption) {
            D3Api.setProperty(this.DOM, 'caption', data.caption);
        }
        if (data.modal) {
            _modalBorders_.top = document.createElement('DIV');
            _modalBorders_.right = document.createElement('DIV');
            _modalBorders_.bottom = document.createElement('DIV');
            _modalBorders_.left = document.createElement('DIV');

            D3Api.addClass(_modalBorders_.top, 'formModalBorder');
            D3Api.addClass(_modalBorders_.right, 'formModalBorder');
            D3Api.addClass(_modalBorders_.bottom, 'formModalBorder');
            D3Api.addClass(_modalBorders_.left, 'formModalBorder');

            D3Api.addDom(document.body, _modalBorders_.top);
            D3Api.addDom(document.body, _modalBorders_.right);
            D3Api.addDom(document.body, _modalBorders_.bottom);
            D3Api.addDom(document.body, _modalBorders_.left);
        }
        this.formData = data;

        this.formStyles = D3Api.getAllDomBy(this.DOM, 'style');

        //Нет форм
        if (!dom.D3Container) {
            dom.D3Container = new D3Api.D3Container(dom);
            dom.D3Container.lastForm = this;
        }
        if (dom.D3Container.currentForm) {
            if (dom.D3Container.currentForm.rightForm) {
                var rF = dom.D3Container.currentForm.rightForm;
                var tmp = null;
                while (rF && dom.D3Container.currentForm.D3Thread == rF.D3Thread) {
                    tmp = rF;
                    if (rF.rightForm)
                        rF = rF.rightForm;
                    else
                        rF = null;
                    if (!tmp.destroyed)
                        tmp.destructor();
                }
            }
            this.leftForm = dom.D3Container.currentForm;
            dom.D3Container.currentForm.rightForm = this;
            dom.D3Container.countForm++;
            dom.D3Container.lastActiveForm = dom.D3Container.currentForm;
            RemoveFormFromCont.call(dom.D3Container.currentForm, dom, dom.D3Container.currentForm.DOM);
        }
        this.container = dom.D3Container;
        this.addHistory();

        dom.D3Container.setCurrentForm(this);
        InsertFormToCont.call(this, dom);

        this.isShowed = true;

        this.loadParams(this.onCreateForm);
    };
    /**
     * Показать форму
     * @param data
     * @param dom
     */
    this.show = function (data, dom) {
        if (this.isShowed) {
            D3Api.debug_msg('Форма уже показана');
            return;
        }

        this.formCheckPrivs = D3Api.getProperty(this.DOM, 'check_privs') == 'true' ? true : false;
        this.formCheckCreated = D3Api.getProperty(this.DOM, 'check_created') == 'true' ? true : false;
        this.formSkipRefresh = D3Api.getProperty(this.DOM, 'skip_refresh') == 'true' ? true : false;

        this.formUnit = D3Api.getProperty(this.DOM, 'unit');
        this.formPrimary = D3Api.getProperty(this.DOM, 'primary', 'PRIMARY');
        var subunits = D3Api.getProperty(this.DOM, 'subunits'); // в формате unit:pid:id, где pid - имя поля с FK основного раздела, id - имя PRIMARY поля в дочернем разделе

        /* находим ID основного раздела по записи detail раздела */
        if (this.formUnit && subunits && data.request && data.request.unit && data.request.unit != this.formUnit){
            var subunit = null; // подраздел
            subunits = subunits.split(';');
            // ищем в атрибуте правило для соответствующего подраздела
            subunits.forEach(function (item) {
                if (item.split(':')[0] == data.request.unit) subunit = item;
            });

            var req = {
                getMainUnit: {type: 'Form', params: {
                    id: D3Api.getValueInObj(this.formPrimary, data.vars),
                    subunit: subunit
                }}
            };

            D3Api.requestServer({
                url: 'request.php',
                method: 'POST',
                urlData:{action: 'main_unit'},
                data: {request: D3Api.JSONstringify(req)},
                contextObj:this,
                onSuccess: function(r) {
                    var result = JSON.parse(r);
                    if (!data.vars) data.vars = {};
                    if (result.unit_PRIMARY) data.vars['UNIT_PRIMARY'] = result.unit_PRIMARY;
                    if (result.subunit_PRIMARY) data.vars[data.request.unit+'_PRIMARY'] = result.subunit_PRIMARY;

                    this.showAfterCheck(data, dom);
                }
            });
        }
        else{
            this.showAfterCheck(data, dom);
        }
    };

    /**
     * Эвенты при открытии формы
     */
    this.onCreateForm = function () {
        if (scriptsLoad > 0) {
            setTimeout(function () {
                MainForm.onCreateForm();
            }, 100);
            return;
        }

        this.callEvent('oninit');
        this.callEvent('onprepare', this);
        this.callEvent('oncreate', this);
        this.beginRequest();
        for (var i = 0, c = activateDataSets.length; i < c; i++) {
            this.refreshDataSet(activateDataSets[i],null,null,false,null,false);
        }
        //Загрузить параметры формы
        //executeAction();
        activateDataSets = null;
        this.endRequest(true, false, this.onShowForm, this.onShowForm);
        if(this.destroyed === true){
            /* форму закрыли */
            return;
        }
        //проверяем наличии блока вкладок, запускаем отрисовку только если он есть
        if(this.container.DOM.D3ThreadsTabs && D3Api.MainDom.D3Container && D3Api.MainDom.D3Container.currentForm == this){
            this.container.DOM.D3ThreadsTabs._refresh(this);
        }
    };

    /**
     * Эвенты при показе формы.
     */
    this.onShowForm = function () {
        /* дожидаемся завершения работы пользовательского onCreate (опционально) */
        if (this.formCheckCreated && !this.isCreated){
            setTimeout(function () {
                if (MainForm) MainForm.onShowForm();
            }, 100);
            return;
        }

        resizeForm(this.DOM);
        //поставить фокус на первый контрол
        var focussableElements = 'input:not([disabled])';
        var focussable = this.DOM.querySelectorAll(focussableElements);
        if(focussable && focussable.length > 0)
        {
            var inp = focussable[0];
            inp.focus();
        }

        var dom = this;
        /* D3Api.D3Form.onRefreshForm - кастомная для каждого проекта функция,
        * выполняющая обязательные действия для всех форм (например, проверку прав)
        * Объявляется в Extensions/[МОДУЛЬ]/System/js/common.js */
        if (!this.formSkipRefresh && D3Api.D3Form.onRefreshForm)
            D3Api.D3Form.onRefreshForm(dom, function(){
                dom.callEvent('onshow', dom);
            });
        else
            dom.callEvent('onshow', dom);
    };

    function InsertFormToCont(contDOM, FormDOM) {
        FormDOM = FormDOM || this.DOM;
        if (FormDOM.parentNode != contDOM) {
            if (contDOM.firstChild)
                D3Api.insertBeforeDom(contDOM.firstChild, FormDOM);
            else
                D3Api.addDom(contDOM, FormDOM);
        } else
            D3Api.showDomBlock(FormDOM);

        D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', true);
        D3Api.MainDom.D3FormHelp && D3Api.MainDom.D3FormHelp._show(this);
        if (_modalBorders_.top) {
            D3Api.setDomDisplayDefault(_modalBorders_.top);
            D3Api.setDomDisplayDefault(_modalBorders_.right);
            D3Api.setDomDisplayDefault(_modalBorders_.bottom);
            D3Api.setDomDisplayDefault(_modalBorders_.left);
        }

        this.isActive = true;

        for (var i = 0, c = this.formStyles.length; i < c; i++) {
            D3Api.addDom(FormDOM, this.formStyles[i]);
        }
        //if(this.isShowed)
        resizeForm(FormDOM);

        var chforms = D3Api.getAllDomBy(FormDOM, '[formname]');
        for (var i = 0, c = chforms.length; i < c; i++) {
            if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && chforms[i].D3Form.isActive) {
                chforms[i].D3Form.parentFormShow();
            }
        }

        for (var i = 0, c = this.scrollDoms.length; i < c; i++) {
            if (this.scrollDoms[i].top > 0) {
                this.scrollDoms[i].dom.scrollTop = this.scrollDoms[i].top;
            }
            if (this.scrollDoms[i].left > 0) {
                this.scrollDoms[i].dom.scrollLeft = this.scrollDoms[i].left;
            }
        }
        this.scrollDoms = [];
        /*if (D3Api.getProperty(FormDOM, 'effects', false))
         {
         $(FormDOM).hide();
         setTimeout(function(){$(FormDOM).show('slide',{duration: 200, direction: 'left'});},200);
         }*/
        this.setFormCaption();

        this.callEvent('onform_dominsert', FormDOM);
    }
    function clearSelection()
    {
        if (window.getSelection) {
            var selection = window.getSelection();

            if (selection.rangeCount > 0 && selection.getRangeAt(0).getClientRects().length > 0) {
                selection.removeAllRanges();
            }
        } else { // старый IE
            document.selection.empty();
        }
    }

    function RemoveFormFromCont(contDOM, FormDOM) {
        clearSelection();
        this.saveParams(true);
        var chforms = D3Api.getAllDomBy(this.DOM, '[formname]');
        for (var i = 0, c = chforms.length; i < c; i++) {
            if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && chforms[i].D3Form.isActive) {
                chforms[i].D3Form.saveParams(true);
                chforms[i].D3Form.parentFormHide();
            }
        }
        this.hideFormCaption();
        FormDOM = FormDOM || this.DOM;
        contDOM = contDOM || FormDOM.parentNode;

        var scR = D3Api.getAllDomBy(FormDOM, '[scrollable]');
        this.scrollDoms = [];
        for (var i = 0, c = scR.length; i < c; i++) {
            if (scR[i].scrollTop > 0 || scR[i].scrollLeft > 0) {
                this.scrollDoms.push({
                    dom: scR[i],
                    top: scR[i].scrollTop,
                    left: scR[i].scrollLeft
                });
            }
        }
        if (FormDOM.scrollTop > 0 || FormDOM.scrollLeft > 0) {
            this.scrollDoms.push({
                dom: FormDOM,
                top: FormDOM.scrollTop,
                left: FormDOM.scrollLeft
            });
        }
        /*if (D3Api.getProperty(FormDOM, 'effects', false))
         {
         $(FormDOM).hide('slide',{duration: 200, direction: 'right'},function(){contDOM.removeChild(FormDOM)});
         }else*/
        if (_modalBorders_.top) {
            D3Api.hideDom(_modalBorders_.top);
            D3Api.hideDom(_modalBorders_.right);
            D3Api.hideDom(_modalBorders_.bottom);
            D3Api.hideDom(_modalBorders_.left);
        }
        if (D3Api.BROWSER.msie && D3Api.BROWSER.versionMajor < 9) {
            D3Api.removeDom(FormDOM);
        } else
            D3Api.hideDom(FormDOM);
        this.isActive = false;
        for (var i = 0, c = this.formStyles.length; i < c; i++) {
            D3Api.removeDom(this.formStyles[i]);
        }
        //contDOM.removeChild(FormDOM);
        this.callEvent('onform_domremove', FormDOM);
    }

    /**
     * Показать родитеслькую форму
     */
    this.parentFormShow = function () {
        if (_modalBorders_.top) {
            D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', false);
            D3Api.MainDom.D3FormHelp && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormHelp, 'visible', false);
            D3Api.setDomDisplayDefault(_modalBorders_.top);
            D3Api.setDomDisplayDefault(_modalBorders_.right);
            D3Api.setDomDisplayDefault(_modalBorders_.bottom);
            D3Api.setDomDisplayDefault(_modalBorders_.left);
        }
        resizeForm(this.DOM);
    }
    /**
     * скрыть родитескую форму
     */
    this.parentFormHide = function () {
        if (_modalBorders_.top) {
            D3Api.hideDom(_modalBorders_.top);
            D3Api.hideDom(_modalBorders_.right);
            D3Api.hideDom(_modalBorders_.bottom);
            D3Api.hideDom(_modalBorders_.left);
        }
    }
    /**
     * Добавить в историю
     */
    this.addHistory = function () {
        var addHist = true;
        if (Form._pushHistory_ instanceof Function) {
            addHist = Form._pushHistory_(this.container);
        }
        if (addHist && this.formData.history !== false) {
            D3Api.globalClientData.set('history_state', D3Api.JSONstringify({form: this.name, data: this.formData}, true, /^_.+_$/));
            //window.history.pushState(D3Api.JSONstringify({form: this.name, data: this.formData},true),'');
        }
    }

    /**
     * Активировать форму
     */
    this.activate = function () {
        if (this.destroyed)
        {
            D3Api.debug_msg('Попытка активировать не существующую форму.');
            return;
        }
        if (this.container.currentForm == this)
            return;
        if (this.container.currentForm) {
            this.container.lastActiveForm = this.container.currentForm;
            RemoveFormFromCont.call(this.container.currentForm, this.container.DOM, this.container.currentForm.DOM);
        }
        this.container.setCurrentForm(this);
        this.addHistory();
        InsertFormToCont.call(this, this.container.DOM);
        this.callEvent('onformactivate', this);
        var chforms = D3Api.getAllDomBy(this.DOM, '[formname]');
        for (var i = 0, c = chforms.length; i < c; i++) {
            if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && !chforms[i].D3Form.destroyed)
                chforms[i].D3Form.callEvent('onformactivate', chforms[i].D3Form);
        }
    }
    /**
     * удалить все из формы.
     * @param destroyOnly
     */
    this.destructor = function (destroyOnly) {
        if (this.isActive) {
            this.saveParams(true);
            //TODO: Закрыть все соединения с сервером
            //requests.abort();

            if (!destroyOnly) {
                if (this.container.currentForm == this) {
                    this.setFormCaption('');
                    this.container.setCurrentForm(null);
                    var lF = this.leftForm;
                    while (lF && lF.destroyed) {
                        lF = lF.leftForm;
                    }
                    if (lF) {
                        lF.activate();
                        lF.rightForm = null;
                    }
                } else if (this.container.lastForm == this) {
                    this.rightForm.leftForm = null;
                    this.container.lastForm = this.rightForm;
                } else if (this.leftForm && this.rightForm) // В середине очереди
                    this.leftForm.rightForm = this.rightForm;

                if (this.container.lastActiveForm == this) {
                    this.container.lastActiveForm = null;
                }

                this.container.countForm--;
                if (this.container.countForm <= 0) {
                    this.container.setCurrentForm(null);
                    this.container.lastForm = null;
                    if (this.container.DOM != D3Api.MainDom) {
                        this.container.DOM.D3Container = null;
                        delete this.container.DOM.D3Container;
                    }
                }
            }
        }
        D3Api.Base.removeEvent('onResize', resizeEventUid);
        D3Api.MainDom.D3FormCloseCtrl && D3Api.setControlPropertyByDom(D3Api.MainDom.D3FormCloseCtrl, 'visible', true);
        D3Api.MainDom.D3FormHelp && D3Api.MainDom.D3FormHelp._show(this);
        if (_modalBorders_.top) {
            D3Api.removeDom(_modalBorders_.top);
            D3Api.removeDom(_modalBorders_.right);
            D3Api.removeDom(_modalBorders_.bottom);
            D3Api.removeDom(_modalBorders_.left);
            _modalBorders_.top = null;
            _modalBorders_.right = null;
            _modalBorders_.bottom = null;
            _modalBorders_.left = null;
            _modalBorders_ = null;
        }
        if (this.D3Thread) {
            this.D3Thread.removeForm(this);
        }
        Form = null;
        MainForm = null;
        for (var rep in repeaters) {
            if(!repeaters.hasOwnProperty(rep)){
                continue;
            }
            repeaters[rep].destructor();
        }
        repeaters = null;
        for (var ds in dataSets) {
            if(!dataSets.hasOwnProperty(ds)){
                continue;
            }
            dataSets[ds].destructor();
        }
        dataSets = null;
        for (var act in actions) {
            if(!actions.hasOwnProperty(act)){
                continue;
            }
            actions[act].destructor();
        }
        for (var mod in modules){
            if(!modules.hasOwnProperty(mod)){
                continue;
            }
            modules[mod].destructor();
        }
        modules = null;
        this.isActive = false;
        this.formParams = null;
        this.formParamsHash = null;
        this.formParamsSettings = null;
        formParamsHash = null;
        actions = null;
        sysinfo = null;
        D3Api.removeDom(this.DOM);
        if (!destroyOnly) {
            var chforms = D3Api.getAllDomBy(this.DOM, '[formname]');
            for (var i = 0, c = chforms.length; i < c; i++) {
                if (chforms[i].D3Form && chforms[i].D3Form.formUid != this.formUid && !chforms[i].D3Form.destroyed)
                    chforms[i].D3Form.destructor(true);
            }
        }
        this.callEvent('onform_destroy', this.DOM);
        this.DOM.D3Form = null;
        this.DOM = null;
        this.D3Thread = null;

        delete this.D3Thread;
        delete this.container;
        delete this.DOM;
        //delete this.leftForm;
        delete this.rightForm;
        delete this.currentContext;

        delete this.formData;
        delete this.events;
        delete this.vars;
        this.destructorBase();
    };
    /**
     * закрытие формы
     * @param result
     */
    this.close = function (result,_func) {
        if(this.destroyed === true){
            return;
        }
        this.destroyed = true;
        if(this.callEvent('onbeforeclose', (arguments.length)?result:Form._onCloseResult_) === false)
        {
            this.destroyed = false;
            return;
        }
        //В событии могут закрыть родительскую форму, чтобы небыло цикла destroyed = true
        if(this.callEvent('onclose', (arguments.length)?result:Form._onCloseResult_) === false)
        {
            this.destroyed = false;
            return;
        }
        /* удаление сессионого кэша */
        //setVar('formCache', this.formCache);
        //CacheSessDelete.execute(function(){
        //    if(typeof _func == "function"){
        //        _func();
        //    }
        //});
        //clearSelection();
        /*если показано модальное окно - работаем только с ним и его содержимым*/
        var open_modal_cont = D3Api.getDomBy(D3Api.D3MainContainer, 'div[id="open_modal"]');
        if(open_modal_cont && D3Api.showedDom(open_modal_cont) && open_modal_cont.childNodes.length >1 && open_modal_cont.childNodes[0].D3Form){
            if(this.container && this.container.DOM){
                if(!this.container.DOM.D3Form || this.container.DOM.D3Form != open_modal_cont.childNodes[0].D3Form){
                    if(this.container.DOM && this.container.DOM == open_modal_cont){
                        this.destructor();
                    }else{
                        open_modal_cont.childNodes[0].D3Form.destructor();
                        if(Array.from(open_modal_cont.childNodes).indexOf(this)==-1){
                            this.destroyed = false;
                        }
                    }
                }else{
                    this.destructor();
                }
            }
        }else{
            this.destructor();
        }
        /*если есть такой контейнер и он на данный момент не скрыт и модально открыто не больше 1 формы*/
        if(open_modal_cont && D3Api.showedDom(open_modal_cont) && open_modal_cont.childNodes.length <=1 ){
            /*то прячем этот контейнер*/
            D3Api.hideDom(open_modal_cont);
        }
    };
    /**
     * Добавление контрола
     * @param controls
     * @param dom
     */
    this.addInControls = function (controls, dom) {
        var d = D3Api.getProperty(dom, 'data');
        if (!d)
            return;
        var dfields = {};
        var p = d.split(';');
        for (var i = 0, c = p.length; i < c; i++) {
            var f = p[i].split(':');
            if (f.length > 1)
                dfields[f[0]] = f[1];
        }
        if (i > 0)
            controls.push({control: dom, datafields: dfields});
    };

    /**
     * установка данных в контролы
     * @param controls
     * @param data
     * @param DOM
     * @param resultData
     * @returns {{}}
     */
    this.setControlsData = function (controls, data, DOM, resultData) {
        var resData = {}, ctrls, firstProp;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];
            firstProp = true;
            for (var prop  in ctrl.datafields) {
                if(!ctrl.datafields.hasOwnProperty(prop)){
                    continue;
                }
                var v = data[ctrl.datafields[prop]];
                /* if (v !== undefined || resultData) { */
                if (firstProp) {
                    if (DOM.id == ctrl.control.id && D3Api.getProperty(DOM,'isrepeat',false) === false)
                        ctrls = [DOM];
                    else
                        ctrls = DOM.querySelectorAll('#' + ctrl.control.id+':not([isrepeat])');
                }
                for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                    /* if (v !== undefined) */
                    this.setControlProperty(ctrls[ci], prop, v);
                    if (resultData) {
                        var name = this.getControlProperty(ctrls[ci], 'name');
                        resData[name + '_' + prop] = this.getControlProperty(ctrls[ci], prop);
                    }
                }
                firstProp = false;
                /* } */
            }
        }
        return resData;
    };

    /**
     * получение данных из контрола.
     * @param controls
     * @param DOM
     * @returns {{}}
     */
    this.getControlsData = function (controls, DOM) {
        var data = {}, ctrls, firstProp;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];
            firstProp = true;
            for (var prop  in ctrl.datafields) {
                if(!ctrl.datafields.hasOwnProperty(prop)){
                    continue;
                }
                if (firstProp) {
                    if (DOM.id == ctrl.control.id || DOM.id == ctrl.control.id + 'clone')
                        ctrls = [DOM];
                    else
                        ctrls = DOM.querySelectorAll('#' + ctrl.control.id);
                }
                for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                    var name = this.getControlProperty(ctrls[ci], 'name');
                    data[name + '_' + prop] = this.getControlProperty(ctrls[ci], prop);
                }
                firstProp = false;
            }
        }
        return data;
    };

    /**
     *
     * @param controls
     * @param DOM
     */
    this.startWaitControls = function (controls, DOM) {
        var ctrls;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];

            if (DOM.id == ctrl.control.id)
                ctrls = [DOM];
            else
                ctrls = DOM.querySelectorAll('#' + ctrl.control.id);
            for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                D3Api.BaseCtrl.callMethod(ctrls[ci], 'startWait');
            }
        }
    };
    //Вынес отдельно так как лишние итерации при клонировании
    /**
     *
     * @param controls
     * @param DOM
     */
    this.stopWaitControls = function (controls, DOM) {
        var ctrls;
        DOM = DOM || this.DOM;
        for (var i = 0, c = controls.length; i < c; i++) {
            var ctrl = controls[i];

            if (DOM.id == ctrl.control.id)
                ctrls = [DOM];
            else
                ctrls = DOM.querySelectorAll('#' + ctrl.control.id);
            for (var ci = 0, cc = ctrls.length; ci < cc; ci++) {
                D3Api.BaseCtrl.callMethod(ctrls[ci], 'stopWait');
            }
        }
    };
    function createAction(name) {
        if (!actions[name]) {
            actions[name] = new D3Api.D3Action(_GCF(), name);
            actions[name].sysinfo = new postObject();
        }
        return actions[name];
    }

    function createModule(name) {
        if(!modules[name]){
            modules[name] = new D3Api.D3Module(_GCF(), name);
            modules[name].sysinfo = new postObject();
        }
        return modules[name];
    }
    this.createModule = createModule;
    /**
     *
     * @param cmptype
     * @param name
     * @returns {undefined|*}
     */
    this.getParamsByName = function (cmptype, name) {
        if (!this.withParams())
            return undefined;
        this.formParams = this.formParams || {};
        if (!this.formParams[cmptype] || !this.formParams[cmptype][name]) {
            if (!this.formParams[cmptype] || Array.isArray(this.formParams[cmptype])) {
                this.formParams[cmptype] = {};
            }
            if (D3Api.controlsApi[cmptype] && D3Api.controlsApi[cmptype]._API_ && D3Api.controlsApi[cmptype]._API_._getDefaultParams) {
                this.formParams[cmptype][name] = D3Api.controlsApi[cmptype]._API_._getDefaultParams() || {};
            } else {
                this.formParams[cmptype][name] = {};
            }
        }
        return this.formParams[cmptype][name];
    };

    /**
     *
     * @param cmptype
     * @param name
     * @param params
     */
    this.setParamsByName = function (cmptype, name, params) {
        if (!this.withParams())
            return;
        this.formParams = this.formParams || {};
        this.formParams[cmptype] = this.formParams[cmptype] || {};
        this.formParams[cmptype][name] = params;
    };

    /**
     *
     * @param name
     * @returns {undefined|*}
     */
    this.getGlobalParamsByName = function (name) {
        if (!this.withParams())
            return undefined;
        this.formParams = this.formParams || {};
        return this.formParams[name];
    };

    /**
     *
     * @param name
     * @param params
     */
    this.setGlobalParamsByName = function (name, params) {
        if (!this.withParams())
            return;
        this.formParams = this.formParams || {};
        this.formParams[name] = params;
    };

    /**
     *
     * @param onload
     */
    this.loadParams = function (onload) {
        if (this.withParams()) {
            setVar('ps_form', this.getFormParamsHash());
            getParamsAction.execute(function () {
                setVar('ps_form');
                formParamsHash = getVar('ps_params');
                this.formParams = D3Api.JSONparse(formParamsHash);
                setVar('ps_params');
                if (onload instanceof Function)
                    onload.call(MainForm);
            });
        }
        else
            onload.call(this);

    };

    /**
     *
     * @returns {*|boolean}
     */
    this.withParams = function () {
        return (Form._withParams_ !== undefined && Form._withParams_) || (Form._withParams_ === undefined && this.formParamsSettings['withparams']);
    };
    var _sPTimer = null;

    /**
     *
     * @param force
     * @returns {boolean}
     */
    this.saveParams = function (force) {
        if (this.withParams()) {
            if (_sPTimer) {
                clearTimeout(_sPTimer);
                _sPTimer = null;
            }
            if (!force) {
                _sPTimer = setTimeout(function () {
                    MainForm.saveParams(true)
                }, 1000);
                return true;
            }
            var nFP = D3Api.JSONstringify(this.formParams)
            if (this.formParams && formParamsHash != nFP) {
                setVar('ps_form', this.getFormParamsHash());
                setVar('ps_params', nFP);
                formParamsHash = nFP;
                setParamsAction.execute();
            }
        }
    };
    /**ы
     *
     * @returns {string}
     */
    this.getFormParamsHash = function () {
        var form_hash = this.name;
        for (var i = 0, c = this.formParamsHash.length; i < c; i++) {
            form_hash += ':' + this.formData.request[this.formParamsHash[i]];
        }
        return form_hash;
    };
    this.parse(fDOM);
    fDOM = null;
};

/**
 * @class
 * @param name
 * @constructor
 */
D3Api.D3ThreadForms = function (name) {
    D3Api.D3Base.call(this);
    var threadForms = [];

    /**
     *
     * @returns {*}
     */
    this.getName = function () {
        return name;
    }

    /**
     *
     * @param newName
     */
    this.rename = function (newName) {
        name = newName;
        D3Api.Base.callEvent('onThreadFormsRename', this, name, newName);
    }

    /**
     *
     * @param form
     */
    this.addForm = function (form) {
        threadForms.push(form);
        form.D3Thread = this;
    }

    /**
     *
     * @returns {*}
     */
    this.getRootForm = function () {
        return threadForms[0];
    }

    /**
     *
     * @returns {*}
     */
    this.getStepForm = function () {
        return threadForms[threadForms.length - 1];
    }

    /**
     *
     * @returns {string|*|boolean|undefined}
     */
    this.getThreadCaption = function () {
        var rf = this.getRootForm();
        if (!rf)
            return false;
        if (rf.existsFunction('threadCaption')) {
            return rf.callFunction('threadCaption');
        }
        if (D3Api.hasProperty(rf.DOM, 'thread_caption'))
            return D3Api.getProperty(rf.DOM, 'thread_caption');

        return rf.getFormCaption();
    }

    /**
     *
     * @returns {string|*|boolean|undefined}
     */
    this.getThreadStepCaption = function () {
        var sf = this.getStepForm();
        if (!sf)
            return false;
        if (sf.existsFunction('threadStepCaption')) {
            return rf.callFunction('threadStepCaption');
        }
        if (D3Api.hasProperty(sf.DOM, 'thread_step_caption'))
            return D3Api.getProperty(sf.DOM, 'thread_step_caption');

        return sf.getFormCaption();
    }

    /**
     *
     * @param form
     */
    this.removeForm = function (form) {
        var ind = threadForms.indexOf(form);
        if (ind >= 0)
            threadForms.splice(ind, 1);
        if (threadForms.length <= 0) {
            this.close();
        }
    }

    /**
     *
     */
    this.activate = function () {
        var c = threadForms.length;
        if (c > 0)
            threadForms[c - 1].activate();
        else {
            this.close();
            return;
        }
        D3Api.Base.callEvent('onThreadFormsActivate', this, name);
    }

    /**
     *
     */
    this.close = function () {
        for (var i = threadForms.length - 1; i > -1; i--)
            threadForms[i].destructor();

        //Нить закрыть
        this.destructorBase();
        D3Api.threads[name] = undefined;
        delete D3Api.threads[name];

        var it = name.indexOf('.thread:');
        if (it > 0) {
            name = name.substr(0, it);
        }
        if (D3Api.threads[name])
            return;
        //Проверим есть ли еще нити с таким именем
        if(!D3Api.MainDom.D3ThreadsTabs){
            for (var nt in D3Api.threads) {
                if(!D3Api.threads.hasOwnProperty(nt)){
                    continue;
                }
                if(nt.indexOf(name + '.thread:') === 0){
                    D3Api.threads[name] = D3Api.threads[nt];
                    D3Api.threads[name].rename(name);
                    delete D3Api.threads[nt];
                    break;
                }
            }
        }
        D3Api.Base.callEvent('onThreadFormsClose', this, name);
    }
    D3Api.Base.callEvent('onThreadFormsCreate', this, name);
};

/**
 *
 * @class
 * @param dom{Object}
 */
D3Api.D3Container = function (dom) {
    D3Api.D3Base.call(this);
    this.countForm = 1;
    this.currentForm = null;
    this.lastActiveForm = null;
    this.lastForm = null;
    this.DOM = dom;

    /**
     *
     * @param form
     */
    this.setCurrentForm = function (form) {
        this.callEvent('onChangeCurrentForm', this.currentForm, form);
        this.currentForm = form;
        if(this.countForm == 1)
        {
            this.lastForm = form;
        }
    }

    /**
     *
     */
    this.destructor = function () {
        this.destructorBase();
    }
};

/**
 * @description Выполнить DataSet-ы
 * @example
 * D3Api.RefreshDataSets()
 * @param form {D3Api.D3Form} - Экземпляр класса D3Form
 * @param dataSets {string} - список имен датасетов через ;
 * @param value
 */
D3Api.RefreshDataSets = function (form, dataSets, value) {
    form.beginRequest();
    var ds = dataSets.split(';');
    for (var i = 0, c = ds.length; i < c; i++) {
        if (value != undefined)
            form.setVar(ds[i] + '_parent', value);
        form.refreshDataSet(ds[i]);
    }
    form.endRequest();
};
/**
 * @description Cоответствие двух элементов.
 * @param {Array|Object|Number|String|Boolean} - 1-ый элемент
 * @param {Array|Object|Number|String|Boolean} - 2-ой элемент
 * @return {Boolean} результат соответствие
 **/
D3Api.Equals = function(_obj1, _obj2){
    function equals_obj(obj1, obj2){
        var isEqual = true;
        if(Object.keys(obj1).length != Object.keys(obj2).length){
            return false;
        }
        for(var l in obj1){
            if(obj1.hasOwnProperty(l)){
                if(isEqual == true){
                    if(obj2[l] instanceof Array && obj1[l] instanceof Array){
                        isEqual = equals_arr(obj1[l],obj2[l]);
                    } else if(obj2[l] instanceof Object && obj1[l] instanceof Object){
                        isEqual = equals_obj(obj1[l],obj2[l]);
                    }else{
                        isEqual = obj1[l] == obj2[l];
                    }
                }else{
                    return isEqual;
                }
            }
        }
        return isEqual;
    }
    function equals_arr(obj1, obj2){
        var isEqual = true;
        if(obj1.length != obj2.length){
            return false;
        }
        for(var i = 0,len = obj2.length ; i < len ; i++){
            if(isEqual == true){
                if (obj1[i] instanceof Array && obj2[i] instanceof Array) {
                    isEqual =  equals_arr(obj1[i],obj2[i]);
                }else if (obj1[i] instanceof Object && obj2[i] instanceof Object){
                    isEqual = equals_obj(obj1[i],obj2[i]);
                }else{
                    isEqual = obj1[i] == obj2[i];
                }
            }else{
                return isEqual;
            }
        }
        return isEqual;
    }
    if(Array.isArray(_obj1) && Array.isArray(_obj2)){
        return equals_arr(_obj1,_obj2);
    }else if(_obj1 instanceof Object && _obj2 instanceof Object){
        return equals_obj(_obj1,_obj2);
    }else{
        return _obj1 == _obj2;
    }
};
/**
 * @description разбивает объект или массив на несколько подмассивов
 * @param {Array|Object}
 * @param {number}
 * @return {Array|Object}
 **/
D3Api.DataChunk = function(_data,_size){
    if(Array.isArray(_data)){
        if(!_size){
            _size = _data.length;
        }
        var res = _data.reduce(function(p, c){
            if(p[p.length-1].length == _size){
                p.push([]);
            }

            p[p.length-1].push(c);
            return p
        },[[]]);
        return res;
    }else if(_data instanceof Object){
        var arr = [{}];
        var indx = 0;
        for(var i in _data){
            if(_data.hasOwnProperty(i)){
                if(_size && indx >= _size){
                    indx = 0;
                    arr.push({});
                }
                arr[arr.length - 1][i] = _data[i];
                ++indx;
            }
        }
        return arr;
    }else{
        D3Api.debug_msg('DataChunk принимает только массив или объект');
    }
};
D3Api.Office = {
    Spreadsheet:{},
    WordProcessing:{}
};
/**
 * связываем оригинальный дом с копией
 * @param _originSource оригинал
 * @param _isDisplayNoneRemove не делать ли копию невидимых элементов
 */
D3Api.createClone = function (_param) {
    var _originSource = null;
    var _isDisplayNoneRemove = null;
    var _sync = false;

    if('originSource' in _param){
        _originSource = _param['originSource'];
    }
    if('isDisplayNoneRemove' in _param){
        _isDisplayNoneRemove = _param['isDisplayNoneRemove'];
    }
    if('sync' in _param){
        _sync = _param['sync'];
    }

    var asyncCalls = {};
    var asyncImage = {};
    var asyncCallBack = {};
    var asyncCallBackCancel = {};
    function convertCanvas(_origin, _clone, _callback){
        var uid = D3Api.getUniqId('uid_call');
        var ctx = _clone.getContext("2d");
        asyncCalls[uid] = _clone;
        asyncCallBack[uid] = _callback;
        try{
            _origin.toBlob(function(blob) {
                var newImg = document.createElement('img');
                _clone.parentNode.insertBefore(newImg,_clone);
                initLink(_origin, newImg);
                convertBlobToBase64(blob,_origin,newImg,function(){
                    delete asyncCalls[uid];
                    if(_callback){
                        _callback(uid);
                    }
                    delete asyncCallBack[uid];
                });
                _clone.remove();
            })
        }catch (e){
            delete asyncCalls[uid];
            delete asyncCallBack[uid];
        }
    }
    function convertBlobSrcToBase64(_src,_origin, _clone, _callback){
        var uid = D3Api.getUniqId('uid_call');
        asyncCalls[uid] = _clone;
        asyncCallBack[uid] = _callback;
        var xhr = new XMLHttpRequest();
        xhr.open('GET', _src, true);
        xhr.responseType = 'blob';
        xhr.onload = function() {
            var blob = this.response;
            convertBlobToBase64(blob,_origin,_clone,function(){
                delete asyncCalls[uid];
                if(_callback){
                    _callback(uid);
                }
                delete asyncCallBack[uid];
            })
        };
        xhr.onerror = function(){
            delete asyncCalls[uid];
            D3Api.debug_msg('не удалось получить blob. Возможно объект был освобождем методом revokeObjectURL');
            if(_callback){
                _callback(uid);
            }
            delete asyncCallBack[uid];
        }

        xhr.send();
    }
    function convertBlobToBase64(_blob,_origin, _clone, _callback){
        var uid = D3Api.getUniqId('uid_call');
        asyncCalls[uid] = _clone;
        asyncCallBack[uid] = _callback;
        var reader = new FileReader();
        reader.readAsDataURL(_blob);
        reader.onloadend = function() {
            _clone.height = _origin.offsetHeight;
            _clone.width = _origin.offsetWidth;
            var base64data = reader.result;
            _clone.src = base64data;
            delete asyncCalls[uid];
            if(_callback){
                _callback(uid);
            }
            delete asyncCallBack[uid];
        }

    }
    function convertSrcToBase64(_img){
        var _uid = D3Api.getProperty(_img,'uid_call');
        if(_uid in asyncCalls){
            var c = document.createElement('canvas');
            c.height = _img.offsetHeight;
            c.width = _img.offsetWidth;
            var ctx = c.getContext('2d');
            ctx.drawImage(_img, 0, 0, c.width, c.height);
            var base64String = c.toDataURL();
            asyncCalls[_uid].style.backgroundImage = 'url("' + base64String + '")';
        }
    };
    function createImg(_src, _clone,_callback,_callbackCancel){
        var image = new Image();
        var uid = D3Api.getUniqId('uid_call');
        asyncCalls[uid] = _clone;
        asyncImage[uid] = image;
        asyncCallBack[uid] = _callback;
        asyncCallBackCancel[uid] = _callbackCancel;
        document.body.appendChild(image);
        image.setAttribute('uid_call',uid);
        if(_sync === true){
            image.addEventListener('load', function(_event) {
                convertSrcToBase64(image);
                image.remove();
                delete asyncCalls[uid];
                delete asyncImage[uid];
            }, false);
        } else {
            image.addEventListener('load', function(_event) {
                convertSrcToBase64(_event.target);
                var _uid = D3Api.getProperty(_event.target,'uid_call');
                if(_uid in asyncCalls){
                    convertSrcToBase64(_event.target);
                    _event.target.remove();
                    delete asyncCalls[_uid];
                    delete asyncImage[_uid];
                    if(_callback){
                        _callback(_uid);
                    }
                    delete asyncCallBack[_uid];
                    delete asyncCallBackCancel[_uid];
                }
            }, false);
            image.addEventListener('error', function(_event) {
                _callbackCancel(_uid);
                /*if(Object.keys(asyncCalls).length <= 0){
                    resolve(clone);
                }*/
                delete asyncCalls[_uid];
                delete asyncImage[_uid];
                delete asyncCallBack[_uid];
                if(_uid in asyncCallBackCancel){
                    asyncCallBackCancel[_uid](_uid);
                }
                delete asyncCallBackCancel[_uid];

            }, false);
        }

        image.src = _src;

        return uid;
    }


    var clone = null;
    var origin = null;
    if(_originSource.nodeType == 9){
        clone = _originSource.body.cloneNode(true);
        origin = _originSource.body;
    }else if(_originSource.nodeType == 1){
        clone = _originSource.cloneNode(true);
        origin = _originSource;
    }

    function initLink(_origin, _clone){
        var _or = _origin;
        for(;;){
            if(_or.linkorigin){
                _or = _or.linkorigin;
            }else{
                break;
            }
        }
        _origin.linkclone = _clone;
        _clone.linkorigin = _or;
    }

    function initClone(_origin, _clone, resolve){
        if(_origin.nodeType != 1){
            return;
        }
        var nName = _origin.nodeName.toLowerCase();
        var cName = _clone.nodeName.toLowerCase();
        if(nName == 'canvas' && cName == 'canvas'){
            convertCanvas(_origin, _clone,function(){
                if(Object.keys(asyncCalls).length <= 0){
                    resolve(clone);
                }
            });
            return;
        }

        if (nName == 'script' && cName == 'script') {
            _clone.remove();
            return;
        }
        initLink(_origin, _clone);
        var isClone = true;
        if(_isDisplayNoneRemove === true){
            if(['style'].indexOf(nName) == -1){
                if (getComputedStyle(_origin).display == 'none' || _origin.style.display == 'none') {
                    _clone.remove();
                    /* элемент скрытый не делаем копию */
                    isClone = false;
                }
            }
        }
        if(isClone){
            if(nName == 'select'){
                var span = document.createElement('span');
                span.innerText = _origin.value;
                _clone.parentNode.insertBefore(span,_clone);
                _clone.remove();
                initLink(_origin, span);
            }else if(nName == 'iframe'){
                var divIframe = document.createElement('div');

                for (var jndex = 0; jndex < _origin.attributes.length; jndex++) {
                    if(_origin.attributes[jndex].name == 'height'){
                        if(D3Api.getProperty(_origin,'autoheight','false') === 'true'){
                            continue;
                        }
                    }

                    divIframe.setAttribute(_origin.attributes[jndex].name,_origin.attributes[jndex].value);
                    if(_origin.attributes[jndex].name == 'style'){
                        if(D3Api.getProperty(_origin,'autoheight','false') === 'true'){
                            divIframe.style.height = '100%';
                        }
                    }
                }
                var divBody = document.createElement('div');
                var childBody = _origin.contentDocument.body.cloneNode(true);
                for (var jndex = 0; jndex < childBody.attributes.length; jndex++) {
                    divBody.setAttribute(childBody.attributes[jndex].name,childBody.attributes[jndex].value);
                }
                divIframe.appendChild(divBody);

                var nLIst = D3Api.singleNode();
                nLIst.setNodeList(childBody.childNodes);
                var list = nLIst.get();
                for(var i = 0;i < list.length; i++){
                    divBody.appendChild(list[i]);
                }
                _clone.parentNode.insertBefore(divIframe,_clone);
                _clone.remove();
                initClone(_origin.contentDocument.body, divBody,resolve);
            }else {
                if (nName == 'img'){
                    try{
                        var src = _origin.src;
                        var regExp = src.match(/blob:/);
                        if (!D3Api.empty(regExp) && regExp.length > 0) {
                            convertBlobSrcToBase64(src, _origin, _clone, function(){
                                if(Object.keys(asyncCalls).length <= 0){
                                    resolve(clone);
                                }
                            })
                        }else{
                            var c = document.createElement('canvas');
                            c.height = _origin.naturalHeight;
                            c.width = _origin.naturalWidth;
                            var ctx = c.getContext('2d');
                            ctx.drawImage(_origin,0,0,c.width,c.height);
                            var base64String = c.toDataURL();
                            _clone.src = base64String;
                        }

                    }catch (e){
                        D3Api.debug_msg(e);
                    }

                }
                var backImage = _origin.style.backgroundImage;
                if (!D3Api.empty(backImage)) {
                    var regExp = backImage.match(/url\("([^>]*)"\)/);
                    if (!D3Api.empty(regExp) && regExp.length >= 2) {

                        createImg(regExp[1], _clone,function(){
                            if(Object.keys(asyncCalls).length <= 0){
                                resolve(clone);
                            }
                        },function(){
                            if(Object.keys(asyncCalls).length <= 0){
                                resolve(clone);
                            }
                        })
                    }
                }

                var nLIstOrigin = D3Api.singleNode();
                var nLIstCLone = D3Api.singleNode();
                nLIstOrigin.setNodeList(_origin.childNodes);
                nLIstCLone.setNodeList(_clone.childNodes);

                var orchilds = nLIstOrigin.get(),
                    clchilds = nLIstCLone.get();
                if (orchilds.length != clchilds.length) {
                    //ошибка кол-во дочерних элементов не совапала
                }
                for (var i = 0; i < orchilds.length; i++) {
                    initClone(orchilds[i], clchilds[i], resolve);
                }
            }
        }
    }
    if(_sync === false){
        var promise = new Promise(function(resolve) {
            initClone(origin, clone, resolve);
            if(Object.keys(asyncCalls).length <= 0){
                resolve(clone);
            }
        });
        return promise;
    }else{
        initClone(origin, clone);
        return clone;
    }

};

D3Api.getParentDom = function(_domObject , _attrs){
    var searchDom = _domObject;
    if(_domObject && _domObject.nodeType == 1){
        var _arrtibutes = _domObject.attributes;
        for(var _name in _attrs){
            if(!(_attrs.hasOwnProperty(_name) && _name in _arrtibutes && _arrtibutes[_name].value == _attrs[_name])){
                searchDom = null;
                break;
            }
        }
        if(D3Api.empty(searchDom)){
            searchDom = D3Api.getParentDom(_domObject.parentNode,_attrs);
        }
    }else{
        searchDom = null;
    }
    return searchDom;
};
/**
 * Вместо parseFloat использовать string2Float
 * Если, для parseFloat передать пустую строку(""), вернется NaN
 * Что бы, везде не использовать проверку isNaN, на этапе преобразования его проверяем.
 * Ссылка на спецификацию: https://tc39.es/ecma262/#sec-parsefloat-string
**/
D3Api.string2Float = function(str){
    var f_number = parseFloat(str);
    return (f_number !== f_number) ? 0 : f_number;
};
D3Api.exportDataToExcel = function(param, oncallbacks){
    var body = param.body;
    var header = param.header||[];
    var groups = param.groups;
    var _data = param.data;
    var show_number = param.show_number||false;
    var filename = param.filename;
    var title = param.title||filename;
    var result = {};
    var indexData = {};
    var groupData = {};
    var excel = new D3Api.Office.Spreadsheet.export('xlsx');
    var sheet1 = excel.addSheet(title);
    var startRow = null;
    var postMerges = [];//слить ячейки после того как все ячейки проставились.
    if(!D3Api.Equals([],header)){
        for(var i = 0 ; i < header.length ; i++){
            var maxRow = sheet1.getMaxRow();
            if(i > 0){
                maxRow += 1;
            }
            maxRow = D3Api.Office.Spreadsheet.getRow(maxRow);
            for(var j = 0 ; j < header[i].length ; j++){
                var column = D3Api.Office.Spreadsheet.getColumn(j);
                var coord = column+maxRow;
                var style = sheet1.setCellValue(coord, header[i][j].caption);
                if('style' in header[i][j]){
                    style.setStyleArray(header[i][j].style);
                }
                if('MergeCells' in header[i][j]){
                    postMerges.push({
                        coord: coord,
                        MergeCells: header[i][j].MergeCells
                    })
                }
            }
        }

    }
    if(!D3Api.empty(title)){
        var maxRow = sheet1.getMaxRow();
        if(!D3Api.Equals([],header)){
            maxRow += 1;
        }
        maxRow = D3Api.Office.Spreadsheet.getRow(maxRow);
        var column = D3Api.Office.Spreadsheet.getColumn(0);
        var coord = column+maxRow;
        sheet1.setCellValue(coord,title).setStyleArray(D3Api.mixin({
            border:{
                'all': {
                    borderWidth: 1,
                    borderStyle: 'thin'
                }
            },
            text:{
                wraptext : true,
                bold: true,
                alignment:{
                    horizontal:'center'
                }
            }
        },{}));
        sheet1.setMergeCells(coord+':'+ (D3Api.Office.Spreadsheet.getColumn(body.length - 1) + maxRow));
    }


    if(groups){
        for(var i = 0 ; i < groups.length ; i++){
            var maxRow = D3Api.Office.Spreadsheet.getRow(sheet1.getMaxRow() + 1);
            if(i == 0){
                startRow = maxRow;
            }
            var column = D3Api.Office.Spreadsheet.getColumn(0);
            var coord = column+maxRow;
            sheet1.setCellValue(coord,groups[i].caption).setStyleArray(D3Api.mixin({
                border:{
                    'all': {
                        borderWidth: 1,
                        borderStyle: 'thin'
                    }
                },
                text:{
                    wraptext : true,
                    bold: true
                }
            },{}));
            sheet1.setMergeCells(coord+':'+ (D3Api.Office.Spreadsheet.getColumn(body.length - 1) + maxRow));
        }
    }
    var lenSym = _data.length.toString().length;
    var clearColums = [];// список колонок где нет значений
    if(groups.length > 0 ){
        for(var i = 0; i < _data.length ; i++){
            /* TODO: объекты ключи автоматически сортируются перед значение устанавливается порядковый номер записи для сохранения последовательности */
            var spad = i.toString().padStart(lenSym,'0');
            var indexKey = '';
            for(var j = 0 , lvres = result; j < groups.length ; j++){
                if(_data[i][groups[j].field] === ''){
                    var code = _data[i][groups[j].field];
                    for(var l = i + 1; l < groups.length ; l++){
                        code+= _data[i][groups[l].field];
                    }
                    var UniqId = '!UniqId-'+D3Api.crc32(code)
                    clearColums.push(UniqId);
                    _data[i][groups[j].field] = UniqId;
                }
                indexKey += _data[i][groups[j].field];

                var isAdd = false;
                if(!(groups[j].field in _data[i]) || _data[i][groups[j].field] === ''){
                    continue;
                }
                if(!(indexKey in indexData)){
                    indexData[indexKey] = spad;
                    var key = spad+"|"+_data[i][groups[j].field];
                    if('!groupCaption' in _data[i]){
                        groupData[key] = _data[i]['!groupCaption'];
                    }
                    if(j < groups.length - 1){
                        lvres[key] = {};
                    }else{
                        lvres[key] = [];
                    }
                    isAdd = true;
                }
                if(j == groups.length - 1){
                    if(!('!notAddData' in _data[i] && _data[i]['!notAddData'] === true)){
                        /* вставляем данные в указанную иерархию */
                        var indx = indexData[indexKey];
                        lvres[indx+"|"+_data[i][groups[j].field]].push(_data[i]);
                    }
                }else{
                    /* переключаемся на дочерний элемент */
                    if(isAdd){
                        lvres = lvres[spad+"|"+_data[i][groups[j].field]];
                    }else{
                        var indx = indexData[indexKey];
                        lvres = lvres[indx+"|"+_data[i][groups[j].field]];
                    }
                }
            }
        }
    }else{
        result = _data;
    }
    var d = result;

    var filterCoordMin = '';
    var filterCoordMax = '';
    var maxRow = sheet1.getMaxRow();
    for(var i = 0; i < body.length ; i++){
        var caption = body[i].caption.trim();
        var styleHeader = {};

        if('styleHeader' in body[i]){
            styleHeader = body[i].styleHeader;
        }

        var column = D3Api.Office.Spreadsheet.getColumn(i);
        var row = D3Api.Office.Spreadsheet.getRow(maxRow + 1);
        var coord = column+row;
        if(filterCoordMin == ''){
            filterCoordMin = coord;
        }
        filterCoordMax = coord;
        sheet1.setCellValue(coord,caption).setStyleArray(D3Api.mixin({
            border:{
                'all': {
                    borderWidth: 1,
                    borderStyle: 'thin'
                }
            },
            text:{
                wraptext : true,
                bold: true
            }
        },styleHeader));
    }
    var maxRow = sheet1.getMaxRow() + 1;
    sheet1.setAutoFilter("A"+maxRow+":"+D3Api.Office.Spreadsheet.getColumn(body.length - 1)+maxRow);
    if(show_number === true){
        var maxRow = sheet1.getMaxRow();
        for(var i = 0; i < body.length ; i++){
            var column = D3Api.Office.Spreadsheet.getColumn(i);
            var row = D3Api.Office.Spreadsheet.getRow(maxRow + 1);
            var coord = column+row;
            sheet1.setCellValue(coord,i + 1).setStyleArray(D3Api.mixin({
                border:{
                    'all': {
                        borderWidth: 1,
                        borderStyle: 'thin'
                    }
                },
                text:{
                    wraptext : true,
                    bold: true
                }
            }, {}));
        }
    }

    var grouping = {}
    function setCellExcel(_dd, _num){
        if(!_num){
            _num = 1;
        }
        var maxRow = sheet1.getMaxRow();
        if(_dd instanceof Array){
            for(var i = 0, l = 0 ; i < _dd.length ; i++){
                if(Object.keys(_dd[i]).length <= 1 && body.length > 1){
                    continue
                }
                for(var j = 0 ; j < body.length ; j++){
                    var styleBody = {};
                    if('styleBody' in body[j]){
                        styleBody = body[j].styleBody;
                    }

                    var caption = '';
                    if((body[j].name in _dd[i]) && _dd[i][body[j].name]){
                        if(clearColums.indexOf(_dd[i][body[j].name]) > -1){
                            caption = '';
                        }else{
                            caption = _dd[i][body[j].name].trim();
                        }
                    }
                    if(caption.indexOf('!UniqId-') > -1){
                        caption = '';
                    }
                    var column = D3Api.Office.Spreadsheet.getColumn(j);
                    var row = D3Api.Office.Spreadsheet.getRow(maxRow + l + 1);
                    var coord = column+row;
                    sheet1.setCellValue(coord,caption).setStyleArray(D3Api.mixin({
                        border:{
                            'all': {
                                borderWidth: 1,
                                borderStyle: 'thin'
                            }
                        },
                        text:{
                            wraptext : true
                        }
                    },styleBody));
                    if('EXCEL_CELL_WIDTH' in D3Api){
                        sheet1.setMaxColumnWidth(D3Api.Office.Spreadsheet.getColumn(j),D3Api.EXCEL_CELL_WIDTH);
                    } else {
                        sheet1.setAutoWidth({
                            'column': D3Api.Office.Spreadsheet.getColumn(j)
                        })
                    }
                }
                l++;
            }
        }else{
            var styleGroupBody = {};
            if((_num in groups) && ('styleBody' in groups[_num])){
                styleGroupBody = groups[_num].styleBody;
            }
            for(var _name in _dd){
                if(_dd.hasOwnProperty(_name)){
                    var caption = _name;
                    var space = ''
                    if(_name in groupData){
                        caption = groupData[_name];
                    }else{
                        if(lenSym > 0){
                            caption = caption.substr(lenSym + 1);
                        }
                    }

                    if(clearColums.indexOf(caption) > -1){
                        caption = '';
                    }
                    for(var i = 1 ; i < _num ; i++){
                        space += '   ';
                    }
                    caption = space + caption;


                    var maxRow = sheet1.getMaxRow();
                    var column = 'A';
                    var row = D3Api.Office.Spreadsheet.getRow(maxRow + 1);
                    var coord = column+row;
                    var maxCol = D3Api.Office.Spreadsheet.getColumn(sheet1.getMaxColumn());
                    sheet1.setCellValue(coord, caption).setStyleArray(D3Api.mixin({
                        border:{
                            'all': {
                                borderWidth: 1,
                                borderStyle: 'thin'
                            }
                        },
                        text:{
                            wraptext : true,
                            color:{
                                hex:'#3282c3'
                            },
                            bold: true
                        }
                    },styleGroupBody));
                    sheet1.setMergeCells(coord+':'+maxCol+row);
                   // if(_dd[_name].length > 1){
                        var startGroup = D3Api.Office.Spreadsheet.getRow(sheet1.getMaxRow() + 1);
                        setCellExcel(_dd[_name],_num + 1);
                        var endGroup = D3Api.Office.Spreadsheet.getRow(sheet1.getMaxRow());
                        if(!(_num in grouping)){
                            grouping[_num] = '';
                        }
                        if(grouping[_num] != ''){
                            grouping[_num] += ';'
                        }
                        grouping[_num] += startGroup+":"+endGroup;
                   // }
                }
            }
        }

    }
    setTimeout(function(_param, sht1, _postMerges){
        var footer = _param.footer||[];
        setCellExcel(d);
        if(!D3Api.Equals([],footer)){
            for(var i = 0 ; i < footer.length ; i++){
                var maxRow = D3Api.Office.Spreadsheet.getRow(sht1.getMaxRow() + 1 + i);
                for(var j = 0 ; j < footer[i].length ; j++){
                    var column = D3Api.Office.Spreadsheet.getColumn(j);
                    var coord = column+maxRow;
                    var style = sht1.setCellValue(coord, footer[i][j].caption);
                    if('style' in footer[i][j]){
                        style.setStyleArray(footer[i][j].style);
                    }
                    if('MergeCells' in footer[i][j]){
                        switch (footer[i][j].MergeCells){
                            case D3Api.Office.Spreadsheet.Constants.MaxColumn:
                                var maxCol = D3Api.Office.Spreadsheet.getColumn(sht1.getMaxColumn());
                                sht1.setMergeCells(coord+':'+(maxCol + maxRow));
                                break;
                            default:
                                sht1.setMergeCells(coord+':'+footer[i][j].MergeCells);
                        }
                    }
                }
            }
        }
        if(!D3Api.Equals({},grouping)){
            sheet1.setOutlineLevelRow({
                summaryBelow: true,
                levels: grouping
            })
        }

        if(!D3Api.Equals([],_postMerges)){
            for(var i = 0; i < _postMerges.length ; i++){
                switch (_postMerges[i].MergeCells){
                    case D3Api.Office.Spreadsheet.Constants.MaxColumn:
                        var maxCol = D3Api.Office.Spreadsheet.getColumn(sht1.getMaxColumn());
                        var crd = D3Api.Office.Spreadsheet.intoCoord(_postMerges[i].coord);
                        sht1.setMergeCells(_postMerges[i].coord+':'+(maxCol + D3Api.Office.Spreadsheet.getRow(crd.row)));
                        break;
                    default:
                        sht1.setMergeCells(_postMerges[i].coord+':'+_postMerges[i].MergeCells);
                }
            }
        }
        setTimeout(function(){
            excel.save(filename);
        })
    },undefined,param, sheet1, postMerges)
};