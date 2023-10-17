import WebServerLite.HttpExchange;
import org.jasper.Report;

import net.sf.jasperreports.engine.*;
import net.sf.jasperreports.engine.data.JsonDataSource;
import net.sf.jasperreports.engine.design.JasperDesign;
import net.sf.jasperreports.engine.export.JRXlsExporter;
import net.sf.jasperreports.engine.export.oasis.JROdtExporter;
import net.sf.jasperreports.engine.export.oasis.JROdsExporter;
import net.sf.jasperreports.engine.xml.JRXmlLoader;
import net.sf.jasperreports.export.SimpleExporterInput;
import net.sf.jasperreports.export.SimpleOutputStreamExporterOutput;
import org.json.JSONArray;
import org.json.JSONObject;

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
        while(keys.hasNext()) {
            key = (String)keys.next();
            if (inputProperty.get(key) instanceof JSONObject) {
                inputProperty.getJSONObject(key);
            } else if (inputProperty.get(key) instanceof JSONArray) {
                inputProperty.getJSONArray(key);
            } else {
                staticParametersReport.put(key, String.valueOf(inputProperty.get(key)));
            }
        }
        // Создаем отчет
        try {
            InputStream targetStream = new ByteArrayInputStream(BodyXML.getBytes());
            JasperDesign  jd = JRXmlLoader.load(targetStream);
            JasperReport jrReport = JasperCompileManager.compileReport(jd);
            InputStream jsonDataStream = new ByteArrayInputStream(inputProperty.toString().getBytes());
            JsonDataSource ds = new JsonDataSource(jsonDataStream, "Northwind.Customers");
            JasperPrint jrPrint = JasperFillManager.fillReport(jrReport, staticParametersReport, ds);
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
                "\t<property name=\"ireport.zoom\" value=\"1.6105100000000014\"/>\n" +
                "\t<property name=\"ireport.x\" value=\"0\"/>\n" +
                "\t<property name=\"ireport.y\" value=\"0\"/>\n" +
                "\t<property name=\"net.sf.jasperreports.awt.ignore.missing.font\" value=\"true\"/>\n" +
                "\t<parameter name=\"TEST\" class=\"java.lang.String\">\n" +
                "\t\t<defaultValueExpression><![CDATA[222222]]></defaultValueExpression>\n" +
                "\t</parameter>\n" +
                "\t<parameter name=\"MyNewParam\" class=\"java.lang.String\">\n" +
                "\t\t<defaultValueExpression><![CDATA[\"4444444444\"]]></defaultValueExpression>\n" +
                "\t</parameter>\n" +
                "\t<parameter name=\"TITLE_TEXT\" class=\"java.lang.String\"/>\n" +
                "\t<queryString language=\"json\">\n" +
                "\t\t<![CDATA[Northwind]]>\n" +
                "\t</queryString>\n" +
                "\t<field name=\"my_fild\" class=\"java.lang.String\"/>\n" +
                "\t<field name=\"id\" class=\"java.lang.Long\">\n" +
                "\t\t<property name=\"net.sf.jasperreports.json.field.expression\" value=\"id\"/>\n" +
                "\t</field>\n" +
                "\t<field name=\"name\" class=\"java.lang.String\">\n" +
                "\t\t<property name=\"net.sf.jasperreports.json.field.expression\" value=\"name\"/>\n" +
                "\t</field>\n" +
                "\t<field name=\"username\" class=\"java.lang.String\">\n" +
                "\t\t<property name=\"net.sf.jasperreports.json.field.expression\" value=\"username\"/>\n" +
                "\t</field>\n" +
                "\t<field name=\"TEST\" class=\"java.lang.String\">\n" +
                "\t\t<property name=\"net.sf.jasperreports.json.field.expression\" value=\"TEST\"/>\n" +
                "\t</field>\n" +
                "\t<title>\n" +
                "\t\t<band height=\"143\">\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"0\" y=\"94\" width=\"128\" height=\"20\" uuid=\"a4891b97-6a8e-4ca2-ac7e-a0aef7377966\"/>\n" +
                "\t\t\t\t<textElement>\n" +
                "\t\t\t\t\t<font fontName=\"DejaVu Sans\" isBold=\"true\"/>\n" +
                "\t\t\t\t</textElement>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$P{TEST}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"450\" y=\"110\" width=\"100\" height=\"20\" uuid=\"23d3c476-2e3b-45f5-8157-5d8a14615d09\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$P{MyNewParam}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<staticText>\n" +
                "\t\t\t\t<reportElement x=\"128\" y=\"110\" width=\"165\" height=\"20\" uuid=\"a6fe3370-3a5a-4ecd-b767-19bd6de05f0a\"/>\n" +
                "\t\t\t\t<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\n" +
                "\t\t\t\t\t<font isBold=\"true\" isUnderline=\"true\"/>\n" +
                "\t\t\t\t</textElement>\n" +
                "\t\t\t\t<text><![CDATA[Static text 4444444444]]></text>\n" +
                "\t\t\t</staticText>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"170\" y=\"41\" width=\"245\" height=\"35\" uuid=\"c1bd889c-3875-40cd-8bcd-1da5f43e2721\"/>\n" +
                "\t\t\t\t<textElement textAlignment=\"Center\" verticalAlignment=\"Middle\">\n" +
                "\t\t\t\t\t<font fontName=\"DejaVu Serif\" size=\"20\" isBold=\"true\"/>\n" +
                "\t\t\t\t</textElement>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$P{TITLE_TEXT}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t</band>\n" +
                "\t</title>\n" +
                "\t<detail>\n" +
                "\t\t<band height=\"16\" splitType=\"Stretch\">\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"0\" y=\"0\" width=\"50\" height=\"15\" uuid=\"ee7d3f1c-9bfb-4590-9e5a-21deebd2e89d\"/>\n" +
                "\t\t\t\t<textElement textAlignment=\"Right\" verticalAlignment=\"Middle\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$F{id}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"70\" y=\"0\" width=\"100\" height=\"15\" uuid=\"6b88584f-42c4-439b-82e9-63347e0982a0\"/>\n" +
                "\t\t\t\t<textElement textAlignment=\"Left\" verticalAlignment=\"Middle\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$F{name}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t\t<textField>\n" +
                "\t\t\t\t<reportElement x=\"170\" y=\"1\" width=\"100\" height=\"15\" uuid=\"b7a092f7-bf32-47a4-b6b4-c19dc17b0ebc\"/>\n" +
                "\t\t\t\t<textElement verticalAlignment=\"Middle\"/>\n" +
                "\t\t\t\t<textFieldExpression><![CDATA[$F{username}]]></textFieldExpression>\n" +
                "\t\t\t</textField>\n" +
                "\t\t</band>\n" +
                "\t</detail>\n" +
                "</jasperReport>";
    }
}