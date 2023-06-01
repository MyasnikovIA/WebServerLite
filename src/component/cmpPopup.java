package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.HashMap;

public class cmpPopup extends Base {
    /*

https://stackoverflow.com/questions/26800350/defining-icons-in-the-contextmenu-plugin-of-jquery

V1
<cmplabel name="testCtrlPop" caption="4444"/>
<cmpPopup name="ctrlMap" popupobject="testCtrlPop"  onpopup="console.log('onpopup')">
    <item name="pAdd"     caption="Добавить"      icon="insert"  onclick="alert(1);"/>
    <item name="pEdit"    caption="Редактировать" icon="edit"    onclick="alert(2);"/>
    <item name="pView"    caption="Просмотреть"   icon="preview" onclick="alert(3);"/>
    <item  caption="Просмотреть"  >
        <item name="pAddSUB"     caption="Добавить SUB"      icon="insert"  onclick="alert(4);"/>
    </item>
</cmpPopup>


// Сделать неактивным пункт меню с именем 'pEdit'
D3Api.setDisabledPopUp('pEdit',true)

// Сделать невидимым пункт меню с именем 'pEdit'
D3Api.setVisiblePopUp('pEdit',false)
---------------------------------------------------------------------------------------------

Подключить контекстное меню сразу на контроле

<cmpEdit name="testCtrlPop" caption="4444" popupmenu="popup_men"/>
<cmpPopup name="popup_men"  onpopup="console.log('onpopup')">
    <item name="pEdit"    caption="Редактировать" icon="edit"    onclick="alert(2);"/>
</cmpPopup>

---------------------------------------------------------------------------------------------
Подключить контекстное меню "popup_men" сразу на  несколько контролов

<cmpAccordion label="выбор" name="ctrlAcordion" onchange="console.log(D3Api.getValue('ctrlAcordion'));" height="30%" width="50%"   popupmenu="popup_men">
    <items caption="text1">
        <cmpEdit name="testCtrlPop" caption="4444" popupmenu="popup_men"/>
    </items>
    <items caption="text2">
        <cmpEdit name="v2_edit" label=" текст в другой вкладке -edit2--"/>
    </items>
    <items caption="text3">
        <cmpEdit name="testCtrlPop444" caption="66666"  popupmenu="popup_men"/>
    </items>
</cmpAccordion>

<cmpPopup name="popup_men"  onpopup="console.log('onpopup')">
    <item name="pEdit"    caption="Редактировать" icon="edit"   onclick="alert(2);"/>
</cmpPopup>



     */
    public cmpPopup(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        if (doc.select("[cmp=\"cmpPopup\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<link cmp=\"cmpPopup\" rel=\"stylesheet\" href=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/jquery.contextMenu.min.css\">");
            elements.append("<script cmp=\"cmpPopup\" src=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/jquery.contextMenu.min.js\"></script>");
            elements.append("<script cmp=\"cmpPopup\" src=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/jquery.ui.position.min.js\"></script>");
            elements.append("<script cmp=\"cmpPopup\" src=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/popup_menu.js\"></script>");
        }
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "");
        attrsDst.add("type", "popup");
        String width = getCssArrKeyRemuve(attrs, "width", true);
        if (width.length() == 0) {
            width = "width:30%;";
        }
        String height = getCssArrKeyRemuve(attrs, "height", true);
        if (height.length() == 0) {
            height = "height:30%;";
        }
        String left = getCssArrKeyRemuve(attrs, "left", true);
        String top = getCssArrKeyRemuve(attrs, "top", true);
        String popupobject = RemoveArrKeyRtrn(attrs, "popupobject", "");
        String onpopup = RemoveArrKeyRtrn(attrs, "onpopup", "");
        String onafterpopup = RemoveArrKeyRtrn(attrs, "onafterpopup", "");
        String ctrlId = this.attr("id") + "_ctrl";
        String name = this.attr("name");
        HashMap<String, Object> cssIcon = new HashMap<String, Object>();
        HashMap<String, Object> popupItemsName = new HashMap<String, Object>();
        // attrsDst.add("ctrl", name);
        StringBuffer sb = new StringBuffer();

