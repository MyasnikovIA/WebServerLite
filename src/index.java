import WebServerLite.HttpExchange;
import WebServerLite.onPage;


public class index {
    @onPage(url = "index.html", ext = "html")
    public byte[] page(HttpExchange query) {
        return "asdfasdfsa asdfasdfa sadfsadf".getBytes();
    }
}