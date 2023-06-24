D3Api.GLOBAL_DEPENDENS={};
D3Api.dependencesInit = function(nameDep,requiredArr, dependArr) {
    var dep = {};
    dep['require'] = requiredArr;
    dep['depend'] = dependArr;
    dep['style'] = {};
    for (var ind in requiredArr){
        var ctrl = this.getCtrl(requiredArr[ind]);
        if (ctrl.length === 0) {
            console.error("dependencesInit","Controll not found in page: "+requiredArr[ind]);
            continue
        }
        ctrl.on( "change", function() {
            var nameCtrl = this.getAttribute("name");
            var name = nameCtrl.substring(0, nameCtrl.length-5);
            D3Api.testDepCtrl(nameDep);
        });
        dep['style'][requiredArr[ind]]=ctrl.css('border'); // запоминаем какого стиля была рамка
    }
    D3Api.GLOBAL_DEPENDENS[nameDep] = dep;
    D3Api.testDepCtrl(nameDep);
 }
/**
* Функция проверки заполненных полей (required) и  включение или выключение зависимых контролов (depend)
*/
D3Api.testDepCtrl = function(nameDep) {
    var dep = D3Api.GLOBAL_DEPENDENS[nameDep];
    var error=0; // индекс ошибки
    for (var ind in dep['require']){
        var nameCtrl = dep['require'][ind];
        var ctrl = D3Api.getCtrl(nameCtrl);
        var val = D3Api.getValue(nameCtrl,'');
        if (val == '') {
            error += 1;
            ctrl.css('border', 'red 1px solid'); // устанавливаем рамку красного цвета
        } else {
            ctrl.css('border', dep['style'][nameCtrl]);
        }
    }
    if (error==0) {
        D3Api.setDisabledArr(dep['depend'], false);
    } else {
        D3Api.setDisabledArr(dep['depend'], true);
    }
};

/**
* Функция очистки контролируемых контролов
*/
D3Api.dependencesClear = function(nameDep) {
    var dep = D3Api.GLOBAL_DEPENDENS[nameDep];
    for (var ind in dep['require']) {
        var nameCtrl = dep['require'][ind];
        var ctrl = D3Api.getCtrl(nameCtrl);
        ctrl.css('border', dep['style'][nameCtrl]);
    }
    D3Api.setDisabledArr(dep['depend'], false);
    delete D3Api.GLOBAL_DEPENDENS[nameDep];
}

/**
*  Добавить контрол который должен быть заполнен (required)
*/
D3Api.dependencesAddCtrl = function(nameDep, nameNewCtrl) {
    if (!(nameDep in D3Api.GLOBAL_DEPENDENS)) {
        console.error('Not controls dependences :'+dependences);
        return
    }
    var dep = D3Api.GLOBAL_DEPENDENS[nameDep];
    nameNewCtrl = nameNewCtrl.trim();
    if (!dep['require'].includes(nameNewCtrl)) {
        dep['require'].push(nameNewCtrl);
    }
    var ctrl = this.getCtrl(nameNewCtrl);
    if (ctrl.length === 0) {
        console.error("dependencesAddCtrl","Controll not found in page: " + nameNewCtrl);
        continue
    }
    ctrl.on( "change", function() {
        var nameCtrl = this.getAttribute("name");
        var name = nameCtrl.substring(0, nameCtrl.length-5);
        D3Api.testDepCtrl(nameDep);
    });
    dep['style'][requiredArr[ind]] = ctrl.css('border'); // запоминаем какого стиля была рамка
    D3Api.testDepCtrl(nameDep);
}

/*
* Функция добавления зависимого контрола который должен быть не активен, если  контролы required не все заполнены
*/
D3Api.dependencesAddDep = function(nameDep, nameNewCtrl) {
    if (!(nameDep in D3Api.GLOBAL_DEPENDENS)) {
        console.error('Not controls dependences :'+dependences);
        return
    }
    var dep = D3Api.GLOBAL_DEPENDENS[nameDep];
    nameNewCtrl = nameNewCtrl.trim();
    if (!dep['depend'].includes(nameNewCtrl)) {
        dep['depend'].push(nameNewCtrl);
    }
    var ctrl = this.getCtrl(nameNewCtrl);
    if (ctrl.length === 0) {
        console.error("dependencesAddDep","Controll not found in page: " + nameNewCtrl);
        continue
    }
    D3Api.testDepCtrl(nameDep);
}