/**
 * @class
 * @param form
 * @param name
 * @param dom
 * @constructor
 */
D3Api.D3Module = function(form,name,dom){
    D3Api.D3Base.call(this);
    this.name = name;
    this.form = form;
    this.requestParams = {};
    this.sysinfo = null;
    this.data = {};
    this.datadest = [];
    
    /**
     *
     * @param dom
     */
    this.init = function(dom){

    }
    if(dom){
        this.init(dom);
    }

    /**
     *
     */
    this.destructor = function(){
        this.data = null;
        this.name = null;
        this.form = null;
        this.requestParams = null;
        this.sysinfo = null;
        this.datadest = null;

        delete this.name;
        delete this.form;
        delete this.requestParams;
        delete this.sysinfo;
        delete this.datadest;
        delete this.data;

        this.destructorBase();
    }

    /**
     *
     * @param onsuccess
     * @param onerror
     * @param sync
     * @param force
     */
    this.execute = function(onsuccess,onerror,sync,force){
        var params = this.sysinfo.getParams();
        var reqData = D3Api.mixin({
            type: 'Module',
            params: params
        },this.requestParams);
        this.form.sendRequest(this.name,reqData,sync,onsuccess,onerror);
    }

    /**
     *
     * @param paramObj
     */
    this.addSysInfoParam = function(paramObj){
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
        }else{
            this.sysinfo.params.push(paramObj);
        }

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
     * @param data
     */
    this.setData = function(data)
    {
        this.data = data;
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
                    this.form.setControlProperty(dest.name,dest.prop,v);
                    break;
            }
        }
    }

    /**
     *
     * @returns {{}|null}
     */
    this.getData = function()
    {
        return this.data;
    }
};
