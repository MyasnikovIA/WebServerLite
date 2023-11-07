import WebServerLite.WebServerLite;
import WebServerLite.HttpExchange;
public class Main {
    public static void main(String[] args) {
        WebServerLite web = new WebServerLite();
        web.onPage("test.html", (HttpExchange query) -> {
            StringBuffer sb = new StringBuffer();
            sb.append("\nquery.headers : " + query.headers);
            sb.append("\nquery.requestParam : " + query.requestParam);
            sb.append("\nquery.session : " + query.session);
            sb.append("\nquery.cookie : " + query.cookie);
            sb.append("\nquery.sessionID : " + query.sessionID);
            query.mimeType = "text/plain";
            return sb.toString().getBytes();
        });
        web.start(args);
    }
}