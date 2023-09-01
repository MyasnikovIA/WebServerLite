package WebServerLite;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.*;
import java.net.Socket;
import java.nio.charset.Charset;
import java.util.ArrayList;
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

    public static JSONObject SHARE = new JSONObject();
    public String sessionID = "";
    public HashMap<String, Object> session = null;
    public InputStreamReader inputStreamReader;
    public String typeQuery = "";
    public String mimeType = "text/html";
    // public String requestURI = "";
    public String requestText = "";
    public String requestPath = "";
    public String expansion = "";
    public byte[] postBody = null;
    public JSONObject requestParam = new JSONObject();

    public String message = ""; // хронит текст сообщения от Socket клиента
    public JSONObject messageJson = new JSONObject();
    ; // хронит текст сообщения от Socket клиента
    public int countQuery = 0;
    public static HashMap<String, HttpExchange> DevList = new HashMap<String, HttpExchange>(10, (float) 0.5);
    public static HashMap<String, String> MESSAGE_LIST = new HashMap<String, String>(10, (float) 0.5);
    public static HashMap<String, ArrayList<String>> BROADCAST_MESSAGE_LIST = new HashMap<String, ArrayList<String>>(10, (float) 0.5);

    public HttpExchange(Socket socket, HashMap<String, Object> session) throws IOException, JSONException {
        this.SHARE = ServerResourceHandler.SERVER_SHARE;
        this.socket = socket;
        this.socket.setSoTimeout(86400000);
        this.inputStreamReader = new InputStreamReader(socket.getInputStream());
        this.headers = new HashMap<String, Object>();
        this.response.put("Connection", "close");
        this.response.put("Server", "WebServerLite");
    }

    public void close() throws IOException {
        if (socket.isConnected() == false) {
            return;
        }
        socket.close();
        socket = null;
    }

    public boolean isConnected() {
        try {
            return (inputStreamReader.read() != -1);
        } catch (IOException e) {
            return false;
        }
        //  return socket.isConnected();
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

    public boolean write(int content) {
        return write(content);

    }

    public int readInt() {
        try {
            return inputStreamReader.read();
        } catch (IOException e) {
            return -2;
        }
    }

    /**
     * Функция проверки  готовности данных для прочтения ль клиента
     * @return
     */
    public boolean available() {
        try {
            return inputStreamReader.ready();
        } catch (IOException e) {
            return false;
            //throw new RuntimeException(e);
        }
    }

    /**
     * Функция чтения строки от клиента
     *
     * @return
     */
    public String readLine() {
        StringBuffer sbSub2 = new StringBuffer();
        int subcharInt = -1;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try {
            while (available()) {
                if (!((subcharInt = inputStreamReader.read()) != -1)) break;
                sbSub2.append((char) subcharInt);
                buffer.write(subcharInt);
            }
        } catch (IOException e) {
            sbSub2.append(e.getMessage());
            //throw new RuntimeException(e);
        }
        return sbSub2.toString();
    }

    /**
     * Функция ожидания данных от клиента (преобразование в объект)
     *
     * @return
     */
    public String read() {
        StringBuffer sbSub2 = new StringBuffer();
        int subcharInt = -1;
        int countEnter = 0;
        int subcharIntLast = 0;
        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        try {
            while (true) {
                if (!((subcharInt = inputStreamReader.read()) != -1)) break;
                if (subcharInt == 0) break;
                if (((subcharInt == 13) && (subcharIntLast == 13))
                        || ((subcharInt == 10) && (subcharIntLast == 10))
                        || ((subcharInt == 13) && (subcharIntLast == 10))
                        || ((subcharInt == 10) && (subcharIntLast == 13))
                ) {
                    countEnter += 1;
                    if (countEnter == 2) {
                        break; // чтение окончено
                    }
                } else {
                    countEnter = 0;
                }
                sbSub2.append((char) subcharInt);
                buffer.write(subcharInt);
                subcharIntLast = subcharInt;
            }
            // читаем остальные данные из буфера(очищаем очередь)
            while (available()) {
               if (!((subcharInt = inputStreamReader.read()) != -1)) break;
            }
        } catch (IOException e) {
            return null;
            //throw new RuntimeException(e);
        }
        countQuery++;
        postBody = buffer.toByteArray();
        message = sbSub2.toString();
        if (message.indexOf(":") != -1) {
            for (String titleLine : message.split("\r")) {
                // System.out.println("titleLine|" + titleLine);
                titleLine = titleLine.replace("\n", "");
                if (titleLine.indexOf(":") != -1) {
                    String key = titleLine.substring(0, titleLine.indexOf(":")).trim();
                    String val = titleLine.substring(titleLine.indexOf(":") + 1).trim();
                    messageJson.put(key, val);
                    headers.put(key, val);
                }
            }
        }
        sbSub2.setLength(0);
        buffer.reset();
        if (subcharInt == -1) {
            return null;
        }
        return message;
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

    /**
     * Отправка текстового ответа в браузер
     *
     * @param content
     */
    public void sendHtml(String content) {
        sendHtml(content.getBytes(Charset.forName("UTF-8")));
    }


    /**
     * Отправка битового ответа в браузер
     *
     * @param content
     */
    public void sendHtml(byte[] content) {
        try {
            if (!socket.isConnected()) return;
            DataOutputStream dataOutputStream = new DataOutputStream(this.socket.getOutputStream());
            dataOutputStream.write("HTTP/1.1 200 OK\r\n".getBytes());
            // dataOutputStream.write(("Content-Type: text/html; charset=utf-8\r\n").getBytes());
            dataOutputStream.write(("Content-Type: " + this.mimeType + "; charset=utf-8\r\n").getBytes());

            // Крос доменный запрос из JS кода (ajax)
            //dataOutputStream.write("Access-Control-Allow-Origin: *\r\n".getBytes());
            //dataOutputStream.write("Access-Control-Allow-Credentials: true\r\n".getBytes());
            //dataOutputStream.write("Access-Control-Expose-Headers: FooBar\r\n".getBytes());

            // Остальные заголовки
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
            e.printStackTrace();
        }
    }
    public void sendByteFile(File file) {
        try {
            DataOutputStream dataOutputStream = new DataOutputStream(this.socket.getOutputStream());
            dataOutputStream.write("HTTP/1.1 200 OK\r\n".getBytes());
            // dataOutputStream.write(("Content-Type: text/html; charset=utf-8\r\n").getBytes());
            dataOutputStream.write(("Content-Type: " + this.mimeType + "; charset=utf-8\r\n").getBytes());
            dataOutputStream.write(("Content-Length: " + file.length() + "\r\n").getBytes());
            // Крос доменный запрос из JS кода (ajax)
            // dataOutputStream.write("Access-Control-Allow-Origin: *\r\n".getBytes());
            // dataOutputStream.write("Access-Control-Allow-Credentials: true\r\n".getBytes());
            // dataOutputStream.write("Access-Control-Expose-Headers: FooBar\r\n".getBytes());
            // Остальные заголовки
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
            InputStream inputStreamFile = new FileInputStream(file.getAbsolutePath());
            byte[] bs = new byte[4096];
            int lenReadByts;
            while ((lenReadByts = inputStreamFile.read(bs)) >= 0) {
                dataOutputStream.write(bs, 0, lenReadByts);
            }
            // dataOutputStream.write(0);
            dataOutputStream.flush();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
