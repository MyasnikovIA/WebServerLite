package component;

import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;



public class cmpDialog extends Base {
    /*


<cmpDialog caption="test" name="d1"  path="subform.html" width="900" height="900" >
    safgsadfsda
</cmpDialog>



    http://www.w3big.com/jqueryui/example-dialog.html#gsc.tab=0

    https://professorweb.ru/my/javascript/jquery/level4/4_9.php
   Свойство	Описание
        autoOpen	Если эта опция равна true, то диалоговое окно открывается сразу же после его создания с помощью метода dialog(). Значение по умолчанию — true
        buttons	Позволяет указать набор кнопок, которые должны быть добавлены в виджет, и функции, которые будут вызываться после щелчка на соответствующей кнопке. По умолчанию кнопки отсутствуют
        closeOnEscape	Если эта опция равна true, то диалоговое окно можно будет убрать с экрана, нажав клавишу <Esc>. Значение по умолчанию — true
        draggable	Если эта опция равна true, то пользователь сможет перемещать диалоговое окно, перетаскивая его заголовок, в пределах окна браузера
        height	Определяет начальную высоту диалогового окна в пикселях. По умолчанию имеет значение auto, при котором высота диалогового окна устанавливается автоматически
        hide	Определяет тип анимации, используемой для сокрытия диалогового окна
        maxHeight	Определяет максимальную высоту диалогового окна в пикселях. По умолчанию имеет значение false, которому соответствует отсутствие ограничений по высоте
        maxWidth	Определяет максимальную ширину диалогового окна в пикселях. По умолчанию имеет значение false, которому соответствует отсутствие ограничений по ширине
        minHeight	Определяет минимальную высоту диалогового окна в пикселях. По умолчанию имеет значение false, которому соответствует отсутствие ограничений по высоте
        minWidth	Определяет минимальную ширину диалогового окна в пикселях. По умолчанию имеет значение false, которому соответствует отсутствие ограничений по ширине
        modal	Если эта опция равна true, то диалоговое окно будет создано как модальное, и пока оно не будет скрыто, пользователь не сможет взаимодействовать с документом
        position	Определяет начальную позицию диалогового окна. Значение по умолчанию — center, которому соответствует расположение диалогового окна по центру окна браузера
        resizable	Если эта опция равна true, то диалоговое окно будет иметь кнопку-манипулятор, с помощью которой пользователь сможет изменить его размер. Значение по умолчанию — true
        show	Определяет тип анимации, используемой для отображения диалогового окна
        stack	Если эта опция равна true, то щелчок на диалоговом окне перемещает его на передний план на экране. Значение по умолчанию — true
        title	Определяет заголовок диалогового окна
        width	Определяет начальную ширину диалогового окна в пикселях. По умолчанию имеет значение auto, при котором ширина диалогового окна устанавливается автоматически

    Событие	Описание
        create	Происходит, когда виджет Dialog применяется к базовому HTML-элементу
        beforeClose	Происходит непосредственно перед закрытием диалогового окна. Возврат значения false функцией—обработчиком события принудительно оставляет диалоговое окно открытым
        open	Происходит при открытии диалогового окна
        focus	Происходит при получении фокуса диалоговым окном
        dragStart	Происходит, когда пользователь начинает перетаскивать диалоговое окно
        drag	Происходит при каждом перемещении мыши в процессе перетаскивания диалогового окна
        dragStop	Происходит по окончании перетаскивания пользователем диалогового окна
        resizeStart	Происходит, когда пользователь начинает изменять размер диалогового окна
        resize	Происходит при каждом перемещении мыши в процессе изменения размера диалогового окна
        resizeStop	Происходит по окончании изменения пользователем размеров диалогового окна Происходит при закрытии диалогового окна
        close	Поддержание диалогового окна в открытом состоянии


          <cmpDialog name="dia" caption="Диалоговое окно" open="1">
              Текст до компонента
              <cmpLabel caption="Содержимое диалогового окна (компонент)"/>
              Текст после компонента
          </cmpDialog>
    */
    public cmpDialog(Document doc, Element element) {
        super(doc, element, "span");
        this.initCmpType(element);
        this.initCmpId(element);
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        String width = getCssArrKeyRemuve(attrs, "width", false);
        String height = getCssArrKeyRemuve(attrs, "height", false);
        String widthJs = getJsArrKeyRemuve(attrs, "width", true);
        String heightJs = getJsArrKeyRemuve(attrs, "height", true);
        String query_selector = RemoveArrKeyRtrn(attrs, "query_selector", "");
        String ctrlName = this.attr("name") + "_ctrl";
        String name = this.attr("name");
        attrsDst.add("ctrl", ctrlName);
        attrsDst.add("schema", "");
        attrsDst.add("type", "dialog");
        StringBuffer sb = new StringBuffer();
        sb.append("\n<script> $(function() {\n");
        String captionText = "";
        if (attrs.hasKey("caption")) {
            captionText = RemoveArrKeyRtrn(attrs, "caption");
        }
        String autoOpen = ",autoOpen: false";
        if (attrs.hasKey("open")) {
            RemoveArrKeyRtrn(attrs, "open");
            autoOpen = ",autoOpen: true";
        }
        String modal = "modal: false";
        if (attrs.hasKey("modal")) {
            RemoveArrKeyRtrn(attrs, "modal");
            modal = "modal: true";
        }
        sb.append(" $('[name=\"" + ctrlName + "\"]').dialog({" + modal + autoOpen+widthJs+heightJs+ "});\n");
        // sb.append(" $('[name=\"" + ctrlName + "\"]').dialog( \"close\" );\n");
        sb.append(" D3Api.setControlAuto('" + name + "', $('[name=\"" + name + "\"]'));\n");
        sb.append("}); </script>\n");
        sb.append("   <div name=\"" + ctrlName + "\" title=\"" + captionText + "\">\n");
        String path = RemoveArrKeyRtrn(attrs, "path", "");
        String htmlText = "";
        if (path.length() == 0) {
            htmlText = element.html();
        } else {
            htmlText = WebServerLite.ServerResourceHandler.parseSubElementV2(doc, path, query_selector);
        }
        sb.append(htmlText);
        sb.append("   </div>\n");
        sb.append(cmpPopup.initPopUpCtrl(doc,attrs,name)); // добавление контекстного меню на контрол
        this.append(sb.toString());
        System.out.println(sb.toString());

        // https://jqueryui.com/autocomplete/
    }
}
