package WebServerLite;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.lang.reflect.Method;
import java.net.URL;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Enumeration;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

public class PacketManager {
    // Использование анатацый
    // https://habr.com/ru/companies/otus/articles/764244/

    /**
     * Собираем список классов у которых есть анотация WebServerLite.onPage.class на методе
     * Универсальный метод для классов и Jar файлов
     * @param mainClass
     * @return
     */
    public static List<Class<?>> getWebPage(Class<?> mainClass) {
        List<Class<?>> res;
        //String className = WebServerLite.class.getName().replace('.', '/') + ".class";
        //String classPath = WebServerLite.class.getClassLoader().getResource(className).toString();
        String className = mainClass.getName().replace('.', '/') + ".class";
        String classPath = mainClass.getClassLoader().getResource(className).toString();
        // if (classPath.startsWith("jar")) {
        //    System.out.println("Программа запущена из JAR файла");
        // } else {
        //    System.out.println("Программа запущена из классовой директории");
        // }
        // Определение класса из JAR-файла
        if (classPath.startsWith("jar")) {
            String jarPath = classPath.substring(0, classPath.indexOf('!'));
            res = getPageJar(jarPath);
        } else {
            // Package pkg = Main.class.getPackage();
            Package pkg = mainClass.getPackage();
            String packageName = pkg.getName();
            res = getPageClasses(packageName);
        }
        return res;
    }

    /**
     * Собираем список классов у которых есть анотация WebServerLite.onPage.class на методе
     * @param pathJarFile
     * @return
     */
    public static List<Class<?>> getPageJar(String pathJarFile) {
        if (pathJarFile.indexOf("jar:file:/")!=-1) {
            pathJarFile = pathJarFile.substring(pathJarFile.indexOf("jar:file:/")+"jar:file:/".length());
        }
        System.out.println(pathJarFile);
        List<Class<?>> classes = new ArrayList<>();
        ZipInputStream zip = null;
        try {
            zip = new ZipInputStream(new FileInputStream(pathJarFile));
        } catch (FileNotFoundException e) {
            throw new RuntimeException(e);
        }
        try {
            for (ZipEntry entry = zip.getNextEntry(); entry != null; entry = zip.getNextEntry()) {
                if (!entry.isDirectory() && entry.getName().endsWith(".class")) {
                    String className = entry.getName().replace('/', '.'); // including ".class"
                    String classNameShot = className.substring(0, className.length() - ".class".length());
                    // Костыли (переписать) : пропускаем классы, которые нельзя создать через  "Class.forName(classNameShot);"
                    if (classNameShot.indexOf("$") != -1) continue;
                    if (classNameShot.indexOf("META-INF") != -1) continue;
                    if (classNameShot.indexOf("module-info") != -1) continue;
                    if (classNameShot.indexOf("org.") != -1) continue;
                    if (classNameShot.indexOf("com.ctc.wstx.osgi") != -1) continue;
                    if (classNameShot.indexOf("net.sf.") != -1) continue;
                    if (classNameShot.indexOf("com.lowagie.bouncycastle.") != -1) continue;
                    if (classNameShot.indexOf("com.lowagie.text.") != -1) continue;
                    if (classNameShot.indexOf("net.sourceforge.barbecue.") != -1) continue;
                    Class<?> clazz = null;
                    try {
                        clazz = Class.forName(classNameShot);
                    } catch (ClassNotFoundException e) {
                        System.err.println("getPageJar ClassNotFoundException error: "+e);
                        // throw new RuntimeException(e);
                    }
                    if (clazz==null) continue;
                    Method[] methods2 = clazz.getMethods();
                        for (Method method : methods2) {
                            onPage anotation = (onPage) method.getAnnotation(onPage.class);
                            if (anotation == null) continue;
                            if (anotation == null) continue; // если нет анотации WebServerLite.onPage ,тогда пропускаем метод
                            if ((method.getParameterTypes()[0]).equals("WebServerLite.HttpExchange")) continue; // если первый параметр не имеет тип WebServerLite.HttpExchange, тогда пропускаем этот метод
                            JavaInnerClassObject page = new JavaInnerClassObject();
                            page.ext = anotation.ext();
                            page.mime = anotation.mime();
                            page.method = method;
                            try {
                                page.ObjectInstance = clazz.newInstance(); // Создаем экземпляр класса (Java страницы)
                            } catch (Exception e) {
                                System.out.println("Error create class "+e.getMessage());
                                continue;
                            }
                            page.classNat= clazz;
                            WebServerLite.pagesJavaInnerClass.put(anotation.url(), page);
                            classes.add(clazz);
                        }

                }
            }
        } catch (IOException e) {
            System.err.println("getPageJar IOException error: "+e);
            // throw new RuntimeException(e);
        }
        return classes;
    }

