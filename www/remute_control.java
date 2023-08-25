import WebServerLite.HttpExchange;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;


import java.util.ArrayList;
import java.util.Set;

import static WebServerLite.HttpExchange.*;

/**
 * Пример организации обмена сообщениями  между Сокет устройствами (Arduino ESP8266)
 */
public class remute_control {
/*
Пример регистрации устройства на сервере :
TERM /Example/Terminal/esp8266.java
device_name:test1
*/

   public static JSONObject message = new JSONObject();

    public byte[] onPage(HttpExchange query) {
        StringBuffer sb = new StringBuffer();
        sb.append("\nquery.headers : " + query.headers);
        sb.append("\nquery.requestParam : " + query.requestParam);
        sb.append("\nquery.session : " + query.session);
        sb.append("\nquery.cookie : " + query.cookie);
        sb.append("\nquery.sessionID : " + query.sessionID);
        sb.append("\nmessage : " +message);
        query.mimeType = "text/plain";
        return sb.toString().getBytes();
    }

    public static void onTerminal(HttpExchange query) {
        String DeviceName = "";
        String UserName = "";
        String UserPass = "";
        String lastCommandName = "";
        String DeviceNameSendTo = "";
        if (query.headers.containsKey("device_name")) {
            DeviceName = (String) query.headers.get("device_name");
        }
        if (query.headers.containsKey("UserName")) {
            UserName = (String) query.headers.get("UserName");
        }
        if (query.headers.containsKey("UserPass")) {
            UserPass = (String) query.headers.get("UserPass");
        }
        DevList.put(DeviceName, query);
        ArrayList<String> listDevice = new ArrayList<String>();
        BROADCAST_MESSAGE_LIST.put(DeviceName, listDevice); // Регистрируем канал, для широковещательной передачи сообщений (1 отправитель -> много получателей = видеострим)
        query.write("{\"register\":\"" + DeviceName + "\"}");
        query.write("\r\n");
        while (query.read() != null) {
            // query.write(query.requestParam.toString() + "\r\n");
            // query.write("DeviceName " + DeviceName + "\r\n");
            // query.write("message " + query.message + "\r\n");
            String msg = query.message.replace("\r", "").replace("\n", "").trim();
            if (msg.length() == 0) {
                continue;
            }
            System.out.println("query.countQuery " + query.countQuery);
           //  message = new JSONObject(msg);
            System.out.println("msg--- " + msg);

        }
    }
}