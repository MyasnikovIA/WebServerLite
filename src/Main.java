import WebServerLite.WebServerLite;

import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;

import WebServerLite.HttpExchange;

public class Main {
    public static void main(String[] args) {
        WebServerLite web = new WebServerLite();
        web.start(args);
        //  debuggPage(); // заготовка для отладки Java страниц
    }

    public static void debuggPage() {
        HttpExchange query = null;
        try {
            query = new HttpExchange(null, new HashMap<>());
            query.postBody = ("{\n" +
                    "    \"type_report\": \"ods\",\n" +
                    "    \"TEST\": \"111111\",\n" +
                    "    \"TITLE_TEXT\": \"Заголовок\",\n" +
                    "    \"XML\": \"<?xml version=\\\"1.0\\\" encoding=\\\"UTF-8\\\"?>\\n<jasperReport xmlns=\\\"http://jasperreports.sourceforge.net/jasperreports\\\" xmlns:xsi=\\\"http://www.w3.org/2001/XMLSchema-instance\\\" xsi:schemaLocation=\\\"http://jasperreports.sourceforge.net/jasperreports http://jasperreports.sourceforge.net/xsd/jasperreport.xsd\\\" name=\\\"report\\\" pageWidth=\\\"595\\\" pageHeight=\\\"842\\\" columnWidth=\\\"555\\\" leftMargin=\\\"20\\\" rightMargin=\\\"20\\\" topMargin=\\\"20\\\" bottomMargin=\\\"20\\\" uuid=\\\"33b0ba21-c1cf-4c2d-8d61-5c5cf0251a77\\\">\\n\\t<property name=\\\"ireport.zoom\\\" value=\\\"1.6105100000000014\\\"/>\\n\\t<property name=\\\"ireport.x\\\" value=\\\"0\\\"/>\\n\\t<property name=\\\"ireport.y\\\" value=\\\"0\\\"/>\\n\\t<property name=\\\"net.sf.jasperreports.awt.ignore.missing.font\\\" value=\\\"true\\\"/>\\n\\t<parameter name=\\\"TEST\\\" class=\\\"java.lang.String\\\">\\n\\t\\t<defaultValueExpression><![CDATA[222222]]></defaultValueExpression>\\n\\t</parameter>\\n\\t<parameter name=\\\"MyNewParam\\\" class=\\\"java.lang.String\\\">\\n\\t\\t<defaultValueExpression><![CDATA[\\\"4444444444\\\"]]></defaultValueExpression>\\n\\t</parameter>\\n\\t<parameter name=\\\"TITLE_TEXT\\\" class=\\\"java.lang.String\\\"/>\\n\\t<queryString language=\\\"json\\\">\\n\\t\\t<![CDATA[Northwind]]>\\n\\t</queryString>\\n\\t<field name=\\\"my_fild\\\" class=\\\"java.lang.String\\\"/>\\n\\t<field name=\\\"id\\\" class=\\\"java.lang.Long\\\">\\n\\t\\t<property name=\\\"net.sf.jasperreports.json.field.expression\\\" value=\\\"id\\\"/>\\n\\t</field>\\n\\t<field name=\\\"name\\\" class=\\\"java.lang.String\\\">\\n\\t\\t<property name=\\\"net.sf.jasperreports.json.field.expression\\\" value=\\\"name\\\"/>\\n\\t</field>\\n\\t<field name=\\\"username\\\" class=\\\"java.lang.String\\\">\\n\\t\\t<property name=\\\"net.sf.jasperreports.json.field.expression\\\" value=\\\"username\\\"/>\\n\\t</field>\\n\\t<field name=\\\"TEST\\\" class=\\\"java.lang.String\\\">\\n\\t\\t<property name=\\\"net.sf.jasperreports.json.field.expression\\\" value=\\\"TEST\\\"/>\\n\\t</field>\\n\\t<title>\\n\\t\\t<band height=\\\"143\\\">\\n\\t\\t\\t<textField>\\n\\t\\t\\t\\t<reportElement x=\\\"0\\\" y=\\\"94\\\" width=\\\"128\\\" height=\\\"20\\\" uuid=\\\"a4891b97-6a8e-4ca2-ac7e-a0aef7377966\\\"/>\\n\\t\\t\\t\\t<textElement>\\n\\t\\t\\t\\t\\t<font fontName=\\\"DejaVu Sans\\\" isBold=\\\"true\\\"/>\\n\\t\\t\\t\\t</textElement>\\n\\t\\t\\t\\t<textFieldExpression><![CDATA[$P{TEST}]]></textFieldExpression>\\n\\t\\t\\t</textField>\\n\\t\\t\\t<textField>\\n\\t\\t\\t\\t<reportElement x=\\\"450\\\" y=\\\"110\\\" width=\\\"100\\\" height=\\\"20\\\" uuid=\\\"23d3c476-2e3b-45f5-8157-5d8a14615d09\\\"/>\\n\\t\\t\\t\\t<textFieldExpression><![CDATA[$P{MyNewParam}]]></textFieldExpression>\\n\\t\\t\\t</textField>\\n\\t\\t\\t<staticText>\\n\\t\\t\\t\\t<reportElement x=\\\"128\\\" y=\\\"110\\\" width=\\\"165\\\" height=\\\"20\\\" uuid=\\\"a6fe3370-3a5a-4ecd-b767-19bd6de05f0a\\\"/>\\n\\t\\t\\t\\t<textElement textAlignment=\\\"Center\\\" verticalAlignment=\\\"Middle\\\">\\n\\t\\t\\t\\t\\t<font isBold=\\\"true\\\" isUnderline=\\\"true\\\"/>\\n\\t\\t\\t\\t</textElement>\\n\\t\\t\\t\\t<text><![CDATA[Static text 4444444444]]></text>\\n\\t\\t\\t</staticText>\\n\\t\\t\\t<textField>\\n\\t\\t\\t\\t<reportElement x=\\\"170\\\" y=\\\"41\\\" width=\\\"245\\\" height=\\\"35\\\" uuid=\\\"c1bd889c-3875-40cd-8bcd-1da5f43e2721\\\"/>\\n\\t\\t\\t\\t<textElement textAlignment=\\\"Center\\\" verticalAlignment=\\\"Middle\\\">\\n\\t\\t\\t\\t\\t<font fontName=\\\"DejaVu Serif\\\" size=\\\"20\\\" isBold=\\\"true\\\"/>\\n\\t\\t\\t\\t</textElement>\\n\\t\\t\\t\\t<textFieldExpression><![CDATA[$P{TITLE_TEXT}]]></textFieldExpression>\\n\\t\\t\\t</textField>\\n\\t\\t</band>\\n\\t</title>\\n\\t<detail>\\n\\t\\t<band height=\\\"16\\\" splitType=\\\"Stretch\\\">\\n\\t\\t\\t<textField>\\n\\t\\t\\t\\t<reportElement x=\\\"0\\\" y=\\\"0\\\" width=\\\"50\\\" height=\\\"15\\\" uuid=\\\"ee7d3f1c-9bfb-4590-9e5a-21deebd2e89d\\\"/>\\n\\t\\t\\t\\t<textElement textAlignment=\\\"Right\\\" verticalAlignment=\\\"Middle\\\"/>\\n\\t\\t\\t\\t<textFieldExpression><![CDATA[$F{id}]]></textFieldExpression>\\n\\t\\t\\t</textField>\\n\\t\\t\\t<textField>\\n\\t\\t\\t\\t<reportElement x=\\\"70\\\" y=\\\"0\\\" width=\\\"100\\\" height=\\\"15\\\" uuid=\\\"6b88584f-42c4-439b-82e9-63347e0982a0\\\"/>\\n\\t\\t\\t\\t<textElement textAlignment=\\\"Left\\\" verticalAlignment=\\\"Middle\\\"/>\\n\\t\\t\\t\\t<textFieldExpression><![CDATA[$F{name}]]></textFieldExpression>\\n\\t\\t\\t</textField>\\n\\t\\t\\t<textField>\\n\\t\\t\\t\\t<reportElement x=\\\"170\\\" y=\\\"1\\\" width=\\\"100\\\" height=\\\"15\\\" uuid=\\\"b7a092f7-bf32-47a4-b6b4-c19dc17b0ebc\\\"/>\\n\\t\\t\\t\\t<textElement verticalAlignment=\\\"Middle\\\"/>\\n\\t\\t\\t\\t<textFieldExpression><![CDATA[$F{username}]]></textFieldExpression>\\n\\t\\t\\t</textField>\\n\\t\\t</band>\\n\\t</detail>\\n</jasperReport>\",\n" +
                    "    \"Northwind\": {\n" +
                    "        \"Customers\": [\n" +
                    "            {\n" +
                    "                \"id\": 1,\n" +
                    "                \"name\": \"Leanne Graham\",\n" +
                    "                \"username\": \"Bret\",\n" +
                    "                \"email\": \"Sincere@april.biz\"\n" +
                    "            },\n" +
                    "            {\n" +
                    "                \"id\": 2,\n" +
                    "                \"name\": \"Ervin Howell0\",\n" +
                    "                \"username\": \"Antonette\",\n" +
                    "                \"email\": \"Shanna@melissa.tv\"\n" +
                    "            },\n" +
                    "            {\n" +
                    "                \"id\": 3,\n" +
                    "                \"name\": \"Ervin Howell3\",\n" +
                    "                \"username\": \"Antonette\",\n" +
                    "                \"email\": \"Shanna@melissa.tv\"\n" +
                    "            },\n" +
                    "            {\n" +
                    "                \"id\": 4,\n" +
                    "                \"name\": \"Ervin Howell4\",\n" +
                    "                \"username\": \"Antonette\",\n" +
                    "                \"email\": \"Shanna@melissa.tv\"\n" +
                    "            }\n" +
                    "        ]\n" +
                    "    }\n" +
                    "}").getBytes();
            test_page test = new test_page();
            test.onPage(query);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

    }
}