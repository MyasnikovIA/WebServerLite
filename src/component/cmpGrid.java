package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

public class cmpGrid extends Base {
    /*
https://datatables.net/manual/ajax
https://datatables.net/examples/index


<cmpGrid label="выбор" name="ctrlAcordion" onchange="console.log(D3Api.getValue('ctrlAcordion'));" height="30%" width="50%" left="30%" top="100px">
</cmpGrid>

     */
    public cmpGrid(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "");
        attrsDst.add("type", "cmpGrid");
        String width = getCssArrKeyRemuve(attrs, "width", true);
        String height = getCssArrKeyRemuve(attrs, "height", true);
        String left = getCssArrKeyRemuve(attrs, "left", true);
        String top = getCssArrKeyRemuve(attrs, "top", true);
        if (doc.select("[cmp=\"cmpGrid\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<link cmp=\"cmpGrid\" rel=\"stylesheet\" href=\"/System/jqueryui/Addon/DataTables/media/css/jquery.dataTables.css\">");
            elements.append("<script cmp=\"cmpGrid\" src=\"/System/jqueryui/Addon/DataTables/media/js/jquery.dataTables.min.js\"></script>");
            // stateSave: true,
            elements.append("<script cmp=\"cmpGrid\" src=\"/System/jqueryui/Addon/DataTables/media/js/query.dataTables.min.js\"></script>");
        }
        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));");
        sb.append("$('[name=\"" + ctrlName + "\"]').accordion();");
        sb.append("" +
                "" +
                " $('#example').DataTable( {\n" +
                // Выключить пагинацию
                //  "          paging:   false,\n" +
                //  "          ordering: false,\n" +
                //  "          info:     false,\"\n" +
                // Сохронять состояние после перезагрузки  страницы
                // "          stateSave: true,\"\n" +
                "          pagingType : \"full_numbers\"\n" +

                // перевод текста
                "         ,language : {\n" +
                "            \"lengthMenu\": \"Отображать _MENU_ записей\",\n" +
                "            \"loadingRecords\": \"Загрузка...\"," +
                "            \"thousands\":     \".\","+
                "            \"zeroRecords\": \"Ничего не найдено - sorry\",\n" +
                "            \"search\":         \"Поиск:\"," +
                "            \"info\": \" _PAGE_ из _PAGES_\",\n" +
                "            \"infoEmpty\": \"Нет доступных записей\"," +
                "            \"paginate\": {\n" +
                "                 \"first\":      \"<<\",\n" +
                "                 \"last\":       \">>\",\n" +
                "                 \"next\":       \">\",\n" +
                "                 \"previous\":   \"<\"\n" +
                "            },\n" +

               // "            \"infoLast\": \"в конец\",\n" +
                "            \"infoFiltered\": \"(отфильтровано из _MAX_ записей)\"\n" +
                "        }\n" +
                "    });" +
                "");
        sb.append("}); </script>");
        sb.append("<div name=\"" + ctrlName + "\" style=\"position: relative;" + height + width + left + top + "\">\n");
 //--------------------------------------
        sb.append("<table id=\"example\" class=\"display\" style=\"width:100%\">\n" +
                "    <thead>\n" +
                "        <tr>\n" +
                "            <th>Имя</th>\n" +
                "            <th>Расположение</th>\n" +
                "            <th>Офис</th>\n" +
                "            <th>Лет</th>\n" +
                "            <th>Дата начала</th>\n" +
                "            <th>Денег</th>\n" +
                "        </tr>\n" +
                "    </thead>\n" +
                "    <tbody>\n" +
                "        <tr>\n" +
                "            <td>Tiger Nixon</td>\n" +
                "            <td>System Architect</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>61</td>\n" +
                "            <td>2011/04/25</td>\n" +
                "            <td>$320,800</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Garrett Winters</td>\n" +
                "            <td>Accountant</td>\n" +
                "            <td>Tokyo</td>\n" +
                "            <td>63</td>\n" +
                "            <td>2011/07/25</td>\n" +
                "            <td>$170,750</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Ashton Cox</td>\n" +
                "            <td>Junior Technical Author</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>66</td>\n" +
                "            <td>2009/01/12</td>\n" +
                "            <td>$86,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Cedric Kelly</td>\n" +
                "            <td>Senior Javascript Developer</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>22</td>\n" +
                "            <td>2012/03/29</td>\n" +
                "            <td>$433,060</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Airi Satou</td>\n" +
                "            <td>Accountant</td>\n" +
                "            <td>Tokyo</td>\n" +
                "            <td>33</td>\n" +
                "            <td>2008/11/28</td>\n" +
                "            <td>$162,700</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Brielle Williamson</td>\n" +
                "            <td>Integration Specialist</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>61</td>\n" +
                "            <td>2012/12/02</td>\n" +
                "            <td>$372,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Herrod Chandler</td>\n" +
                "            <td>Sales Assistant</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>59</td>\n" +
                "            <td>2012/08/06</td>\n" +
                "            <td>$137,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Rhona Davidson</td>\n" +
                "            <td>Integration Specialist</td>\n" +
                "            <td>Tokyo</td>\n" +
                "            <td>55</td>\n" +
                "            <td>2010/10/14</td>\n" +
                "            <td>$327,900</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Colleen Hurst</td>\n" +
                "            <td>Javascript Developer</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>39</td>\n" +
                "            <td>2009/09/15</td>\n" +
                "            <td>$205,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Sonya Frost</td>\n" +
                "            <td>Software Engineer</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>23</td>\n" +
                "            <td>2008/12/13</td>\n" +
                "            <td>$103,600</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Jena Gaines</td>\n" +
                "            <td>Office Manager</td>\n" +
                "            <td>London</td>\n" +
                "            <td>30</td>\n" +
                "            <td>2008/12/19</td>\n" +
                "            <td>$90,560</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Quinn Flynn</td>\n" +
                "            <td>Support Lead</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>22</td>\n" +
                "            <td>2013/03/03</td>\n" +
                "            <td>$342,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Charde Marshall</td>\n" +
                "            <td>Regional Director</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>36</td>\n" +
                "            <td>2008/10/16</td>\n" +
                "            <td>$470,600</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Haley Kennedy</td>\n" +
                "            <td>Senior Marketing Designer</td>\n" +
                "            <td>London</td>\n" +
                "            <td>43</td>\n" +
                "            <td>2012/12/18</td>\n" +
                "            <td>$313,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Tatyana Fitzpatrick</td>\n" +
                "            <td>Regional Director</td>\n" +
                "            <td>London</td>\n" +
                "            <td>19</td>\n" +
                "            <td>2010/03/17</td>\n" +
                "            <td>$385,750</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Michael Silva</td>\n" +
                "            <td>Marketing Designer</td>\n" +
                "            <td>London</td>\n" +
                "            <td>66</td>\n" +
                "            <td>2012/11/27</td>\n" +
                "            <td>$198,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Paul Byrd</td>\n" +
                "            <td>Chief Financial Officer (CFO)</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>64</td>\n" +
                "            <td>2010/06/09</td>\n" +
                "            <td>$725,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Gloria Little</td>\n" +
                "            <td>Systems Administrator</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>59</td>\n" +
                "            <td>2009/04/10</td>\n" +
                "            <td>$237,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Bradley Greer</td>\n" +
                "            <td>Software Engineer</td>\n" +
                "            <td>London</td>\n" +
                "            <td>41</td>\n" +
                "            <td>2012/10/13</td>\n" +
                "            <td>$132,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Dai Rios</td>\n" +
                "            <td>Personnel Lead</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>35</td>\n" +
                "            <td>2012/09/26</td>\n" +
                "            <td>$217,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Jenette Caldwell</td>\n" +
                "            <td>Development Lead</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>30</td>\n" +
                "            <td>2011/09/03</td>\n" +
                "            <td>$345,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Yuri Berry</td>\n" +
                "            <td>Chief Marketing Officer (CMO)</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>40</td>\n" +
                "            <td>2009/06/25</td>\n" +
                "            <td>$675,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Caesar Vance</td>\n" +
                "            <td>Pre-Sales Support</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>21</td>\n" +
                "            <td>2011/12/12</td>\n" +
                "            <td>$106,450</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Doris Wilder</td>\n" +
                "            <td>Sales Assistant</td>\n" +
                "            <td>Sydney</td>\n" +
                "            <td>23</td>\n" +
                "            <td>2010/09/20</td>\n" +
                "            <td>$85,600</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Angelica Ramos</td>\n" +
                "            <td>Chief Executive Officer (CEO)</td>\n" +
                "            <td>London</td>\n" +
                "            <td>47</td>\n" +
                "            <td>2009/10/09</td>\n" +
                "            <td>$1,200,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Gavin Joyce</td>\n" +
                "            <td>Developer</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>42</td>\n" +
                "            <td>2010/12/22</td>\n" +
                "            <td>$92,575</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Jennifer Chang</td>\n" +
                "            <td>Regional Director</td>\n" +
                "            <td>Singapore</td>\n" +
                "            <td>28</td>\n" +
                "            <td>2010/11/14</td>\n" +
                "            <td>$357,650</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Brenden Wagner</td>\n" +
                "            <td>Software Engineer</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>28</td>\n" +
                "            <td>2011/06/07</td>\n" +
                "            <td>$206,850</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Fiona Green</td>\n" +
                "            <td>Chief Operating Officer (COO)</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>48</td>\n" +
                "            <td>2010/03/11</td>\n" +
                "            <td>$850,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Shou Itou</td>\n" +
                "            <td>Regional Marketing</td>\n" +
                "            <td>Tokyo</td>\n" +
                "            <td>20</td>\n" +
                "            <td>2011/08/14</td>\n" +
                "            <td>$163,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Michelle House</td>\n" +
                "            <td>Integration Specialist</td>\n" +
                "            <td>Sydney</td>\n" +
                "            <td>37</td>\n" +
                "            <td>2011/06/02</td>\n" +
                "            <td>$95,400</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Suki Burks</td>\n" +
                "            <td>Developer</td>\n" +
                "            <td>London</td>\n" +
                "            <td>53</td>\n" +
                "            <td>2009/10/22</td>\n" +
                "            <td>$114,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Prescott Bartlett</td>\n" +
                "            <td>Technical Author</td>\n" +
                "            <td>London</td>\n" +
                "            <td>27</td>\n" +
                "            <td>2011/05/07</td>\n" +
                "            <td>$145,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Gavin Cortez</td>\n" +
                "            <td>Team Leader</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>22</td>\n" +
                "            <td>2008/10/26</td>\n" +
                "            <td>$235,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Martena Mccray</td>\n" +
                "            <td>Post-Sales support</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>46</td>\n" +
                "            <td>2011/03/09</td>\n" +
                "            <td>$324,050</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Unity Butler</td>\n" +
                "            <td>Marketing Designer</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>47</td>\n" +
                "            <td>2009/12/09</td>\n" +
                "            <td>$85,675</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Howard Hatfield</td>\n" +
                "            <td>Office Manager</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>51</td>\n" +
                "            <td>2008/12/16</td>\n" +
                "            <td>$164,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Hope Fuentes</td>\n" +
                "            <td>Secretary</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>41</td>\n" +
                "            <td>2010/02/12</td>\n" +
                "            <td>$109,850</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Vivian Harrell</td>\n" +
                "            <td>Financial Controller</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>62</td>\n" +
                "            <td>2009/02/14</td>\n" +
                "            <td>$452,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Timothy Mooney</td>\n" +
                "            <td>Office Manager</td>\n" +
                "            <td>London</td>\n" +
                "            <td>37</td>\n" +
                "            <td>2008/12/11</td>\n" +
                "            <td>$136,200</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Jackson Bradshaw</td>\n" +
                "            <td>Director</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>65</td>\n" +
                "            <td>2008/09/26</td>\n" +
                "            <td>$645,750</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Olivia Liang</td>\n" +
                "            <td>Support Engineer</td>\n" +
                "            <td>Singapore</td>\n" +
                "            <td>64</td>\n" +
                "            <td>2011/02/03</td>\n" +
                "            <td>$234,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Bruno Nash</td>\n" +
                "            <td>Software Engineer</td>\n" +
                "            <td>London</td>\n" +
                "            <td>38</td>\n" +
                "            <td>2011/05/03</td>\n" +
                "            <td>$163,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Sakura Yamamoto</td>\n" +
                "            <td>Support Engineer</td>\n" +
                "            <td>Tokyo</td>\n" +
                "            <td>37</td>\n" +
                "            <td>2009/08/19</td>\n" +
                "            <td>$139,575</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Thor Walton</td>\n" +
                "            <td>Developer</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>61</td>\n" +
                "            <td>2013/08/11</td>\n" +
                "            <td>$98,540</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Finn Camacho</td>\n" +
                "            <td>Support Engineer</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>47</td>\n" +
                "            <td>2009/07/07</td>\n" +
                "            <td>$87,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Serge Baldwin</td>\n" +
                "            <td>Data Coordinator</td>\n" +
                "            <td>Singapore</td>\n" +
                "            <td>64</td>\n" +
                "            <td>2012/04/09</td>\n" +
                "            <td>$138,575</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Zenaida Frank</td>\n" +
                "            <td>Software Engineer</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>63</td>\n" +
                "            <td>2010/01/04</td>\n" +
                "            <td>$125,250</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Zorita Serrano</td>\n" +
                "            <td>Software Engineer</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>56</td>\n" +
                "            <td>2012/06/01</td>\n" +
                "            <td>$115,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Jennifer Acosta</td>\n" +
                "            <td>Junior Javascript Developer</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>43</td>\n" +
                "            <td>2013/02/01</td>\n" +
                "            <td>$75,650</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Cara Stevens</td>\n" +
                "            <td>Sales Assistant</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>46</td>\n" +
                "            <td>2011/12/06</td>\n" +
                "            <td>$145,600</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Hermione Butler</td>\n" +
                "            <td>Regional Director</td>\n" +
                "            <td>London</td>\n" +
                "            <td>47</td>\n" +
                "            <td>2011/03/21</td>\n" +
                "            <td>$356,250</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Lael Greer</td>\n" +
                "            <td>Systems Administrator</td>\n" +
                "            <td>London</td>\n" +
                "            <td>21</td>\n" +
                "            <td>2009/02/27</td>\n" +
                "            <td>$103,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Jonas Alexander</td>\n" +
                "            <td>Developer</td>\n" +
                "            <td>San Francisco</td>\n" +
                "            <td>30</td>\n" +
                "            <td>2010/07/14</td>\n" +
                "            <td>$86,500</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Shad Decker</td>\n" +
                "            <td>Regional Director</td>\n" +
                "            <td>Edinburgh</td>\n" +
                "            <td>51</td>\n" +
                "            <td>2008/11/13</td>\n" +
                "            <td>$183,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Michael Bruce</td>\n" +
                "            <td>Javascript Developer</td>\n" +
                "            <td>Singapore</td>\n" +
                "            <td>29</td>\n" +
                "            <td>2011/06/27</td>\n" +
                "            <td>$183,000</td>\n" +
                "        </tr>\n" +
                "        <tr>\n" +
                "            <td>Donna Snider</td>\n" +
                "            <td>Customer Support</td>\n" +
                "            <td>New York</td>\n" +
                "            <td>27</td>\n" +
                "            <td>2011/01/25</td>\n" +
                "            <td>$112,000</td>\n" +
                "        </tr>\n" +
                "    </tbody>\n" +
                "    <tfoot>\n" +
                "        <tr>\n" +
                "            <th>Имя</th>\n" +
                "            <th>Расположение</th>\n" +
                "            <th>Офис</th>\n" +
                "            <th>Лет</th>\n" +
                "            <th>Дата начала</th>\n" +
                "            <th>Денег</th>\n" +
                "        </tr>\n" +
                "    </tfoot>\n" +
                "</table>");
//---------------------------------

        sb.append("</div>");
        sb.append(cmpPopup.initPopUpCtrl(doc, attrs, name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
    }
}
