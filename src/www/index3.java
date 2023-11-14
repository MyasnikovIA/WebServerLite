package www;

import WebServerLite.HttpExchange;
import WebServerLite.onPage;

public class index3 {
    @onPage(url="index3.html",ext="js")
    public byte[] indexPage(HttpExchange query) {
        return " // ddddddddddddfsdfsd---  sdfsdf sd--- sdfsddddddddd".getBytes();
    }
}
