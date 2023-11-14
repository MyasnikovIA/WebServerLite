package www;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Arrays;

public class main_test {
    public static void test() {

       // List<Class<?>> classes = ClassFinder.find("WebServerLite");
       // System.out.println(classes);
        // System.out.println(Main.class.getProtectionDomain().getCodeSource().getLocation());

       //List<Class<?>> webPages = ClassFinder.find_www("www");
       //System.out.println(webPages);

        // ----------------------------------------
        // ----------------------------------------
        // https://habr.com/ru/companies/otus/articles/764244/
        // https://javadevblog.com/polnoe-rukovodstvo-po-java-reflection-api-refleksiya-na-primerah.html
        Class<?> myClassClass = index_test.class;
        Method[] methods = myClassClass.getMethods();
        for (Method method : methods) {
            if (method.isAnnotationPresent(www.CustomAnnotation.class)) {
                System.out.println(method);
                System.out.println(method.getName() + "  " + Arrays.toString(method.getDeclaredAnnotations()));
                // Вызываем метод, помеченный аннотацией MyCustomAnnotation
                // method.invoke(instance, args);
            }
        }
        // ----------------------------------------
        // ----------------------------------------
        System.out.println("----------------------------------------");
        // Class mClassObject = index_test.class;
        // Method method = mClassObject.getMethod("sayBye", new Class[]{String.class});
        Method[] methods2 = myClassClass.getMethods();
        for (Method method : methods2) {
            Annotation[][] paramAnnotations = method.getParameterAnnotations();
            Class[] paramTypes = method.getParameterTypes();
            int i = 0;
            for (Annotation[] annotations : paramAnnotations) {
                System.out.println(Arrays.toString(annotations));
                Class parameterType = paramTypes[i++];
                for (Annotation annotation : annotations) {
                    System.out.println(annotation);
                    // if (annotation instanceof Reflectable) {
                    //     Reflectable mAnnotation = (Reflectable) annotation;
                    //     System.out.println("param: " + paramType.getName());
                    //     System.out.println("name: " + mAnnotation.name());
                    //     System.out.println("value: " + mAnnotation.value());
                    // }
                }
            }
        }
        System.out.println("----------------------------------------");
        // ----------------------------------------
        // ----------------------------------------
    }
}
