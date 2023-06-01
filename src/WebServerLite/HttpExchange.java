package WebServerLite;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.net.Socket;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.Charset;
import java.util.HashMap;
import java.util.Iterator;

/**
 * Класс хронения и обработки пользовательского запроса из браузера
 */
public class HttpExchange {
    public Socket socket;
    public HashMap<String, Object> headers = new HashMap<String, Object>();
    public HashMap<String, String> cookie = new HashMap<String, String>();
    public HashMap<String, String> response = new HashMap<String, String>();
    public String sessionID = "";
    public HashMap<String, Object> session = null;
    public InputStreamReader inputStreamReader;
    public String typeQuery = "";
    public String mimeType = "text/html";
    // public String requestURI = "";
    public String requestText = "";
    public String requestPath = "";
    public byte[] postBody = null;

    public JSONObject requestParam = new JSONObject();

    public HttpExchange(Socket socket, HashMap<String, Object> session) throws IOException, JSONException {
        this.socket = socket;
        this.socket.setSoTimeout(86400000);
        this.inputStreamReader = new InputStreamReader(socket.getInputStream());
        this.headers = new HashMap<String, Object>();
        this.response.put("Connection", "close");
    }

    public void close() throws IOException {
        if (socket.isConnected() == false) {
            return;
        }
        socket.close();
        socket = null;
    }

    public HashMap<String, Object> getRequestHeaders() {
        return headers;
    }

    public void sendFile(String pathFile) {
        StringBuffer sb = new StringBuffer();
        BufferedReader reader;
        try {
            reader = new BufferedReader(new FileReader(pathFile));
            String line = reader.readLine();
            while (line != null) {
                if (line.indexOf('#') != -1) {
                    line = line.split("#")[0];
                }
                sb.append(line);
                line = reader.readLine();
            }
            reader.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
        sendHtml(sb.toString());
    }

    /**
     * Функция отправки текстового ответа в браузер
     *
     * @param content
     * @return
     */
    public boolean write(String content) {
        return write(content.getBytes(Charset.forName("UTF-8")));
    }

    /**
     * Функция отправки битового ответа в браузер
     *
     * @param content
     * @return
     */
    public boolean write(byte[] content) {
        try {
            this.socket.getOutputStream().write(content);
            return true;
        } catch (IOException e) {
            return false;
            // throw new RuntimeException(e);
        }
    }

    public void sendHtml(String content) {
        sendHtml(content.getBytes(Charset.forName("UTF-8")));
    }

    public void sendHtml(byte[] content) {
        try {
            DataOutputStream dataOutputStream = new DataOutputStream(this.socket.getOutputStream());
            dataOutputStream.write("HTTP/1.1 200 OK\r\n".getBytes());
            // dataOutputStream.write(("Content-Type: text/html; charset=utf-8\r\n").getBytes());
            dataOutputStream.write(("Content-Type: " + this.mimeType + "\r\n").getBytes());
            // Остальные заголовки
            dataOutputStream.write("Access-Control-Allow-Origin: *\r\n".getBytes());
            dataOutputStream.write("Access-Control-Allow-Credentials: true\r\n".getBytes());
            dataOutputStream.write("Access-Control-Expose-Headers: FooBar\r\n".getBytes());
            Iterator<String> keys = this.response.keySet().iterator();
            while (keys.hasNext()) {
                try {
                    String key = keys.next();
                    String val = this.response.get(key);
                    dataOutputStream.write((key + ": " + val + "\r\n").getBytes());
                } catch (JSONException e) {
                    e.printStackTrace();
                }
            }
            dataOutputStream.write("\r\n".getBytes());
            //dataOutputStream.write("Connection: close\r\n".getBytes());
            //dataOutputStream.write("Server: HTMLserver\r\n\r\n".getBytes());
            dataOutputStream.write(content);
            // dataOutputStream.write(0);
            dataOutputStream.flush();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
