package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class cmpOsm extends Base {
    /*
    https://snipp.ru/jquery/leaflet-lines-marker

    https://habr.com/ru/articles/532902/
    https://github.com/Leaflet/Leaflet

  <cmpOsm label="выбор" name="ctrlMap"  height="30%" width="50%" left="30%" top="100px">
        <label caption="text1" lat="20" lon="15" onclick="" img="point" name="nameLabel"/>
    </cmpOsm>
     */
    public cmpOsm(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        if (doc.select("[cmp=\"cmpOsm\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<link cmp=\"cmpOsm\" href=\"/System/leaflet/leaflet.css\" rel=\"stylesheet\" type=\"text/css\"/>");
            elements.append("<script cmp=\"cmpOsm\" src=\"/System/leaflet/leaflet.js\"  type=\"text/javascript\"></script>");
            elements.append("<script cmp=\"cmpOsm\" src=\"/System/leaflet/leafletlib.js\"  type=\"text/javascript\"></script>");
        }
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "");
        attrsDst.add("type", "osm");
        String width = getCssArrKeyRemuve(attrs, "width", true);
        if (width.length()==0){
            width = "width:30%;";
        }
        String height = getCssArrKeyRemuve(attrs, "height", true);
        if (height.length()==0){
            height = "height:30%;";
        }
        String left = getCssArrKeyRemuve(attrs, "left", true);
        String top = getCssArrKeyRemuve(attrs, "top", true);
        String ctrlName = this.attr("name") + "_ctrl";
        String ctrlId = this.attr("id")+"_ctrl" ;
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        attrsDst.add("style", width+height);
        StringBuffer sb = new StringBuffer();
        sb.append("<div id=\""+ctrlId+"\" style=\""+width+height+"\"></div>\n");
        sb.append("<script>\n");
        sb.append("    var map = L.map('"+ctrlId+"', {center: [38.89, -77.03], zoom: 5, minZoom: 1, maxZoom: 18 });\n");

        // https://c.tile.openstreetmap.org/14/4688/6267.png
        // https://a.tile.openstreetmap.org/14/4683/6267.png

        sb.append("    var tiles = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {\n" +
                  "        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\n" +
                  "    }).addTo(map);\n" );
        /*
        sb.append("    var tiles = new L.tileLayer('/component/cmpOsm.java?sloy={s}&z={z}&x={x}&y={y}', {\n" +
                  "        attribution: '&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a> contributors'\n" +
                  "    }).addTo(map);\n" );
        */
        sb.append("   var marker = L.marker([38.89, -77.03]).addTo(map);\n");
        sb.append("</script>\n");
        this.append(sb.toString());
    }
}
