package component;

import WebServerLite.HttpExchange;
import WebServerLite.ServerResourceHandler;
import constant.ServerConstant;

import org.json.JSONArray;
import org.json.JSONObject;
import org.jsoup.nodes.Attribute;
import org.jsoup.nodes.Attributes;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;


import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;

import static WebServerLite.PostgreQuery.getConnect;
import static WebServerLite.PostgreQuery.procedureList;


public class cmpDataset extends Base {
    public cmpDataset(Document doc, Element element) {
        super(doc, element, "teaxtarea");
        /*
        if (doc.select("[cmp=\"cmpAction\"]").toString().length() == 0) {
            Elements elements = doc.getElementsByTag("head");
            elements.append("<script cmp=\"cmpAction\" src=\"{component}/cmpAction\" type=\"text/javascript\"/>");
        }
        */
        Attributes attrs = element.attributes();
        Attributes attrsDst = this.attributes();
        attrsDst.add("schema", "Dataset");
        String name = attrs.get("name");
        this.attr("name", name);
        attrsDst.add("name", name);
        this.initCmpType(element);

        String db = RemoveArrKeyRtrn(attrs, "DB", "DB");
        String query_type = "sql";
        if (element.attributes().hasKey("query_type")) {
            query_type = element.attributes().get("query_type");
        }
        // String functionName = getMd5Hash(doc.attr("doc_path").replaceAll("/", "_")) + "#" + getMd5Hash(element.attr("name"));
        String functionName = (doc.attr("doc_path").substring(0, doc.attr("doc_path").length() - 5).substring(doc.attr("rootPath").length())).replaceAll("/", "_") + "___" + element.attr("name");
        this.attr("style", "display:none");
        this.attr("dataset_name", functionName);
        this.attr("name", element.attr("name"));
        StringBuffer jsonVar = new StringBuffer();
        ArrayList<String> jarResourse = new ArrayList<String>();
        ArrayList<String> importPacket = new ArrayList<String>();
        for (int numChild = 0; numChild < element.childrenSize(); numChild++) {
            Element itemElement = element.child(numChild);
            Attributes attrsItem = itemElement.attributes();
            if (itemElement.tag().toString().toLowerCase().indexOf("import") != -1) {
                if (attrsItem.hasKey("path")) {
                    jarResourse.add(attrsItem.get("path"));
                }
                if (attrsItem.hasKey("packet")) {
                    importPacket.add(attrsItem.get("packet"));
                }
            } else if (itemElement.tag().toString().toLowerCase().indexOf("var") != -1) {
                String nameItem = attrsItem.get("name");
                String src = RemoveArrKeyRtrn(attrsItem, "src", nameItem);
                String srctype = RemoveArrKeyRtrn(attrsItem, "srctype", "");
                String get = RemoveArrKeyRtrn(attrsItem, "get", "");
                String put = RemoveArrKeyRtrn(attrsItem, "put", "");
                String len = RemoveArrKeyRtrn(attrsItem, "len", "");
                String defaultVal = RemoveArrKeyRtrn(attrsItem, "default", "");
                jsonVar.append("'" + nameItem + "':{");
                jsonVar.append("'src':'" + src + "',");
                jsonVar.append("'srctype':'" + srctype + "',");
                jsonVar.append("'get':'" + get + "',");
                jsonVar.append("'put':'" + put + "',");
                jsonVar.append("'len':'" + len + "',");
                jsonVar.append("'defaultVal':'" + defaultVal.replaceAll("'", "\\'") + "'");
                jsonVar.append("},");
            }
        }
        this.attr("vars", "{" + jsonVar.substring(0, jsonVar.length() - 1) + "}");
        this.attr("query_type", query_type);
        this.attr("db", db);

        if (element.hasText()) {
            if (query_type.equals("java")) {
                JSONObject infoCompile = new JSONObject();
                if (!ServerResourceHandler.javaStrExecut.compile(functionName, importPacket, jarResourse, element.text().trim(), infoCompile)) {
                    System.out.println("infoCompile "+infoCompile);
                    StringBuffer sbErr = new StringBuffer();
                    sbErr.append(infoCompile.getString("src"));
                    sbErr.append("\n");
                    this.removeAttr("style");
                    this.html(sbErr.toString());
                    return;
                } else {
                    //  HashMap<String, Object> vars = new HashMap<>();   // инициализация переменных
                    //  HashMap<String, Object> res =ServerResourceHandler.javaStrExecut.runFunction(functionName,vars,null); // запуск выполнения скрипта
                    //  System.out.println("==="+res.get("test")+"===");  // парсим результат
                    //  System.out.println(functionName + "-------- Compile OK-------------");
                }
            } else if (query_type.equals("sql")) {
                createSQL(ServerConstant.config.APP_NAME+"_" + functionName, this, element);
            }
        }
        this.text("");
        for (Attribute attr : element.attributes().asList()) {
            if ("error".equals(attr.getKey())) continue;
            this.removeAttr(attr.getKey());
        }
        StringBuffer sb = new StringBuffer();
        sb.append("<script> $(function() {");
        sb.append("  D3Api.setDatasetAuto('" + name + "');");
        sb.append("}); </script>");
        Elements elements = doc.getElementsByTag("body");
        elements.append(sb.toString());
    }

