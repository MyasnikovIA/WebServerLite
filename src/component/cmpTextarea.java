package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class cmpTextarea extends Base {
    /*

    <cmpTextarea name="t1" value="sdfgsdfgsdf"/>

     */
    public cmpTextarea(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();

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
        if (style.size()>0) {
            attrsDst.add("style", String.join(";", style));
        }
        // ==============================================
        String width="";
        if (attrs.hasKey("width")) {
            width = "width:'"+attrs.get("width")+"',";
        }
        String ctrlName =  this.attr("name")+"_ctrl";
        String name =  this.attr("name");
        attrsDst.add("ctrl",ctrlName);
        attrsDst.add("schema","");

        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        // sb.append("$('[name=\""+ctrlName+"\"]').selectmenu({"+width+"} );");
        sb.append(" D3Api.setControlAuto('"+name+"', $('[name=\""+name+"\"]'));");
        sb.append(getJQueryEventString(ctrlName,attrs,true));
        sb.append("}); </script>");

        sb.append("<label block=\"label\" for=\"");
        sb.append(ctrlName);
        sb.append("\">\n");
        sb.append(RemoveArrKeyRtrn(attrs, "label",""));
        sb.append("</label>\n");
        // <textarea id="resizable" rows="5" cols="20"></textarea>
        sb.append("<textarea name=\"");
        sb.append(ctrlName);
        sb.append("\"");
        sb.append(">\n");
        sb.append(RemoveArrKeyRtrn(attrs, "value",""));
        sb.append("</textarea>\n");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
        System.out.println(sb.toString());

        // https://jqueryui.com/autocomplete/
    }
}
