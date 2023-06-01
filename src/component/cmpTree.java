package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import java.util.HashMap;

public class cmpTree extends Base {
    /*
https://www.c-sharpcorner.com/article/create-jstree-simply/

https://stackoverflow.com/questions/26800350/defining-icons-in-the-contextmenu-plugin-of-jquery

V1

<cmpTree name="ctrlMap"  onopen="console.log('on_onopen')" >
    <item name="pAdd"     caption="Добавить"      icon="insert"  onclick="alert(1);"/>
    <item name="pEdit"    caption="Редактировать" icon="edit"    onclick="alert(2);"/>
    <item name="pView"    caption="Просмотреть"   icon="preview" onclick="alert(3);"/>
    <item  caption="Просмотреть"  >
        <item name="pAddSUB"     caption="Добавить SUB"      icon="insert"  onclick="alert(4);"/>
    </item>
</cmpTree>

     */
    public cmpTree(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        if (doc.select("[cmp=\"cmpTree\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<link cmp=\"cmpTree\" rel=\"stylesheet\" href=\"/System/jqueryui/Addon/jsTree/dist/themes/default/style.min.css\">");
            elements.append("<script cmp=\"cmpTree\" src=\"/System/jqueryui/Addon/jsTree/dist/jstree.min.js\"></script>");
            elements.append("<script cmp=\"cmpTree\" src=\"/System/jqueryui/Addon/jsTree/dist/tree_panel.js\"></script>");
        }
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "");
        attrsDst.add("type", "jstree");
        StringBuffer sb = new StringBuffer();
        HashMap<String, Object> onClickNode = new HashMap<String, Object>();
        HashMap<String, Object> onDblClickNode = new HashMap<String, Object>();
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
        String checkbox = RemoveArrKeyRtrn(attrs, "checkbox", "");
        if (checkbox.length()>0) checkbox = "\"checkbox\",";

        String conditionalselect = RemoveArrKeyRtrn(attrs, "conditionalselect", "");
        if (checkbox.length()>0) conditionalselect = "\"conditionalselect\",";
        String contextmenu = RemoveArrKeyRtrn(attrs, "contextmenu", "");
        if (contextmenu.length()>0) conditionalselect = "\"contextmenu\",";
        String dnd = RemoveArrKeyRtrn(attrs, "dnd", "");
        if (dnd.length()>0) conditionalselect = "\"dnd\",";
        String sort = RemoveArrKeyRtrn(attrs, "sort", "");
        if (sort.length()>0) conditionalselect = "\"sort\",";

        String onchange = RemoveArrKeyRtrn(attrs, "onchange", "");
        if (onchange.length()>0) attrsDst.add("onchange", onchange);

        String dblclick = RemoveArrKeyRtrn(attrs, "dblclick", "");
        if (dblclick.length()>0) attrsDst.add("dblclick", dblclick);

        String src = RemoveArrKeyRtrn(attrs, "src", "");

        String name = this.attr("name");
        String ctrlName = this.attr("name") + "_ctrl";
        attrsDst.add("ctrl", ctrlName);

        attrsDst.add("ctrl", ctrlName);

        sb.append("<script>\n");
        sb.append("$(function() {\n");
        sb.append("    D3Api.setControlAuto('" + name + "', $('[name=\"" + name +"\"]'));");
        sb.append("    D3Api.RegistrTreePanel('" + name + "',{" +

                "\nplugins : [ "+checkbox+conditionalselect+contextmenu+dnd+sort+" ]  ," +

                "\n'core':{ \"check_callback\" : true , " +
                "\n'check_callback' : function (operation, node, node_parent, node_position, more) { " +
                "\nconsole.log(operation, node, node_parent, node_position, more);" +
                "\nreturn operation === 'delete_node';}," +
                "\nmultiple : true,"+
                "\n'data':{}}},");

