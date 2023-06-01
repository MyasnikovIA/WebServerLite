# cmpAction

Сомпонент для обработки бизнесс логики на стороне сервера

Есть возможность размещать JAVA код на ВЭБ странице, для этого в компоненте необходимо указать атребут  **query_type="java"**  

Пример выполнения Java кода
```xml
<cmpAction name="getNosRegisterID" query_type="java">
    <import packet="org.json.JSONObject" path="json-20230227.jar"/>
    <![CDATA[
        System.out.println("----текст появится на стороне сера в консоле, где был запущен сервер----");
        vars.put("EDIT_TEXT2", vars.getString("LPU_TEXT")+"--*"); // присвоить контролу с именем EDIT_TEXT2 значение в JAVA коде , на стороне сервера 
    ]]>
    <cmpActionVar name="LPU"          src="LPU"            srctype="session"/>
    <cmpActionVar name="LPU_TEXT"     src="LPU_TEXT"       srctype="var"  get="gLPU"/>
    <cmpActionVar name="NOS_REGISTR"  src="varNOS_REGISTR" srctype="var"  put="pNOS_REGISTR" len="17"/>
    <cmpActionVar name="EDIT_TEXT"    src="ctrlEditText"   srctype="ctrl" put="ctrlEditText" len="512" default="22222222"/>
    <cmpActionVar name="EDIT_TEXT2"                        srctype="ctrl" put="ctrlEditText"/>
</cmpAction>

<cmpEdit name="ctrlEditText" value="1111111111"/>
<cmpEdit name="EDIT_TEXT2" value="222222"/>
<script>
   setVar('LPU_TEXT', "fff111111");
   executeAction('getNosRegisterID', function(vars) {
        console.log('getVars()', getVars()); //  показать все переменные, инициализированные на активной странице
        console.log('vars', vars); // показать объект, который вернулся с сервера
   });
</script>
```

