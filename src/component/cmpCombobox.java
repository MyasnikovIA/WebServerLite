package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class cmpCombobox extends Base {
    /*

<cmpComboBox label="выбор" name="ctrlComboText1" onchange="console.log(this);" width="160">
    <cmpitems>sdfs</cmpitems>
</cmpComboBox>

<cmpComboBox label="выбор" name="ctrlComboText3" onchange="console.log(this);" width="300" >
    <items caption="text1" value="1" />
    <items caption="text2" value="2" />
    <items caption="text3" value="3" />
</cmpComboBox>

     */
    public cmpCombobox(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "selectmenu");

        // ============== INIT Html Class =========================
        List<String> classCSS = new ArrayList<>();
        if (attrs.hasKey("class")) {
            classCSS.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "class").split(" ")));
        }
        attrsDst.add("class", String.join(" ", classCSS));
        // ---------------------------------------------------------

        // ===============INIT Html style================
        List<String> style = new ArrayList<>();
        if (attrs.hasKey("style")) {
            style.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "style").split(";")));
        }
        attrsDst.add("style", String.join(";", style));
        // ==============================================
        String width = getCssArrKeyRemuve(attrs,"width",true);
        String height = getCssArrKeyRemuve(attrs,"height",true);

        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);

        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append("$('[name=\"" + ctrlName + "\"]').selectmenu();");
        if (attrs.hasKey("onchange")) {
            sb.append("$('[name=\"" + ctrlName + "\"]').on('selectmenuchange', function(event, data ) {\n");
            // sb.append("   D3Api.setValueAuto(\"" + this.attr("name") + "\",data.item.value); \n");
            sb.append(RemoveArrKeyRtrn(attrs, "onchange", "") + ";");
            sb.append("});\n");
        };
        sb.append(getJQueryEventString(ctrlName,attrs,true));
        sb.append("}); </script>");
        if (attrs.hasKey("label")) {
            sb.append("<label for=\"");
            sb.append(ctrlName);
            sb.append("\">\n");
            sb.append(RemoveArrKeyRtrn(attrs, "label"));
            sb.append("</label>\n");
        }
        sb.append("<select name=\"");
        sb.append(ctrlName);
        sb.append("\"");
        sb.append(">\n");
        sb.append("<option></option>\n");
        int childrenint = 0;
        for (int numChildNode = 0; numChildNode < element.childNodeSize(); numChildNode++) {
            // System.out.println(numChildNode + ")  " + element.childNode(numChildNode).nodeName() + " element.childrenSize() " + element.childrenSize() + " numChildNode " + numChildNode);
            if (element.childNode(numChildNode).nodeName().equals("#text")) {

            } else if (element.childNode(numChildNode).nodeName().equals("#comment")) {

            } else if (element.childNode(numChildNode).nodeName().equals("#cdata")) {

            } else {
                if (childrenint < element.childrenSize()) {
                    Element itemElement = element.child(childrenint);
                    Attributes attrsItem = itemElement.attributes();
                    String key = "";
                    String val = "";
                    String selected = "";
                    if (attrsItem.hasKey("caption") && !attrsItem.hasKey("value")) {
                        key = attrsItem.get("caption");
                        val = attrsItem.get("caption");
                    } else if (!attrsItem.hasKey("caption") && attrsItem.hasKey("value")) {
                        key = attrsItem.get("value");
                        val = attrsItem.get("value");
                    } else if (!attrsItem.hasKey("caption") && !attrsItem.hasKey("value")) {
                        key = itemElement.text();
                        val = itemElement.text();
                    } else if (attrsItem.hasKey("caption") && attrsItem.hasKey("value")) {
                        key = attrsItem.get("caption");
                        val = attrsItem.get("value");
                    }
                    if (attrsItem.hasKey("selected")) {
                        selected = "selected=\"selected\" ";
                    }
                    sb.append("<option" + selected + " value=\"" + val.replaceAll("\"", "\\\"") + "\">" + key + "</option>\n");
                    childrenint++;
                }
            }
        }
        sb.append("</select>");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
        sb.setLength(0);
    }
}
