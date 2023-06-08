
Есть возможность создавать сценарии обработки Socket подключений в файлах Java


1) Для этого файл должен располагаться в каталоге со статическими файлами HTML
2) Имя класса должносовпадать с именем файла
3) В классе должен быть  подкючены основные библиотеки **WebServerLite.HttpExchange;**
4) Запускаемый метод **onTerminal**, с входящим аргументом **HttpExchange query** и возвращаемым результатом **byte[]**

<br/>Атребуты Socket запроса:
<br/>**query.message** - текст сообщения присланного от клиента (String)
<br/>**query.countQuery** - порядковый номер запроса от клиента (int)
<br/>**query.headers** - входящие атребуты (HashMap<String, Object>)
<br/>**Head.write** - функция отправки ответа клиенту  **Head.write(query.headers+"\r\n");**
<br/>**Head.read** - функция ожидания запроса клиенту  **Head.read();** . Если возвращается значение NULL тогда клиент отключился


<br/>После ввода команды "exit" сервер отключаеи клиента

<br/>**Пример отправки сообщения от клиента:**
```
TERM /terminal/terminal.java
aa:ddddddd
dd:fffff
ggg:hhhhhhhh


```



**Пример файла terminal.java :**
```java
import WebServerLite.HttpExchange;
public class terminal {
    /*
Пример отправки сообщения от клиента:

TERM /terminal/terminal.java
aa:ddddddd
dd:fffff
ggg:hhhhhhhh


     */
    public static void onTerminal(HttpExchange query) {
        // Отправить сообщение  сокет клиенту
        query.write(query.requestParam.toString() + "\r\n");
        query.write(query.requestText + "\r\n");
        query.write(query.headers + "\r\n");
        while (query.read() != null) { // ждем сообщений от клиента 
            System.out.println("{\"ok\":false,\"++++++error+++++----\":\"no message\"}\r\n");
            System.out.println("Head.message " + query.message);
            query.write("-------------------------------\r\n");
            query.write(query.requestParam.toString() + "\r\n");
            query.write(query.requestText + "\r\n");
            query.write(query.headers + "\r\n");
        }
    }
}
```

 