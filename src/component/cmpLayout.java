package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;



public class cmpLayout extends Base {
    /*

<cmpLayout>
    <span position="center">Center</span>
    <span position="top">top</span>
    <span position="buttom">South</span>
    <span position="right">East</span>
    <span position="left">West</span>
</cmpLayout>

     */
    public cmpLayout(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "layout");
        attrsDst.add("type", "layout");

        // ============== INIT Html Class =========================
        List<String> classCSS = new ArrayList<>();
        if (attrs.hasKey("class")) {
            classCSS.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "class").split(" ")));
        }
        attrsDst.add("class", String.join(" ", classCSS));
        // ---------------------------------------------------------
        String height = "height:100%;";
        if (attrs.hasKey("height")) {
            height = getCssArrKeyRemuve(attrs, "height", true);
        }

        // ===============INIT Html style================
        List<String> style = new ArrayList<>();
        if (attrs.hasKey("style")) {
            style.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "style").split(";")));
        }
        // attrsDst.add("style", String.join(";", style));
        attrsDst.add("style", "position: relative;" + height);
        // ==============================================

        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" var configLay = { applyDemoStyles: true };");
        sb.append(" var layoutSettings_Outer = {\n" +
                "       name: \"outerLayout\"\n" +
                "       , defaults: {\n" +
                "           size:     \"auto\"\n" +
                // "           , minSize:    500\n" +
                // "           , paneClass:    \"pane\"   // default = 'ui-layout-pane'\n" +
                //  "           , resizerClass:   \"resizer\" // default = 'ui-layout-resizer'\n" +
                //  "           , togglerClass:   \"toggler\" // default = 'ui-layout-toggler'\n" +
                //  "           , buttonClass:   \"button\" // default = 'ui-layout-button'\n" +
                //  "           , contentSelector:  \".content\" // inner div to auto-size so only it scrolls, not the entire pane!\n" +
                //  "           , contentIgnoreSelector: \"span\"  // 'paneSelector' for content to 'ignore' when measuring room for content\n" +
                //   "           , togglerLength_open:  35   // WIDTH of toggler on north/south edges - HEIGHT on east/west edges\n" +
                //   "           , togglerLength_closed: 35   // \"100%\" OR -1 = full height\n" +
                //    "           , hideTogglerOnSlide:  true  // hide the toggler when pane is 'slid open'\n" +
                //    "           , togglerTip_open:  \"Close This Pane\"\n" +
                //    "           , togglerTip_closed:  \"Open This Pane\"\n" +
                //    "           , resizerTip:    \"Resize This Pane\"\n" +
                //    "           , fxName:     \"slide\"  // none, slide, drop, scale\n" +
                //    "           , fxSpeed_open:   750\n" +
                //    "           , fxSpeed_close:   1500\n" +
                //    "           , fxSettings_open:  { easing: \"easeInQuint\" }\n" +
                //    "           , fxSettings_close:  { easing: \"easeOutQuint\" }\n" +
                "       }\n" +
                "       , north: {\n" +
                //  "            spacing_open:   1   // cosmetic spacing\n" +
                //  "           , togglerLength_open:  0   // HIDE the toggler button\n" +
                //  "           , togglerLength_closed: -1   // \"100%\" OR -1 = full width of pane\n" +
                //  "           , resizable:     false\n" +
                //  "           , slidable:    false\n" +
                //  "           // override default effect\n" +
                //  "           , fxName:     \"none\"\n" +
                "       }\n" +
                "       , south: {\n" +
                //    "            maxSize:    200\n" +
                //    "           , spacing_closed:   0   // HIDE resizer & toggler when 'closed'\n" +
                //    "           , slidable:    false  // REFERENCE - cannot slide if spacing_closed = 0\n" +
                //    "           , initClosed:    true\n" +
                //    "           // CALLBACK TESTING...\n" +
                //    "           , onhide_start:   function () { return confirm(\"START South pane hide \\n\\n onhide_start callback \\n\\n Allow pane to hide?\"); }\n" +
                //    "           , onhide_end:    function () { alert(\"END South pane hide \\n\\n onhide_end callback\"); }\n" +
                //    "           , onshow_start:   function () { return confirm(\"START South pane show \\n\\n onshow_start callback \\n\\n Allow pane to show?\"); }\n" +
                //    "           , onshow_end:    function () { alert(\"END South pane show \\n\\n onshow_end callback\"); }\n" +
                //    "           , onopen_start:   function () { return confirm(\"START South pane open \\n\\n onopen_start callback \\n\\n Allow pane to open?\"); }\n" +
                //    "           , onopen_end:    function () { alert(\"END South pane open \\n\\n onopen_end callback\"); }\n" +
                //    "           , onclose_start:   function () { return confirm(\"START South pane close \\n\\n onclose_start callback \\n\\n Allow pane to close?\"); }\n" +
                //    "           , onclose_end:   function () { alert(\"END South pane close \\n\\n onclose_end callback\"); }\n" +
                //    "           //, onresize_start:   function () { return confirm(\"START South pane resize \\n\\n onresize_start callback \\n\\n Allow pane to be resized?)\"); }\n" +
                //    "           , onresize_end:   function () { alert(\"END South pane resize \\n\\n onresize_end callback \\n\\n NOTE: onresize_start event was skipped.\"); }\n" +
                "       }\n" +
                "       , west: {\n" +
                //   "            size:     250\n" +
                //   "           , spacing_closed:   21   // wider space when closed\n" +
                //   "           , togglerLength_closed: 21   // make toggler 'square' - 21x21\n" +
                //   "           , togglerAlign_closed: \"top\"  // align to top of resizer\n" +
                //   "           , togglerLength_open:  0   // NONE - using custom togglers INSIDE west-pane\n" +
                //   "           , togglerTip_open:  \"Close West Pane\"\n" +
                //   "           , togglerTip_closed:  \"Open West Pane\"\n" +
                //   "           , resizerTip_open:  \"Resize West Pane\"\n" +
                //   "           , slideTrigger_open:  \"click\"  // default\n" +
                //   "           , initClosed:    true\n" +
                //   "           // add 'bounce' option to default 'slide' effect\n" +
                //   "           , fxSettings_open:  { easing: \"easeOutBounce\" }\n" +
                "       }\n" +
                "       , east: {\n" +
                //   "            size:     250\n" +
                //   "           , spacing_closed:   21   // wider space when closed\n" +
                //   "           , togglerLength_closed: 21   // make toggler 'square' - 21x21\n" +
                //   "           , togglerAlign_closed: \"top\"  // align to top of resizer\n" +
                //   "           , togglerLength_open:  0    // NONE - using custom togglers INSIDE east-pane\n" +
                //   "           , togglerTip_open:  \"Close East Pane\"\n" +
                //   "           , togglerTip_closed:  \"Open East Pane\"\n" +
                //   "           , resizerTip_open:  \"Resize East Pane\"\n" +
                //   "           , slideTrigger_open:  \"mouseover\"\n" +
                //   "           , initClosed:    true\n" +
                //   "           // override default effect, speed, and settings\n" +
                //   "           , fxName:     \"drop\"\n" +
                //   "           , fxSpeed:    \"normal\"\n" +
                //   "           , fxSettings:    { easing: \"\" } // nullify default easing\n" +
                "       }\n" +
                "       , center: {\n" +
                //  "           // paneSelector:   \"#mainContent\"    // sample: use an ID to select pane instead of a class\n" +
                //  "            minWidth:    200\n" +
                //  "           , minHeight:    200\n" +
                "       }\n" +
                "   };");

        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        // sb.append("$('[name=\"" + ctrlName + "\"]').layout(configLay);");
        sb.append("$('[name=\"" + ctrlName + "\"]').layout(layoutSettings_Outer);");
        sb.append("}); </script>");
        sb.append("<div name=\"" + ctrlName + "\" style=\"position: relative;" + height + "\">\n");
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
                    String query_selector = RemoveArrKeyRtrn(attrsItem, "query_selector","");
                    String classText = "ui-layout-center";
                    if (attrsItem.hasKey("position")) {
                        String position = RemoveArrKeyRtrn(attrsItem, "position");
                        if (position.equals("top") || position.equals("north")) {
                            classText = "ui-layout-north";
                        } else if (position.equals("buttom") || position.equals("south")) {
                            classText = "ui-layout-south";
                        } else if (position.equals("right") || position.equals("east")) {
                            classText = "ui-layout-east";
                        } else if (position.equals("left") || position.equals("west")) {
                            classText = "ui-layout-west";
                        }
                    }
                    sb.append(" <div class=\"" + classText + "\" >\n");
                    if (path.length() > 0) {
                        sb.append(WebServerLite.ServerResourceHandler.parseSubElementV2(doc, path, query_selector));
                    } else {
                        sb.append(WebServerLite.ServerResourceHandler.parseStrElementV2(doc, itemElement.toString(), query_selector ));
                    }
                    sb.append("  </div>\n");
                    childrenint++;
                }
            }
        }
        sb.append("</div>");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
    }
}
