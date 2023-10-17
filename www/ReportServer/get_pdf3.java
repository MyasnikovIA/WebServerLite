import WebServerLite.HttpExchange;
import org.jasper.Report;



import net.sf.jasperreports.engine.data.JRBeanCollectionDataSource;
import net.sf.jasperreports.engine.design.*;
import net.sf.jasperreports.engine.export.*;
import net.sf.jasperreports.engine.export.oasis.*;
import net.sf.jasperreports.engine.xml.JRXmlLoader;
import net.sf.jasperreports.engine.data.JsonDataSource;
import org.json.JSONArray;
import org.json.JSONObject;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import java.io.File;
import java.io.InputStream;
import java.util.*;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;


public class get_pdf3 {
    public byte[] onPage(HttpExchange query) {
        // крос доменный запрос
        query.response.put("Access-Control-Expose-Headers", "FooBar");
        query.response.put("Access-Control-Allow-Credentials", "true");
        query.response.put("Access-Control-Allow-Origin", "*");
        return getRep(query);
    }

    public byte[] getRep(HttpExchange query){
        query.mimeType ="application/pdf";
        String rawJsonData = new String(query.postBody);
        JSONObject inputProperty = new JSONObject(rawJsonData);
        String type_report = "pdf";
        String BodyXML = "";
        // получаем бланк JRXML
        if (inputProperty.has("XML")) {
            BodyXML = inputProperty.getString("XML");
        }
        if (BodyXML.length() == 0) {
            BodyXML = getBlank();
        }
        // Получаем формат, в который необходимо выгрузить отчет
        if (inputProperty.has("type_report")) {
            type_report = inputProperty.getString("type_report");
        }
        // читаем все входящие параметры для отдельных полей
        Map staticParametersReport = new HashMap();
        Iterator<String> keys = inputProperty.keys();
        String key;
        while (keys.hasNext()) {
            key = (String) keys.next();
            if (inputProperty.get(key) instanceof JSONObject) {
                if (!"dataset".equals(key)) {
                    try {
                        JRRewindableDataSource subDataset = new JsonDataSource(new ByteArrayInputStream(inputProperty.getJSONArray(key).toString().getBytes()));
                        inputProperty.remove(key);
                        //  staticParametersReport(key,subDataset);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }
            } else if (inputProperty.get(key) instanceof JSONArray) {
                inputProperty.getJSONArray(key);
            } else {
                staticParametersReport.put(key, String.valueOf(inputProperty.get(key)));
            }
        }
        // Создаем отчет
        try {
            InputStream targetStream = new ByteArrayInputStream(BodyXML.getBytes());
            JasperDesign  jasperDesign = JRXmlLoader.load(targetStream);
            JRRewindableDataSource dataset;
            if (inputProperty.has("dataset")) {
                //  v1
                //  InputStream jsonDataStream = new ByteArrayInputStream(inputProperty.toString().getBytes());
                //  dataset = new JsonDataSource(jsonDataStream, "dataset");
                //  v2
                dataset = new JsonDataSource(new ByteArrayInputStream(inputProperty.getJSONArray("dataset").toString().getBytes()));
                inputProperty.remove("dataset");
            } else {
                dataset = new JREmptyDataSource();
            }
            JasperReport jrReport = JasperCompileManager.compileReport(jasperDesign);
            JasperPrint jrPrint = JasperFillManager.fillReport(jrReport, staticParametersReport, dataset);
            // Конвертируем отчет в нужных формат
            byte[] resultByte = new byte[0];
            if (type_report.equals("pdf")) {
                query.mimeType ="application/pdf";
                System.out.print("type_report "+jrPrint);

                resultByte = JasperExportManager.exportReportToPdf(jrPrint);
            } else if (type_report.equals("docx")) {
                query.mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                ByteArrayOutputStream excelStream = new ByteArrayOutputStream();
                JROdtExporter exporterOdt = new JROdtExporter();
                exporterOdt.setExporterInput(new SimpleExporterInput(jrPrint));
                exporterOdt.setExporterOutput(new SimpleOutputStreamExporterOutput(excelStream));
                exporterOdt.exportReport();
                resultByte = excelStream.toByteArray();
            } else if (type_report.equals("xls")) {
                query.mimeType = "application/vnd.ms-excel";
                ByteArrayOutputStream excelStream = new ByteArrayOutputStream();
                JRXlsExporter exporterOdt = new JRXlsExporter();
                exporterOdt.setExporterInput(new SimpleExporterInput(jrPrint));
                exporterOdt.setExporterOutput(new SimpleOutputStreamExporterOutput(excelStream));
                exporterOdt.exportReport();
                resultByte = excelStream.toByteArray();
            } else if (type_report.equals("odt")) {
                query.mimeType = "application/vnd.oasis.opendocument.text";
                ByteArrayOutputStream excelStream = new ByteArrayOutputStream();
                JROdtExporter exporterOdt = new JROdtExporter();
                exporterOdt.setExporterInput(new SimpleExporterInput(jrPrint));
                exporterOdt.setExporterOutput(new SimpleOutputStreamExporterOutput(excelStream));
                exporterOdt.exportReport();
                resultByte = excelStream.toByteArray();
            } else if (type_report.equals("ods")) {
                query.mimeType = "application/vnd.oasis.opendocument.text";
                ByteArrayOutputStream excelStream = new ByteArrayOutputStream();
                JROdsExporter exporterOdt = new JROdsExporter();
                exporterOdt.setExporterInput(new SimpleExporterInput(jrPrint));
                exporterOdt.setExporterOutput(new SimpleOutputStreamExporterOutput(excelStream));
                exporterOdt.exportReport();
                resultByte = excelStream.toByteArray();
            }
            return resultByte;
        } catch (Exception e) {
            //return (e.getMessage()+"").getBytes();
            System.out.print(e.getMessage()+"");
            return ("-------"+e.getMessage()+"------").getBytes();
        }
    }

    public String getBlank() {
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                "<jasperReport xmlns=\"http://jasperreports.sourceforge.net/jasperreports\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xsi:schemaLocation=\"http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd\" name=\"report\" pageWidth=\"595\" pageHeight=\"842\" columnWidth=\"555\" leftMargin=\"20\" rightMargin=\"20\" topMargin=\"20\" bottomMargin=\"20\" uuid=\"33b0ba21-c1cf-4c2d-8d61-5c5cf0251a77\">\n" +
                "\t<property name=\"ireport.zoom\" value=\"3.4522712143931082\"/>\n" +
                "\t<property name=\"ireport.x\" value=\"108\"/>\n" +
                "\t<property name=\"ireport.y\" value=\"218\"/>\n" +
                "\t<property name=\"net.sf.jasperreports.awt.ignore.missing.font\" value=\"true\"/>\n" +
                "\t<property name=\"com.jaspersoft.studio.data.defaultdataadapter\" value=\"One Empty Record\"/>\n" +
                "\t<style name=\"table\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"1.0\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table_TH\" mode=\"Opaque\" backcolor=\"#F0F8FF\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"0.5\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table_CH\" mode=\"Opaque\" backcolor=\"#BFE1FF\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"0.5\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table_TD\" mode=\"Opaque\" backcolor=\"#FFFFFF\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"0.5\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table 1\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"1.0\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table 1_TH\" mode=\"Opaque\" backcolor=\"#F0F8FF\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"0.5\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table 1_CH\" mode=\"Opaque\" backcolor=\"#BFE1FF\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"0.5\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<style name=\"table 1_TD\" mode=\"Opaque\" backcolor=\"#FFFFFF\">\n" +
                "\t\t<box>\n" +
                "\t\t\t<pen lineWidth=\"0.5\" lineColor=\"#000000\"/>\n" +
                "\t\t</box>\n" +
                "\t</style>\n" +
                "\t<subDataset name=\"dataset1\" uuid=\"116f77b2-c884-4a3b-85b4-f4514104700b\">\n" +
                "\t\t<parameter name=\"MyParamDataset\" class=\"net.sf.jasperreports.engine.data.JRBeanCollectionDataSource\"/>\n" +
                "\t\t<field name=\"name2\" class=\"java.lang.String\"/>\n" +
                "\t\t<field name=\"id2\" class=\"java.lang.Long\"/>\n" +
                "\t</subDataset>\n" +
                "\t<subDataset name=\"Table Dataset 1\" uuid=\"0b9cbdcc-6274-4259-82ec-72d7882ae9c9\"/>\n" +
                "\t<subDataset name=\"Table Dataset 2\" uuid=\"c3ceb83d-ceed-4618-9f87-9277cadb76ca\"/>\n" +
                "\t<subDataset name=\"dataset2\" uuid=\"f2e58c5e-604d-4944-88ff-60656f281b02\"/>\n" +
                "\t<parameter name=\"TEST\" class=\"java.lang.String\">\n" +
                "\t\t<defaultValueExpression><![CDATA[222222]]></defaultValueExpression>\n" +
                "\t</parameter>\n" +
                "\t<parameter name=\"MyNewParam\" class=\"java.lang.String\">\n" +
                "\t\t<defaultValueExpression><![CDATA[\"4444444444\"]]></defaultValueExpression>\n" +
                "\t</parameter>\n" +
                "\t<parameter name=\"TITLE_TEXT\" class=\"java.lang.String\"/>\n" +
                "\t<queryString language=\"json\">\n" +
                "\t\t<![CDATA[]]>\n" +
                "\t</queryString>\n" +
                "\t<field name=\"id\" class=\"java.lang.Integer\"/>\n" +
                "\t<field name=\"name\" class=\"java.lang.String\"/>\n" +
                "\t<title>\n" +
                "\t\t<band height=\"143\">\n" +
                "\t\t\t<staticText>\n" +
                "\t\t\t\t<reportElement x=\"10\" y=\"55\" width=\"392\" height=\"17\" uuid=\"a09ea6e3-959b-43c2-8943-d950fb66e837\"/>\n" +
                "\t\t\t\t<text><![CDATA[Static Text]]></text>\n" +
                "\t\t\t</staticText>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"10\" y=\"10\" width=\"100\" height=\"14\" uuid=\"585447f0-d212-45e8-b520-f95bb21d04cc\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$P{TEST}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"10\" y=\"24\" width=\"100\" height=\"15\" uuid=\"733478b0-810b-4c1e-b05e-a362989fb135\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$P{MyNewParam}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"10\" y=\"39\" width=\"100\" height=\"16\" uuid=\"f93b3d5e-c242-49f9-b931-e3d9b41f92b4\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$P{TITLE_TEXT}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"10\" y=\"94\" width=\"90\" height=\"20\" uuid=\"0942bed6-113f-4c0f-82b8-a371a200bf6d\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$F{field}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<rectangle>\n" +
                "\t\t\t\t<reportElement x=\"100\" y=\"94\" width=\"100\" height=\"20\" uuid=\"5916a523-dd9a-4d6b-9ffb-df2794ad148b\"/>\n" +
                "\t\t\t</rectangle>\n" +
                "\t\t</band>\n" +
                "\t</title>\n" +
                "\t<detail>\n" +
                "\t\t<band height=\"20\">\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"0\" y=\"0\" width=\"100\" height=\"20\" uuid=\"5ab57508-4b34-4d66-b493-9504e230cde8\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$F{id}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"100\" y=\"0\" width=\"100\" height=\"20\" uuid=\"436e292c-ffbf-4825-810b-8732a1ef63b1\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$F{name}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t</band>\n" +
                "\t</detail>\n" +
                "</jasperReport>\n\n";
    }
}