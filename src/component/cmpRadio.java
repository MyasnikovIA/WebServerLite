package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
/*

<cmpRadio name="rad1" label="Перекючатель ">
    <item value="1" caption="r1" />
    <item value="2" caption="r2" />
    <item value="3" caption="r3" />
    <item value="4" caption="r4" />
    <item value="5" caption="r5" />
    <item value="6" caption="r6" />
</cmpRadio>


 */

public class cmpRadio extends Base {
    public cmpRadio(Document doc, Element element) {
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
        if (style.size() > 0) {
            attrsDst.add("style", String.join(";", style));
        }
        // ==============================================

        String funOnchange = "";
        if (attrs.hasKey("onchange")) {
            funOnchange = RemoveArrKeyRtrn(attrs, "onchange") + ";";
        }

        String width = "";
        if (attrs.hasKey("width")) {
            width = "width:'" + attrs.get("width") + "',";
        }
        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        attrsDst.add("schema", "checkboxradio");
        attrsDst.add("type","radio");
        StringBuffer sb = new StringBuffer();
        sb.append("\n");
        sb.append("\n");
        sb.append("<script> $( function() {");
        sb.append(" $('[name=\"" + ctrlName + "\"]').checkboxradio();\n");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append(getJQueryEventString(ctrlName, attrs, true));
        sb.append("});</script>");
        sb.append("<span block=\"label\">");
        sb.append(RemoveArrKeyRtrn(attrs, "label", ""));
        sb.append("</span>\n");
        int childrenint = 0;
        for (int numChildNode = 0; numChildNode < element.childNodeSize(); numChildNode++) {
            if (element.childNode(numChildNode).nodeName().equals("#text")) {

            } else if (element.childNode(numChildNode).nodeName().equals("#comment")) {

            } else if (element.childNode(numChildNode).nodeName().equals("#cdata")) {

            } else {
                if (childrenint < element.childrenSize()) {
                    Element itemElement = element.child(childrenint);
                    Attributes attrsItem = itemElement.attributes();
                    String val = "";
                    String selected = "";
                    val = attrsItem.get("value");
                    if (attrsItem.hasKey("selected")) {
                        selected = "selected=\"selected\" ";
                    }
                    sb.append(" <input type=\"radio\" name=\"" + ctrlName + "\" id=\"" + ctrlName + "_radio-"+childrenint+"\" value=\""+val.replaceAll("\"", "\\\"") +"\""+selected+">\n");
                    if (attrsItem.hasKey("caption")) {
                        sb.append(" <label for=\"" + ctrlName + "_radio-"+childrenint+"\">"+attrsItem.get("caption")+"</label>\n");
                    }
                    childrenint++;
                }
            }
        }
        sb.append("<script>\n"); // костыль !!!
        sb.append("</span>");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
    }
}
