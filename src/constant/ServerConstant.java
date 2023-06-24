package constant;


import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.api.errors.GitAPIException;
import org.eclipse.jgit.lib.Repository;
import org.eclipse.jgit.storage.file.FileRepositoryBuilder;
import org.json.JSONObject;

import java.io.*;
import java.util.*;

public final class ServerConstant {

    public static ServerConstant config;

    public ServerConstant(String pathIniConfig) {
        StringBuffer sb = new StringBuffer();
        BufferedReader reader;
        try {
            reader = new BufferedReader(new FileReader(pathIniConfig));
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
        JSONObject jsonIni = new JSONObject(sb.toString().trim());

        // подключение к БД под пользователем, который иммет права создавать новые процедуры и функции
        if (jsonIni.has("DATABASE_NAME")) this.DATABASE_NAME = jsonIni.getString("DATABASE_NAME");
        if (jsonIni.has("DATABASE_USER_NAME")) this.DATABASE_USER_NAME = jsonIni.getString("DATABASE_USER_NAME");
        if (jsonIni.has("DATABASE_USER_PASS")) this.DATABASE_USER_PASS = jsonIni.getString("DATABASE_USER_PASS");
        if (jsonIni.has("APP_NAME")) this.APP_NAME = jsonIni.getString("APP_NAME");
        // --------------------------------------------------------------------------------------------

        if (jsonIni.has("LIB_DIR")) this.LIB_DIR = jsonIni.getString("LIB_DIR");
        if (jsonIni.has("DEBUG")) this.DEBUG = jsonIni.getString("DEBUG").equals("true");
        if (jsonIni.has("GZIPPABLE")) this.GZIPPABLE = jsonIni.getString("GZIPPABLE").equals("true");
        if (jsonIni.has("CAHEBLE")) this.CAHEBLE = jsonIni.getString("CAHEBLE").equals("true");
        if (jsonIni.has("FORWARD_SINGLE_SLASH")) this.FORWARD_SINGLE_SLASH = jsonIni.getString("FORWARD_SINGLE_SLASH");
        if (jsonIni.has("LOGIN_PAGE")) this.LOGIN_PAGE = jsonIni.getString("LOGIN_PAGE");
        if (jsonIni.has("PAGE_404")) this.PAGE_404 = jsonIni.getString("PAGE_404");

        if (jsonIni.has("FORWARD_DOUBLE_SLASH")) this.FORWARD_DOUBLE_SLASH = jsonIni.getString("FORWARD_DOUBLE_SLASH");
        if (jsonIni.has("COMPONENT_PATH")) this.COMPONENT_PATH = jsonIni.getString("COMPONENT_PATH");
        if (jsonIni.has("WEBAPP_DIR")) this.WEBAPP_DIR = jsonIni.getString("WEBAPP_DIR");
        if (jsonIni.has("WEBAPP_SYSTEM_DIR")) this.WEBAPP_SYSTEM_DIR = jsonIni.getString("WEBAPP_SYSTEM_DIR");
        if (jsonIni.has("DEFAULT_HOST")) this.DEFAULT_HOST = jsonIni.getString("DEFAULT_HOST");
        if (jsonIni.has("DEFAULT_PORT")) this.DEFAULT_PORT = jsonIni.getString("DEFAULT_PORT");
        if (jsonIni.has("SERVER_HOM")) this.SERVER_HOM = jsonIni.getString("SERVER_HOM");
        if (jsonIni.has("APPLICATION_OCTET_STREAM")) this.APPLICATION_OCTET_STREAM = jsonIni.getString("APPLICATION_OCTET_STREAM");
        if (jsonIni.has("TEXT_PLAIN")) this.TEXT_PLAIN = jsonIni.getString("TEXT_PLAIN");
        if (jsonIni.has("TEXT_HTML")) this.TEXT_HTML = jsonIni.getString("TEXT_HTML");
        if (jsonIni.has("APPLICATION_OCTET_STREAM")) this.APPLICATION_OCTET_STREAM = jsonIni.getString("APPLICATION_OCTET_STREAM");
        if (jsonIni.has("INDEX_PAGE")) this.INDEX_PAGE = jsonIni.getString("INDEX_PAGE");
        if (jsonIni.has("CONTENT_TYPE")) this.CONTENT_TYPE = jsonIni.getString("CONTENT_TYPE");
        if (jsonIni.has("CONTENT_LENGTH")) this.CONTENT_LENGTH = jsonIni.getString("CONTENT_LENGTH");
        if (jsonIni.has("CONTENT_ENCODING")) this.CONTENT_ENCODING = jsonIni.getString("CONTENT_ENCODING");
        if (jsonIni.has("ENCODING_GZIP")) this.ENCODING_GZIP = jsonIni.getString("ENCODING_GZIP");
        if (jsonIni.has("ENCODING_UTF8")) this.ENCODING_UTF8 = jsonIni.getString("ENCODING_UTF8");
        if (jsonIni.has("GIT_MASTER")) this.GIT_MASTER = jsonIni.getString("GIT_MASTER");
        if (jsonIni.has("GIT_URL")) this.GIT_URL = jsonIni.getString("GIT_URL");
        if (jsonIni.has("GIT_INTERVAL")) this.GIT_INTERVAL = jsonIni.getString("GIT_INTERVAL");
        if (jsonIni.has("LIB_CSS")) {
            this.LIB_CSS.clear();
            Iterator iterator = jsonIni.getJSONArray("LIB_CSS").iterator();
            while (iterator.hasNext()) {
                this.LIB_CSS.add((String) iterator.next());
            }
        }
        if (jsonIni.has("LIB_JS")) {
            this.LIB_JS.clear();
            Iterator iterator = jsonIni.getJSONArray("LIB_JS").iterator();
            while (iterator.hasNext()) {
                this.LIB_JS.add((String) iterator.next());
            }
        }
        if (jsonIni.has("LIB_JAR")) {
            this.LIB_JAR.clear();
            Iterator iterator = jsonIni.getJSONArray("LIB_JAR").iterator();
            while (iterator.hasNext()) {
                this.LIB_JAR.add((String) iterator.next());
            }
        }
        if (jsonIni.has("MIME_MAP")) {
            // this.MIME_MAP.clear(); // очистка предзаполненного списка mime типов
            JSONObject jsonObject = jsonIni.getJSONObject("MIME_MAP");
            Iterator<String> keys = jsonObject.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                MIME_MAP.put(key, jsonObject.getString(key));
            }
        }
        if (this.WEBAPP_DIR.indexOf('/') == -1) {
            this.WEBAPP_DIR = this.SERVER_HOM + '/' + this.WEBAPP_DIR;
        }
        if (this.GIT_URL.length() > 0) {
            Runnable r = ()-> {
                while (true) {
                    if (gitClone(this.GIT_URL, this.GIT_MASTER, this.WEBAPP_DIR)) {
                        System.out.println("PULL прошел успешно");
                    } else {
                        System.out.println("в процессе PULL произашла ошибка");
                    };
                    try {
                        Thread.sleep(Integer.valueOf(this.GIT_INTERVAL+"000")); // ждем  и повторяем проверку изменений
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            };
            Thread gitCloneThread = new Thread(r,"git_Clone_Thread");
            gitCloneThread.start();
        }
    }

    public static boolean gitClone(String gitUrl,String master, String localPath) {
        try {
            File localFile =  new File(localPath);
            if (!localFile.exists()) { // если каталога нет, тогда создаем его
                if (!localFile.mkdirs()) {
                    return false;
                }
            }
            File localGitFile =  new File(localPath + "/.git");
            if (localGitFile.exists()) { // Если репозиторий уже существует, тогда стягиваем изменения
                Git git = Git.open(localFile);
                git.pull().call();
                return true;
            }
            Git.cloneRepository().setURI(gitUrl).setDirectory(new File(localPath)).call();
            // Открыть локальный репозиторий
            Repository repository = new FileRepositoryBuilder().setGitDir(localGitFile).build();
            // Checkout the master branch
            Git git = new Git(repository);
            if (master.length() > 0) {
                // Переключить ветку
                git.checkout().setName(master).call();
            }
            // Стянуть все изменения
            git.pull().call();
        } catch (GitAPIException | IOException e) {
            e.printStackTrace();
            return false;
        }
        return true;
    }

    public static String DATABASE_NAME = "jdbc:postgresql://your_host:your_port/your_database"; // путь к БД
    public static String DATABASE_USER_NAME = "postgres";
    public static String DATABASE_USER_PASS = "******";
    public static String LIB_DIR = "D:\\JavaProject\\HttpServer-JAVA\\lib"; // путь к JAR библиотекам
    public static String APP_NAME = "webpage"; // Имя приложения (функции на SQL сервер будут иметь префикс этого имени)

    public static Boolean DEBUG = false; // параметр применяется для отладки приложения("true" - каждый раз при обращении к  форме происходит переработка сначала )
    public static Boolean GZIPPABLE = false; // Параметр сжатия страниц, если  это поддерживает браузер
    public static Boolean CAHEBLE = true; // Параметр кэширования страниц

    public static String LOGIN_PAGE = "/"; // страница авторизации пользователя в БД
    public static String PAGE_404 = "/";  // Страница 404 отсутствие содержимого
    public static String FORWARD_SINGLE_SLASH = "/";
    public static String FORWARD_DOUBLE_SLASH = "//";
    public static String COMPONENT_PATH = "component"; // путь к хранению компонентов, для динамического переключения между стилями и реализациями
    public static String WEBAPP_DIR = "www"; // путь к статичным ресурсам сервера

    public static String WEBAPP_SYSTEM_DIR = "www"; // путь к статичным ресурсам системы сервера

    public static String DEFAULT_HOST = "0.0.0.0";
    public static String DEFAULT_PORT = "8081"; // порт на котором будет работать сервер

    //public static  String SERVER_HOM = "D:\\JavaProject\\HttpServer-JAVA-"; //  домашний каталог сервера
    public static String SERVER_HOM = "/data/data/com.termux/files/home2"; //  домашний каталог сервера
    public static String APPLICATION_OCTET_STREAM = "application/octet-stream";
    public static String TEXT_PLAIN = "text/plain; charset=utf-8";

    public static String TEXT_HTML = "text/html; charset=utf-8";

    public static String INDEX_PAGE = "index.html"; // путь страницы по умолчанию
    public static String CONTENT_TYPE = "Content-Type";
    public static String CONTENT_LENGTH = "Content-Length";
    public static String CONTENT_ENCODING = "Content-Encoding";
    public static String ENCODING_GZIP = "gzip";
    public static String ENCODING_UTF8 = "UTF-8";
    public static String GIT_URL = "";
    public static String GIT_MASTER = "";
    public static String GIT_INTERVAL = "120"; // порт на котором будет работать сервер

    public static List<String> LIB_CSS = new ArrayList<>();

    // Список подключаемых стилей при использовании компонентов
    static {
        // jQuery UI
        LIB_CSS.add("/System/jqueryui/1.13.2(Samoothnes)/jquery-ui.min.css");
        LIB_CSS.add("/System/jqueryui/1.13.2(Samoothnes)/jquery-ui.theme.min.css");
        LIB_CSS.add("/System/jqueryui/1.13.2(Samoothnes)/jquery-ui.structure.min.css");

        // jquery_mobile
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile-1.4.5.min.css");
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile.theme-1.4.5.min.css");
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile.structure-1.4.5.min.css");
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile.inline-svg-1.4.5.min.css");
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile.inline-png-1.4.5.min.css");
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile.icons-1.4.5.min.css");
        LIB_CSS.add("/System/jquery_mobile/1.4.5/jquery.mobile.external-png-1.4.5.min.css");

        // jQuery Layout
        LIB_CSS.add("/System/jquery_layout/1.4.0/layout-default-latest.css");
        LIB_CSS.add("");
        LIB_CSS.add("/System/main.css");
    }


    public static List<String> LIB_JS = new ArrayList<>();

    // Список подключаемых библиотек при использовании компонентов
    static {
        // jQuery
        LIB_JS.add("/System/jquery/1.9.0/jquery.js");

        // jQuery UI
        LIB_JS.add("/System/jqueryui/1.13.2(Samoothnes)/jquery-ui.min.js");
        LIB_JS.add("/System/jqueryui/Addon/DatePicker/datepicker-ru.js");

        // jquery_mobile
        //LIB_JS.add("/System/jquery_mobile/1.4.5/jquery.mobile-1.4.5.min.js");

        // jQuery Layout
        LIB_JS.add("/System/jquery_layout/1.4.0/jquery.layout.1.4.4.js");

        LIB_JS.add("/System/main.js");
        LIB_JS.add("");
    }

    public static List<String> LIB_JAR = new ArrayList<>();
    static {
        // JSONObject
        // JSONOArray
        LIB_JAR.add("json-20230227.jar"); // подключаемые обязательных JAR библиотек для компиляции кода из строк
        // LIB_JS.add("/path/to/file/lib/json-20230227.jar");
    }

    public static Map<String, String> MIME_MAP = new HashMap<>();

    static {
        MIME_MAP.put("appcache", "text/cache-manifest");
        MIME_MAP.put("css", "text/css");
        MIME_MAP.put("asc", "text/plain");
        MIME_MAP.put("gif", "image/gif");
        MIME_MAP.put("htm", "text/html");
        MIME_MAP.put("html", "text/html");
        MIME_MAP.put("java", "text/x-java-source");
        MIME_MAP.put("js", "application/javascript");
        MIME_MAP.put("json", "application/json");
        MIME_MAP.put("jpg", "image/jpeg");
        MIME_MAP.put("jpeg", "image/jpeg");
        MIME_MAP.put("mp3", "audio/mpeg");
        MIME_MAP.put("mp4", "video/mp4");
        MIME_MAP.put("m3u", "audio/mpeg-url");
        MIME_MAP.put("ogv", "video/ogg");
        MIME_MAP.put("flv", "video/x-flv");
        MIME_MAP.put("mov", "video/quicktime");
        MIME_MAP.put("swf", "application/x-shockwave-flash");
        MIME_MAP.put("pdf", "application/pdf");
        MIME_MAP.put("doc", "application/msword");
        MIME_MAP.put("ogg", "application/x-ogg");
        MIME_MAP.put("png", "image/png");
        MIME_MAP.put("svg", "image/svg+xml");
        MIME_MAP.put("xlsm", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        MIME_MAP.put("xml", "application/xml");
        MIME_MAP.put("zip", "application/zip");
        MIME_MAP.put("m3u8", "application/vnd.apple.mpegurl");
        MIME_MAP.put("md", "text/plain");
        MIME_MAP.put("txt", "text/plain");
        MIME_MAP.put("php", "text/plain");
        MIME_MAP.put("ts", "video/mp2t");
    };

}
