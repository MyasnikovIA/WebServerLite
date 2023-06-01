package WebServerLite;

import constant.ServerConstant;
import org.json.JSONArray;
import org.json.JSONObject;

import javax.tools.*;
import javax.tools.JavaCompiler.CompilationTask;
import java.io.*;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.net.URI;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.logging.Level;
import java.util.logging.Logger;


/**
 * Класс предназначени для динамической компиляции и выполнения JAVA кода из текста (есть буфирезация выполненных фрагментов кода)
 * <p>
 * Пример использования :
 * import java.util.HashMap;
 * public class Main {
 * public static String str= "Текст в глобальной переменной";
 * <p>
 * public static void main(String[] args) {
 * JavaStrExecut exec = new JavaStrExecut();
 * exec.exec("System.out.println(2222);  Main.str =\"Модификация  глобальной переменной\"; ");
 * HashMap<String, Object> res = exec.exec("System.out.println(2222);  Main.str =\"444444444\"; ",null,null);
 * <p>
 * System.out.println(str);
 * System.out.println(res.get("JAVA_CODE_SRC"));
 * <p>
 * HashMap<String, Object> res2 = exec.exec(" error!!! ",null,null);
 * System.out.println(res2.get("JAVA_CODE_SRC"));
 * System.out.println(res2.get("JAVA_ERROR"));
 * }
 * }
 */
public class JavaStrExecut {


    /**
     * Места хронения скомпелированных классов и созданных экземпляров классов (CompileObject)
     */
    public static HashMap<String, Object> InstanceClassHash = new HashMap<>();


    public static HashMap<String, Object> InstanceClassName = new HashMap<>();

    /**
     * Объект компилируемого класса
     */
    private class CompileObject {
        Class<?> ClassNat = null;     // объект класса, по которому будет создан экземпляр класса
        Object ObjectInstance = null; // Экземпляр класса
        String CodeText = null;       // Код программы
        String HashClass = null;      // Шеш кода программы
        long lastModified = 0;
    }

    /**
     * Подключение  внешних библиотек JS (не проверен)
     *
     * @param IncudeClassName
     */
    private void IncludeClass(String IncudeClassName) {
        try {
            // Поиск библиотеки
            System.out.println("/* LoadClass: " + IncudeClassName + "  */");
            // String JsIncludeClass=IncudeClassName.replace(".","_");
            Class<?> ClassUserBin = Class.forName(IncudeClassName);
            Method[] m = ClassUserBin.getDeclaredMethods();
            System.out.println("\n " + IncudeClassName + " = {}");
            for (int i = 0; i < m.length; i++) {
                //  System.out.println("\n /*"+ m[i].getParameters().length+"*/");
                //  public-1 ;  private-2 ; protected-4
                //  public static - 9 ; private static - 10 ;  protected static-12 ;
                if (m[i].getModifiers() != 9) {
                    continue;
                }
                System.out.println("\n /*" + IncudeClassName + "." + m[i].getName() + "*/");
                // System.out.println(" "+JsIncludeClass+"."+m[i].getName()+" = function(){");
                System.out.println(" " + m[i].getName() + " = function(){");
                if (m[i].getReturnType().toString().equals("void")) {
                    System.out.println(" SendServer(\"" + IncudeClassName + "." + m[i].getName() + "\",arguments ); ");
                } else {
                    System.out.println(" return SendServer(\"" + IncudeClassName + "." + m[i].getName() + "\",arguments ); ");
                }
                System.out.println(" } ");
            }
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        }

    }

    /**
     * не проверен !!!
     *
     * @param ClassNameSrc
     * @param MethodNameSrc
     * @return
     */
    public Object RunClass(String ClassNameSrc, String MethodNameSrc) {
        return RunClass(ClassNameSrc, MethodNameSrc, new Object[]{});
    }

