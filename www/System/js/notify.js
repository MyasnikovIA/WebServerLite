D3Api.notify = function D3Api_showNotify(title,text,options)
{
    if(!D3Api._notifyDom_)
    {
        var c = document.createElement('DIV');
        c.id = 'notify_modal_container';
        c.style.display='none';
        c.style.position = 'fixed';
        c.style.width = '100%';
        c.style.height = '100%';
        c.style.top = '0';
        c.style.left = '0';
        try
        {
            c.style.backgroundColor = 'rgba(0,0,0,0.1)';
        }catch(e)
        {
            c.style.backgroundColor = 'transparent';
        }
        c.onclick = function(){
            var n = this.notify.pop();
            if(!n)
                return;
            if(!n.options.template || n.options.template != 'modal')
                n.close();
        };
        document.body.appendChild(c);
        D3Api._notifyDom_ = c;
        
        c = document.createElement('DIV');
        c.id = 'notify_container';
        c.style.display='none';
        $(c).append('<div id="default"><h1>#{title}</h1><p>#{text}</p></div>');
        $(c).append('<div id="sticky"><a class="ui-notify-close ui-notify-cross" href="#">X</a><a class="ui-notify-code ui-notify-cross" href="#" onclick="D3Api.notify.prototype.notifyObj._func_showCode(this)">#</a><h1>#{title}</h1><textarea class="ui-notify-codearea" readonly="readonly" style="display: none;">#{text}</textarea><p oncontextmenu="D3Api.stopEvent(event,false); return true;">#{brtext}</p>#{footer}</div>');
        $(c).append('<div id="modal"><h1>#{title}</h1><p oncontextmenu="D3Api.stopEvent(event,false); return true;">#{brtext}</p>#{footer}</div>');
        document.body.appendChild(c);
        D3Api.notify.prototype.notifyObj = $('#notify_container').notify();
        D3Api.notify.prototype.notifyObj._func_showCode = function(btn)
        {
            var notify = btn.parentNode;
            var ta = $('textarea',notify).get(0);
            var p = $('p',notify).get(0);
            if(!notify._width_)
            {
                notify._width_ = D3Api.getStyle(notify,'width');
                notify.style.width = 'auto';
                var rect = D3Api.getAbsoluteClientRect(p);
                var w = D3Api.getPageWindowSize();
                ta.style.width = rect.width+'px';
                if(rect.y+rect.height+30 > w.windowHeight)
                {
                    ta.style.height = (w.windowHeight - 30 - rect.y)+'px';
                }else
                {
                    ta.style.height = (rect.height+30)+'px';
                }
                if(rect.width > w.windowWidth)
                {
                    ta.style.width = (w.windowWidth - 40)+'px';
                }
                $(p).hide();
                $(ta).show();
            }else
            {
                notify.style.width = notify._width_;
                notify._width_ = undefined;
                $(ta).hide();
                $(p).show();
            }
        }
        D3Api.notify.prototype.notifyObj._close_all_notify_ = function(){
            $("#notify_container").empty();//удаляем все что внутри
            $('#notify_modal_container').hide(); //скрываем контейнер
            D3Api.notify.prototype.openedSticky = 0;
        }
    }

    options = options || {};
    var template = 'default';
    if(options.modal == true)
    {
        options.expires = false;
        template = (options.template && options.template == 'modal')?'modal':'sticky';
        options.beforeopen = function(ev,notify)
        {
            D3Api.notify.prototype.openedSticky++;
            $('#notify_modal_container').show();
        }
        options.close = function()
        {
            if($("a").is("#notify_btn_msg_all") && $('.ui-notify-message:visible').length<3 ){
                $("#notify_btn_msg_all").closest("div").remove();
            }
            D3Api.notify.prototype.openedSticky--;
            if(D3Api.notify.prototype.openedSticky <= 0)
            {
                D3Api.notify.prototype.openedSticky = 0;
                $('#notify_modal_container').hide();
            }
        }
        options.click = function(e,notify)
        {
            if(options.onclick instanceof Function)
                options.onclick();
            //else
                //notify.close();
        }
    }else if(options.expires === false)
    {
        options.click = function(e,notify)
        {
            notify.close();
        }
    }else if(D3Api.isUndefined(options.expires))
    {
        options.expires = 2000;
    }
    var brtext = text.replace(/\n/g, '<br/>');
    text = text.replace(/<br\/>/g, '\n');
    var res = D3Api.notify.prototype.notifyObj.notify('create',template,{title: title, text: text, brtext: brtext, footer: options.footer||''},options);
    this.notify_modal_container = this.notify_modal_container || $('#notify_modal_container').get(0);
    this.notify_modal_container.notify = this.notify_modal_container.notify || [];
    this.notify_modal_container.notify.push(res);
    if($('.ui-notify-click').length > 1 && !$("a").is("#notify_btn_msg_all")){
        var d = document.createElement('DIV');
        d.className = 'ui-notify-message ui-notify-message-style ui-notify-click';
        $(d).append('   <h1>' +
                    '       <a href="#" cont="btn_msg_mark_all" id="notify_btn_msg_all" class="notify_btn_msg_all" onclick="D3Api.notify.prototype.notifyObj._close_all_notify_()">Закрыть все уведомления</a>' +
                    '   </h1>' +
                    '   <p oncontextmenu="D3Api.stopEvent(event,false); return true;"/>');
        $('.ui-notify-message:first-child').before(d);
    }
    return res;
}
D3Api.notify.prototype.notifyObj = {};
D3Api.notify.prototype.notify_modal_container = null;
D3Api.notify.prototype.openedSticky = 0;