        sb.append("<script>\n");
        sb.append("    $(function() {\n");
        sb.append("        D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));\n");
        sb.append("        D3Api.RegistrPopUp('" + name + "',{\n");
        // sb.append("            selector: '[name=\"" + popupobject + "\"]', \n");
        sb.append("            position: function(options, x, y) {  " +
                "                        this.data('" + name + "_x',x);" +
                "                        this.data('" + name + "_y',y);" +
                "                        options['point']={left:x,top:y};" + // добавляю атребут позиции клика
                "                        options['object']=$(options['selector']);" +  // находим объект по селектору
                "                        D3Api.RegisterPositionPopUpMenu(this,options, x, y);" +
                "                        options.$menu.css({top: y, left: x}); " +
                "                        " + onpopup + ";" +
                "                        return true; }, ");
        sb.append("            events: {\n" +
                "                      preShow: function() { },\n" +
                "                      show: function(options, x, y) {\n" +
                "                          contextMenuIsOpen = true;\n" +
                "                      },\n" +
                "                      hide: function (options) {\n" +
                "                            " + onafterpopup + ";\n" +
                "                            contextMenuIsOpen = false;\n" +
                "                      }\n" +
                "              }, \n");
        sb.append("            callback: function(key, options) {\n" +
                "                 var m = \"clicked: \" + key;\n" +
                "             },\n \n");
        sb.append("            items: {\n");
        sb.append(parseMenu(element, cssIcon, popupItemsName)); // парсим вложенные элементы
        sb.append("                    \n");
        sb.append("            }\n");
        sb.append("         });\n");
        for (String objName : popupobject.split(";")) {
            sb.append("         D3Api.InitPopUp('" + objName + "','" + name + "');\n");
        }