    /**
     * не проверен !!!
     * System.setOut(new PrintStream(response.getOutputStream()));
     * System.setErr(new PrintStream(response.getOutputStream()));
     * String UserClassname2="NewClass";
     * String UserMethodname2="test3";
     * Object arglist[] = new Object[1];
     * arglist[0] = new String("fffffffffff");
     * Object res=RunClass( UserClassname2,  UserMethodname2,arglist );
     * System.out.println(res);
     */
    public Object RunClass(String ClassNameSrc, String MethodNameSrc, Object[] args) {
        Object res = null;
        try {
            //   Class<?> methodAccessorGeneratorClass = Class.forName(ClassNameSrc);
            Class<?> ClassUserBin = Class.forName(ClassNameSrc);
            Object ClassObj = ClassUserBin.newInstance();
            Method meth;
            if (args.length == 0) {
                meth = ClassUserBin.getMethod(MethodNameSrc, new Class[]{});
            } else {
                Class partypes[] = new Class[args.length];
                for (int i = 0; i < args.length; i++) {
                    partypes[i] = args[i].getClass();
                }
                meth = ClassUserBin.getMethod(MethodNameSrc, partypes);
            }
            //  public-1 ;  private-2 ; protected-4
            //  public static - 9 ; private static - 10 ;  protected static-12 ;
            if (meth.getModifiers() != 9) {
                return res;
            }
            if (meth.getReturnType().toString().equals("void")) {
                meth.invoke(ClassObj, args);
            } else if (meth.getReturnType().toString().equals("String")) {
                res = meth.invoke(ClassObj, args);
            } else if (meth.getReturnType().toString().equals("interface java.util.Map")) {
                // res = JSON.encode(meth.invoke(ClassObj, args), false);
                System.out.println("===" + meth.getReturnType().toString() + "===");
            } else {
                // res = JSON.encode(meth.invoke(ClassObj, args), false);
                System.out.println("===" + meth.getReturnType().toString() + "===");
            }
        } catch (NoSuchMethodException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        } catch (SecurityException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IllegalAccessException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        } catch (IllegalArgumentException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InvocationTargetException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        } catch (InstantiationException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        } catch (ClassNotFoundException ex) {
            Logger.getLogger(JavaStrExecut.class.getName()).log(Level.SEVERE, null, ex);
        }
        return res;
    }


    /**
     * Выполнить команду Java (без получения результата)
     *
     * @param code
     * @throws Exception
     */
    public void exec(String code) {
        String src = "" +
                "public class SpecialClassToCompile { \n"
                + "public void evalFunc(){"
                + code + ";"
                + "}"
                + "}";
        String hashCrs = getMd5Hash(src); // получаем хэш текста исходника функции
        try {
            CompileObject compileObject = new CompileObject();
            if (!InstanceClassHash.containsKey(hashCrs)) {
                SpecialClassLoader classLoader = new SpecialClassLoader();
                compileMemoryMemory(src, "SpecialClassToCompile", classLoader);
                compileObject.ClassNat = Class.forName("SpecialClassToCompile", false, classLoader);
                compileObject.ObjectInstance = compileObject.ClassNat.newInstance();
                compileObject.CodeText = src;
                compileObject.HashClass = hashCrs;
                InstanceClassHash.put(hashCrs, compileObject); // запоминаем созданный экземпляр класса
            } else {
                compileObject = (CompileObject) InstanceClassHash.get(hashCrs);
            }
            compileObject.ClassNat.getMethod("evalFunc", new Class[]{}).invoke(compileObject.ObjectInstance, new Object[]{});
        } catch (ClassNotFoundException e) {
            throw new RuntimeException(e);
        } catch (InvocationTargetException e) {
            throw new RuntimeException(e);
        } catch (InstantiationException e) {
            throw new RuntimeException(e);
        } catch (IllegalAccessException e) {
            throw new RuntimeException(e);
        } catch (NoSuchMethodException e) {
            throw new RuntimeException(e);
        }
       /*
        SpecialClassLoader classLoader = new SpecialClassLoader();
        compileMemoryMemory(src, "SpecialClassToCompile", classLoader, System.err);
        Class<?> c = Class.forName("SpecialClassToCompile", false, classLoader);
        Object o = c.newInstance();
        c.getMethod("evalFunc", new Class[]{}).invoke(o, new Object[]{});
        */
    }


