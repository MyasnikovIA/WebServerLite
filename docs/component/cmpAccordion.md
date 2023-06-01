# Компонента Accordion

Компонент построен на базе элемента jQueryUI Accordion
(https://jqueryui.com/accordion/#fillspace)


## Пример синтаксиса
 
```xml
    <cmpAccordion name="ctrlAcordion" onchange="console.log(D3Api.getValue('ctrlAcordion'));"
                  height="60%"
                  width="50%"
                  left="10px"
                  top="10px">
    <items caption="text1">
        <cmpLabel caption="test CTRL"/>
    </items>
    <items caption="text2">
        <cmpEdit name="v2_edit" label=" текст в другой вкладке -edit2--"/>
    </items>
    <items caption="text3">
        Простой текст
    </items>
</cmpAccordion>
```

## Атрибуты

|Название| Назеначение                                                     |Тип| Возможнные значения      |
|---|-----------------------------------------------------------------|---|--------------------------|
|width| Установить ширину контрола                                      |string| width="10px;" <br/> width="20%"<br/> width="200" |
|height| Установить высоту контрола                                      |string| height="10px;" <br/> height="20%"<br/> height="200" |
|left| Установить отступ от левого края элемента                       |string| left="10px;" <br/> left="20%"<br/> left="200" |
|top| Установить отступ от верхнего края элемента                     |string| top="10px;" <br/> top="20%"<br/> top="200" |
|onchange| JS функция отрабатывает в  момент переключения между закладками |string|onchange="console.log(D3Api.getValue('ctrlAcordion'));" |


## Обработка в JS

1) D3Api.setValue('ctrlAcordion',3) - выбрать активной номер закладки
2) D3Api.getValue('ctrlAcordion',3) - получить значение активной номер закладки