        StringBuffer dis = new StringBuffer();
        for (String key : popupItemsName.keySet()) {
            if (dis.length() > 0) {
                dis.append(",");
            }
            dis.append("\"" + key + "\"");
        }
        sb.append("     D3Api.RegistrPopUpItem(\"" + name + "\", [" + dis + "]);\n");
        /*
        if (popupobject.length() > 0) {
            if (popupobject.indexOf(";") == -1) {
                for (String objName : popupobject.split(";")) {
                    sb.append("  D3Api.RegistrPopUpItem(\"" + objName + "\", [" + dis + "]);\n");
                }
            } else {
                sb.append("  D3Api.RegistrPopUpItem(\"" + popupobject + "\", [" + dis + "]);\n");
            }
        }else {
            sb.append("  D3Api.RegistrPopUpItemInCtrl(\"" + popupobject + "\", [" + dis + "]);\n");
        }
         */
        sb.append("    });\n");
        sb.append("</script>\n");
        sb.append("<style>\n");
        sb.append("   .context-menu-item.icon { min-height: 18px; background-repeat: no-repeat; background-position: 4px 2px; }\n");
        for (String key : cssIcon.keySet()) {
            sb.append("   " + cssIcon.get(key).toString() + "\n");
        }
        sb.append("</style>\n");
        this.append(sb.toString());
    }

    private String parseMenu(Element element, HashMap<String, Object> cssIcon, HashMap<String, Object> popupItemsName) {
        StringBuffer sb = new StringBuffer();
        for (int numChild = 0; numChild < element.childrenSize(); numChild++) {
            Element itemElement = element.child(numChild);
            Attributes attrsItem = itemElement.attributes();
            String caption = RemoveArrKeyRtrn(attrsItem, "caption", "");
            String name = RemoveArrKeyRtrn(attrsItem, "name", genUUID());
            String icon = RemoveArrKeyRtrn(attrsItem, "icon", "");
            if (icon.indexOf(".") != -1) {
                if (!cssIcon.containsKey(name)) {
                    cssIcon.put(name, ".context-menu-item.icon-" + name + " { background-image: url(" + icon + "); }");
                    //.context-menu-item.icon-edit { background-image: url(images/page_white_edit.png); }
                    icon = name;
                }
            }
            popupItemsName.put(name, name + "_disabled");
            String onclick = RemoveArrKeyRtrn(attrsItem, "onclick", "");
            if (itemElement.childrenSize() > 0) {
                sb.append("\"" + name + "\":{\n");
                sb.append("               \"name\":\"" + caption + "\",\n");
                sb.append("               \"icon\": \"" + icon + "\",\n");
                sb.append("               \"items\":{\n");
                sb.append("                      " + parseMenu(itemElement, cssIcon, popupItemsName));
                sb.append("               }\n");
                sb.append("},\n");
            } else {
                sb.append("               \"" + name + "\": {\n" +
                        "                     name: \"" + caption + "\",\n" +
                        "                     icon: \"" + icon + "\",\n" +
                        "                     disabled: function(key, opt) {return this.data('" + name + "_disabled');},\n" +
                        "                     visible: function(key, opt) {return !this.data('" + name + "_visible');},\n" +
                        "                     callback: function(itemKey, opt, e) {\n" +
                        "                         " + onclick + ";\n" +
                      //  "                         console.log(itemKey, opt, e);\n" +
                        "                         return false;\n" +
                        "                     },\n" +
                        "                 },");
            }
        }
        return sb.toString();
    }

    public static String initPopUpCtrl(Document doc, Attributes attrs, String nameCtrl) {
        if (!attrs.hasKey("popupmenu")) return "";
        StringBuffer sb = new StringBuffer();
        String popupmenu = attrs.get("popupmenu");
        attrs.remove("popupmenu");
        if (popupmenu.length() > 0) {
            if (doc.select("[cmp=\"cmpPopup\"]").toString().length() == 0) {
                Elements elements = doc.getElementsByTag("head");
                elements.append("<link cmp=\"cmpPopup\" rel=\"stylesheet\" href=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/jquery.contextMenu.min.css\">");
                elements.append("<script cmp=\"cmpPopup\" src=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/jquery.contextMenu.min.js\"></script>");
                elements.append("<script cmp=\"cmpPopup\" src=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/jquery.ui.position.min.js\"></script>");
                elements.append("<script cmp=\"cmpPopup\" src=\"/System/jqueryui/Addon/jQuery-contextMenu-master/dist/popup_menu.js\"></script>");
            }
            sb.append("<script>\n");
            sb.append("    $(function() {\n");
            sb.append("        D3Api.InitPopUp('" + nameCtrl + "','" + popupmenu + "');\n");
            sb.append("    });\n");
            sb.append("</script>\n");
        }
        return sb.toString();
    }

}



    /*
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<!DOCTYPE HTML>
<html>

<head>
  <meta charset="utf-8" />
  <!-- include the context-menu from cdnjs -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.0.1/jquery.contextMenu.min.css" />
  <style>
    .context-menu-abc {
      border: 1px solid gray;
      padding: 5px;
    }
    /* used for all items

    .context-menu-item {
        min-height: 18px;
        background-repeat: no-repeat;
        background-position: 4px 4px;
    }
    //all custom icons

    .context-menu-item.context-menu-icon-firstOpt {
        background-image: url("https://cdn4.iconfinder.com/data/icons/6x16-free-application-icons/16/Boss.png");
    }

    .context-menu-item.context-menu-icon-secondOpt {
        background-image: url("https://cdn4.iconfinder.com/data/icons/6x16-free-application-icons/16/Save.png");
    }

    .context-menu-item.context-menu-icon-thirdOpt {
        background-image: url("https://cdn4.iconfinder.com/data/icons/6x16-free-application-icons/16/OK.png");
    }
  </style>
</head>

<body>
  <div><span class="context-menu-abc">right-click this box</span></div>

  <!-- try to include scripts at the end so the DOM can be created faster -->
  <script src="js/jquery-2.1.4.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery-contextmenu/2.0.1/jquery.contextMenu.min.js"></script>

    <script>
    $(function() {
        "use strict";
        $.contextMenu({
                selector: '.context-menu-abc',
                callback: function(key, options) {
            if (key === 'firstOpt') {
                // specific code for your first option
            } else if (key === 'secondOpt') {
                // specific code for your second option
            } else if (key === 'thirdOpt') {
                // specific code for your third option
            }
        },
        items: {
            'firstOpt': {
                name: "First option",
                        icon: "firstOpt"
            },
            'secondOpt': {
                name: "Second choice",
                        icon: "secondOpt"
            },
            'thirdOpt': {
                name: "Third option",
                        icon: "thirdOpt"
            },
            'copy': {
                name: "Fourth option",
                        icon: "copy"
            }
        }
      });
    });
  </script>
</body>











    <cmpPopup name="ctrlMap"  onpopup="pkm('onpop')">
        <item name="pAdd"     caption="Добавить"      std_icon="insert"  onclick="editVisit(1);"/>
        <item name="pEdit"    caption="Редактировать" std_icon="edit"    onclick="editVisit();"/>
        <item name="pView"    caption="Просмотреть"   std_icon="preview" onclick="editVisit(2);"/>
        <item  caption="Просмотреть"  >
            <item name="pAddSUB"     caption="Добавить SUB"      icon="insert"  onclick="editVisit(1);"/>
        </item>
    </cmpPopup>

.context-menu-item.icon-<NAME-OF-ICON> {
    background-image: url(images/<NAME-OF-ICON>.png);
}
.context-menu-icon {
  min-height: 18px; background-repeat: no-repeat; background-position: 4px 2px;
}

.context-menu-item.icon { min-height: 18px; background-repeat: no-repeat; background-position: 4px 2px; }
.context-menu-item.icon-edit { background-image: url(images/page_white_edit.png); }
.context-menu-item.icon-cut { background-image: url(images/cut.png); }
.context-menu-item.icon-copy { background-image: url(images/page_white_copy.png); }
.context-menu-item.icon-paste { background-image: url(images/page_white_paste.png); }
.context-menu-item.icon-delete { background-image: url(images/page_white_delete.png); }
.context-menu-item.icon-add { background-image: url(images/page_white_add.png); }
.context-menu-item.icon-quit { background-image: url(images/door.png); }

<span class="context-menu-one btn btn-neutral">right click me</span>
<script>
$(function(){
    var pop = $.contextMenu({
        selector: '.context-menu-one',
        events: {
                show: function(options) {
                    contextMenuIsOpen = true;
                    // if ($("#GraphType option:selected").text() == "Line")
                    //    chart = "#chart";
                    // alert("Show Context Menu");
                },
                hide: function (options) {
                    contextMenuIsOpen = false;
                    // alert("Hide Context Menu");
                }
            },
        callback: function(key, options) {
            var m = "clicked: " + key;
            window.console && console.log(m) || alert(m);
        },
        items: {
            "edit": {name: "Clickable", icon: "edit"},
            "cut": {
                name: "Disabled",
                icon: "10.png",
                disabled: function(key, opt) {return !this.data('cut_Disabled');},
                visible: function(key, opt) {return !this.data('cut_Visible');},
                callback: function(itemKey, opt, e) {
                    console.log(itemKey, opt, e);
                    return false;
                },
            },
            "toggle": {
                name: "Toggle",
                callback: function() {
                    // this references the trigger element
                    // this.data('cutDisabled', !this.data('cutDisabled'));
                    $('.context-menu-one').data('cutDisabled', !$('.context-menu-one').data('cutDisabled'));
                    return false;
                }
            }
        }
    });

     // включение  контекстного меню
     //$('.context-menu-one').contextMenu(true);
     // выключение  контекстного меню
     //$('.context-menu-one').contextMenu(false);

     //  получить значение видимости
     !$('.context-menu-one').data('cut_Visible')
     //  Инвертировать видемость
     $('.context-menu-one').data('cut_Visible', !$('.context-menu-one').data('cut_Visible'));

     //  получить значение активности
     $('.context-menu-one').data('cut_Disabled')
     //  Инвертировать активность
     $('.context-menu-one').data('cut_Disabled', !$('.context-menu-one').data('cut_Disabled'));
});
</script>



     */