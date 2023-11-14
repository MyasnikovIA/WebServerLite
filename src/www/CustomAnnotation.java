package www;

import java.lang.annotation.*;

@Retention(RetentionPolicy.RUNTIME)  // Specifies that the annotation should be retained at runtime
@Target({ElementType.METHOD, ElementType.TYPE})  // Specifies that the annotation can only be applied to classes
public @interface CustomAnnotation {
    String value() default "/";
}

