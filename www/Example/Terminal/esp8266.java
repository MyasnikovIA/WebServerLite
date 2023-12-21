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
public class esp8266 {
    /*
Пример регистрации устройства на сервере :

TERM /Example/Terminal/esp8266.java
device_name:test1

     */
    public static void onTerminal(HttpExchange query) {
        String DeviceName = "";
        String UserName = "";
        String UserPass = "";
        String lastCommandName = "";
        String DeviceNameSendTo = "";
        System.out.println("query.headers " + query.headers);
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
            System.out.println("query.headers " + query.headers);
            System.out.println("query.countQuery " + query.countQuery);
            System.out.println("DeviceName " + DeviceName);
            System.out.println("lastCommandName " + lastCommandName);
            System.out.println("DeviceNameSendTo " + DeviceNameSendTo);
            query.write(query.requestParam.toString() + "\r\n");
            query.write("DeviceName " + DeviceName + "\r\n");
            query.write("message " + query.message + "\r\n");
            String cmd = query.message.replace("\r", "").replace("\n", "").trim();
            if ((cmd.indexOf("exit") != -1) && (cmd.length() == 4)) {
                break;
            }
            if ((cmd.indexOf("ping") != -1) && (cmd.length() == 4)) {
                query.write("ping\r\n");
                continue;
            }
            // получить список подключенных устройств
            if ((cmd.indexOf("list") != -1) && (cmd.length() == 4)) {
                Set<String> keys = DevList.keySet();
                StringBuffer sbList = new StringBuffer();
                sbList.append("\r\n");
                sbList.append("[");
                int ind = 0;
                for (String key : keys) {
                    try {
                        DevList.get(key);
                    } catch (Exception e) {
                        DevList.remove(key);
                        continue;
                    }
                    ind++;
                    if (ind > 1) {
                        sbList.append(",\"" + key + "\"");
                    } else {
                        sbList.append("\"" + key + "\"");
                    }
                }
                sbList.append("]\r\n");
                query.write(sbList.toString());
                sbList.setLength(0);
                continue;
            }

            // Переключение в режим трансляции видеострима
            if ((cmd.indexOf("udp") != -1) && (cmd.length() == 3)) {
                boolean isWor = true;
                int charInt;
                while (isWor) {
                    while ((charInt = query.readInt()) != -1) {
                        if (charInt == -1) {
                            isWor = false;
                            rebootOneDevice(DeviceName);
                            break;
                        }
                        for (int ind = 0; ind < BROADCAST_MESSAGE_LIST.get(DeviceName).size(); ind++) {
                            try {
                                DevList.get(BROADCAST_MESSAGE_LIST.get(DeviceName).get(ind)).write(charInt);
                            } catch (Exception e) {
                                DevList.remove(BROADCAST_MESSAGE_LIST.get(DeviceName).get(ind));
                                BROADCAST_MESSAGE_LIST.get(DeviceName).remove(ind);
                            }
                        }
                    }
                }
                break;
            }
            // получение сообщения для устройства
            if ((cmd.indexOf("pop") != -1) && (cmd.trim().length() == 3)) {
                if (MESSAGE_LIST.containsKey(DeviceName) == true) {
                    query.write(MESSAGE_LIST.get(DeviceName).toString() + "\r\n");
                    MESSAGE_LIST.remove(DeviceName);
                } else {
                    query.write("{\"ok\":false,\"error\":\"no message\"}\r\n");
                }
                continue;
            }
            if (query.messageJson.toString().equals("{}")) continue;
            // отправка сообщения для устройства
            if ((query.messageJson.has("push") == true) || (lastCommandName.equals("push"))) {
                lastCommandName = "push";
                if (query.messageJson.has("push") == true) {
                    DeviceNameSendTo = query.messageJson.getString("push");
                    query.messageJson.remove("push");
                }
                query.messageJson.put("from", DeviceName);
                if (MESSAGE_LIST.containsKey(DeviceNameSendTo)) {
                    JSONArray arr = new JSONArray((String) MESSAGE_LIST.get(DeviceNameSendTo));
                    arr.put(query.messageJson);
                    MESSAGE_LIST.put(DeviceNameSendTo, arr.toString());
                } else {
                    MESSAGE_LIST.put(DeviceNameSendTo, "[" + query.messageJson.toString() + "]");
                }
                query.write("{\"ok\":true}\r\n");
                continue;
            }

            // прямая отправка сообщения для устройства, если оно в сети
            if ((query.messageJson.has("send") == true) || (lastCommandName.equals("send"))) {
                lastCommandName = "send";
                if (query.messageJson.has("send") == true) {
                    DeviceNameSendTo = query.messageJson.getString("send");
                }
                query.messageJson.remove("send");
                query.messageJson.put("from", DeviceName);
                if (DevList.containsKey(DeviceNameSendTo)) {
                    HttpExchange devTo = (HttpExchange) DevList.get(DeviceNameSendTo);
                    devTo.write((query.messageJson.toString()).getBytes());
                    query.write("{\"ok\":true}");
                } else {
                    query.write("{\"ok\":false,\"error\":\"send '" + DeviceNameSendTo + "' error\"}\r\n");
                }
                continue;
            }

            // Если получатель определен, тогда все остальные сообщения отпр
            if (DeviceNameSendTo.length() > 0) {
                query.messageJson.put("from", DeviceName);
                if (DevList.containsKey(DeviceNameSendTo)) {
                    HttpExchange devTo = (HttpExchange) DevList.get(DeviceNameSendTo);
                    devTo.write(query.messageJson.toString().getBytes());
                } else {
                    query.write("{\"ok\":false,\"error\":\"device '" + DeviceNameSendTo + "' not found\"}\r\n");
                }
                continue;
            }
            System.out.println("message " + query.message);
        }
        if (DeviceName.length() > 0) {
            rebootOneDevice(DeviceName);
        }
    }

    public static void rebootOneDevice(String DevName) {
        if (DevName.length() == 0) return;
        Set<String> keys = DevList.keySet();
        if (keys != null) {
            for (String key : keys) {
                if (DevName.length() > 0) {
                    if (key.equals(DevName)) {
                        HttpExchange dev = (HttpExchange) DevList.get(key);
                        if (dev.isConnected()) {
                            dev.write(" Kill connect \r\n".getBytes());
                        }
                        DevList.remove(key);
                        BROADCAST_MESSAGE_LIST.remove(key);
                    }
                }
            }
        }
    }


    public byte[] onPage(HttpExchange query) {
        StringBuffer sb = new StringBuffer();
        sb.append("\nquery.headers : " + query.headers);
        query.mimeType = "text/plain";
        return sb.toString().getBytes();
    }
}