import java.io.*;
import java.util.*;
import org.json.JSONObject;
import WebServerLite.HttpExchange;

import java.io.DataOutputStream;
import java.io.IOException;
import java.io.OutputStream;

public class index {
    public byte[] onPage(HttpExchange query) {
        query.write("HTTP/1.1 200 OK\r\n");
        query.write("Cache-Control: no-store\r\n");
        query.write("Content-Type: text/event-stream; charset=UTF-8\r\n");
        query.write("Access-Control-Allow-Credentials: true\r\n");
        query.write("\r\n");
        int delay = 100;
        while (true) {
            if (!query.socket.isConnected()) {
                break;
            }
            query.write("data: {\"ok\":\"false\"}");
            query.write("\n\n");
            try {
                Thread.sleep(delay);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
        return null;
        // String resultText = "sb.toString()";
        // return resultText.getBytes();
    }
}