        if (src.length() > 0) {
            sb.append("\n{\"url\" : \"" + src + "\",\"dataType\" : \"json\"}");
            // Вариант  указания идентификационного поля
            // 'data' : { "url" : "https://www.jstree.com/fiddle/?lazy", "data" : function (node) { return { "id" : node.id };} }
        } else if (element.childrenSize() > 0) {
            sb.append("\n[");
            sb.append(parseTree(name, element, onClickNode,onDblClickNode)); // парсим вложенные элементы
            sb.append("]");
        }
        sb.append("\n)");
        sb.append("});");
        sb.append("</script>");
        sb.append("<div name=\"" + ctrlName + "\"></div> ");
        this.append(sb.toString());
    }

    private String parseTree(String nameCtrl, Element element, HashMap<String, Object> onClickNode, HashMap<String, Object> onDblClickNode) {
        StringBuffer sb = new StringBuffer();
        for (int numChild = 0; numChild < element.childrenSize(); numChild++) {
            Element itemElement = element.child(numChild);
            Attributes attrsItem = itemElement.attributes();
            String caption = RemoveArrKeyRtrn(attrsItem, "caption", "");
            String open = RemoveArrKeyRtrn(attrsItem, "open", "");
            if (open.length() > 0) open = "  \"opened\" : true,";
            String disabled = RemoveArrKeyRtrn(attrsItem, "disabled", "");
            if (disabled.length() > 0) disabled = "  \"disabled\" : true,";
            String name = RemoveArrKeyRtrn(attrsItem, "name", genUUID());
            String icon = RemoveArrKeyRtrn(attrsItem, "icon", "");
            if (icon.length() > 0) icon = "  \"icon\" : \"" + icon + "\",";
            String onclick = RemoveArrKeyRtrn(attrsItem, "onclick", "");
            String idNode = nameCtrl + ":" + name;
            if (onclick.length() > 0) {
                onClickNode.put(idNode, onclick);
                onclick = "\"onchange\": function(event,data){var node=data.instance.get_node(data.selected[0]); " + onclick + ";},";
            }
            String dblclick = RemoveArrKeyRtrn(attrsItem, "dblclick", "");
            if (dblclick.length() > 0) {
                onDblClickNode.put(idNode, dblclick);
                dblclick = "\"dblclick\": function(event,data){var node=data.instance.get_node(data.selected[0]); " + dblclick + ";},";
            }
            sb.append("{\"text\":\"" + caption + "\",\"id\":\"" + idNode + "\",\"state\":{" + open + disabled + "}," + icon + onclick+dblclick);
            if (itemElement.childrenSize() > 0) {
                sb.append("\"children\":[");
                sb.append(parseTree(nameCtrl, itemElement, onClickNode,onDblClickNode));
                sb.append("]");
            }
            sb.append("},");
        }
        return sb.toString();
    }


}

      /*
        sb.append(""+
                "<div id=\"html\" class=\"demo\">\n" +
                "    <ul>\n" +
                //"       <li data-jstree='{ \"opened\" : false }'>Root node\n" +
                "       <li>Root node\n" +
                "           <ul>\n" +
                "               <li data-jstree='{ \"selected\" : true }'  onclick=\"alert(1);\">Child node 1</li>\n" +
                "               <li onclick=\"console.log('---------1--------');\">Child node 2</li>\n" +
                "               <li onclick=\"alert(1);\">Child node 3</li>\n" +
                "               <li onclick=\"alert(1);\">Child node 4</li>\n" +
                "               <li onclick=\"alert(1);\">Child node 5</li>\n" +
                "               <li>Child node 2</li>\n" +
                "           </ul>\n" +
                "       </li>\n" +
                "    </ul>\n" +
                "</div>" +
                "\n" +
                "" +
                "" +
                "<script>" +
                "   $('#html').jstree().on(\"changed.jstree\", function (e, data) {\n" +
                "      console.log('------2-----------');\n" +
                "      console.log(data);\n" +
                "      debugger;\n" +
                "      if(data.selected.length) {\n" +
                "           console.log('The selected node is: ' + data.instance.get_node(data.selected[0]).text);\n" +
                "      }\n" +
                "   })" +
                "</script>" +
                " ");

         */