    /**
     * Выполнить команду Java
     *
     * @param code    - текст выполняемого кода
     * @param vars    - список входящих переменных
     * @param session - список входящих переменных (из сессии для ВЭБ сервера)
     * @return - возвращается объект vars
     * res.get("JAVA_CODE_SRC") - получение исходного кода
     * res.get("JAVA_ERROR") - получение объекта ошибки
     */
    public HashMap<String, Object> exec(String code, HashMap<String, Object> vars, HashMap<String, Object> session) {
        HashMap<String, Object> res = new HashMap<>();
        if (session == null) {
            session = new HashMap<>();
        }
        if (vars == null) {
            vars = new HashMap<>();
        }
        String src = "" +
                "import java.util.HashMap; \n"
                + "public class SpecialClassToCompileV2 { \n"
                + "    public HashMap<String, Object>  evalFunc(HashMap<String, Object> vars, HashMap<String, Object> session) {\n"
                + "        " + code + ";\n"
                + "        return vars;\n"
                + "    }\n"
                + "}\n";
        res.put("JAVA_CODE_SRC", src);
        String hashCrs = getMd5Hash(src); // получаем хэш текста исходника функции
        try {
            CompileObject compileObject = new CompileObject();
            if (!InstanceClassHash.containsKey(hashCrs)) {
                SpecialClassLoader classLoader = new SpecialClassLoader();
                compileMemoryMemory(src, "SpecialClassToCompileV2", classLoader);
                compileObject.ClassNat = Class.forName("SpecialClassToCompileV2", false, classLoader);
                compileObject.ObjectInstance = compileObject.ClassNat.newInstance();
                InstanceClassHash.put(hashCrs, compileObject); // запоминаем созданный экземпляр класса
            } else {
                compileObject = (CompileObject) InstanceClassHash.get(hashCrs);
            }
            Class[] argTypes = new Class[]{HashMap.class, HashMap.class};             // перечисляем типы входящих переменных
            Method meth = compileObject.ClassNat.getMethod("evalFunc", argTypes);                                // получаем метод по имени и типам входящих переменных
            res = (HashMap<String, Object>) meth.invoke(compileObject.ObjectInstance, vars, session); // запуск мектода на выполнение
            res.put("JAVA_CODE_SRC", src);
        } catch (ClassNotFoundException e) {
            res.put("JAVA_ERROR", e);
        } catch (InvocationTargetException e) {
            res.put("JAVA_ERROR", e);
        } catch (InstantiationException e) {
            res.put("JAVA_ERROR", e);
        } catch (IllegalAccessException e) {
            res.put("JAVA_ERROR", e);
        } catch (NoSuchMethodException e) {
            res.put("JAVA_ERROR", e);
        } catch (Exception e) {
            res.put("JAVA_ERROR", e);
        }
        return res;
    }


    /**
     * Функция компиляции кода (поиск по хэшу кода)
     *
     * @param code
     * @return
     */
    public boolean compile(String code) {
        boolean res = true;
        String src = "" +
                "import java.util.HashMap; \n"
                + "public class SpecialClassToCompileV2 { \n"
                + "    public HashMap<String, Object>  evalFunc(HashMap<String, Object> vars, HashMap<String, Object> session) {\n"
                + "        " + code + ";\n"
                + "        return vars;\n"
                + "    }\n"
                + "}\n";
        String hashCrs = getMd5Hash(src); // получаем хэш текста исходника функции
        try {
            if (!InstanceClassHash.containsKey(hashCrs)) {
                SpecialClassLoader classLoader = new SpecialClassLoader();
                compileMemoryMemory(src, "SpecialClassToCompileV2", classLoader);
                CompileObject compileObject = new CompileObject();
                compileObject.ClassNat = Class.forName("SpecialClassToCompileV2", false, classLoader);
                compileObject.ObjectInstance = compileObject.ClassNat.newInstance();
                InstanceClassHash.put(hashCrs, compileObject); // запоминаем созданный экземпляр класса
            }
        } catch (Exception e) {
            res = false;
        }
        return res;
    }


