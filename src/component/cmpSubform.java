package component;


import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;




public class cmpSubform extends Base {
    /*
    https://www.geeksforgeeks.org/jquery-ui-tabs/

        <cmpSubform path="NR/stroke/registr"/>

     */
    public cmpSubform(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "tabs");
        attrsDst.add("type", "Subform");
        String path = RemoveArrKeyRtrn(attrs, "path","");
        if (path.length()==0){
            this.append("");
        }
        this.append(WebServerLite.ServerResourceHandler.parseSubElementV2(doc,path,""));
    }
}
