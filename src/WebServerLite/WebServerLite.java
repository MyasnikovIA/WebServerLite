package WebServerLite;

import constant.ServerConstant;
import org.json.JSONException;

import java.io.File;
import java.io.IOException;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.http.HttpResponse;
import java.util.HashMap;
import java.util.logging.Level;
import java.util.logging.Logger;

public class WebServerLite implements Runnable {
    public static HashMap<String, CallbackPage> pagesList = new HashMap<String, CallbackPage>(10, (float) 0.5);
    private static final Logger LOGGER = Logger.getLogger(WebServerLite.class.getName());
    private static WebServerLite server;
    private static boolean isRunServer = false;
    public interface CallbackPage {
        public byte[] call(HttpExchange query);
    }
    public static void start(String[] args) {
        if (args.length == 0) {
            ServerConstant.config = new ServerConstant("config.ini");
        } else if (args.length == 1) {
            ServerConstant.config = new ServerConstant(args[0]);
        }
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

    /**
     * прописывание контента в Java коде
     * @param path - путь к вызываемому содержимому
     * @param callbackPage - JAVA код страницы
     */
    public void onPage(String path, CallbackPage callbackPage) {
        this.pagesList.put(path, callbackPage);
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

}