    /**
     * Выполнить ранее скомпилированную команду Java
     *
     * @param nameFunction - Имя ранее скомпелированной функции
     * @param vars         - список входящих переменных
     * @param session      - список входящих переменных (из сессии для ВЭБ сервера)
     * @return - возвращается объект vars
     * res.get("JAVA_ERROR") - получение объекта ошибки
     */
    public JSONObject runFunction(String nameFunction, JSONObject vars, HashMap<String, Object> session, JSONArray data) {
        JSONObject res = new JSONObject();
        if (session == null) {
            session = new HashMap<>();
        }
        if (vars == null) {
            vars = new JSONObject();
        }
        if (data == null) {
            data = new JSONArray();
        }
        try {
            if (!InstanceClassName.containsKey(nameFunction)) {
                res.put("JAVA_ERROR", "Compile file not found");
            } else {
                CompileObject compileObject = (CompileObject) InstanceClassName.get(nameFunction);
                Class[] argTypes = new Class[]{JSONObject.class, HashMap.class, JSONArray.class};             // перечисляем типы входящих переменных
                Method meth = compileObject.ClassNat.getMethod("evalFunc", argTypes);                                // получаем метод по имени и типам входящих переменных
                res = (JSONObject) meth.invoke(compileObject.ObjectInstance, vars, session, data); // запуск мектода на выполнение
            }
        } catch (InvocationTargetException e) {
            res.put("JAVA_ERROR", (e.getClass().getName() + ": " + e.getMessage()));
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        } catch (IllegalAccessException e) {
            res.put("JAVA_ERROR", (e.getClass().getName() + ": " + e.getMessage()));
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        } catch (NoSuchMethodException e) {
            res.put("JAVA_ERROR", (e.getClass().getName() + ": " + e.getMessage()));
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        } catch (Exception e) {
            res.put("JAVA_ERROR", (e.getClass().getName() + ": " + e.getMessage()));
            System.err.println(e.getClass().getName() + ": " + e.getMessage());
        }
        return res;
    }

    /**
     * Проверка наличия скомпелированного файла в памяти приложения
     * @param name
     * @return
     */
    public boolean existJavaFunction(String name) {
          return InstanceClassName.containsKey(name);
    }

    public boolean compile(String name, String code, JSONObject info) {
        return compile(name, null, null, code, info);
    }

