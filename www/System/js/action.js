/**
 * @class
 * @param form
 * @param name
 * @param dom
 * @constructor
 */
D3Api.D3Action = function(form,name,dom)
{
    D3Api.D3Base.call(this);
    this.name = name;
    this.form = form;
    this.data = {};
    this.dataHash = '';
    this.checkPointHash = null;
    //Флаг того что был сделан запрос на сервер
    this.sendRequest = false;
    this.datadest = new Array();
    
    this.sysinfo = null;
    this.requestParams = {};
    /**
     *
     * @param paramObj
     */
    this.addSysInfoParam = function(paramObj)
    {
        if(paramObj['put'])
        {
            switch (paramObj['srctype'])
            {
                case 'ctrl':
                        var pf = paramObj['src'].split(':');
                        if (pf.length > 1 || paramObj['property'])
                            this.addControl(pf[0],paramObj['property'] || pf[1],paramObj['put']);
                        else
                            this.addControl(pf[0],'value',paramObj['put']);
                    break;
                case 'var':
                        this.addVar(paramObj['src'],paramObj['put'],paramObj['property'],paramObj['global']);
                    break;
            }
        }else
            this.sysinfo.params.push(paramObj);
    }

    /**
     *
     * @param paramObj
     */
    this.removeSysInfoParam = function(paramObj)
    {
        var params =this.sysinfo.params;
        for(var i=0;i<params.length;i++)
        { 
            if ((params[i].get==paramObj['get'])&&(params[i].src==paramObj['src'])&&(params[i].srctype==paramObj['srctype'])) this.sysinfo.params.splice(i,1);
        }
    }

    /**
     *
     * @param dom
     */
    this.init = function(dom)
    {
    }
    if(dom)
        this.init(dom);
    
    /**
     *
     */
    this.destructor = function()
    {
        this.data = null;
        this.datadest = null;
        this.form = null;
        this.sysinfo = null;
        this.requestParams = null;
        
        delete this.name;
        delete this.data;
        delete this.datadest;
        delete this.form;
        delete this.dataHash;
        delete this.sendRequest;
        
        this.destructorBase();
    }

    /**
     *
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     */
    this.execute = function(onsuccess,onerror,sync,force)
    {
        this.callEvent('onprepare_params');
        var params = this.sysinfo.getParams();
        var reqData = D3Api.mixin({
            type: 'Action',
            params: params
        },this.requestParams);
        this.callEvent('onbefore_execute');
        for(var i = 0, c = this.datadest.length; i < c; i++)
        {
            var dest = this.datadest[i];            
            if (dest.type == 'ctrl')
            {
                D3Api.BaseCtrl.callMethod(this.form.getControl(dest.name),'startWait');
            }
        }
        this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
    }

    /**
     *
     * @param save
     * @returns {*}
     */
    this.checkPoint = function(save)
    {
        save = (save === undefined)?true:save;
        var hash = D3Api.JSONstringify(this.sysinfo.getParams(this.name),true);
        if(save)
            this.checkPointHash = hash;
        return hash;
    }

    /**
     *
     * @returns {boolean}
     */
    this.check = function()
    {
        return this.checkPointHash != this.checkPoint(false);
    }

    /**
     *
     * @param name
     * @param property
     * @param field
     */
    this.addControl = function(name,property,field)
    {
        this.datadest.push({type: 'ctrl', name: name, prop: property, field:field});
    }

    /**
     *
     * @param name
     * @param field
     * @param property
     * @param global
     */
    this.addVar = function(name,field,property,global)
    {
        this.datadest.push({type: 'var', name: name, field:field, property: property, global: global});
    }

    /**
     *
     */
    this.reSetData = function()
    {
        this.setData(this.data);
    }

    /**
     *
     * @param data
     */
    this.setDataSilent = function(data)
    {
        this.data = data;
    }
    /**
     * @example Объект {field1: 1,field2: 2}
     * @param {object} data
     */
    this.setData = function(data)
    {
        this.data = data;
        this.callEvent('onexecute');
        for(var i = 0, c = this.datadest.length; i < c; i++)
        {
            var dest = this.datadest[i];
            var v = this.data[dest.field]; 
            if (v === undefined)
                continue;
            
            switch (dest.type)
            {
                case 'var':
                        var DESTOBJ = this.form;
                        if(dest.global === 'true')
                            DESTOBJ = D3Api;
                        if(dest.property)
                        {
                            var obj = DESTOBJ.getVar(dest.name) || {};
                            obj[dest.property] = v;
                            DESTOBJ.setVar(dest.name,obj);
                        }else
                            DESTOBJ.setVar(dest.name,v);
                    break;
               case 'ctrl':
                        D3Api.BaseCtrl.callMethod(this.form.getControl(dest.name),'stopWait');
                        if(Array.isArray(v)){
                            var ctrl = this.form.getControl(dest.name);
                            if(ctrl.D3Repeater){
                                ctrl.D3Repeater.setData(v);
                                continue;
                            }
                        }
                        this.form.setControlProperty(dest.name,dest.prop,v);
                    break;
            }
        }
        
        this.callEvent('onafter_execute');
        //this.form.resize();
    }

    /**
     *
     * @returns {{}|null}
     */
    this.getData = function()
    {
        return this.data;
    }
}
