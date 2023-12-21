package www;

import WebServerLite.HttpExchange;
import WebServerLite.onPage;

public class esp8266 {
    @onPage(url="esp8266.html",ext="html")
    public byte[] indexPage(HttpExchange query) {

        return "ddddddddddddddddddddd".getBytes();
    }
}