    /**
     * Компиляция кода с присваеванием имени, по котором  можно будет его найти
     *
     * @param name - имя скомпелированной функции (произвольное)
     * @param code - тело кода
     * @return
     */
    public boolean compile(String name, ArrayList<String> importPacket, ArrayList<String> jarResourse, String code, JSONObject info) {
        boolean res = true;
        StringBuffer importPacketString = new StringBuffer();
        Set<String> importSet = new LinkedHashSet<String>(importPacket);
        for (String key : importSet) {
            importPacketString.append("\nimport ");
            importPacketString.append(key);
            importPacketString.append(";");
        }
        String src = "" +
                "import java.util.HashMap; \n" +
                "import java.util.ArrayList; \n" +
                "import org.json.JSONArray; \n" +
                "import org.json.JSONObject; \n"
                + importPacketString
                + "\npublic class SpecialClassToCompileV3 { \n"
                + "    public JSONObject evalFunc(JSONObject vars, HashMap<String, Object> session, JSONArray data) {\n"
                + "        " + code + ";\n"
                + "        return vars;\n"
                + "    }\n"
                + "}\n";
        String hashCrs = getMd5Hash(src); // получаем хэш текста исходника функции
        //System.out.print("src\n" + src);
        info.put("compile", false);
        info.put("src", src);
        if (!InstanceClassHash.containsKey(hashCrs)) {
            SpecialClassLoader classLoader = new SpecialClassLoader();
            if (!compileMemoryMemory(src, "SpecialClassToCompileV3", classLoader, jarResourse, info)) {
                return false;
            }
            ;
            try {
                CompileObject compileObject = new CompileObject();
                compileObject.ClassNat = Class.forName("SpecialClassToCompileV3", false, classLoader);
                compileObject.ObjectInstance = compileObject.ClassNat.newInstance();
                compileObject.CodeText = src;
                InstanceClassHash.put(hashCrs, compileObject); // запоминаем созданный экземпляр класса
                InstanceClassName.put(ServerConstant.config.APP_NAME + "_" + name, compileObject);
                System.out.println("COMPILE " + name);
                info.put("compile", true);
            } catch (Exception e) {
                //info.put("error", e.getClass().getName() + ": " + e.getMessage());
                res = false;
            }
        }
        return res;
    }


    /**
     * Компиляция кода с присваеванием имени, по котором  можно будет его найти
     *
     * @return
     */
    public boolean compileFile(String rootPath, String requestPath, JSONObject info) {
        if (info == null) {
            info = new JSONObject();
        }
        boolean res = true;
        String src = "";
        String resourcePath = rootPath + '/' + requestPath;
        try {
            File nameFileObj = new File(resourcePath);
            String nameFile = nameFileObj.getName();
            String classNameText = nameFile.substring(0, nameFile.length() - 5);
            long lastModified = nameFileObj.lastModified(); // дата последней модификации файла
            // Если Java файл не был скомпилирован, или был модифицирован, тогда перекомпилируем его.
            if (!InstanceClassName.containsKey(requestPath) || ((CompileObject) InstanceClassName.get(requestPath)).lastModified != lastModified) { //
                InputStream in = new FileInputStream(resourcePath);
                InputStreamReader inputStreamReader = new InputStreamReader(in);
                StringBuffer sb = new StringBuffer();
                int charInt;
                while ((charInt = inputStreamReader.read()) > 0) {
                    sb.append((char) charInt);
                }
                src = sb.toString();
            }
            String hashCrs = getMd5Hash(src); // получаем хэш текста исходника функции
            info.put("compile", false);
            info.put("src", src);
            if (!InstanceClassHash.containsKey(hashCrs)) {
                SpecialClassLoader classLoader = new SpecialClassLoader();
                // System.out.println("src:" + src);
                if (!compileMemoryMemory(src, classNameText, classLoader, null, info)) {
                    return false;
                }
                try {
                    CompileObject compileObject = new CompileObject();
                    compileObject.ClassNat = Class.forName(classNameText, false, classLoader);
                    compileObject.ObjectInstance = compileObject.ClassNat.newInstance();
                    compileObject.CodeText = src;
                    InstanceClassHash.put(hashCrs, compileObject); // запоминаем созданный экземпляр класса
                    InstanceClassName.put(requestPath, compileObject);
                    System.out.println("COMPILE " + requestPath);
                    info.put("compile", true);
                } catch (Exception e) {
                    //info.put("error", e.getClass().getName() + ": " + e.getMessage());
                    res = false;
                }
            }
        } catch (Exception e) {
            // ошибка чтения файла
            info.put("ERROR", "ошибка чтения файла:" + resourcePath);
            return false;
        }
        return res;
    }


