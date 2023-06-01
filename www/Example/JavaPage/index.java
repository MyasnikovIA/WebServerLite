import WebServerLite.HttpExchange;
public class index {
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