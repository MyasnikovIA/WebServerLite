package WebServerLite;

import constant.ServerConstant;
import org.json.JSONException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;

import java.io.*;
import java.lang.reflect.Constructor;
import java.net.Socket;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

public class ServerResourceHandler implements Runnable {

    private final Map<String, Resource> resources = new HashMap<>(); // хронилище статического ресурса в оперативной памяти
    private final Map<String, String> resourcesDateTime = new HashMap<>(); // хронилище даты и времени последней модификации файла (путь к файлу)
    public static HashMap<String, HashMap<String, Object>> sessionList = new HashMap<>(); // список всех сессий, которые зарегистрированны на сервере
    public static JavaStrExecut javaStrExecut = new JavaStrExecut(); // класс для компиляции Java кода из текста
    private HttpExchange query;  // объект пользовательского запроса

    public ServerResourceHandler(Socket socket) throws IOException, JSONException {
        query = new HttpExchange(socket, null);
    }

    @Override
    public void run() {
        try {
            if (readRequestHeader()) {
                sendResponseQuery();
            }
        } catch (Exception ex) {
            Logger.getLogger(ServerResourceHandler.class.getName()).log(Level.SEVERE, null, ex);
        } finally {
            try {
                query.close();
                query = null;
            } catch (Exception ex) {
                Logger.getLogger(ServerResourceHandler.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
    }

    /**
     * Функция чтения запроса пользователя (браузера)
     *
     * @return
     */
    private boolean readRequestHeader() throws IOException {
        int charInt;
        StringBuffer sb = new StringBuffer();
        StringBuffer sbTmp = new StringBuffer();
        // читаем заголовок HTML запроса
        while ((charInt = query.inputStreamReader.read()) > 0) {
            if (query.socket.isConnected() == false) return false;
            sbTmp.append((char) charInt);
            if ((sbTmp.toString().indexOf("\r") != -1) || (sbTmp.toString().indexOf("\n") != -1) || (charInt == 0)) {
                if (sbTmp.toString().length() == 2) {
                    break; // чтение заголовка окончено
                }
                sbTmp.setLength(0);
            }
            sb.append((char) charInt);
            if (sb.toString().length() > 4) { // не удачная конструкция, надо подумать о корректировки механизма поиска окончания запроса
                if ((sb.toString().indexOf("\r\n\r\n") != -1)
                        || (sb.toString().indexOf("\r\r") != -1)
                        || (sb.toString().indexOf("\n\n") != -1)
                ) {
                    break; // чтение заголовка окончено
                }
            }
        }
        query.typeQuery = "GET";
        if (sb.toString().indexOf("Content-Length: ") != -1) {
            // Читаем тело POST запроса
            String sbTmp2 = sb.toString().substring(sb.toString().indexOf("Content-Length: ") + "Content-Length: ".length(), sb.toString().length());
            String lengPostStr = sbTmp2.substring(0, sbTmp2.indexOf("\n")).replace("\r", "");
            int LengPOstBody = Integer.valueOf(lengPostStr);
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            while ((charInt = query.inputStreamReader.read()) > 0) {
                if (query.socket.isConnected() == false) {
                    return false;
                }
                buffer.write((char) charInt);
                LengPOstBody--;
                if (LengPOstBody == 0) {
                    break;
                }
            }
            buffer.flush();
            query.postBody = buffer.toByteArray();
            query.typeQuery = "POST";
        }
        // Парсим заголовок
        int indLine = 0;
        for (String titleLine : sb.toString().split("\r")) {
            titleLine = titleLine.replace("\n", "");
            indLine++;
            if (indLine == 1) {
                if (titleLine.indexOf("GET /") != -1) {
                    titleLine = titleLine.replaceAll("GET /", "");
                    query.typeQuery = "GET";
                } else if (titleLine.indexOf("POST /") != -1) {
                    titleLine = titleLine.replaceAll("GET /", "");
                } else if (titleLine.indexOf("TERM /") != -1) {
                    titleLine = titleLine.replaceAll("TERM /", "");
                    query.typeQuery = "TERM";
                }
                if (titleLine.indexOf(" HTTP/") != -1) {
                    titleLine = titleLine.substring(0, titleLine.length() - (titleLine.substring(titleLine.lastIndexOf(" HTTP/"))).length());
                }
                if ((titleLine.indexOf(" HTTP/") == 0) || (titleLine.trim().length() == 0)) {
                    titleLine = ServerConstant.config.INDEX_PAGE;
                }
                titleLine = URLDecoder.decode(titleLine, StandardCharsets.UTF_8.toString());
                query.requestText = titleLine;
                query.requestPath = titleLine;
                if (titleLine.indexOf("?") != -1) {
                    String param = titleLine.substring(titleLine.indexOf("?") + 1);
                    int indParam = 0;
                    for (String par : param.split("&")) {
                        String[] val = par.split("=");
                        if (val.length == 2) {
                            val[0] = java.net.URLDecoder.decode(val[0], "UTF-8");
                            val[1] = java.net.URLDecoder.decode(val[1], "UTF-8");
                            query.requestParam.put(val[0], val[1]);
                        } else {
                            indParam++;
                            val[0] = java.net.URLDecoder.decode(val[0], "UTF-8");
                            query.requestParam.put("Param" + String.valueOf(indParam), val[0]);
                        }
                    }
                    query.requestPath = query.requestText.substring(0, query.requestText.indexOf("?"));
                }
            } else {
                if (titleLine.indexOf(":") != -1) {
                    String key = titleLine.substring(0, titleLine.indexOf(":")).trim();
                    String val = titleLine.substring(titleLine.indexOf(":") + 1).trim();
                    query.headers.put(key, val);
                    switch (key) {
                        case "Cookie":
                            for (String elem : val.split("; ")) {
                                String[] valSubArr = elem.split("=");
                                if (valSubArr.length == 2) {
                                    query.cookie.put(valSubArr[0], valSubArr[1]);
                                    if ((valSubArr[0].trim()).toLowerCase().equals("session")) {
                                        query.sessionID = valSubArr[1];
                                    }
                                }
                            }
                            break;
                    }
                }
            }
        }
        query.session = getSession(query);
        if (query.typeQuery.toUpperCase().equals("TERM")) { // Обработка запроса с терминала
            sendResponseTerminal();
            return false;
        }
        query.mimeType = getFileMime(query.requestPath);
        return true;
    }

    /**
     * Обработать запрос из Socket клиента
     */
    private void sendResponseTerminal() {
        // обработка запроса bp
        while (query.socket.isConnected()) {
            String message = query.read();
            if ((message == null) ||(message.trim().toLowerCase().equals("exit"))) break;
            if (!javaStrExecut.runJavaTerminalFile(query)) break;
        }
    }

    /**
     * процедура отправки ответа клиенту (браузеру)
     */
    private void sendResponseQuery() {
        String mimeType = getFileMime(query.requestPath);
        String ext = getFileExt(query.requestPath).toLowerCase();
        if (query.requestParam.has("debug")) {
            ServerConstant.config.DEBUG = query.requestParam.getString("debug").equals("1");
        }
        if (query.requestPath.indexOf("{component}") != -1) {
            ServerResourceHandler.javaStrExecut.runJavaServerlet(query);
        } else if ("component".equals(ext)) {
            // исправить
            ServerResourceHandler.javaStrExecut.runJavaComponent(query);
        } else {
            String resourcePath = ServerConstant.config.WEBAPP_DIR + "/" + query.requestPath;
            File file = new File(resourcePath);
            if (!file.exists()) { // если пользовательском каталоге нет вызываемого ресурса, тогда веняем каталог на системный
                resourcePath = ServerConstant.config.WEBAPP_SYSTEM_DIR + "/" + query.requestPath;
                file = new File(resourcePath);
            }
            if (file.exists()) {
                String lastModified = String.valueOf(new Date(file.lastModified()));
                if ("java".equals(ext)) {
                    ServerResourceHandler.javaStrExecut.runJavaFile(query);
                } else {
                    Resource res = null;
                    if (!ServerConstant.config.DEBUG) { // если не влючен режим отладки сервера , тогда  кэширкем отправляемый контент
                        // Если ресурс не был ранее прочитан, или дата модификации была изменена, тогда читаем ресурс снова
                        if ((resources.get(resourcePath) == null) || !resourcesDateTime.get(resourcePath).equals(lastModified)) {
                            res = new Resource(readResource(file, query, resourcePath, ServerConstant.config.WEBAPP_DIR));
                            resources.put(resourcePath, res);
                            resourcesDateTime.put(resourcePath, lastModified);
                        } else {
                            // иначе вытаскиваем ранее прочитанную версию
                            res = resources.get(resourcePath);
                        }
                    } else {
                        // если включена отладка, тогда перечитываем ресурс каждый раз при обращении
                        res = new Resource(readResource(file, query, resourcePath, ServerConstant.config.WEBAPP_DIR));
                    }
                    // query.mimeType = mimeType;
                    query.mimeType = "text/html";
                    query.sendHtml(res.content);
                }
            } else {
                // Если ресурс не найден, тогда отправляем пустую страницу с сообщением "Page not found"
                query.mimeType = "text/html";
                if (new File(ServerConstant.config.WEBAPP_DIR + "/" + ServerConstant.config.PAGE_404).exists()) {
                    query.sendFile(ServerConstant.config.WEBAPP_DIR + "/" + ServerConstant.config.PAGE_404);
                } else if (new File(ServerConstant.config.WEBAPP_SYSTEM_DIR + "/" + ServerConstant.config.PAGE_404).exists()) {
                    query.sendFile(ServerConstant.config.WEBAPP_SYSTEM_DIR + "/" + ServerConstant.config.PAGE_404);
                } else {
                    query.sendFile("Page not found");
                }
            }
        }
    }

    private byte[] readResource(final File file, final HttpExchange query, String resourcePath, String rootPath) {
        ByteArrayOutputStream bout = new ByteArrayOutputStream();
        try {
            InputStream in = new FileInputStream(resourcePath);
            String ext = getFileExt(resourcePath).toLowerCase();
            //OutputStream gout = gzip ? new GZIPOutputStream(bout) : new DataOutputStream(bout);
            OutputStream gout = new DataOutputStream(bout);
            if ("html".equals(ext)) { // если запрашиваем HTML страницу, тогда  обрабатываем как XML структуру, для замены специализированных тэгов
                InputStreamReader inputStreamReader = new InputStreamReader(in);
                StringBuffer sb = new StringBuffer();
                int charInt;
                while ((charInt = inputStreamReader.read()) > 0) {
                    sb.append((char) charInt);
                }
                Document doc = Jsoup.parse(sb.toString()); // парсим HTML страницу  с использованием библиотеки jsoup-1.15.4.jar
                Element els = doc.getElementsByTag("body").get(0);
                doc.attr("doc_path", resourcePath);
                doc.attr("rootPath", rootPath);
                parseElementV2(doc, els, null);
                doc.removeAttr("doc_path");
                doc.removeAttr("rootPath");
                doc.getElementsByTag("body").get(0).replaceWith(els);
                Element elsDst = doc.getElementsByTag("html").get(0);
                gout.write(elsDst.toString().getBytes());
            } else {
                byte[] bs = new byte[4096];
                int lenReadByts;
                while ((lenReadByts = in.read(bs)) >= 0) {
                    gout.write(bs, 0, lenReadByts);
                }
            }
            gout.flush();
            gout.close();
            in.close();
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        return bout.toByteArray();
    }

    /**
     * Получить объект сесси по ID
     *
     * @param sessionKey
     * @return
     */
    public static HashMap<String, Object> getSession(String sessionKey) {
        if (sessionList.containsKey(sessionKey)) {
            return (HashMap<String, Object>) sessionList.get(sessionKey);
        }
        return null;
    }

    /**
     * Получении (генерация) сесси по запросу брайзера
     *
     * @param httpExchange
     * @return
     */
    public static HashMap<String, Object> getSession(HttpExchange httpExchange) {
        HashMap<String, Object> userSession;
        if (!sessionList.containsKey(httpExchange.sessionID)) {
            userSession = new HashMap<>();
            sessionList.put(httpExchange.sessionID, userSession);
        } else {
            userSession = sessionList.get(httpExchange.sessionID);
        }
        return userSession;
    }

    /**
     * Фонкция получения MIME типа ответа по расширению файла
     *
     * @param path
     * @return
     */
    public static String getFileMime(final String path) {
        String ext = getFileExt(path).toLowerCase();
        if (!ServerConstant.config.MIME_MAP.containsKey(ext)) {
            return ServerConstant.config.MIME_MAP.get(ext);
        } else {
            return ServerConstant.config.APPLICATION_OCTET_STREAM;
        }
    }

    /**
     * Функция получения расширения файла
     *
     * @param path
     * @return
     */
    public static String getFileExt(final String path) {
        int slashIndex = path.lastIndexOf(ServerConstant.config.FORWARD_SINGLE_SLASH);
        String basename = (slashIndex < 0) ? path : path.substring(slashIndex + 1);
        int dotIndex = basename.lastIndexOf('.');
        if (dotIndex >= 0) {
            return basename.substring(dotIndex + 1);
        } else {
            return "";
        }
    }

    /**
     * Класс (структура) для хронения  статического контента в оперативной памяти
     */
    private class Resource {
        public final byte[] content;

        public String mimeType = "text/html";

        public Resource(byte[] content) {
            this.content = content;
        }
    }


    /**
     * функция разбора собформы XML и замены специализированных тэгов, которые начинаются с текста "cmpXXXXXX"
     * Логика  переопределения  содержимого тэгп находится в пакете "component"
     *
     * @param doc
     * @param path
     * @param SelectorQuery
     * @return
     */
    public static String parseSubElementV2(Document doc, String path, String SelectorQuery) {
        InputStreamReader inputStreamReader = null;
        try {
            inputStreamReader = new InputStreamReader(new FileInputStream(doc.attr("rootPath") + path));
        } catch (FileNotFoundException e) {
            return "Error open subform file :" + e.toString() + "\n " + e.getMessage() + "   " + doc.attr("doc_path");
        }
        StringBuffer sb = new StringBuffer();
        int charInt;
        while (true) {
            try {
                if (!((charInt = inputStreamReader.read()) > 0)) break;
                sb.append((char) charInt);
            } catch (IOException e) {
                return "Error read subform file :" + e.toString() + "\n " + e.getMessage();
            }
        }
        return parseStrElementV2(doc, sb.toString(), SelectorQuery);
    }

    /**
     * функция разбора XML структуры и замены специализированных тэгов, которые начинаются с текста "cmpXXXXXX"
     * Логика  переопределения  содержимого тэгп находится в пакете "component"
     *
     * @param doc
     * @param htmlText
     * @param SelectorQuery
     * @return
     */
    public static String parseStrElementV2(Document doc, String htmlText, String SelectorQuery) {
        Document docForm = Jsoup.parse(htmlText);
        if (SelectorQuery.length() == 0) {
            Element els = docForm.getElementsByTag("body").get(0);
            parseElementV2(docForm, els, null);
            System.out.println(els.toString());
            return els.toString();
        } else {
            StringBuffer sb = new StringBuffer();
            for (Element elOne : doc.select(SelectorQuery)) {
                parseElementV2(docForm, elOne, null);
                sb.append(elOne.toString());
            }
            return sb.toString();
        }
    }

    public static void parseElementV2(Document doc, Element element, Element elementParent) {
        String tagName = element.tag().getName();
        if (!tagName.equals("cmpform") && tagName.length() > 3) {
            if (tagName.substring(0, 3).equals("cmp")) {
                // System.out.println(tagName);
                try {
                    String classNameCmp = ServerConstant.config.COMPONENT_PATH + ".cmp" + tagName.substring(3, 4).toUpperCase() + tagName.substring(4);
                    Class classComponent = Class.forName(classNameCmp);
                    Constructor constructor = classComponent.getConstructor(Document.class, Element.class);
                    Object newClassObject = constructor.newInstance(doc, element);
                    // заменить старый тэг новым (сгенерированным)
                    element.replaceWith((Element) newClassObject);
                } catch (ClassNotFoundException e) {
                    Element errBody = new Element("error");
                    errBody.text("not found " + ServerConstant.config.COMPONENT_PATH + ".cmp" + tagName.substring(3, 4).toUpperCase() + tagName.substring(4));
                    element.replaceWith(errBody);
                } catch (Exception e) {
                    Element errBody = new Element("error");
                    errBody.text(e.getLocalizedMessage() + " : " + e.getMessage() + " \n " + e.toString());
                    element.replaceWith(errBody);
                }
                return;
            }
        }
        for (Attribute attr : element.attributes().asList()) {
            //  System.out.println("\t\t" + attr.getKey() + " = " + attr.getValue());
        }
        if (element.hasText()) {
            //  System.out.println(element.tagName() + " element.text().trim() " + element.text().trim());
        }
        if (element.childNodeSize() == 0) {

        } else {
            int childrenint = 0;
            for (int numChildNode = 0; numChildNode < element.childNodeSize(); numChildNode++) {
                // System.out.println(numChildNode + ")  " + element.childNode(numChildNode).nodeName() + " element.childrenSize() " + element.childrenSize() + " numChildNode " + numChildNode);
                if (element.childNode(numChildNode).nodeName().equals("#text")) {

                } else if (element.childNode(numChildNode).nodeName().equals("#comment")) {

                } else if (element.childNode(numChildNode).nodeName().equals("#cdata")) {

                } else {
                    if (childrenint < element.childrenSize()) {
                        parseElementV2(doc, element.child(childrenint), element);
                        childrenint++;
                    }
                }
            }
        }
        if (elementParent == null) {

        }
    }

    public static void parseElementV2(Document doc, Element element) {
        parseElementV2(doc, element, null);
    }

    public static Element parseElementV2(Document doc, String elementText) {
        Element el = new Element(elementText);
        parseElementV2(doc, el, null);
        return el;
    }

    public static void parseElementV2(Document doc, String elementText, Element elementParent) {
        parseElementV2(doc, new Element(elementText), elementParent);
    }
}