    /**
     * Запуск скомпилированного ранее файла (или скомпилировать его)
     */
    public void runJavaFile(HttpExchange query) {
        JSONObject infoCompile = new JSONObject();
        try {
            if (compileFile(ServerConstant.config.WEBAPP_DIR, query.requestPath, infoCompile)) {
                query.mimeType = "text/html";
                CompileObject compileObject = (CompileObject) InstanceClassName.get(query.requestPath);
                Class[] argTypes = new Class[]{HttpExchange.class};
                Method meth = compileObject.ClassNat.getMethod("onPage", argTypes);   // получаем метод по имени и типам входящих переменных
                byte[] messageBytes = (byte[]) meth.invoke(compileObject.ObjectInstance, query); // запуск метода на выполнение
                if (messageBytes == null)
                    return;                                                      // если возвращается NULL тогда ничего отправлять ненадо
                query.sendHtml(messageBytes);
            } else {
                // Если при компиляции произошла ошибка, тогда отправляем подробности клиенту в браузер

                query.mimeType = "text/plain";
                query.mimeType = "text/html";
                query.sendHtml(parseErrorCompile(infoCompile));
            }
        } catch (Exception e) {
            query.mimeType = "text/html";
            query.sendHtml(e.toString());
        }
    }

    public static String parseErrorCompile( JSONObject infoCompile ){
        StringBuffer message = new StringBuffer("HTTP error compile Java file:");
        String srcCode = infoCompile.getString("src");
        StringBuffer dstError = new StringBuffer();
        message.append("<br/>");
        if (infoCompile.has("ERROR")) {
            JSONArray arrError = infoCompile.getJSONArray("ERROR");
            message.append("Found ");
            message.append(arrError.length());
            message.append(" error.<br/>");
            for (int i = 0; i < arrError.length(); i++) {
                JSONObject objError = arrError.getJSONObject(i);
                if (objError.has("ErrorString")) {
                    message.append("<pre>");
                    message.append(objError.getString("ErrorString"));
                    message.append("</pre>");
                }
            }
            for (int i = 0; i < arrError.length(); i++) {
                JSONObject objError = arrError.getJSONObject(i);
                // "LineNumber"
                StringBuffer dstTmpError = new StringBuffer();
                dstTmpError.append(srcCode.substring(0, objError.getInt("StartPosition"))); // фрагменьт кода до обшибки
                if (objError.getInt("StartPosition") == objError.getInt("EndPosition")) {
                    dstTmpError.append("<span style=\"color: crimson;\">");
                    dstTmpError.append(" >#< ");
                    dstError.append(objError.getString("Message"));
                    dstTmpError.append("</span>");
                } else {
                    dstTmpError.append("<span style=\"color: crimson;\">");
                    dstTmpError.append(srcCode.substring(objError.getInt("StartPosition"), objError.getInt("EndPosition")));
                    dstTmpError.append("</span>");
                }
                dstTmpError.append(srcCode.substring(objError.getInt("EndPosition"))); // фрагменьт кода до обшибки
                int indLine = 0;
                for (String line : dstTmpError.toString().split("\r")) {
                    indLine++;
                    if (objError.getInt("LineNumber") == indLine) {
                        if (objError.getInt("StartPosition") == objError.getInt("EndPosition")) {
                            dstError.append("\r<span style=\"color: crimson;\">");
                            dstError.append(objError.getString("Message"));
                            dstError.append("</span>");
                        } else {
                            dstError.append("\n<span style=\"color: crimson;\">Error: ");
                            dstError.append(objError.getString("Message"));
                            dstError.append("</span>");
                        }
                    }
                    dstError.append(line);
                }
                break;
            }
        }
        message.append("<br/>");
        message.append("<pre>");
        message.append(dstError);
        message.append("</pre>");
        message.append("\r\n");
        return message.toString();
    }

