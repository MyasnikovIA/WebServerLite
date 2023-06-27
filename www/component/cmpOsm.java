import java.util.*;
import com.sun.net.httpserver.*;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;


public class cmpOsm {
    public byte[] onPage(HashMap<String, Object> query) {
        HashMap<String, Object> session = (HashMap<String, Object>) query.get("session");   // Получение session объекта
        HashMap<String, Object> vars = (HashMap<String, Object>) query.get("vars");         // переменные (из URL строки)
        HashMap<String, Object> property = (HashMap<String, Object>) query.get("property"); // атребуты загодовка запроса
        HttpExchange httpExchange = (HttpExchange) query.get("httpExchange");               // получение серверного обхъекта
        String method = httpExchange.getRequestMethod();                                    // метод запроса GET или POST
        //Systrm.out.print(property);

        String contentType = (String)query.get("Content-Type");                             // Получить mime контента (автоопределение по расширению)
        query.put("Content-Type", "application/png; charset=UTF-8");                        // Изменить mime ответа


        /*
        // Получение тела POST запроса
        if (!session.containsKey("post")) {
            byte[] post = (byte[]) query.get("post");
        }
        // работа с сессией
        if (!session.containsKey("test-2")) {
            session.put("test-2", 1);
        } else {
            int tmp = (Integer) session.get("test-2");
            session.put("test-2", tmp + 1);
        }
        String resultText ="res - text" + session.toString() + "     ";
        return resultText.getBytes();
    */
        String resultText ="";
        return resultText.getBytes();
    }
}