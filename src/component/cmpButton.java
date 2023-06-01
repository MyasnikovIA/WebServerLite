package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class cmpButton extends Base {
/*
https://professorweb.ru/my/javascript/jquery/level4/4_2.php
Свойство	Описание
    disabled	Позволяет определить, отключена ли кнопка, или изменить ее состояние. Отключенной кнопке соответствует значение true. Состояние базового HTML-элемента игнорируется в jQuery UI
    text	Позволяет определить, отображается ли текст кнопки, а также установить или отменить отображение текста. Если значение icons равно false, то эта опция игнорируется
    icons	Позволяет определить, отображаются ли значки в тексте кнопки, а также задать отображаемые значки или отменить их отображение
    label	Позволяет получить или изменить текст кнопки

Метод	Описание
    button("destroy")	Возвращает базовый элемент в первоначальное состояние, полностью удаляя из него функциональность виджета
    button("disable")	Отключает кнопку
    button("enable")	Включает кнопку
    button("option")	Устанавливает одно или несколько значений свойств
    button("refresh")	Обновляет состояние кнопки


    <cmpButton caption="Login"  onclick="alert(1);"  TEST="1" DATA="EEWRWERFASD SADFASDFAS SADFAS AS"/>
    	$( "#button" ).button();

 */
    public cmpButton(Document doc, Element element) {
        super(doc, element, "a");
        this.initCmpType(element);
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "button");
        attrsDst.add("type", "button");
        String width = getCssArrKeyRemuve(attrs,"width",true);
        String height = getCssArrKeyRemuve(attrs,"height",true);
        String left = getCssArrKeyRemuve(attrs,"left",true);
        String top  = getCssArrKeyRemuve(attrs,"top",true);

        attrsDst.add("style","position: relative;"+width+height+left+top);

        //   height="30%" width="50%" left="10%" top="100px"
        // ============== INIT Html Class =========================
        List<String> classCSS = new ArrayList<>();
        if (!attrs.hasKey("class")) {
            for (String className : Arrays.asList("ui-widget", "ui-corner-all")) {
                classCSS.add(className);
            }
        } else {
            classCSS.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "class").split(" ")));
            for (String className : Arrays.asList("ui-widget", "ui-corner-all")) {
                if (!classCSS.contains(className)) {
                    classCSS.add(className);
                }
            }
        }
        attrsDst.add("class", String.join(" ", classCSS));
        // ---------------------------------------------------------

        // ===============INIT Html style================
        List<String> style = new ArrayList<>();
        if (attrs.hasKey("style")) {
            style.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "style").split(";")));
        }
        if (style.size() > 0) {
            attrsDst.add("style", String.join(";", style));
        }
        // ==============================================

        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append("$('[name=\"" + ctrlName + "\"]').button();");
        sb.append(getJQueryEventString(ctrlName, attrs, true));
        sb.append("}); </script>");
        sb.append("<label block=\"label\" for=\"");
        sb.append(ctrlName);
        sb.append("\">\n");
        sb.append(RemoveArrKeyRtrn(attrs, "label", ""));
        sb.append("</label>\n");
        sb.append("<span name=\"");
        sb.append(ctrlName);
        sb.append("\"");
        sb.append("style=\"position: relative;"+height+width+left+top+"\"");
        sb.append(">");
        sb.append(RemoveArrKeyRtrn(attrs, "caption", ""));
        sb.append("</span\n");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
    }
}
