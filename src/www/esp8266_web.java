package www;

import WebServerLite.HttpExchange;
import WebServerLite.onPage;
import WebServerLite.onTerminal;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import java.util.ArrayList;
import java.util.Set;

import static WebServerLite.HttpExchange.*;

/**
 * Пример организации обмена сообщениями  между Сокет устройствами (Arduino ESP8266)
 */
public class esp8266_web {
    /*
Пример регистрации устройства на сервере :
TERM /Example/Terminal/esp8266.java
device_name:test1
     */
    @onTerminal(url="Example/Terminal/esp8266_web.java")
    public static void onTerminal(HttpExchange query) {
        String DeviceName = "";
        String DevicePass = "";
        System.out.println("query.headers " + query.headers);
        if (query.headers.containsKey("device_name")) {
            DeviceName = (String) query.headers.get("device_name");
        }
        if (query.headers.containsKey("device_pass")) {
            DevicePass = (String) query.headers.get("device_pass");
        }
        DevList.put(DeviceName, query);
        ArrayList<String> listDevice = new ArrayList<String>();
        BROADCAST_MESSAGE_LIST.put(DeviceName, listDevice); // Регистрируем канал, для широковещательной передачи сообщений (1 отправитель -> много получателей = видеострим)
        // query.write("{\"register\":\"" + DeviceName + "\"}");
        // query.write("\r\n");
        while (query.socket.isConnected() == true) {
            while (query.read() != null) {
                if (query.message.indexOf("{") == -1 || query.message.indexOf("}") == -1) continue;
                //  System.out.println("query.countQuery " + query.countQuery);
                System.out.println("DeviceName " + DeviceName);
                System.out.println("query.message " + query.message);
                System.out.println("requestParam " + query.requestParam.toString());
                // query.write(query.requestParam.toString() + "\r\n"); // Отправка сообщения подключенному устройству
            }
        }
    }

    @onPage(url="Example/Terminal/esp8266_web.java")
    public byte[] onPage(HttpExchange query) {
        StringBuffer sb = new StringBuffer();
        sb.append("\nquery.headers : " + query.headers);
        query.mimeType = "text/plain";
        return sb.toString().getBytes();
    }
}