    public static byte[] onPage(HttpExchange query) {
        query.mimeType = "application/javascript"; // Изменить mime ответа
        HashMap<String, Object> session = query.session;
        JSONObject queryProperty = query.requestParam;
        JSONObject vars = new JSONObject(new String(query.postBody));
        JSONObject result = new JSONObject();
        result.put("data", new JSONArray("[]"));
        String query_type = queryProperty.getString("query_type");
        String dataset_name = ServerConstant.config.APP_NAME+"_" + queryProperty.getString("dataset_name");
        if (ServerResourceHandler.javaStrExecut.existJavaFunction(dataset_name)) {
            JSONObject varFun = new JSONObject();
            Iterator<String> keys = vars.keys();
            while (keys.hasNext()) {
                String key = keys.next();
                JSONObject varOne = vars.getJSONObject(key);
                if (varOne.getString("srctype").equals("session")) {
                    if (session.containsKey(key)) {
                        varFun.put(key, session.get(key));
                    } else {
                        varFun.put(key, varOne.getString("defaultVal"));
                    }
                } else {
                    if (varOne.has("value")) {
                        varFun.put(key, varOne.getString("defaultVal"));
                    } else if (varOne.has("defaultVal")) {
                        varFun.put(key, varOne.getString("defaultVal"));
                    } else {
                        varFun.put(key, "");
                    }
                }
            }
            JSONArray dataRes = new JSONArray();
            JSONObject resFun = ServerResourceHandler.javaStrExecut.runFunction(dataset_name, varFun, session, dataRes);
            if (resFun.has("JAVA_ERROR")) {
                result.put("ERROR", resFun.get("JAVA_ERROR"));
            }
            // System.out.println("dataRes " + dataRes);
            result.put("data", dataRes);
        } else if (query_type.equals("sql")) {
            try {
                if (procedureList.containsKey(dataset_name)) {
                    CallableStatement selectFunctionStatement = null;
                    HashMap<String, Object> param = procedureList.get(dataset_name);
                    String prepareCall = (String) param.get("prepareCall");
                    if (session.containsKey("DATABASE")) {
                        // Если в сессии есть информация о подключении к БД, тогда подключаемся
                        HashMap<String, Object> data_base = (HashMap<String, Object>) session.get("DATABASE");
                        Connection conn = null;
                        if (data_base.containsKey("CONNECT")) {
                            conn = (Connection) data_base.get("CONNECT");
                        } else {
                            conn = getConnect(String.valueOf(data_base.get("DATABASE_USER_NAME")), String.valueOf(data_base.get("DATABASE_USER_PASS")));
                            data_base.put("CONNECT", conn);
                        }
                        if (conn == null) {
                            // переадресация на страницу регистрации
                            System.out.println("(conn == null) ");
                            result = new JSONObject();
                            result.put("redirect", ServerConstant.config.LOGIN_PAGE);
                            return result.toString().getBytes();
                        }
                        selectFunctionStatement = conn.prepareCall(prepareCall);
                    } else {
                        // иначе берем подключение системного пользователя
                        // selectFunctionStatement = (CallableStatement) param.get("selectFunctionStatement");
                        result.put("redirect", ServerConstant.config.LOGIN_PAGE);
                        return result.toString().getBytes();
                    }
                    // Connection conn = (Connection) param.get("connect");
                    // String prepareCall = (String) param.get("prepareCall");
                    List<String> varsArr = (List<String>) param.get("vars");
                    if (ServerConstant.config.DEBUG) {
                        result.put("SQL", ((String) param.get("SQL")).split("\n"));
                    }
                    int ind = 0;
                    for (String varNameOne : varsArr) {
                        JSONObject varOne = vars.getJSONObject(varNameOne);
                        String valueStr = "";
                        if (varOne.getString("srctype").equals("session")) {
                            if (session.get(varNameOne) == null) {
                                valueStr = varOne.getString("defaultVal");
                            } else {
                                valueStr = String.valueOf(session.get(varNameOne));
                            }
                        } else {
                            if (vars.has(varNameOne)) {
                                JSONObject varObj = vars.getJSONObject(varNameOne);
                                if (varObj.has("value")) {
                                    valueStr = String.valueOf(varObj.get("value")); // Входящие переменные
                                }
                                if (valueStr.length() == 0) {
                                    if (varObj.has("defaultVal")) {
                                        valueStr = String.valueOf(varObj.get("defaultVal"));
                                    }
                                }
                            }
                        }
                        ind++;
                        // System.out.println(" ind "+ind+ " varNameOne:"+varNameOne +"  valueStr:"+valueStr);
                        selectFunctionStatement.setString(ind, valueStr);
                    }
                    boolean hasResults = selectFunctionStatement.execute();
                    while (hasResults) {
                        ResultSet rs = selectFunctionStatement.getResultSet();
                        if (rs != null) {
                            if (rs.next()) {
                                result.put("data", new JSONArray(rs.getString(1))); // получить результат JSON
                            }
                            rs.close();
                        }
                        hasResults = selectFunctionStatement.getMoreResults();
                    }
                    /*
                    ind = 0;
                    for (String varNameOne : varsArr) {
                        ind++;
                        // применяется при использовании  INOUT типа
                        //String outParam = selectFunctionStatement.getString(ind);  // Получение ответа
                        JSONObject varOne = vars.getJSONObject(varNameOne);
                        if (varOne.getString("srctype").equals("session")) {
                            session.put(varNameOne, outParam);
                        } else {
                            varOne.put("value", outParam);
                        }
                    }
                    */
                }
            } catch (Exception e) {
                result.put("ERROR", (e.getClass().getName() + ": " + e.getMessage()).split("\n"));
            }
        }
        // ((JSONObject) vars.get("LPU_TEXT")).put("value", "12121212");
        result.put("vars", vars);
        return result.toString().getBytes();
    }

