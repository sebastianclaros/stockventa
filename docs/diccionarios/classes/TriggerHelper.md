---
title: TriggerHelper
---

## Introducción

<!-- START autogenerated-class -->
## Descripción



- Status: Active
- Api Version: 59
- Interface 

## Diagrama
```mermaid
classDiagram

class TriggerHelper {
    
     ERROR_FIELD_CANT_BE_MODIFIED $    
     validateFieldsUnchanged(Map newMapMap oldMapList fieldNames) void $
     validateFieldUnchanged(Map newMapMap oldMapString fieldName) void $
     getRecordChanges(Map newMapMap oldMapString fieldName) List $
     getFieldsFromSObjects(List recordsString fieldName) Set $
     getExternalMap(String objectNameString externalFieldSet values) Map $
     getExternalMap(String objectNameString externalFieldList values) Map $

}
```


### Metodos

*Metodos*
| #   | Nombre | Return | Argumentos |
| --- | ------ | ------ | ---------- |
| <div class="icons">$</div> | validateFieldsUnchanged | void| <ul><li>Map newMap</li><li>Map oldMap</li><li>List fieldNames</li></ul>|
| <div class="icons">$</div> | validateFieldUnchanged | void| <ul><li>Map newMap</li><li>Map oldMap</li><li>String fieldName</li></ul>|
| <div class="icons">$</div> | getRecordChanges | List| <ul><li>Map newMap</li><li>Map oldMap</li><li>String fieldName</li></ul>|
| <div class="icons">$</div> | getFieldsFromSObjects | Set| <ul><li>List records</li><li>String fieldName</li></ul>|
| <div class="icons">$</div> | getExternalMap | Map| <ul><li>String objectName</li><li>String externalField</li><li>Set values</li></ul>|
| <div class="icons">$</div> | getExternalMap | Map| <ul><li>String objectName</li><li>String externalField</li><li>List values</li></ul>|


| #  | Referencia       | #  | Referencia |
| -- | ---------------- | -- | ---------- |
| +  | public or global | #  | protected  |
| -  | private          | ~  | Package    |
| $  | final or static  | *  | abstract   |

<!-- END autogenerated-class -->
