package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

public class cmpLabel extends Base {
/*
<cmpLabel caption="asdasdadada: "/>
*/
    public cmpLabel(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();

        // ========= инициализации class стиля =======
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
        // ==============================================


        // ==============================================
        List<String> style = new ArrayList<>();
        if (attrs.hasKey("style")) {
            style.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "style").split(";")));
        }
        if (style.size() > 0) {
            attrsDst.add("style", String.join(";", style));
        }
        // ==============================================
        String captionText = "";
        if (attrs.hasKey("caption")) {
            captionText = attrs.get("caption");
            attrs.remove("caption");
        }
        String ctrlName = this.attr("name") + "_ctrl";
        attrsDst.add("ctrl", ctrlName);

        this.append("<label block=\"label\" name=\""+ctrlName+"\">"+captionText+"</label>");
        copyEventRemove(attrs, attrsDst, true);
        /*
        $("").button();
         */

    }

    /*
    public cmpButton(Document doc, Element element) {
        super(doc, element, "div");
        this.initCmpType(element);

        String labeLib = "cmp=\""+this.attr("cmptype")+"\"";
        if (doc.select("["+labeLib+"]").toString().length() == 0) {
            // Если библиотека не была подключена, тогда подключаем её
            Elements elements = doc.getElementsByTag("head");
            elements.append("<script "+labeLib+" src=\"System/Components/Button/js/Button.js\" type=\"text/javascript\"/>");
            elements.append("<link   "+labeLib+" href=\"System/Components/Button/css/Button.css\" rel=\"stylesheet\" type=\"text/css\"/>");
        }



        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        String captionText = "";
        List<String> style = new ArrayList<>();
        List<String> classCSS = new ArrayList<>();

        if (attrs.hasKey("caption")) {
            captionText = attrs.get("caption");
            attrs.remove("caption");
        }


        String popupmenu = RemoveArrKeyRtrn(attrs, "popupmenu");
        String icon = RemoveArrKeyRtrn(attrs, "icon");
        if (icon.length() > 0) {
            icon = "<div class=\"btn_icon\"><img src=\"" + icon + "\" class=\"btn_icon_img\"/></div>";
        }

        if ((popupmenu.length() > 0) && (!attrs.hasKey("onclick"))) {
            attrsDst.add("onclick", "D3Api.ButtonCtrl.showPopupMenu(this," + popupmenu + "');");
        } else if ((popupmenu.length() > 0) && (attrs.hasKey("onclick"))) {
            attrsDst.add("onclick", attrs.hasKey("onclick") + "; D3Api.ButtonCtrl.showPopupMenu(this," + popupmenu + "');");
        }

        if (attrs.hasKey("style")) {
            style.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "style").split(";")));
        }
        if (attrs.hasKey("width")) {
            style.add("width: " + RemoveArrKeyRtrn(attrs, "width"));
        } else {
            style.add("width: 255px");
        }

        // инициализации class стиля
        if (!attrs.hasKey("class")) {
            for (String className : Arrays.asList("ctrl_button", "box-sizing-force")) {
                classCSS.add(className);
            }
        } else {
            classCSS.addAll(Arrays.asList(RemoveArrKeyRtrn(attrs, "class").split(" ")));
        }
        for (String className : Arrays.asList("ctrl_button", "box-sizing-force")) {
            if (!classCSS.contains(className)) {
                classCSS.add(className);
            }
        }

        if (attrs.hasKey("onlyicon") || (captionText.length() == 0)) {
            classCSS.add("onlyicon");
        }

        copyEventRemove(attrs, attrsDst ,true);

        for (Attribute attr : attrs.asList()) {
            attrsDst.add(attr.getKey(), attr.getValue());
        }

        // attrsDst.add("onclick", "openD3Form('Tutorial/Layout/layout',true)");
        attrsDst.add("tabindex", "0");
        attrsDst.add("class", String.join(" ", classCSS));
        attrsDst.add("style", String.join(";", style));
        this.append("<div class=\"btn_caption btn_center\">" + icon + captionText + "</div>");
    }
    */
}