    private void createSQL(String functionName, Element elementThis, Element element) {
        //if (procedureList.containsKey(functionName)) {
        //    return;
        //}
        Connection conn = getConnect(ServerConstant.config.DATABASE_USER_NAME, ServerConstant.config.DATABASE_USER_PASS);
        StringBuffer vars = new StringBuffer();
        StringBuffer varsColl = new StringBuffer();
        Attributes attrs = element.attributes();
        HashMap<String, Object> param = new HashMap<String, Object>();
        String language = RemoveArrKeyRtrn(attrs, "language", "plpgsql");
        param.put("language", language);
        List<String> varsArr = new ArrayList<>();
        String befireCodeBloc = "";
        String declareBlocText = "";
        for (int numChild = 0; numChild < element.childrenSize(); numChild++) {
            Element itemElement = element.child(numChild);
            // System.out.println("itemElement.tag() " + itemElement.tag());
            // if (itemElement.tag().toString().toLowerCase().indexOf("before") != -1) { // если вложенный тэг имеет имя в котором содержится слово 'before' , тогда помещаем его в начала скрипта функции
            if (itemElement.text().length() > 0) {  // если вложенный тэг имеет текст, тогда помещаем его в начала скрипта функции
                String beforeCode = itemElement.text().toLowerCase();
                if (beforeCode.indexOf("declare") != -1) { // переносим блок дикларации в заголовок функции
                    declareBlocText = itemElement.text().substring(0, beforeCode.indexOf("begin"));
                    befireCodeBloc = itemElement.text().substring(declareBlocText.length() + "begin".length(), beforeCode.lastIndexOf("end;"));
                } else {
                    befireCodeBloc = itemElement.text();
                }
                itemElement.text("");
            } else if (itemElement.tag().toString().toLowerCase().indexOf("var") != -1) {
                Attributes attrsItem = itemElement.attributes();
                String nameItem = RemoveArrKeyRtrn(attrsItem, "name", "");
                String src = RemoveArrKeyRtrn(attrsItem, "src", nameItem);
                String srctype = RemoveArrKeyRtrn(attrsItem, "srctype", "");
                String get = RemoveArrKeyRtrn(attrsItem, "get", "");
                String put = RemoveArrKeyRtrn(attrsItem, "put", "");
                String len = RemoveArrKeyRtrn(attrsItem, "len", "");
                String typeVar = "VARCHAR";
                if (len.length() > 0) {
                    typeVar = "VARCHAR(" + len + ")";
                }
                typeVar = RemoveArrKeyRtrn(attrsItem, "type", typeVar);
                String defaultVal = RemoveArrKeyRtrn(attrsItem, "default", "");
                vars.append(nameItem);
                varsArr.add(nameItem);
                vars.append(" IN ");
                vars.append(typeVar);
                vars.append(",");
                varsColl.append("?,");
            }
        }
        param.put("vars", varsArr);
        StringBuffer sb = new StringBuffer("CREATE OR REPLACE FUNCTION " + functionName + "(" + vars.toString().substring(0, vars.toString().length() - 1) + ")\n" +
                "RETURNS JSON AS\n" +
                "$$\n" +
                declareBlocText +
                "BEGIN\n" +
                befireCodeBloc +
                "\n RETURN (\n" +
                "SELECT COALESCE(json_agg(tempTab), '[]'::json) FROM (\n" +
                element.text().trim() +
                ") tempTab\n" +
                ");\n" +
                "END;\n" +
                "$$\n" +
                "LANGUAGE " + language + ";");
        // System.out.println(sb);
        try {
            Statement stmt = conn.createStatement();
            stmt.execute("DROP FUNCTION IF EXISTS " + functionName + ";");
            PreparedStatement createFunctionStatement = conn.prepareStatement(sb.toString());
            createFunctionStatement.executeUpdate();
            String prepareCall = "select " + functionName + "(" + varsColl.toString().substring(0, varsColl.toString().length() - 1) + ");";
            CallableStatement selectFunctionStatement = conn.prepareCall(prepareCall);
            // нужно понять почему нет возможности использовать INOUT атребуты
            //int ind=0;
            //for (String varOne : varsArr) {
            //    ind++;
            //    selectFunctionStatement.registerOutParameter(ind, Types.VARCHAR);
            //}
            param.put("selectFunctionStatement", selectFunctionStatement);
            param.put("prepareCall", prepareCall);
            param.put("connect", conn);
            param.put("SQL", sb.toString());
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
        procedureList.put(functionName, param);
    }

}



/*
import javax.tools.JavaCompiler;
import javax.tools.ToolProvider;

        String code = "public class HelloWorld {\n" +
                "  public static void main(String[] args) {\n" +
                "    System.out.println(\"Hello, world!\");\n" +
                "  }\n" +
                "}";

        // Get a compiler
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();

        // Compile the code
        int result = compiler.run(null, null, null, code);
        if (result != 0) {
            System.out.println("Compilation failed");
            return;
        }

        // Load and execute the compiled class
        Class<?> helloWorldClass = Class.forName("HelloWorld");
        helloWorldClass.getMethod("main", String[].class).invoke(null, (Object) null);

 */
