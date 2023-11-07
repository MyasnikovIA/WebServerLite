import WebServerLite.WebServerLite;
import WebServerLite.HttpExchange;
public class Main {
    public static void main(String[] args) {
        WebServerLite web = new WebServerLite();

        // Инициализация  страницы  в коде
        web.onPage("test.html", (HttpExchange query) -> {
            StringBuffer sb = new StringBuffer();
            sb.append("\nquery.headers : " + query.headers);
            sb.append("\nquery.requestParam : " + query.requestParam);
            sb.append("\nquery.session : " + query.session);
            sb.append("\nquery.cookie : " + query.cookie);
            sb.append("\nquery.sessionID : " + query.sessionID);
            query.mimeType = "text/plain";
            return sb.toString().getBytes();
        });

        // Страница из текста
        // web.onPage("test2.html",new StringBuffer("<h1>!!!!!!!!!!!!!!</h1>"));
        // web.onPage("test2.js",new StringBuffer("alert(1)"));

        // Указать путь к файлу с конфигурацией
        // web.initConfig(args[0]);

        // Инициализация конфигурации
        // web.config("INDEX_PAGE" , "test.html");

        web.start();
    }
}