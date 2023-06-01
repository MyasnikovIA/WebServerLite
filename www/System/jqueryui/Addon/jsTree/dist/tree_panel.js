D3Api.GLOBAL_TREE_DATA = {};

D3Api.RegistrTreePanel = function(name,treeObj,data) {
    $.jstree.defaults.core.themes.variant = "large";
    treeObj['core']['data'] = data;
    D3Api.GLOBAL_TREE_DATA[name] = data;
	$('[name="'+name+'"]').jstree(treeObj).on("changed.jstree", function (e, data) {
        if(data.selected.length) {
            // Если на компоненте установлено событие onchange, тогда запускаем его
	        if ('onchange' in e.target) {
                e.target.onchange(e, data);
            }
           // Если на компоненте установлено событие onchange, тогда запускаем его
	       // if ('dblclick' in e.target) {
           //     e.target.dblclick(e, data);
           // }
            //if ('dblclick' in data.instance.get_node(data.selected[0]).original) {
            //    data.instance.get_node(data.selected[0]).original['dblclick'](e,data);
            //}
	        // если на выбронном итеме  стоит событие, тогда запускаем это событие
            if ('onchange' in data.instance.get_node(data.selected[0]).original) {
                data.instance.get_node(data.selected[0]).original['onchange'](e,data);
            }
        }
    }) .on("keyup", function (event) {
      // (event.keyCode == 46) del
    }) .on("keypress", function (event) {

    }) .on("dblclick", function (event) {

    }).bind("create_node.jstree", function (e, data) {
              //create node will be added to the datasource
              data.instance.settings.core.data.push( data.node )
              data.instance.refresh()
    }).bind("loaded.jstree", function (e, data) {
              //this will trigger when jstree is loaded
              //we call the api method here
    })  ;
};

D3Api.setDisabledTreeNode = function(namePanel,nameNode) {
    var instance =$('[name="'+namePanel+'"]').jstree(true);
    instance.disable_node(namePanel+':'+nameNode);
}

D3Api.selectTreeNode = function(namePanel,nameNode) {
    var instance =$('[name="'+namePanel+'"]').jstree(true);
	instance.deselect_all();
	instance.select_node(namePanel+':'+nameNode);
}

D3Api.getTreeNode = function(namePanel, nameNode) {
    var instance =$('[name="'+namePanel+'"]').jstree(true);
	return instance.get_node(namePanel+':'+nameNode);
}

D3Api.deleteTreeNode = function(namePanel,nameNode) {
    var ctrlObj = $('[name="'+namePanel+'"]');
    var node =ctrlObj.jstree(true).get_node(namePanel+':'+nameNode);
    ctrlObj.jstree("delete_node", node);
}

//  получить список ID выбранных node
//    var selectedNode = $('[name="'+namePanel+'"]').jstree(true).get_selected();
D3Api.createTreeNode = function(namePanel,nodeObj) {
   //  получить список ID выбранных node
   //    var selectedNode = ctrlObj.jstree(true).get_selected();

    var ctrlObj = $('[name="'+namePanel+'"]');
   //  if (!('text' in nodeObj)) {
   //     nodeObj['text'] = nodeObj['name'];
   //  }
     if (!namePanel){
        namePanel="ctrlMap";
     }
    newNameNode = "newNODE"
    var ctrlObj = $('[name="'+namePanel+'"]');
    var selectedNode = ctrlObj.jstree(true).get_selected(); // get the ID of the currently selected node
    ctrlObj.jstree('create_node', selectedNode.parent, {
      text: 'New Node',
      id: namePanel + ":" + newNameNode,
      icon: 'icon-class'
    }, 'after', function (newNode) {
      console.log(newNode); // success callback
    },
    function (error) {
      console.log(error); // error callback
    });
    debugger;
};
// [{text:'dddddddd',classelement:'fsdfsfsdfsdfsd'}]
D3Api.setTreeDate = function(namePanel,componentArray) {
    var ctrlObj = $('[name="'+namePanel+'"]');
    ctrlObj.jstree(true).settings.core.data = componentArray;
    ctrlObj.jstree(true).refresh();
};