    public void runJavaComponent(HttpExchange query) {
        String classNameCmp = query.requestPath.substring(0, query.requestPath.length() - ".component".length()).replaceAll("/", ".");
        try {
            Class[] argTypes = new Class[]{HttpExchange.class};
            Class<?> helloWorldClass = Class.forName(classNameCmp);
            Method meth = helloWorldClass.getMethod("onPage", argTypes);
            byte[] messageBytes = (byte[]) meth.invoke(null, query); // запуск мектода на выполнение
            if (messageBytes != null) {
                query.sendHtml(messageBytes);
            }
        } catch (Exception e) {
            System.out.println(e.getClass().getName() + ": " + e.getMessage());
        }
    }

    public void runJavaServerlet(HttpExchange query) {
        String classNameCmp = "component." + query.requestPath.split("component}/")[1];
        try {
            System.out.println("classNameCmp "+classNameCmp);
            String uriStr = query.requestPath;
            Class[] argTypes = new Class[]{HttpExchange.class};
            Class<?> classServerlet = Class.forName(classNameCmp);
            Method meth = classServerlet.getMethod("onPage", argTypes);
            byte[] messageBytes = (byte[]) meth.invoke(null, query); // запуск мектода на выполнение
            if (messageBytes != null) {
                query.sendHtml(messageBytes);
            }
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
    }

    public void compileMemoryMemory(String src, String name, SpecialClassLoader classLoader) {
        compileMemoryMemory(src, name, classLoader, null, null);
    }

    /**
     * Компиляция JAVA файла из текстовой строки в памяти приложения
     *
     * @param src
     * @param name
     * @param classLoader
     */
    public boolean compileMemoryMemory(String src, String name, SpecialClassLoader classLoader, ArrayList<String> jarResourse, JSONObject info) {
        boolean resultColl = true;
        if (info == null) info = new JSONObject();
        if (jarResourse == null) jarResourse = new ArrayList<>();
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        DiagnosticCollector<JavaFileObject> diacol = new DiagnosticCollector<JavaFileObject>();
        StandardJavaFileManager standartFileManager = compiler.getStandardFileManager(diacol, null, null);
        SpecialJavaFileManager fileManager = new SpecialJavaFileManager(standartFileManager, classLoader);
        List<String> optionList = new ArrayList<String>();
        // optionList.addAll(Arrays.asList("-classpath", "D:\\JavaProject\\HttpServer-JAVA\\lib\\json-20230227.jar"));
        for (String libJaR : ServerConstant.config.LIB_JAR) {
            if (libJaR.indexOf(File.separator) == -1) {
                jarResourse.add(libJaR);
            } else {
                jarResourse.add(ServerConstant.config.LIB_DIR + File.separator + libJaR);
            }
        }
        Set<String> jarSet = new LinkedHashSet<String>(jarResourse);
        StringBuffer libList = new StringBuffer(System.getProperty("java.class.path")); // получаем пут к библиотекам, которые подключены к проету
        for (String key : jarSet) {
            File file = new File(ServerConstant.config.LIB_DIR + File.separator + key);
            if (file.exists()) {
                libList.append(";");
                libList.append(file.getAbsolutePath());
            }
        }
        optionList.addAll(Arrays.asList("-classpath", libList.toString()));
        CompilationTask compile = compiler.getTask(null, fileManager, diacol, optionList, null, Arrays.asList(new JavaFileObject[]{new MemorySource(name, src)}));
        boolean status = compile.call();
        if (!status) {
            JSONArray listErrInfo = new JSONArray();
            JSONObject errInfo = new JSONObject();
            List<Diagnostic<? extends JavaFileObject>> diagnostics = diacol.getDiagnostics();
            for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics) {
                JSONObject errInfoOne = new JSONObject();
                errInfoOne.put("Message", diagnostic.getMessage(null));
                errInfoOne.put("Code", diagnostic.getCode());
                errInfoOne.put("ColumnNumber", diagnostic.getColumnNumber());
                errInfoOne.put("Kind", diagnostic.getKind());
                errInfoOne.put("StartPosition", diagnostic.getStartPosition());
                errInfoOne.put("Position", diagnostic.getPosition());
                errInfoOne.put("EndPosition", diagnostic.getEndPosition());
                errInfoOne.put("LineNumber", diagnostic.getLineNumber());
                errInfoOne.put("LineNumber", diagnostic.getLineNumber());
                errInfoOne.put("FullInfo", diagnostic.getKind() + ":\t Line [" + diagnostic.getLineNumber() + "] \t Position [" + diagnostic.getPosition() + "]\t" + diagnostic.getMessage(Locale.ROOT) + "\n");
                errInfoOne.put("ErrorString", diagnostic.toString());
                listErrInfo.put(errInfoOne);
            }
            errInfo.put("Src", src);
            errInfo.put("SizeError", diacol.getDiagnostics().size());
            errInfo.put("errors", listErrInfo);
            info.put("ERROR", listErrInfo);
            resultColl = false;
        }
        /*
        try {
            standartFileManager.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        */
        return resultColl;
    }

