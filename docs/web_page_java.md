
Есть возможность создавать контент в файлах Java


1) Для этого файл должен располагаться в каталоге со статическими файлами HTML
2) Имя класса должносовпадать с именем файла
3) В классе должен быть  подкючены основные библиотеки **WebServerLite.HttpExchange;**
4) Запускаемый метод **onPage**, с входящим аргументом **HttpExchange query** и возвращаемым результатом **byte[]**


**Пример файла cmpAction.java :**
```java
import WebServerLite.HttpExchange;
public class index {
    public byte[] onPage(HttpExchange query) {
        StringBuffer sb = new StringBuffer();
        sb.append("\nquery.headers : " + query.headers);
        sb.append("\nquery.requestParam : " + query.requestParam);
        sb.append("\nquery.session : " + query.session);
        sb.append("\nquery.cookie : " + query.cookie);
        sb.append("\nquery.sessionID : " + query.sessionID);
        query.mimeType = "text/plain";
        return sb.toString().getBytes();
    }
}
```

 