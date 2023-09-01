import WebServerLite.HttpExchange;
public class vr_ajax {
    public byte[] onPage(HttpExchange query) {
        query.mimeType = "application/json";
        // ---- Крос доменный запрос из JS кода (ajax) ----
        query.response.put("Access-Control-Expose-Headers", "FooBar");
        query.response.put("Access-Control-Allow-Credentials", "true");
        query.response.put("Access-Control-Allow-Origin", "*");
        StringBuffer sb = new StringBuffer();
        sb.append("{");
        String devName = "VR";
        if (query.requestParam.has("dev")) {
            devName = query.requestParam.getString("dev");
        }
        sb.append("\"devname\":\""+devName+"\"");
        if (query.SHARE.has(devName)) {
            sb.append(",\"compas\":" + query.SHARE.getString(devName)+"");
        } else {
            sb.append(",\"compas\":[]");
        }
        sb.append("}");
        // System.out.println("sb.toString().getBytes()--- " +  sb.toString());
        return sb.toString().getBytes();
    }
}