    /**
     * @param input
     * @return System.out.println(" MD5 Hash : " + getMd5Hash ( input));
     */
    public static String getMd5Hash(String input) {
        try {
            // Get instance of MessageDigest with "MD5" algorithm
            MessageDigest md = MessageDigest.getInstance("MD5");
            // Generate the hash value of the input
            byte[] digest = md.digest(input.getBytes());
            // Convert the hash value from bytes to hex format
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            // This should never happen since "MD5" is a valid algorithm
            e.printStackTrace();
            return null;
        }
    }

    public void compileTest(String classNameText, String requestPath) {
        String sourceCode = "public class HelloWorld { public static void main(String[] args) {System.out.println(\"Hello World\");}}";
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        int result = compiler.run(null, null, null, sourceCode);
        if (result == 0) {
            System.out.println("Compilation successful");
        } else {
            System.out.println("Compilation failed");
        }

    }


}

/**
 * Класс для создания кода из строки
 *
 * @author vampirus
 */
class MemorySource extends SimpleJavaFileObject {

    private String src;

    public MemorySource(String name, String src) {
        super(URI.create("string:///" + name.replace('.', '/') + Kind.SOURCE.extension), Kind.SOURCE);
        this.src = src;
    }

    public CharSequence getCharContent(boolean ignoreEncodingErrors) {
        return src;
    }
}

/**
 * Класс для записи байткода в память
 *
 * @author vampirus
 */
class MemoryByteCode extends SimpleJavaFileObject {

    private ByteArrayOutputStream oStream;

    public MemoryByteCode(String name) {
        super(URI.create("byte:///" + name.replace('/', '.') + Kind.CLASS.extension), Kind.CLASS);
    }

    public OutputStream openOutputStream() {
        oStream = new ByteArrayOutputStream();
        return oStream;
    }

    public byte[] getBytes() {
        return oStream.toByteArray();
    }
}

/**
 * Файловый менеджер
 *
 * @author vampirus
 */
class SpecialJavaFileManager extends ForwardingJavaFileManager<StandardJavaFileManager> {
    private SpecialClassLoader classLoader;

    public SpecialJavaFileManager(StandardJavaFileManager fileManager, SpecialClassLoader specClassLoader) {
        super(fileManager);
        classLoader = specClassLoader;
    }

    public JavaFileObject getJavaFileForOutput(Location location, String name, JavaFileObject.Kind kind, FileObject sibling) throws IOException {
        MemoryByteCode byteCode = new MemoryByteCode(name);
        classLoader.addClass(byteCode);
        return byteCode;
    }
}

/**
 * Загрузчик
 *
 * @author vampirus
 */
class SpecialClassLoader extends ClassLoader {
    private MemoryByteCode byteCode;

    protected Class<?> findClass(String name) {
        return defineClass(name, byteCode.getBytes(), 0, byteCode.getBytes().length);
    }

    public void addClass(MemoryByteCode code) {
        byteCode = code;
    }
}

