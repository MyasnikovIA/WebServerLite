package WebServerLite;

import constant.ServerConstant;

import java.io.File;
import java.io.FileWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

import static WebServerLite.PacketManager.getPageJar;
import static WebServerLite.PacketManager.getWebPage;

public class WebServerLite implements Runnable {
    public static HashMap<String, CallbackPage> pagesList = new HashMap<String, CallbackPage>(10, (float) 0.5);
    public static HashMap<String, File> pagesListFile = new HashMap<String, File>(10, (float) 0.5);
    public static HashMap<String, StringBuffer> pagesListContent = new HashMap<String, StringBuffer>(10, (float) 0.5);
    public static HashMap<String, JavaInnerClassObject> pagesJavaInnerClass = new HashMap<String, JavaInnerClassObject>(10, (float) 0.5);
    private static final Logger LOGGER = Logger.getLogger(WebServerLite.class.getName());
    private static WebServerLite server;
    private static boolean isRunServer = false;
    public interface CallbackPage {
        public byte[] call(HttpExchange query);
    }

    public WebServerLite() { }
    public WebServerLite(Class<?> mainClass) {
       // System.out.println(getWebPage(Main.class));
        System.out.println("Список страниц "+getWebPage(mainClass));
    }
    public static void start() {
        server = new WebServerLite();
        Thread thread = new Thread(server);
        thread.start();
        Runtime.getRuntime().addShutdownHook(new ShutDown());
        try {
            thread.join();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void stop(int delay) {
        isRunServer = false;
    }
    public void onPage(String path, StringBuffer contentText) {
        this.pagesListContent.put(path, contentText);
    }
    public void onPage(String path, StringBuffer contentText,String mime) {
        this.pagesListContent.put(path, contentText);
    }

    /**
     * прописывание контента в Java коде
     * @param path - путь к вызываемому содержимому
     * @param callbackPage - JAVA код страницы
     */
    public void onPage(String path, CallbackPage callbackPage) {
        this.pagesList.put(path, callbackPage);
    }
    public void onPage(String path, File file) {
        this.pagesListFile.put(path, file);
    }
    public void initConfig(String args) {
        if (args.length() == 0) {
            ServerConstant.config = new ServerConstant("config.ini");
        } else {
            ServerConstant.config = new ServerConstant(args);
        }
    }
    public Boolean config(String confPropName, String confPropValue) {
        return ServerConstant.config.setProp(confPropName, confPropValue);
    }
    public Boolean config(String confPropName, Boolean confPropValue) {
        return ServerConstant.config.setProp(confPropName, confPropValue);
    }

    /**
     * Подключить к серверу сторонние Jar файлы ВЭБ страниц
     * @param pathJarFile
     */
    public void addPageJar(String pathJarFile) {
        System.out.println("Список страниц из Jar файла "+getPageJar(pathJarFile));
    }

    @Override
    public void run() {
        int port = Integer.parseInt(ServerConstant.config.DEFAULT_PORT);
        try {
            isRunServer = true;
            System.out.println("port:"+port);
            System.out.println("http://127.0.0.1:"+port+"/");
            ServerSocket ss = new ServerSocket(port);
            while (isRunServer == true) {
                // ждем новое подключение Socket клиента
                Socket socket = ss.accept();
                // Запускаем обработку нового соединение в паралельном потоке и ждем следующее соединение
                new Thread(new ServerResourceHandler(socket)).start();
            }
        } catch (Exception ex) {
            Logger.getLogger(WebServerLite.class.getName()).log(Level.SEVERE, null, ex);
        } catch (Throwable ex) {
            Logger.getLogger(WebServerLite.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    static void shutDown() {
        try {
            LOGGER.info("Shutting down server...");
            server.stop(0);
        } catch (Exception e) {
            e.printStackTrace();
        }
        synchronized (server) {
            server.notifyAll();
        }
    }

    /**
     * Класс остановки сервера в новом потоке
     */
    public static class ShutDown extends Thread {
        @Override
        public void run() {
            WebServerLite.shutDown();
        }
    }
    protected synchronized static void WriteToFile(String stringMessage) {
        if (ServerConstant.config.LOG_FILE.length()==0) {
            System.err.println(stringMessage);
        } else {
            try {
                FileWriter filelog = new FileWriter(new File(ServerConstant.config.LOG_FILE), true);
                filelog.write(stringMessage);
                filelog.flush();
            } catch (Exception error) {
                System.err.println(error);
            }
        }
    }

}
