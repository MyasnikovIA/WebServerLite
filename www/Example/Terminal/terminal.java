import WebServerLite.HttpExchange;

public class terminal {
    /*
Пример отправки сообщения от клиента:

TERM /Example/Terminal/terminal.java
aa:ddddddd
dd:fffff
ggg:hhhhhhhh
     */

    /**
     *  Метод обрабатывается при обращении из Socket терминала
     */
    public static void onTerminal(HttpExchange query) {
        // Отправить сообщение  сокет клиенту
        query.write(query.requestParam.toString() + "\r\n");
        query.write(query.requestText + "\r\n");
        query.write(query.headers + "\r\n");
        while (query.read() != null) {
            System.out.println("{\"ok\":false,\"++++++error+++++----\":\"no message\"}\r\n");
            System.out.println("Head.message " + query.message);
            System.out.println("query.isConnected() " + query.isConnected());
            System.out.println("query.socket.isClosed() " + query.socket.isClosed());
            query.write("-------------------------------\r\n");
            query.write(query.requestParam.toString() + "\r\n");
            query.write(query.requestText + "\r\n");
            query.write(query.headers + "\r\n");
        }
    }

    /**
     * Метод обрабатывается при обращении из браузера
     * http://127.0.0.1:8080/Example/Terminal/terminal.java
     * @param query
     * @return
     */
    public byte[] onPage(HttpExchange query) {
        StringBuffer sb = new StringBuffer();
        sb.append("\nquery.headers : " + query.headers);
        sb.append("\nquery.requestParam : " + query.requestParam);
        sb.append("\nquery.session : " + query.session);
        sb.append("\nquery.cookie : " + query.cookie);
        sb.append("\nquery.sessionID : " + query.sessionID);
        query.mimeType = "text/plain";
        return sb.toString().getBytes();
    }
}