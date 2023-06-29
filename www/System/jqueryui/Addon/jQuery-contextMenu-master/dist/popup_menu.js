D3Api.GLOBAL_POPUP_OBJECT={};// JSON объекты созданные из тэгов с привязкой к имени POPUP
D3Api.GLOBAL_POPUP_ITEMS={};// список полей привязкой к имени POPUP меню
D3Api.GLOBAL_POPUP_CTRL={};  // список контролов к которым прекреплен popup меню

D3Api.RegistrPopUpItem = function(nameCtrl, ObjectPopUp) {
    D3Api.GLOBAL_POPUP_ITEMS[nameCtrl] = ObjectPopUp;
};

D3Api.RegistrPopUp = function(namePopUp, ObjectPopUp) {
     if (namePopUp in D3Api.GLOBAL_POPUP_OBJECT) {
          console.error("popup control has deplicate in page:"+namePopUp);
          return;
     }
     D3Api.GLOBAL_POPUP_OBJECT[namePopUp] = ObjectPopUp;
     D3Api.reInitPopUp();
};
D3Api.InitPopUp = function(nameCtrl, namePopUp) {
   if (nameCtrl=="") return;
   D3Api.GLOBAL_POPUP_CTRL[nameCtrl] = {is_init: false, namePopUp: namePopUp, isExistPopUp:false};
   D3Api.reInitPopUp();
};
D3Api.reInitPopUp = function() {
    for (var nameCtrl in D3Api.GLOBAL_POPUP_CTRL) {
        if (!D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['is_init']) {
            var namePopUp = D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['namePopUp'];
            if (namePopUp in D3Api.GLOBAL_POPUP_OBJECT) {
                D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['popup'] = Object.assign({}, D3Api.GLOBAL_POPUP_OBJECT[namePopUp]);
                D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['popup']['selector'] = '[name="'+nameCtrl+'"]';
                $.contextMenu(D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['popup']);
                D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['is_init'] = true;
                D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['isExistPopUp'] = true;
            }
        };
    }
};

D3Api.setVisibleArrPopUp = function(arrItems,value) {
    for (var ind in arrItems){
        D3Api.setVisiblePopUp(arrItems[ind],value);
    }
}

D3Api.setVisiblePopUp = function(nameItem,value) {
    for (var nameCtrl in D3Api.GLOBAL_POPUP_CTRL) {
        var namePopUp = D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['namePopUp'];
        if ((namePopUp in D3Api.GLOBAL_POPUP_OBJECT) && (namePopUp in D3Api.GLOBAL_POPUP_ITEMS)) {
            if (D3Api.GLOBAL_POPUP_ITEMS[namePopUp].includes(nameItem)) {
                $('[name="'+nameCtrl+'"]').data(nameItem+'_visible', !value);
            }
        }
    }
};
D3Api.setDisabledArrPopUp = function(arrItems,value) {
    for (var ind in arrItems){
        D3Api.setDisabledPopUp(arrItems[ind],value);
    }
}
D3Api.setDisabledPopUp = function(nameItem,value) {
    for (var nameCtrl in D3Api.GLOBAL_POPUP_CTRL) {
        var namePopUp = D3Api.GLOBAL_POPUP_CTRL[nameCtrl]['namePopUp'];
        if ((namePopUp in D3Api.GLOBAL_POPUP_OBJECT) && (namePopUp in D3Api.GLOBAL_POPUP_ITEMS)) {
            if (D3Api.GLOBAL_POPUP_ITEMS[namePopUp].includes(nameItem)) {
                $('[name="'+nameCtrl+'"]').data(nameItem+'_disabled', value);
            }
        }
    }
};
// функция вызывается перед тем как показать контекстное меню
D3Api.RegisterPositionPopUpMenu = function(dom,option,x,y) {
    console.log('-------------RegisterPositionPopUpMenu---------');
    dom.data()
    console.log('dom',dom);
    console.log('option',option);
    console.log('x',x);
    console.log('y',y);
    console.log('name',option.$trigger.attr("name"));
}
