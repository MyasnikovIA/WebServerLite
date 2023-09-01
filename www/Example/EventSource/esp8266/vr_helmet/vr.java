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
public class vr {
/*
Пример регистрации устройства на сервере :
TERM /Example/Terminal/esp8266.java
device_name:test1
*/
    public byte[] onPage(HttpExchange query) {
        query.write("HTTP/1.1 200 OK\r\n");
        query.write("Cache-Control: no-store\r\n");
        query.write("Content-Type: text/event-stream; charset=UTF-8\r\n");
        // ---- Крос доменный запрос из JS кода (ajax) ----
        query.write("Access-Control-Allow-Origin: *\r\n");
        query.write("Access-Control-Allow-Credentials: true\r\n");
        query.write("Access-Control-Expose-Headers: FooBar\r\n");
        query.write("\r\n");
        String nameDevice = "VR";
        if (query.requestParam.has("dev")) {
            nameDevice = query.requestParam.getString("dev");
        }
        int delay = 1;
        if (query.requestParam.has("delay")) {
            delay = query.requestParam.getInt("delay");
        }
        while (true) {
            if (!query.socket.isConnected()) {
                break;
            }
            query.write("event: "+nameDevice);
            query.write("\n");
            query.write("data: "+query.SHARE.getString(nameDevice));
            query.write("\n\n");
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return null;
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
            // System.out.println("query.countQuery " + query.countQuery);
            // System.out.println("msg--- " + msg);
            JSONObject message = new JSONObject(msg);
            query.SHARE.put(message.getString("send"), message.getString("msg"));
            // System.out.println("message--- " +  query.SHARE);
        }
    }
}