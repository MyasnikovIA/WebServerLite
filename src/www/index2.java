package www;

import WebServerLite.HttpExchange;
import WebServerLite.onPage;

public class index2 {
    @onPage(url="index2.html",ext="html")
    public byte[] indexPage(HttpExchange query) {
        return "ddddddddddddddddddddd".getBytes();
    }
}
