package www;

public class index_test {
    @CustomAnnotation(value = "Моя аннотация")
    public static byte[] index_html() {
        return "123".getBytes();
    }
}
