import WebServerLite.HttpExchange;

public class vr_terminal {
    /*
Пример отправки сообщения от клиента:

TERM /Example/EventSource/esp8266/vr_helmet/vr_terminal.java
dev:VR
     */

    /**
     *  Метод обрабатывается при обращении из Socket терминала
     */
    public static void onTerminal(HttpExchange query) {
        String devName = "VR";
        if (query.headers.containsKey("dev")){
            devName = (String)query.headers.get("dev");
        }
        String tmp = "";
        String tmpInput = "";
        while (true) {
            if (query.available()) {
                query.read();
                String cmd = query.message.replace("\r", "").replace("\n", "").trim();
                query.write("----------------|"+cmd+"|\r\n");
                if (cmd.equals("exit")) {
                    System.out.println("exit !!!! ");
                    break;
                }
            }
            //String msg = query.readLine();
            //if (msg.length() != 0) {
            //    query.write("----------------"+query.message+"\r\n");
            // }
            if (query.SHARE.has(devName)) {
                String str = query.SHARE.getString(devName);
                if (!tmp.equals(str)) {
                    query.write("{\"devname\":\""+devName+"\",\"compas\":"+str+"}\r\n");
                    tmp = str;
                }
            } else {
                query.write("{\"devname\":\""+devName+"\",\"error\":\"device not found\"}\r\n");
            }
        }
    }

    /**
     * Метод обрабатывается при обращении из браузера
     * http://127.0.0.1:8080/Example/EventSource/esp8266/vr_helmet/vr_terminal.java
     * @param query
     * @return
     */
    public byte[] onPage(HttpExchange query) {
        StringBuffer sb = new StringBuffer();
        sb.append("Пример Socket подключения:\n" +
                "TERM /Example/EventSource/esp8266/vr_helmet/vr_terminal.java\n" +
                "dev:VR \n" +
                "\n");
        query.mimeType = "text/plain";
        return sb.toString().getBytes();
    }
}