    public static void analyzeClass(Object o) {
        Class clazz = o.getClass();
        System.out.println("Имя класса: " + clazz);
        System.out.println("Поля класса: " + Arrays.toString(clazz.getDeclaredFields()));
        System.out.println("Родительский класс: " + clazz.getSuperclass());
        System.out.println("Методы класса: " + Arrays.toString(clazz.getDeclaredMethods()));
        System.out.println("Конструкторы класса: " + Arrays.toString(clazz.getConstructors()));
    }

    /**
     * Получение списка классов в директории
     * @param directory
     * @param startDir
     * @return
     */
    public static  List<String> searchFilesClass(File directory, File startDir) {
        List<String> strClassesList = new ArrayList<>();
        File[] files = directory.listFiles();
        if (files != null) {
            for (File file : files) {
                if (file.isDirectory()) {
                    strClassesList.addAll(searchFilesClass(file,startDir)); // recursively search subdirectories
                } else {
                    String fileStr = (file.getAbsolutePath().substring(startDir.getAbsolutePath().length()+1)).replace("\\",".");
                    if (fileStr.substring(fileStr.length() - 6).equals(".class")) {
                        fileStr = fileStr.substring(0, fileStr.length() - 6);
                        strClassesList.add(fileStr);
                    }
                }
            }
        }
        return strClassesList;
    }

    /**
     * Получение(регистрация) страниц из JAVA классов имеющие аннотацию WebServerLite.onPage
     * @param packageName
     * @return
     */
    public static List<Class<?>> getPageClasses(String packageName){
        ClassLoader classLoader = Thread.currentThread().getContextClassLoader();
        String path = packageName.replace('.', '/');
        Enumeration<URL> resources = null;
        try {
            resources = classLoader.getResources(path);
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        List<Class<?>> classes = new ArrayList<>();
        while (resources.hasMoreElements()) {
            URL resource = resources.nextElement();
            File directory = new File(resource.getFile());
            if (directory.exists()) {
                for (String className : searchFilesClass(directory,directory)){
                    Class<?> clazz = null;
                    try {
                        clazz = Class.forName(className);
                    } catch (ClassNotFoundException e) {
                        System.err.println("ClassNotFoundException ERROR: "+e);
                    }
                    if (className.indexOf("$")!=-1) continue;
                    if (clazz == null) continue;
                    for (Method method : clazz.getMethods()) {
                        onPage anotation =  method.getAnnotation(onPage.class);
                        if (anotation == null) continue; // если нет анотации WebServerLite.onPage ,тогда пропускаем метод
                        Class<?>[] parameterTypes = method.getParameterTypes();
                        if (parameterTypes.length!=1)     continue;
                        if ((parameterTypes[0]).equals("WebServerLite.HttpExchange")) continue; // если первый параметр не имеет тип WebServerLite.HttpExchange, тогда пропускаем этот метод
                        JavaInnerClassObject page = new JavaInnerClassObject();
                        page.ext = anotation.ext();
                        page.mime = anotation.mime();
                        page.method = method;
                        try {
                            page.ObjectInstance = clazz.newInstance();
                        } catch (Exception e) {
                            System.out.println("Error create class "+e.getMessage());
                            continue;
                        }
                        page.classNat= clazz;
                        WebServerLite.pagesJavaInnerClass.put(anotation.url(), page);
                        //  System.out.println("");
                        //  System.out.println("--------------------------------------");
                        //  System.out.println("className---" + className + "  " + method + "   " + anotation);
                        //  System.out.println("URL---" + anotation.url() + "  ext=" + anotation.ext() + "   mime=" + anotation.mime());
                        //  System.out.println("--------------------------------------");
                        //  System.out.println("");
                        classes.add(clazz);
                    }
                }
            }
        }
        return classes;
    }
}
