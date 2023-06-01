package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

public class cmpCheckbox extends Base {
 /*
    <cmpCheckbox  label="testCheck" name="myCheck" />
*/
    public cmpCheckbox(Document doc, Element element) {

        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "checkbox");
        attrsDst.add("type", "checkbox");
        String width = getCssArrKeyRemuve(attrs,"width",true);
        String height = getCssArrKeyRemuve(attrs,"height",true);
        String left = getCssArrKeyRemuve(attrs,"left",true);
        String top  = getCssArrKeyRemuve(attrs,"top",true);
        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        String checked = RemoveArrKeyRtrn(attrs, "checked", "");
        if (checked.length() > 0) {
            checked = "checked=\"checked\"";
        }
        attrsDst.add("class", "ui-widget");

        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function(){");
        sb.append("D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append(getJQueryEventString(ctrlName,attrs,true));
        sb.append("});</script>");
        sb.append("<label  block=\"label\" for=\"" + ctrlName + "\" >" + RemoveArrKeyRtrn(attrs, "label", "") + "</label>");
        sb.append("<input block=\"ctrl\" type=\"checkbox\" name=\"" + ctrlName + "\" " + checked + "/>");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
        // https://jqueryui.com/autocomplete/
    }
}
