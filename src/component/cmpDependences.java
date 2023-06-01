package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class cmpDependences extends Base {
    /*
Пример использования:
    <cmpEdit name="testInput"/>
    <cmpEdit name="testInput2"/>
    <cmpButton name="btnTest" caption="test" />
    <cmpDependences name="mainInspector" required="testInput;testInput2" depend="btnTest;"/>

Добавить новый контрол в required
    D3Api.dependencesAddCtrl('mainInspector','ctrlEditText');

Добавить новый контрол в depend
    D3Api.dependencesAddDep('mainInspector','btnOk2');

Очистить весь список проверок
    D3Api.dependencesClear('mainInspector');


     */
    public cmpDependences(Document doc, Element element) {
        super(doc, element, "span");
        if (doc.select("[cmp=\"cmpDependences\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<script cmp=\"cmpDependences\" src=\"/System/jqueryui/Addon/Dependences/dependences.js\" type=\"text/javascript\"/>");
        }
        this.initCmpType(element);
        Attributes attrs = element.attributes();
        String required = RemoveArrKeyRtrn(attrs, "required");
        String depend = RemoveArrKeyRtrn(attrs, "depend");
        StringBuffer sb = new StringBuffer();
        StringBuffer requiredArr = new StringBuffer();
        StringBuffer dependArr = new StringBuffer();
        sb.append("<script>");
        if (required.length() > 0) {
            for (String ctrlOne : required.split(";")) {
                String ctrlBlock = ctrlOne.trim();
                if (ctrlBlock.length() == 0) continue;
                requiredArr.append("'");
                requiredArr.append(ctrlBlock);
                requiredArr.append("',");
            }
        }
        if (depend.length() > 0) {
            for (String ctrlOne : depend.split(";")) {
                String ctrlBlock = ctrlOne.trim();
                if (ctrlBlock.length() == 0) continue;
                dependArr.append("'");
                dependArr.append(ctrlBlock);
                dependArr.append("',");
            }
        }
        sb.append(" D3Api.dependencesInit(\""+this.attr("name")+"\",["+requiredArr+"],["+dependArr+"]);\n");
        sb.append("</script>");
        this.append(sb.toString());
    }
}
