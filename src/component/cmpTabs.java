package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;



public class cmpTabs extends Base {
    /*
    https://www.geeksforgeeks.org/jquery-ui-tabs/


<cmpTabs label="выбор" name="ctrlAcordion" onchange="console.log(D3Api.getValue('ctrlAcordion'));"  heightstyle="auto" onbeforechange="">
    <items caption="text1">
            111111111111
        <cmpLabel caption="test CTRL"/>
    </items>
    <items caption="text2">
        <cmpEdit name="v2_edit" label=" текст в другой вкладке -edit2--"/>
    </items>
    <items caption="text3">
         афывафывафывафывафывафыв
    </items>
</cmpTabs>

     */
    public cmpTabs(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "tabs");
        attrsDst.add("type", "tabs");

        // ============== INIT Html Class =========================
        List<String> classCSS = new ArrayList<>();
        if (attrs.hasKey("class")) {
            classCSS.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "class").split(" ")));
        }
        attrsDst.add("class", String.join(" ", classCSS));
        // ---------------------------------------------------------
        String width = getCssArrKeyRemuve(attrs,"width",true);
        String height = getCssArrKeyRemuve(attrs,"height",true);
        String left = getCssArrKeyRemuve(attrs,"left",true);
        String top  = getCssArrKeyRemuve(attrs,"top",true);

        // ===============INIT Html style================
        List<String> style = new ArrayList<>();
        if (attrs.hasKey("style")) {
            style.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "style").split(";")));
        }
        // attrsDst.add("style", String.join(";", style));
        attrsDst.add("style","position: relative;"+width+height+left+top);
        // ==============================================

        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append("$('[name=\"" + ctrlName + "\"]').tabs();");
        if (attrs.hasKey("onchange")) {
            sb.append("$('[name=\"" + ctrlName + "\"]').on('tabsactivate', function(event, ui) {\n");
            sb.append(RemoveArrKeyRtrn(attrs, "onchange", "") + ";");
            sb.append("});\n");
        }
        if (attrs.hasKey("onbeforechange")) {
            sb.append("$('[name=\"" + ctrlName + "\"]').on('tabsbeforeactivate', function(event, ui) {\n");
            sb.append(RemoveArrKeyRtrn(attrs, "onbeforechange", "") + ";");
            sb.append("});\n");
        }
        sb.append(getJQueryEventString(ctrlName, attrs, true));
        sb.append("}); </script>");
        StringBuffer head = new StringBuffer();
        StringBuffer body = new StringBuffer();


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
                    String path = RemoveArrKeyRtrn(attrsItem, "path","");
                    String htmlText ="";
                    if (path.length()==0) {
                        WebServerLite.ServerResourceHandler.parseElementV2(doc, element.child(childrenint), element);
                        htmlText = element.child(childrenint).toString();
                    } else {
                        String query_selector = RemoveArrKeyRtrn(attrsItem, "query_selector","");
                        htmlText = WebServerLite.ServerResourceHandler.parseSubElementV2(doc,path,query_selector);
                    }
                    String nameTab = name+ "_tabs_"+childrenint;
                    head.append(" <li><a href=\"#"+nameTab+"\" value=\""+childrenint+"\">"+RemoveArrKeyRtrn(attrsItem, "caption","")+"</a></li>\n");
                    body.append(" <div id=\""+nameTab+"\">\n");
                    body.append(htmlText);
                    body.append("  </div>\n");
                    childrenint++;
                }
            }
        }
        sb.append("<div name=\"" + ctrlName + "\" style=\"position: relative;"+height+width+left+top+"\">\n");
        sb.append(" <ul>\n");
        sb.append(head);
        sb.append(" </ul>\n");
        sb.append(body);
        sb.append("</div>");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());

    }
}
