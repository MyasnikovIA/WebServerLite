package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class cmpEdit extends Base {
/*
https://professorweb.ru/my/javascript/jquery/level4/4_5.php

 Виджет Autocomplete облегчает ручной ввод информации, предлагая на выбор пользователю варианты автоматического заполнения текстовых полей по мере ввода символов. Продуманное использование этого виджета обеспечивает значительную экономию времени за счет ускорения ввода данных и снижения вероятности ошибок ввода.


    <cmpEdit name="userName4" label="--editxcvbxcvbxcvbxcvbxcvbcxv2--"  width="500"/>
*/
    public cmpEdit(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        String width = getCssArrKeyRemuve(attrs,"width",false);
        String height = getCssArrKeyRemuve(attrs,"height",false);
        String widthJs = getJsArrKeyRemuve(attrs,"width",true);
        String heightJs = getJsArrKeyRemuve(attrs,"height",true);
        // ============== INIT Html Class =========================
        List<String> classCSS = new ArrayList<>();
        if (!attrs.hasKey("class")) {
            for (String className : Arrays.asList("ui-widget")) {
                classCSS.add(className);
            }
        } else {
            classCSS.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "class").split(" ")));
            for (String className : Arrays.asList("ui-widget")) {
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
        //if (style.size()>0) {
        //    attrsDst.add("style", String.join(";", style));
        //}
        // attrsDst.add("style","position: relative;"+width+height);
        // ==============================================
        String ctrlName =  this.attr("name")+"_ctrl";
        String name =  this.attr("name");
        attrsDst.add("ctrl",ctrlName);
        attrsDst.add("schema","");
        String typeEdit="";
        if (attrs.hasKey("type")) {
            typeEdit = " type=\""+attrs.get("type")+"\" ";
        }

        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" D3Api.setControlAuto('"+name+"', $('[name=\""+name+"\"]'));");
        sb.append(getJQueryEventString(ctrlName,attrs,true));
        sb.append("}); </script>");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
        this.append("<label block=\"label\" for=\""+ctrlName+"\">"+RemoveArrKeyRtrn(attrs, "label","")+"</label>\n");
        this.append("<input  name=\""+ctrlName+"\""+typeEdit+"  style=\"position: relative;"+width+";\"/>");
        // https://jqueryui.com/autocomplete/
    }
}
