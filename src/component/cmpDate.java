package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class cmpDate extends Base {
/*
https://snipp.ru/jquery/jquery-ui-datepicker
https://snipp.ru/jquery/time-ui-datepicker


    <cmpDate name="userName4" label="--editxcvbxcvbxcvbxcvbxcvbcxv2--"  width="500"/>
*/
    public cmpDate(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        if (doc.select("[cmp=\"cmpMask\"]").toString().length() == 0) {
            // Добавляем библиотеку для маски
            Elements elements = doc.getElementsByTag("head");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/MaskedInput/dist/jquery.maskedinput.min.js\" type=\"text/javascript\"/>");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/MaskedInput/dist/tel_filtr.js\" type=\"text/javascript\"/>");
        }
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
        attrsDst.add("schema","datepicker");
        attrsDst.add("type","datepicker");
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        // sb.append(" $('[name=\"" + ctrlName + "\"]').datepicker({ appendText: \"(dd.mm.yyyy)\"});\n");
        String icon="";
        if (attrs.hasKey("icon")) {
            icon = ",buttonImageOnly: true, buttonImage: '"+RemoveArrKeyRtrn(attrs, "icon")+"'";
        }
        String dateFormat=",dateFormat: 'dd.mm.yy'";
        if (attrs.hasKey("format")) {
            dateFormat = ",dateFormat: '"+RemoveArrKeyRtrn(attrs, "format")+"'";
        }
        sb.append(" $('[name=\"" + ctrlName + "\"]').datepicker({ showOn: 'button'"+dateFormat+icon+"});\n");
        sb.append(" $('[name=\"" + ctrlName + "\"]').mask(\"99.99.9999\")\n");

        sb.append(" D3Api.setControlAuto('"+name+"', $('[name=\""+name+"\"]'));");
        sb.append(getJQueryEventString(ctrlName,attrs,true));
        sb.append(" D3Api.setControlAuto('"+name+"', $('[name=\""+name+"\"]'));");

        if (attrs.hasKey("value")) {
            sb.append(" $('[name=\"" + ctrlName + "\"]').datepicker('setDate','"+RemoveArrKeyRtrn(attrs, "value")+"');\n");
        }
        String defaultDate="";
        if (attrs.hasKey("value")) {
            defaultDate = ",defaultDate: '"+RemoveArrKeyRtrn(attrs, "format")+"'";
        }
        sb.append("}); </script>");
        this.append(sb.toString());
        this.append("<label block=\"label\" for=\""+ctrlName+"\">"+RemoveArrKeyRtrn(attrs, "label","")+"</label>\n");
        this.append("<input  name=\""+ctrlName+"\""+" style=\"position: relative;"+width+";\"/>");
        // https://jqueryui.com/autocomplete/
    }
}
