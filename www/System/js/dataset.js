/**
 *
 * @class
 * @param form
 * @param name
 * @param dom
 * @constructor
 */
D3Api.D3DataSet = function(form,name,dom)
{
    D3Api.D3Base.call(this);
    this.name = name;
    this.data = new Array();
    //Хэш параметров запроса если данные пришли без запроса то заполняется и при последующем запросе сверяется, если совпадает то запрос на сервер не происходит
    this.dataHash = '';
    this.uidData = null;
    //Флаг того что нужно обрабатывать все ответы, а не только тот который запросили последним
    this.allResponse = false;
    //Флаг того что был сделан запрос на сервер
    this.sendRequest = 0;
    //Количество принятых данных / запросов
    this.acceptedData = 0;
    //Контролы могут быть без имени
    this.controls = new Array();
    this.form = form;
    this.filters = {};
    this.sorts = {};
    this.group = null; //[];//группировка поле=порядок
    this.groupsumm = null; //{};//Сумма при группировке поле=тип(summ,count,avg,min,max)
    this.filteronce = null; //{};//Фильтр одного запроса поле=значение
    this.sortonce = null; //{};//Сортировка одного запроса поле=значение
    this.filterpermanent = null; //{};//Фильтр постоянный для запроса поле=значение
    this.sortpermanent = null; //{};//Сортировка постоянная для запроса поле=значение
    this.wf = null; //{};//Оконные функции для запроса
    this.details = new Array();
    //Указывается на форме
    this.sysinfo = null;
    this.isUnique = true;
    this.requestParams = {};
    this.addSysInfoParam = function(paramObj)
    {
        if(paramObj['parent'])
        {
            var ds = this.form.getDataSet(paramObj['parent']);
            if(ds)
                ds.addDetail(this.name);
        }
        this.sysinfo.params.push(paramObj);
    }
    //Действительное количество всей выборки без учета лимита
    var rowCount = 0;
    var rangePage = 0;
    var dataPosition = 0;
    this.needRotateData = false;

    /**
     *
     * @param dom
     */
    this.init = function(dom)
    {
        this.rotateData = {
            primary_field: D3Api.getProperty(dom, 'primary_field', false),
            columns_field: D3Api.getProperty(dom, 'columns_field', false),
            values_field: D3Api.getProperty(dom, 'values_field', false)
        }
        this.needRotateData = this.rotateData.columns_field;
    }
    if(dom)
        this.init(dom);

    /**
     *
     * @returns {boolean}
     */
    this.hasDetails = function()
    {
        return this.details.length > 0;
    }

    /**
     *
     * @param name
     */
    this.addDetail = function(name)
    {
        if (this.details.indexOf(name) == -1)
            this.details.push(name);
    }

    /**
     *
     * @param name
     */
    this.removeDetail = function(name)
    {
        var ind = this.details.indexOf(name);
        if (ind != -1)
            this.details.splice(ind,1);
    }

    /**
     *
     */
    this.destructor = function()
    {
        this.data = null;
        this.controls = null;
        this.form = null;
        this.filters = null;
        this.details = null;
        this.sorts = null;
        this.sysinfo = null;
        this.requestParams = null;

        delete this.name;
        delete this.data;
        delete this.controls;
        delete this.form;
        delete this.allResponse;
        delete this.dataHash;
        delete this.sendRequest;
        delete this.filters;
        delete this.sorts;
        delete this.details;

        this.destructorBase();
    }

    /**
     *
     * @param state
     */
    this.setUnique = function(state)
    {
        this.isUnique = state;
    }

    /**
     *
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     * @param details
     * @param repeatersRefresh
     */
    this.refresh = function(onsuccess,onerror,sync,force,details, repeatersRefresh)
    {
        if (this.callEvent('onbefore_refresh') === false) {
            return;
        }
        var _ext_ = this.getRequestData();
        this.callEvent('onprepare_ext',_ext_);
        var newReqUid= (this.isUnique)?D3Api.getUniqId('DS'):'notuinique';
        var params = this.sysinfo.getParams(this.name);
        var hashValues = '';
        for(var p in params)
        {
            if(params.hasOwnProperty(p)){
                hashValues += p+'='+((params[p] === undefined)?'':params[p])+'|';
            }

        }
        params._ext_ = _ext_;
        params._uid_ = newReqUid;
        var reqData = D3Api.mixin({
            type: 'DataSet',
            params: params
        },this.requestParams);
        if (this.dataHash && this.dataHash == MD5.hex_md5(hashValues) && !force)
        {
            this.dataHash = null;
            if (this.dataSilent)
            {
                this.dataSilent = false;
                this.reSetData();
            } else {
                this.callEvent('onafter_refresh');
            }
            //this.sendRequest = 0;
            return;
        }else if(this.dataHash && this.dataHash != MD5.hex_md5(hashValues))
        {
            //Данные с сервера пришли неконсистентные перезапрашиваем

        }/*else
        if(this.sendRequest>0 && this.allResponse != true)
            return;*/
        this.requestUid = newReqUid;
        this.dataHash = null;
        this.dataSilent = false;
        this.sendRequest++;
        if (details == undefined) details = true;
        this.form.startWaitControls(this.controls);
        if (this.hasDetails() && details)
        {
            this.form.beginRequest();
            this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
            this.refreshDetails();
            this.form.endRequest();
        }else
            this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror, repeatersRefresh);
    }

    /**
     *
     * @param mode
     * @param data
     * @param onsuccess
     * @param onerror
     * @param sync
     */
    this.refreshByMode = function(mode,data,onsuccess,onerror,sync)
    {
        this.callEvent('onbefore_refresh','mode',mode,data);
        var _ext_ = this.getRequestData();
        this.callEvent('onprepare_ext',_ext_);
        var params = this.sysinfo.getParams(this.name);
        params._ext_ = _ext_;
        params._uid_ = D3Api.getUniqId('dsm');
        params._mode_ = mode;
        params._mode_data_ = data;
        var reqData = D3Api.mixin({
            type: 'DataSet',
            params: params
        },this.requestParams);

        var reqObj = {};
        reqObj[this.name] = reqData;
        var name = this.name;
        var self = this;
        D3Api.requestServer({
            url: 'request.php',
            async: !sync,
            method: 'POST',
            urlData: this.form.formData.request,
            data: {request: D3Api.JSONstringify(reqObj)},
            onSuccess: function(res){
                self.clearParams();
                try
                {
                    var resObj = JSON.parse(res);
                }catch(e)
                {
                    if (onerror instanceof Function)
                        onerror.call(this,res,e);
                    D3Api.debug_msg('В ответе сервера: '+e.message);
                    return;
                }
                if(!D3Api.empty(resObj[name].error)){
                    if(onerror instanceof Function){
                        onerror.call(this,resObj[name],resObj[name].error);
                    }else if(D3Api.getOption('debug', 0) > 0){
                        D3Api.alert_msg(resObj[name].error);
                    }
                }
                else if (onsuccess instanceof Function)
                    onsuccess.call(this,resObj[name],resObj[name].data);
            },
            onError: function(e){
                self.clearParams();
                D3Api.debug_msg('В ответе сервера: '+e);
                if (onerror instanceof Function)
                    onerror.call(this,e);
            },
            contextObj: this.form
        });
    }

    /**
     *
     */
    this.refreshDetails = function()
    {
        for(var i = 0, c = this.details.length; i < c; i++)
        {
            this.form.refreshDataSet(this.details[i]);
        }
    }

    /**
     * Атрибут data содержит пары "свойство контрола":"поле данных" через ";",  например data="value:col1;caption:col2"
     * @param dom
     */
    this.addControl = function(dom)
    {
        this.form.addInControls(this.controls,dom);
    }

    /**
     *
     * @param cmpName
     * @param property
     * @param field
     * @param upper
     * @param condition
     * @param like
     * @param fkind
     */
    this.addFilterItem = function(cmpName,property,field,upper,condition,like,fkind)
    {
        this.filters[cmpName] = {p: property, f: field, u: upper, c: condition, l: like, fk: fkind, val: ''};
    }

    /**
     *
     * @param cmpName
     * @param field,
     * @param type
     */
    this.addSortItem = function(cmpName,field,type)
    {
        this.sorts[cmpName] = {
            f: field,
            val: '',
            type : function () {
                if(typeof type == 'object'){
                    if(('type' in type) && ('format' in type)){
                        return type.type+"|"+type.format
                    }else{
                        return '';
                    }
                }else if(typeof type == 'string'){
                    return type;
                }else{
                    return '';
                }
            }()
        };
    }

    /**
     *
     * @param page
     * @param amount
     * @param refresh
     * @param keyfield
     * @param count
     */
    this.setRange = function(page, amount, refresh, keyfield, count)
    {
        if(page === undefined && amount === undefined)
        {
            this.range = null;
        }
        page = page || 0;
        amount = amount || 10;

        this.range = {page: (page<0)?0:page, amount: (amount<0)?0:amount, keyfield: (keyfield === undefined)?1:keyfield, count: (count === undefined)?true:count};
        if(refresh){
            this.refresh();
        }
    }

    /**
     *
     * @returns {number}
     */
    this.getRangePage = function()
    {
        return rangePage;
    }

    /**
     *
     * @param field
     * @param value
     * @param refresh
     */
    this.setLocate = function(field, value, refresh)
    {
        if(field === undefined)
        {
            this.locate = null;
            return;
        }
        this.locate = {field: field, value: value};

        if(refresh)
            this.refresh();
    }

    /**
     *
     * @param field
     * @param order
     */
    this.addGroup = function(field,order)
    {
        if(field === undefined)
        {
            this.group = null;
            return;
        }
        this.group = this.group || [];

        this.group.push(field);
    }

    /**
     *
     * @param field
     * @param type
     * @param fixed
     */
    this.addGroupSumm = function(field,type,fixed)
    {
        if(field === undefined)
        {
            this.groupsumm = null;
            return;
        }
        this.groupsumm = this.groupsumm || {};

        fixed = fixed || 0;
        type = type || 'sum';
        type += '|'+fixed;
        this.groupsumm[field]=(this.groupsumm[field])?this.groupsumm[field]+';'+type:type;
    }

    /**
     *
     * @param field
     * @param value
     */
    this.addFilter = function(field,value)
    {
        if(field === undefined)
        {
            this.filteronce = null;
            return;
        }
        this.filteronce = this.filteronce || {};
        this.filteronce[field] = value;
    }

    /**
     *
     * @param field
     * @param value
     */
    this.addFilterPermanent = function(field,value)
    {
        if(field === undefined)
        {
            this.filterpermanent = null;
            return;
        }

        this.filterpermanent = this.filterpermanent || {};
        if(value === undefined && !D3Api.isUndefined(this.filterpermanent[field]))
        {
            this.filterpermanent[field] = null;
            delete this.filterpermanent[field];
        }
        this.filterpermanent[field] = value;
    }

    /**
     *
     * @param field
     * @param value
     */
    this.addSort = function(field,value)
    {
        if(field === undefined)
        {
            this.sortonce = null;
            return;
        }
        this.sortonce = this.sortonce || {};
        this.sortonce[field] = value;
    }

    /**
     *
     * @param field
     * @param value
     */
    this.addSortPermanent = function(field,value)
    {
        if(field === undefined)
        {
            this.sortpermanent = null;
            return;
        }

        this.sortpermanent = this.sortpermanent || {};
        this.sortpermanent[field] = value;
    }

    /**
     *
     * @param field
     * @param name
     */
    this.addWindowFunction = function(field, name) {
        if (!field || typeof name !== 'string' || !name) {
            return;
        }
        if (!this.wf) {
            this.wf = {};
        }
        if (!this.wf[field]) {
            this.wf[field] = [];
        }
        if (this.wf[field].indexOf(name) == -1) {
            this.wf[field].push(name);
        }
    };

    /**
     *
     * @returns {{}}
     */
    this.getRequestData = function()
    {
        var res = {};

        if(this.range)
            res.range = this.range;
        if(this.locate)
            res.locate = this.locate;
        if(this.group)
            res.group = this.group;
        if(this.groupsumm)
            res.groupsumm = this.groupsumm;
        if (this.wf) {
            res.wf = this.wf;
        }
        if(this.filterpermanent || this.filteronce)
        {
            res.filters = {};
            D3Api.mixin(res.filters,this.filterpermanent,this.filteronce);
        }
        if(this.sortpermanent || this.sortonce)
        {
            res.sorts = {};
            D3Api.mixin(res.sorts,this.sortpermanent,this.sortonce);
        }
        if(this.afilter)
        {
            res.afilter = {};
            var afilterctrl = this.afilter['afilterctrl'];
            if(this.form.controlExist(afilterctrl))
            {
                var val = this.form.getControlProperty(afilterctrl,'value');
                this.afilter['afilterval'] = val;
            }else{
                this.afilter['afilterval'] = '';
            }
            if(this.form.controlExist(afilterctrl+'_afilter_reg_use'))
            {
                var afilterreguse = this.form.getControlProperty(afilterctrl+'_afilter_reg_use','value');
                this.afilter['afilterreguse'] = afilterreguse;
            }
            res.afilter = this.afilter;
        }
        for(var f in this.filters)
        {
            if(!this.filters.hasOwnProperty(f)){
                continue;
            }
            var fltr = this.filters[f];
            if(this.form.controlExist(f))
            {
                var val = this.form.getControlProperty(f,fltr.p);
                fltr.val = val;
            }else
                val = fltr.val;

            var extInf = '';
            if (val)
            {
                if (val == '()' || val == '!()') {
                    res.filters = res.filters || {};
                    res.filters[this.filters[f].f + extInf] = val;
                    continue;
                }
                switch (fltr.fk)
                {
                    case 'activedate':
                        var fields = fltr.f.split(';');

                        res.filters = res.filters || {};
                        res.filters[fields[0] + ';D'] = ']' + val;
                        res.filters[fields[1] + ';D'] = '/[' + val;
                        break;
                    case 'perioddate':
                    case 'periodnumb':
                        if(f.search(/_BEGIN$/)>0)
                            extInf +=';B';
                        else if(f.search(/_END$/)>0)
                            extInf +=';E';
                        res.filters = res.filters || {};
                        res.filters[this.filters[f].f+extInf] = val;
                        break;
                    case 'unitmulti':
                        extInf +=';M';
                        res.filters = res.filters || {};
                        res.filters[this.filters[f].f+extInf] = val;
                        break;
                    case 'multi_hier':
                        break;
                    case 'text_af': /*cmpAdditionalFilter*/
                        res.filters = res.filters || {};
                        res.filters[this.filters[f].f+extInf] = '##'+((fltr.u==true)?'^':'')+val.trim();
                        break;
                    case 'text_ext':/*filterkind="text_ext"*/
                        /**
                         * в компоненте AdditionalFilter, а также при указанном filterkind="text_ext" в фильтре колонки проверяется значение фильтра:
                         * если первый символ = "$", то фильтр работает по стандартому выражению LIKE %<значение>%
                         * если первый символ = "&", то используется т.н. сжатый фильтр (regexp_replace(upper(<field>), '[[:punct:]]|[[:space:]]|[[:cntrl:]]|[[:blank:]]|№', '', 'g')=regexp_replace(upper(<значение фильтра>), '[[:punct:]]|[[:space:]]|[[:cntrl:]]|[[:blank:]]|№', '', 'g'))
                         * если присутствуют символы "?" или "*", то они заменяются на "_" и "%" соответсвенно и работают по стандартому выражению LIKE
                         */
                        val=val.trim();
                        if(val.indexOf("$") == 0) {
                            val = val.slice(1);
                            val= '^'+val.replace(new RegExp('', 'g'), '%'+'');
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = val;
                            break;
                        }else if(val.indexOf("&") == 0) {
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = '#'+val.slice(1);
                            break;
                        }
                        else if(val.indexOf("=") == 0) {
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = '^'+val;
                            break;
                        }else if ((val.indexOf("*") != (-1)) || (val.indexOf("?") != (-1))) {
                            if (val.indexOf("?") != (-1)) {
                                val = val.replace(new RegExp("[?]", 'g'), "_");
                            }
                            if (val.indexOf("*") != (-1)) {
                                val = val.replace(new RegExp("[*]", 'g'), "%");
                            }
                            res.filters = res.filters || {};
                            res.filters[this.filters[f].f+extInf] = '^'+val;
                            break;
                        }else{
                            fltr.l = 'both';
                        }
                    default:
                        fltr.fk = fltr.fk || 'text';
                        var addVal = '%';
                        if (fltr.l != 'none' && (fltr.fk=='text' || fltr.fk=='text_ext')){
                            switch (fltr.l){
                                case 'left' :val= '%'+val;
                                    break;
                                case 'right' :val= val+'%';
                                    break;
                                case 'both' :val= '%'+val+'%';
                                    break;
                            }
                            addVal = '';
                        }
                        if (fltr.c != 'none'){
                            switch (fltr.c){
                                case 'like':
                                    if(fltr.fk=='text')
                                        val=val+addVal;
                                    else
                                        val='='+val;
                                    break;
                                case 'mlike':
                                    if(fltr.fk=='text')
                                        val='+'+val;
                                    else
                                        val='='+val;
                                    break;
                                case 'gt':val='>'+val;
                                    break;
                                case 'lt':val='<'+val;
                                    break;
                                case 'gteq':val='['+val;
                                    break;
                                case 'lteq':val=']'+val;
                                    break;
                                case 'eq':val='='+val;
                                    break;
                                case 'neq':val='!'+val;
                                    break;
                            }
                            addVal = '';
                        }else if(fltr.fk && fltr.fk!='text'&& fltr.fk!='text_ext')
                        {
                            val='='+val;
                        }
                        if (fltr.u=='true' && (fltr.fk=='text' || fltr.fk=='text_ext')){
                            val='^'+val+addVal;
                        }

                        res.filters = res.filters || {};
                        if (res.filters[this.filters[f].f + extInf]) {
                            res.filters["add_fltr_" + this.filters[f].f + extInf] = val;
                        } else {
                            res.filters[this.filters[f].f + extInf] = val;
                        }
                }
            }
        }
        for(var s in this.sorts)
        {
            if(!this.sorts.hasOwnProperty(s)){
                continue;
            }
            if(res.sorts && res.sorts[this.sorts[s]] !== undefined)
            {
                continue;
            }
            if(this.form.controlExist(s))
            {
                var val = this.form.getControlProperty(s,'value');
                this.sorts[s].val = val;
            }else
                val = this.sorts[s].val;
            if (val)
            {
                res.sorts = res.sorts || {};
                res.sorts[this.sorts[s].f] = val;
                if('type' in this.sorts[s] && !D3Api.empty(this.sorts[s]['type'])){
                    res.sortsType = res.sortsType || {};
                    res.sortsType[this.sorts[s].f] = this.sorts[s]['type'];
                }
            }
        }

        return res;
    }

    /**
     *
     * @param res
     * @param repeatersRefresh
     */
    this.setResponse = function(res, repeatersRefresh)
    {
        function setResInfo(res) {
            if (this.needRotateData)
                rotateData(res.data, this.rotateData.primary_field, this.rotateData.columns_field, this.rotateData.values_field);

            if(res.rowcount_error && D3Api.getOption('debug', 0) > 0){
                D3Api.alert_msg(res.rowcount_error+'rowcount_error');
            }
            if(res.page_error && D3Api.getOption('debug', 0) > 0){
                D3Api.alert_msg(res.page_error+'page_error');
            }
            if(res.locate_error && D3Api.getOption('debug', 0) > 0){
                D3Api.alert_msg(res.locate_error+'locate_error');
            }
            rowCount = res.rowcount || res.data.length;
            rangePage = res.page;
            dataPosition = (res.position === undefined) ? dataPosition : res.position;

            this.clearParams();
        }
        if (this.sendRequest > 0)
        {
            this.sendRequest--;
            this.dataSilent = false;
            //if(this.sendRequest === 0 || this.allResponse) {
                setResInfo.call(this,res);
                this.setData(res.data, undefined, repeatersRefresh);
            //}
        }else if(this.sendRequest === 0)//Данных не ждали и не запрашивали
        {
            this.dataSilent = true;
            setResInfo.call(this,res);
            this.setDataSilent(res.data);
        }
    }

    /**
     *
     */
    this.clearParams = function()
    {
        //Обнуляем переменные
        this.locate = null;
        this.filteronce = null;
        this.sortonce = null;
        this.group = null;
        this.groupsumm = null;
    }

    /**
     *
     * @param data
     */
    this.reSetData = function()
    {
        this.setData(this.data);
    }

    /**
     *
     * @param data
     * @param position
     */
    this.setDataSilent = function(data)
    {
        this.data = data;
    }

    
    /**
     * массив объектов, где имена параметров колонки, например [{col1: 1, col2: 2},{col1: 3, col2: 4}]
     * @param data
     * @param position
     * @param repeatersRefresh
     */
    this.setData = function(data,position, repeatersRefresh)
    {
        if (position == undefined) position = dataPosition;
        this.data = data;
        this.acceptedData++;
        this.callEvent('onrefresh',data);

        this.setDataPosition(position);
        this.uidData = D3Api.getUniqId();
        if(repeatersRefresh !== false){
            this.callEvent('ondata_ready',data);
            this.form.stopWaitControls(this.controls);
            this.callEvent('onafter_refresh');
        }

        //this.form.resize();
    }

    /**
     *
     * @param pos
     */
    this.setDataPosition = function(pos)
    {
        this.form.setControlsData(this.controls,this.data[pos]||{});
        this.callEvent('ondatapos_change',pos);
    }

    /**
     *
     * @returns {number}
     */
    this.getCount = function()
    {
        return this.data.length;
    }

    /**
     *
     * @returns {number}
     */
    this.getAllCount = function()
    {
        return rowCount;
    }

    /**
     *
     * @param position
     * @returns {*}
     */
    this.getPosition = function()
    {
        return dataPosition;
    }
    this.getData = function(position)
    {
        position = (position === undefined)?dataPosition:position;

        return this.data[position];
    }
    function rotateData(data,primaryField,columnsField,valuesField)
    {
        //Переворот данных
        if (columnsField && valuesField)
        {
            var index = 0;
            if (primaryField)
            {
                var ndata = {};
                for(var i = 0; i < data.length; i++)
                {
                    var key = data[i][primaryField];
                    var field = data[i][columnsField];
                    var value = data[i][valuesField];
                    if (!ndata[key])
                    {
                        ndata[key] = {data: data[index]};
                        ndata[key].data[primaryField] = key;
                        index++;
                    }
                    ndata[key].data[field] = value;
                }
                data.splice(index);
            }else
            {   //Одна строка
                for(var i = 0; i < data.length; i++)
                {
                    var tmp = data[i];
                    data[i] = {};
                    data[0][tmp[columnsField]] = tmp[valuesField]
                }
                data.splice(1);
            }
        }else if (columnsField) //Поворот всех данных строки -> столбцы
        {
            var dataNew = new Array();
            var ParName ="";
            var j;
            for (var i=0; i<data.length;i++)
            {
                j=0;
                for (var z in data[i])
                {
                    if(!data[i].hasOwnProperty(z) || z == columnsField){
                        continue;
                    }
                    ParName = data[i][columnsField];
                    if(dataNew[j] == null) dataNew[j] = {};
                    dataNew[j][ParName] = data[i][z];
                    j++;
                }
            }
            data.splice(0);
            for(var d in data){
                if(data.hasOwnProperty(d)){
                    dataNew[d] = data[d];
                }
            }
            data = dataNew;
        }
    }
}
