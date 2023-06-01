package component;


import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class cmpMask extends Base {
    /*
       https://github.com/digitalBush/jquery.maskedinput
       https://snipp.ru/jquery/masked-input

       Телефон
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="+7 (999) 999-99-99"/>
       Номер телефона
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="tel"/>
       Дата и время
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="datetime"/>
       Дата
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="date"/>
       Время
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="time"/>
       Банковская карта
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="bank"/>
       Паспорт
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="pasport"/>
       Cнилс
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="snils"/>
       МАС адрес
       <cmpMask ctrl="ctrl1; ctrl2; ctrl3; "  mask="mac"/>

     */
    public cmpMask(Document doc, Element element) {
        super(doc, element, "span");
        if (doc.select("[cmp=\"cmpMask\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/MaskedInput/dist/jquery.maskedinput.min.js\" type=\"text/javascript\"/>");
            elements.append("<script cmp=\"cmpMask\" src=\"/System/jqueryui/Addon/MaskedInput/dist/tel_filtr.js\" type=\"text/javascript\"/>");
        }
        this.initCmpType(element);
        Attributes attrs = element.attributes();
        String ctrl = RemoveArrKeyRtrn(attrs, "ctrl");
        String mask = RemoveArrKeyRtrn(attrs, "mask");
        StringBuffer sb = new StringBuffer();

        sb.append("<script>");
        if (ctrl.length() > 0) {
            for (String ctrlOne : ctrl.split(";")) {
                String ctrlBlock = ctrlOne.trim();
                if (ctrlBlock.length() == 0) continue;
                String ctrlName = ctrlBlock + "_ctrl";
                switch (mask) {
                    case "tel":
                        mask = "+7 (t99) 999-99-99";
                        break;
                    case "date":
                        mask = "99.99.9999";
                        break;
                    case "datetime":
                        mask = "99.99.9999 99:99";
                        break;
                    case "time":
                        mask = "99:99";
                        break;
                    case "bank":
                        mask = "9999 9999 9999 9999";
                        break;
                    case "pasport":
                        mask = "99-99 999999";
                        break;
                    case "inn":
                        mask = "999999999999";
                        break;
                    case "snils":
                        mask = "999-999-999 99";
                        break;
                    case "mac":
                        mask = "hh:hh:hh:hh:hh:hh";
                        break;
                    default:
                }
                sb.append(" $('[name=\"" + ctrlName + "\"]').mask(\"" + mask + "\")\n");
            }
        }
        sb.append("</script>");
        this.append(sb.toString());
    }
}
