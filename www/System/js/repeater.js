D3Api.D3Repeater = function(form,dom,parent,dataset)
{
    var nofragment = false;//вставлять в дом сразу после создание клона
    if(!D3Api.empty(parent) || (D3Api.hasProperty(dom,'nofragment') && D3Api.getProperty(dom,'nofragment') == 'true')){
        nofragment = true;
    }
    var fragmentElements = [];
    D3Api.D3Base.call(this);
    //Ссылка на родителя
    this.name = D3Api.getProperty(dom,'repeatername');
    D3Api.addClass(dom,'repeatername_'+this.name);
    this.actionData = false;
    this.rootParent = null;
    this.parent = parent;
    this.childs = new Array();
    if (parent)
    {
        parent.addChild(this);
    }
    this.DOM = dom;
    this.DOM.D3Repeater = this;
    D3Api.setProperty(dom,'isD3Repeater',true);
    this.targetDOM = null;
    this.form = form;
    this.uniqId = D3Api.getUniqId('d3repeater');
    this.DOM.id = this.uniqId;
    this.controls = new Array();
    this.keyField = D3Api.getProperty(dom,'keyfield');
    this.noRepeat = D3Api.getBoolean(D3Api.getProperty(dom,'norepeat',false));
    this.standalone = D3Api.getBoolean(D3Api.getProperty(dom,'standalone',null));
    this.emptydata = D3Api.getProperty(dom,'emptydata',false);
    var simpleClones = [];
    this.emptydataparent = false;
    if(this.emptydata)
    {
        try
        {
            var json = this.emptydata.replace(/'/g,'"');
            this.emptydata = D3Api.JSONparse(json);
            for(var f in this.emptydata)
            {
                if(!this.emptydata.hasOwnProperty(f)){
                    continue;
                }
                var v = this.emptydata[f];
                if(typeof(v) == 'string' && v.indexOf('@parent.') > -1)
                {
                    this.emptydataparent = this.emptydataparent || {};
                    this.emptydataparent[f] = v.split('.')[1];
                }
            }
        }catch(e)
        {
            D3Api.debug_msg('Ошибка при парсе emptydata репитера '+this.name+': '+this.emptydata);
            this.emptydata = false;
        }
    }
    this.detail = D3Api.getProperty(dom,'detail',null);
    this.detail = this.detail !== null?D3Api.getBoolean(this.detail):null;
    this.async = +D3Api.getProperty(dom,'async',0);
    this.parentFields = new Array();
    this.conditions = null;
    this.parentKeyFields = {};
    this.changedData = {
        add : {},
        upd : {},
        del : {}
    }
    this.isSimple = (D3Api.hasProperty(dom,'simple') && !parent);
    this.simpleType = D3Api.getProperty(dom,'simple');
    this.repeatCount = D3Api.getProperty(dom,'repeat');
    var pf = D3Api.getProperty(dom,'parent');
    if (pf)
    {
        pf = pf.split(';');
        for(var i = 0, c = pf.length; i < c; i++)
        {
            var nf = pf[i].split(':');
            if (nf.length > 1)
            {
                var fields = [];
                var rep = form.getRepeater(nf[0]);
                for(var fi = 1, fc = nf.length; fi < fc; fi++)
                {
                    var pcf = nf[fi].split('=');
                    if(pcf.length > 1)
                    {
                        var isfunc = pcf[1][0] == '@';
                        fields.push({parent: pcf[0], parentKey: rep.keyField, child: (isfunc)?pcf[1].substr(1):pcf[1], isfunc: isfunc});
                        rep.setParentKeyField(pcf[0]);
                    }else
                        fields.push({parent: null, parentKey: rep.keyField, child: pcf[0]});
                }
                this.parentFields.push({rep:nf[0],fields: fields});
            }
        }
    }
    pf = null;
    var cnd = D3Api.getProperty(dom,'condition');
    if (cnd)
    {
        this.conditions = {};
        cnd = cnd.split(';');
        for(var i = 0, c = cnd.length; i < c; i++)
        {
            var cndf = cnd[i].split('=');
            this.conditions[cndf[0]] = {
                value: (cndf[1]===undefined)?null:(cndf[1][0]=='@'?cndf[1].substr(1):cndf[1]),
                isfunc: cndf[1] && cndf[1][0]=='@'
            }

        }
    }
    cnd = null;

    this.distinct = D3Api.getProperty(dom,'distinct',null);

    if(!D3Api.getBoolean(D3Api.getProperty(dom,'repeatershow','false')))
        D3Api.showDom(this.DOM,false);

    var prop = null;
    if (prop = D3Api.getProperty(dom, 'onbefore_repeat')){
        this.addEvent('onbefore_repeat', form.execDomEventFunc(dom, {func: prop, args: 'container'}));
    }
    if (prop = D3Api.getProperty(dom, 'onafter_repeat')){
        this.addEvent('onafter_repeat', form.execDomEventFunc(dom, {func: prop, args: 'container'}));
    }
    if (prop = D3Api.getProperty(dom, 'onbefore_clone')){
        this.addEvent('onbefore_clone', form.execDomEventFunc(dom, {func: prop, args: 'data'}));
    }
    if (prop = D3Api.getProperty(dom, 'onafter_clone')){
        this.addEvent('onafter_clone', form.execDomEventFunc(dom, {func: prop, args: 'data,clone'}));
    }
    if (prop = D3Api.getProperty(dom, 'onclone_remove')){
        this.addEvent('onclone_remove', form.execDomEventFunc(dom, {func: prop, args: 'clone'}));
    }


    this.destructor = function()
    {
        if(eventDataReadyUid)
        {
            this.dataSet.removeEvent('ondata_ready',eventDataReadyUid);
        }
        this.parent = null;
        this.childs = null;
        this.dataSet = null;
        this.dataSetUid = null;
        this.DOM = null;
        this.targetDOM = null;
        this.form = null;
        this.controls = null;
        this.parentFields = null;
        this.conditions = null;
        this.changedData = null;
        this.distinct = null;
        this.dataChild = null;
        this.childKeys = null;
        this.currentData = null;
        this.rootParent = null;
        this.emptydata = null;

        delete this.parent;
        delete this.childs;
        delete this.dataSet;
        delete this.dataSetUid;
        delete this.DOM;
        delete this.targetDOM;
        delete this.form;
        delete this.controls;
        delete this.parentFields;
        delete this.conditions;
        delete this.changedData;
        delete this.distinct;

        for(var i = 0,len = simpleClones.length ; i < len ; i++){
            clearTimeout(simpleClones[i]);
        }
        this.destructorBase();
    }
    this.setAsync = function (async) {
        this.async = +async || 0;
    };
    this.setParentKeyField = function(field,remove)
    {
        remove = remove || false;
        if(remove)
        {
            this.parentKeyFields[field] = undefined;
            delete this.parentKeyFields[field];
        }else
            this.parentKeyFields[field] = true;
    }
    this.addControl = function(dom)
    {
        this.form.addInControls(this.controls,dom);
    }
    this.addChild = function(repeater)
    {
        repeater.rootParent = this.rootParent || this;
        if(repeater.detail === null)
            repeater.detail = true;
        this.childs.push(repeater)
    }
    this.setTargetDom = function(dom)
    {
        if(!dom && this.form.currentContext)
        {
            var dom = D3Api.getDomBy(this.form.currentContext, '#'+this.uniqId+'[repeatername="'+this.name+'"]');

            //fix safari selector # -> []
            if (!dom) {
                dom = D3Api.getDomBy(this.form.currentContext, '[id="'+this.uniqId+'"][repeatername="'+this.name+'"]');
            }

            if(!dom)
                return;
        }
        this.targetDOM = dom || this.DOM;
    }
    this.setData = function(data)
    {
        if(!this.dataSet || !(this.dataSet instanceof D3Api.D3DataSet))
            this.dataSet = {data: data, uidData: D3Api.getUniqId()};

        if(this.isSimple || this.rootParent && this.rootParent.isSimple)
        {
            this.prepareData();

            var rP = this.rootParent || this;

            rP.checkPrepareData() &&  rP.simpleRepeat();
        }else
            this.repeat();
    }

    this.dataSet = null;
    this.dataSetUid = null;
    if(!D3Api.hasProperty(dom, 'nodataset'))
        this.dataSet = dataset;
    var eventDataReadyUid = null;
    if (!D3Api.hasProperty(dom, 'onlycreate') && this.dataSet)
    {
        if(this.standalone)
            this.dataSet.allResponse = true;
        eventDataReadyUid = this.dataSet.addEvent('ondata_ready',D3Api.bindThis(this.setData,this));
    }

    var distinctData = {};
    this.repeat = function(forceRepeat,containerDOM,innerStart,clCount)
    {
        fragmentElements = [];
        if(this.detail === false && containerDOM && !innerStart)
            return;

        if(this.standalone && !this.form.currentContext)
        {
            return;
        }

        var topLevel = (!this.detail && !containerDOM) || innerStart;

        if(!innerStart)
        {
            if(!forceRepeat && !containerDOM && this.dataSet)
            {
                if(this.dataSetUid == this.dataSet.uidData)
                    return;
            }
            if(this.noRepeat && !forceRepeat)
                return;
            //if (this.parent && (this.parent.clones().length == 1) && ((parent && this.parent != parent) || (!parent && this.parent)))
            //    return;

            //Удаляем всех своих клонов
            this.targetDOM = null;
            this.removeAllClones(containerDOM);
            //Если больше одного уровня вложенности можем потерять изменения при замкнутом контексте на клон
            var tmpCntxt = this.form.currentContext;
            this.form.currentContext = null;
            if(this.clonesCount() == 0)
            {
                this.changedData = {
                    add : {},
                    upd : {},
                    del : {}
                }
            }
            this.form.currentContext = tmpCntxt;
            var oldFilter;
            var clCount = clCount || 0;
            containerDOM = containerDOM || this.form.DOM;
            if(this.standalone)
            {
                containerDOM = this.form.currentContext;
            }
            distinctData = {};
            if(!this.dataSet)
                return;
            if (this.parent && this.parentFields.length <= 0 && containerDOM.querySelectorAll('#'+this.DOM.id+':not([isrepeat])').length <=0 )
            {
                return;
            }
            this.dataSetUid = this.dataSet.uidData;
            if (this.callEvent('onbefore_repeat',containerDOM) === false)
                return;
        }
        var self = this;
        for(var i = innerStart || 0, c = this.dataSet.data.length; i < c; i++)
        {
            if(this.distinct)
            {
                if(distinctData[this.dataSet.data[i][this.distinct]])
                    continue;
                distinctData[this.dataSet.data[i][this.distinct]] = true;
            }
            if (this.conditions)
            {
                var next = false;
                for(var cnd in this.conditions)
                {
                    if(!this.conditions.hasOwnProperty(cnd)){
                        continue;
                    }
                    if(this.conditions[cnd].isfunc)
                    {
                        if(!this.form.callFunction(this.conditions[cnd].value,cnd,this.dataSet.data[i]))
                        {
                            next = true;
                            break;
                        }
                        continue;
                    }
                    if (this.dataSet.data[i][cnd] != this.conditions[cnd].value)
                    {
                        next = true;
                        break;
                    }
                }
                if (next)
                {
                    if(this.distinct)
                    {
                        distinctData[this.dataSet.data[i][this.distinct]] = false;
                    }
                    continue;
                }
            }
            var filter = '';
            if (this.parentFields.length > 0)
            {
                filter = [];
                for(var pi = 0, pc = this.parentFields.length; pi < pc; pi++)
                {
                    var selector = '.repeatername_'+this.parentFields[pi].rep;
                    for(var fi = 0, fc = this.parentFields[pi].fields.length; fi < fc; fi++)
                    {
                        if(this.parentFields[pi].fields[fi].parent)
                        {
                            var value;
                            if(this.parentFields[pi].fields[fi].isfunc)
                            {
                                value = this.form.callFunction(this.parentFields[pi].fields[fi].child,this.parentFields[pi].fields[fi].parent,this.dataSet.data[i]);
                            }else
                                value = this.dataSet.data[i][this.parentFields[pi].fields[fi].child];
                            selector += '.'+(this.parentFields[pi].fields[fi].parent+'_keyvalue'+value).replace(/\./g,'_');
                        }else
                            selector += '.repkeyvalue'+(''+this.dataSet.data[i][this.parentFields[pi].fields[fi].child]).replace(/\./g,'_');
                    }
                    filter.push(selector);
                }
                filter = filter.join(' ')+' ';
            }

            if (oldFilter != filter){
                var rptrs = containerDOM.querySelectorAll(filter+'#'+this.DOM.id+':not([isrepeat])');// TODO переделать onafter_refresh, на onafter_repeat например комбик
            }

            if (rptrs.length > 0)
                clCount++;
            else
            {
                if(this.distinct)
                {
                    distinctData[this.dataSet.data[i][this.distinct]] = false;
                }
            }

            for(var ri = 0, rc = rptrs.length; ri < rc; ri++)
            {
                this.targetDOM = rptrs[ri];

                addClone.call(this,this.dataSet.data[i],undefined,false, !nofragment );
            }
            oldFilter = filter;
            if(this.repeatCount > 0 && clCount >= this.repeatCount)
                break;

            if(this.async && topLevel && i > 0 && (innerStart === undefined || +innerStart>=1)  && i % this.async == 0)
            {
                insertFragmentElements();
                setTimeout(function(){
                    self.repeat(forceRepeat,containerDOM,++i,clCount)
                },0);
                return;
            }

        }
        insertFragmentElements();
        //Empty Data

        if(this.emptydata && clCount == 0)
        {
            var filter = '';
            if (this.parentFields.length > 0)
            {
                filter = [];
                for(var pi = 0, pc = this.parentFields.length; pi < pc; pi++)
                {
                    var selector = '.repeatername_'+this.parentFields[pi].rep;
                    filter.push(selector);
                }
                filter = filter.join(' ')+' ';
            }
            var rptrs = containerDOM.querySelectorAll(filter+'#'+this.DOM.id+':not([isrepeat])');
            for(var ri = 0, rc = rptrs.length; ri < rc; ri++)
            {
                this.targetDOM = rptrs[ri];
                if(this.emptydataparent)
                {
                    for(var f in this.emptydataparent)
                    {
                        if(!this.emptydataparent.hasOwnProperty(f)){
                            continue;
                        }
                        var parentclonedom = this.form.getClone(this.targetDOM);
                        if(parentclonedom && parentclonedom.clone)
                            this.emptydata[f] = parentclonedom.clone.data[this.emptydataparent[f]];
                    }
                }
                addClone.call(this,this.emptydata,undefined,false);
            }
        }
        this.callEvent('onafter_repeat',containerDOM);
    }
    function insertFragmentElements(){
        for(var remFragment = fragmentElements.splice(0, 1);remFragment && remFragment.length > 0; remFragment = fragmentElements.splice(0, 1)){
            remFragment[0].TargetElement.parentNode.insertBefore(remFragment[0].TargetFragment,remFragment[0].TargetElement)
        }
    }
    this.addClone = function(data,selfDOM)
    {
        data = data || {};
        this.setTargetDom();
        return addClone.call(this,data,selfDOM,true);
    }
    function addClone(data,selfDOM,byUser,noInsertClone /** недобавлять клон в основной документ. **/)
    {
        var targetDOM = (selfDOM)?this.DOM:((this.targetDOM)?this.targetDOM:this.DOM);
        this.hasClones = true;
        if (this.callEvent('onbefore_clone',data) === false){
            return;
        }

        var cl_dom = this.DOM.cloneNode(true);
        D3Api.removeProperty(cl_dom,'isD3Repeater');
        D3Api.removeProperty(cl_dom, 'dataset');
        this.form.clearEvents('oninit');
        var cl_uid = D3Api.getUniqId('cl');
        cl_dom.clone = {data: data, uid: cl_uid};
        this.parseClone(cl_dom,undefined,cl_uid);
        if(!noInsertClone){
            targetDOM && targetDOM.parentNode.insertBefore(cl_dom,targetDOM);
        }else{

            /** Корневой репитер. все дочерние клоны будут во фрагменте. **/
            var isAddTempFragment = true;
            var currfragment = false;
            for(var indxFrm = 0 ; indxFrm < fragmentElements.length ; indxFrm++){
                if(fragmentElements[indxFrm].TargetElement === targetDOM){
                    currfragment = fragmentElements[indxFrm];
                    isAddTempFragment = false;
                    break;
                }
            }

            if(!currfragment){
                var len = fragmentElements.push({
                    TargetElement:this.targetDOM,
                    TargetFragment:document.createDocumentFragment()
                })
                currfragment = fragmentElements[len - 1];
            }
            if(currfragment){
                if(this.parent){
                    if(isAddTempFragment){
                        currfragment.TargetFragment.appendChild(cl_dom);
                    }else{
                        //добавляем перед шаблоном
                        var templ = currfragment.TargetFragment.childNodes.length - 1;
                        currfragment.TargetFragment.insertBefore(cl_dom,currfragment.TargetFragment.childNodes[templ]);
                    }
                }else{
                    currfragment.TargetFragment.appendChild(cl_dom);
                }
            }
        }
        this.form.closureContext(cl_dom);
        this.form.callEvent('oninit');
        this.form.unClosureContext();
        var _data_ = this.form.setControlsData(this.controls,data,cl_dom,this.actionData);

        if (this.actionData)
            cl_dom.clone._data_ = D3Api.JSONstringify(_data_);//MD5.hex_md5

        cl_dom.id += 'clone';
        if (this.keyField)
        {
            cl_dom.setAttribute('repkeyvalue',data[this.keyField]);
            D3Api.addClass(cl_dom, ('repkeyvalue'+data[this.keyField]).replace(/\./g,'_'));
        }
        if(this.parentKeyFields)
        {
            for(var key in this.parentKeyFields)
            {
                if(!this.parentKeyFields.hasOwnProperty(key)){
                    continue;
                }
                cl_dom.setAttribute(key+'_keyvalue',data[key]);
                D3Api.addClass(cl_dom, (key+'_keyvalue'+data[key]).replace(/\./g,'_'));
            }
        }

        for(var i = 0, ic = this.childs.length; i < ic; i++)
        {
            this.childs[i].repeat(this,cl_dom,false,undefined,byUser);
        }

        D3Api.showDom(cl_dom,true);
        this.form.closureContext(cl_dom);
        this.callEvent('onafter_clone',cl_dom.clone.data,cl_dom);
        this.form.unClosureContext();
        if (this.name && D3Api.empty(data[this.keyField]))
        {
            this.changedData['add'][cl_dom.clone.uid] = cl_dom;
        }
        return cl_dom;
    }
    this.parseClone = function(dom,domContext,cloneUid)
    {
        var cmps = D3Api.getAllDomBy(dom,'[cmptype][isrepeat="'+this.uniqId+'"],[cmpparse][isrepeat="'+this.uniqId+'"],[isd3repeater][isrepeat="'+this.uniqId+'"]');
        var i = 0, cmp = dom;
        var context = domContext||dom;
        do
        {

            D3Api.removeProperty(cmp, 'isrepeat');
            D3Api.setProperty(cmp, 'isclone', "1");
            D3Api.setProperty(cmp, 'clone_uid', cloneUid);
            this.form.default_parse(cmp,false,context);
            cmp = cmps[i++];
        }while(cmp);
        var cmps = D3Api.getAllDomBy(dom,'[dataset][onbefore_refresh][isrepeat="'+this.uniqId+'"],[dataset][onrefresh][isrepeat="'+this.uniqId+'"],[dataset][onafter_refresh][isrepeat="'+this.uniqId+'"]');
        var i = 0, cmp = dom;
        while(i < cmps.length)
        {
            var cmp = cmps[i++];
            var dataset = this.form.getDataSet(D3Api.getProperty(cmp,'dataset'));
            var prop = null;
            if(prop = D3Api.getProperty(cmp,'onbefore_refresh'))dataset.addEvent('onbefore_refresh',this.form.execDomEventFunc(cmp,prop));
            if(prop = D3Api.getProperty(cmp,'onrefresh'))dataset.addEvent('onrefresh',this.form.execDomEventFunc(cmp,prop));
            if(prop = D3Api.getProperty(cmp,'onafter_refresh'))dataset.addEvent('onafter_refresh',this.form.execDomEventFunc(cmp,prop));
        }
    }
    this.removeAllClones = function(containerDOM)
    {
        var clones = this.clones(containerDOM);
        for(var i = 0, c = clones.length; i < c; i++)
        {
            this.removeClone(clones[i]);
        }
    }
    this.removeClone = function(clone)
    {
        if(clone.clone)
        {
            if (this.changedData['add'][clone.clone.uid])
                delete this.changedData['add'][clone.clone.uid];
            else
            {
                if(this.parent)
                {
                    var parentClone = this.form.getClone(clone,this.parent.name);
                    if(parentClone)
                        clone.clone.parentUid = parentClone.clone.uid;
                }
                this.changedData['del'][clone.clone.uid] = clone;
            }
        }
        D3Api.removeDom(clone);
        this.callEvent('onclone_remove',clone);
    }
    this.clones = function(containerDOM)
    {
        if(!containerDOM)
        {
            if(this.form.currentContext && D3Api.getProperty(this.form.currentContext,'repeatername','') != this.name && D3Api.getDomBy(this.form.currentContext,'#'+this.uniqId+'[repeatername="'+this.name+'"]'))
            {
                containerDOM = this.form.currentContext;
            }else
            {
                containerDOM = this.targetDOM || this.form.DOM;
                if(fragmentElements.length > 0 && (!nofragment || !D3Api.empty(this.parent))){
                    for(var i = 0 ; i < fragmentElements.length ; i++){
                        if(fragmentElements[i].TargetElement === containerDOM){
                            containerDOM = fragmentElements[i].TargetFragment
                            break;
                        }
                    }
                }else{
                    if (containerDOM && containerDOM.parentNode){
                        containerDOM = containerDOM.parentNode;
                    }
                }

            }
        }
        if (containerDOM)
            return containerDOM.querySelectorAll('#'+this.uniqId+'clone');
    }
    this.clonesCount = function()
    {
        var cl = this.clones();
        if(cl && cl.length !== undefined)
            return cl.length;
        return;
    }
    this.getChangedData = function(type)
    {
        var cls = this.clones();
        var chData = {};
        var findChange = function fnFindChange(repeater,clone)
        {
            if(!repeater.name || !repeater.keyField)
                return false;
            var cls = repeater.clones(clone);
            for(var i = 0, ic = cls.length; i < ic; i++)
            {
                if (repeater.changedData['add'][cls[i].clone.uid])
                    return true;
                var _data_ = D3Api.JSONstringify(repeater.form.getControlsData(repeater.controls,cls[i]));
                if (_data_ != cls[i].clone._data_)
                    return true;
                else
                {
                    for(var c = 0, cc = repeater.childs.length; c < cc; c++)
                    {
                        if(fnFindChange(repeater.childs[c],cls[i]))
                            return true;
                    }
                }
            }
            for(var cl in repeater.changedData['del'])
            {
                if(!repeater.changedData['del'].hasOwnProperty(cl)){
                    continue;
                }
                if(repeater.changedData['del'][cl].clone.parentUid == clone.clone.uid)
                    return true;
            }
            return false;
        }
        if(type == 'each')
        {
            for(var i = 0, ic = cls.length; i < ic; i++)
            {
                chData[cls[i].clone.uid] = cls[i];
            }
        }else if (type == 'del')
        {
            for(var cl in this.changedData['del'])
            {
                if(!this.changedData['del'].hasOwnProperty(cl)){
                    continue;
                }
                if(this.parent && this.form.currentContext && this.form.currentContext.clone.uid == this.changedData['del'][cl].clone.parentUid)
                {
                    chData[cl] = this.changedData['del'][cl];
                }else if(!this.parent)
                    chData[cl] = this.changedData['del'][cl];
            }
        }else
        {
            for(var i = 0, ic = cls.length; i < ic; i++)
            {
                if (this.changedData['add'][cls[i].clone.uid] && type == 'add')
                {
                    chData[cls[i].clone.uid] = this.changedData['add'][cls[i].clone.uid];
                }
                if(this.changedData['add'][cls[i].clone.uid] || type == 'add')
                {
                    continue;
                }
                var _data_ = D3Api.JSONstringify(this.form.getControlsData(this.controls,cls[i]));
                if (_data_ != cls[i].clone._data_)
                {
                    this.changedData['upd'][cls[i].clone.uid] = cls[i];
                    chData[cls[i].clone.uid] = this.changedData['upd'][cls[i].clone.uid];
                }else
                {
                    for(var c = 0, cc = this.childs.length; c < cc; c++)
                    {
                        if(findChange(this.childs[c],cls[i]))
                        {
                            this.changedData['upd'][cls[i].clone.uid] = cls[i];
                            chData[cls[i].clone.uid] = this.changedData['upd'][cls[i].clone.uid];
                            break;
                        }
                    }
                }
            }
        }
        return chData;
    }

    /**************************************/
    //Идентификаторы дынных сгруппированных по связи с родителями
    this.dataChild = {};

    //Ключи для текущей строки для детей у которых текущий репитер указан в связях с родителем
    this.childKeys = {};
    this.currentData = [];
    this.isDataPrepared = false;
    this.prepareData = function()
    {
        if(this.isDataPrepared)
        {
            return;
        }
        this.isDataPrepared = true;
        if(this.parentFields.length <= 0)
        {
            this.dataChild = null;
            return;
        }
        this.dataChild = {};
        var firstRow = true;
        for(var i = 0, c = this.dataSet.data.length; i < c; i++)
        {
            var pKey = [];

            for(var ri = 0, rc = this.parentFields.length; ri < rc; ri++)
            {
                if(firstRow)
                {
                    var rep = form.getRepeater(this.parentFields[ri].rep);
                    rep.addChildKey(this.name,this.parentFields[ri].fields);
                }
                var pVal = [];
                for(var fi = 0, fc = this.parentFields[ri].fields.length; fi < fc; fi++)
                {
                    var pF = this.parentFields[ri].fields[fi].parent || this.parentFields[ri].fields[fi].parentKey;
                    pVal.push(pF+'='+this.dataSet.data[i][this.parentFields[ri].fields[fi].child]);
                }
                pKey.push(this.parentFields[ri].rep+':'+pVal.join(':'));
            }
            this.dataChild[pKey.join(';')] = this.dataChild[pKey.join(';')] || [];
            this.dataChild[pKey.join(';')].push(i);
            firstRow = false;
        }
    }
    this.checkPrepareData = function(reset)
    {
        if(!reset && !this.isDataPrepared)
            return false;

        reset && (this.isDataPrepared = false);

        for(var i = 0, c = this.childs.length; i < c; i++)
        {
            if(!this.childs[i].checkPrepareData(reset) && !reset)
                return false;
        }
        return true;
    }
    this.addChildKey = function(name,info)
    {
        this.childKeys[name] = info;
    }
    this.getKey = function(childName)
    {
        if(!this.childKeys[childName])
            return false;
        var pVal = [];
        for(var i = 0, c = this.childKeys[childName].length; i < c; i++)
        {
            var pF = this.childKeys[childName][i].parent || this.childKeys[childName][i].parentKey;
            pVal.push(pF+'='+this.currentData[pF]);
        }
        return this.name+':'+pVal.join(':');
    }
    this.isCurrentRepeat = null;
    this.clonesFragment = null;
    this.simpleRepeat = function(forceRepeat,containerDOM,dataIndex,startIndex,clCount)
    {
        containerDOM = containerDOM || this.DOM;
        var topLevel = !this.parent;
        if(!dataIndex)
        {
            if(topLevel && !forceRepeat && (this.noRepeat || this.dataSet && this.dataSetUid == this.dataSet.uidData))
            {
                return;
            }
            if(this.dataSet)
                this.dataSetUid = this.dataSet.uidData;
            if (this.callEvent('onbefore_repeat',containerDOM) === false)
                return;
            dataIndex = [];
            if(this.parent && this.parentFields.length > 0)
            {
                var key = [];
                var p = this.parent;
                while(p)
                {
                    var pk = p.getKey(this.name);
                    pk && key.push(pk);
                    p = p.parent;
                }
                key.reverse();
                key = key.join(';');
                dataIndex = this.dataChild[key] || [];
            }else
            {
                dataIndex = Object.keys(this.dataSet.data);
            }
            if(topLevel)
            {
                if(this.isCurrentRepeat)
                {
                    clearTimeout(this.isCurrentRepeat);
                    this.isCurrentRepeat = null;
                }
                this.removeAllClones();
                this.changedData = {
                    add : {},
                    upd : {},
                    del : {}
                };
                this.clonesFragment = null;
                this.clonesFragment = document.createDocumentFragment();
            }
            distinctData = {};
        }
        clCount = clCount || 0;
        for(var i = startIndex || 0, c = dataIndex.length; i < c; i++)
        {
            this.currentData = this.dataSet.data[dataIndex[i]];
            if(this.distinct)
            {
                if(distinctData[this.currentData[this.distinct]])
                    continue;
                distinctData[this.currentData[this.distinct]] = true;
            }
            if (this.conditions)
            {
                var next = false;
                for(var cnd in this.conditions)
                {
                    if(!this.conditions.hasOwnProperty(cnd)){
                        continue;
                    }
                    if(this.conditions[cnd].isfunc)
                    {
                        if(!this.form.callFunction(this.conditions[cnd].value,cnd,this.currentData))
                        {
                            next = true;
                            break;
                        }
                        continue;
                    }
                    if (this.currentData[cnd] != this.conditions[cnd].value)
                    {
                        next = true;
                        break;
                    }
                }
                if (next)
                {
                    if(this.distinct)
                    {
                        distinctData[this.currentData[this.distinct]] = false;
                    }
                    continue;
                }
            }
            this.simpleClone(containerDOM);
            clCount++;
            if(this.repeatCount > 0 && clCount >= this.repeatCount)
                break;
            if(this.async && topLevel && i > 0 && (startIndex === undefined || +startIndex>=1)  && (i % this.async) === 0)
            {
                this.isCurrentRepeat = setTimeout(D3Api.bindThis(function(){this.simpleRepeat(true,containerDOM,dataIndex,++i,clCount)},this),100);
                return;
            }
        }

        if(!this.parent)
        {
            this.checkPrepareData(true);
            containerDOM.parentNode.insertBefore(this.clonesFragment,containerDOM);
            this.clonesFragment = null;
            this.callEvent('onafter_repeat',containerDOM);
        }
    }
    this.simpleClone = function(containerDOM)
    {
        for(var i = 0, c = this.controls.length; i < c; i++)
        {
            for (var prop  in this.controls[i].datafields)
            {
                if(!this.controls[i].datafields.hasOwnProperty(prop)){
                    continue;
                }
                var v = this.currentData[this.controls[i].datafields[prop]];
                this.form.setControlProperty(this.controls[i].control, prop, v);
            }
        }
        var clone = this.DOM.cloneNode(true);
        D3Api.removeProperty(clone,'isD3Repeater');
        clone.clone = {data: this.currentData, uid: D3Api.getUniqId('cl'),timeout:null};
        for(var ci = 0, cc = this.childs.length; ci < cc; ci++)
        {
            this.childs[ci].simpleRepeat(true,clone.querySelector('#'+this.childs[ci].uniqId));
        }
        if(this.parent)
            containerDOM.parentNode.insertBefore(clone,containerDOM);
        else
            this.clonesFragment.appendChild(clone);
        D3Api.showDom(clone,true);
        clone.id += 'clone';
        this.simpleParseClone(clone,undefined,clone.clone.uid);
        this.form.closureContext(clone);
        var smpl = this.simpleType||(this.rootParent && this.rootParent.simpleType);
        if(smpl === 'base')
        {
            var self = this;
            var timerId = setTimeout(function(){
                /**выполняется из очереди вызова за это время форма успела уже закрыться**/
                if(self.form){
                    self.callEvent('onafter_clone',clone.clone.data,clone);
                    if(clone.clone.timeout){
                        var indx = simpleClones.indexOf(clone.clone.timeout);
                        if(indx > -1){
                            simpleClones.splice(indx,1);
                        }
                        indx = null;
                        clone.clone.timeout = null;
                        delete indx;
                    }
                }
            },0);
            clone.clone.timeout = timerId;
            simpleClones.push(clone.clone.timeout);
        }else
            this.callEvent('onafter_clone',clone.clone.data,clone);
        this.form.unClosureContext();
        return clone;
    }
    this.simpleParseClone = function(dom,domContext,cloneUid)
    {
        var smpl = this.simpleType||(this.rootParent && this.rootParent.simpleType);
        var cmps = (smpl !== 'base')?D3Api.getAllDomBy(dom,'[isrepeat="'+this.uniqId+'"]'):[];
        var i = 0, cmp = dom;
        var context = domContext||dom;
        do
        {
            if(smpl === 'closure')
            {
                var onclk = cmp.getAttribute('onclick');
                if(onclk !== '')
                {
                    cmp.D3Store = {_setEvents_:{onclick: true}};
                    cmp.onclick = this.form.execDomEventFunc(cmp, 'if(callControlEvent(D3Api.getControlByDom(this),\'onclick\',event)===false)return;' + onclk, 'onclick', context);
                    if (D3Api.BROWSER.msie) {
                        D3Api.setProperty(dom, '_onclick_', onclk);
                    }
                }
            }else
                cmp.D3Store = {};
            cmp = cmps[i++];
        }while(cmp);
    }
    /**************************************/
    
    this.addControl(this.DOM);
}
